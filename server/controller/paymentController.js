const { stripe } = require('../utils/stripeConfig');
const ProfessionalPayment = require('../model/professionalPaymentModel');
const { Quotes } = require('../model/quoteModel');
const { Jobs } = require('../model/createIssueModel');
const { fixerClient } = require('../model/professionalClientModel');

async function deductCut(req, res) {
    const jobId = req.body.jobId || req.params.jobId;

    if (!jobId) {
        return res.status(400).send({
            status: 'error',
            data: 'Job ID is required'
        });
    }

    try {
        // 1. Get and validate job
        const job = await Jobs.findById(jobId);
        if (!job) {
            return res.status(404).send({
                status: 'error',
                data: 'Job not found'
            });
        }

        // 2. Get professional's email from job
        const professionalEmail = job.professionalEmail;
        if (!professionalEmail) {
            return res.status(400).send({
                status: 'error',
                data: 'Job has no assigned professional'
            });
        }

        // 3. Get professional profile
        const professional = await fixerClient.findOne({ email: professionalEmail });
        if (!professional) {
            return res.status(404).send({
                status: 'error',
                data: 'Professional profile not found'
            });
        }

        // 4. Get payment record
        const paymentRecord = await ProfessionalPayment.findOne({
            professionalId: professional._id
        });

        if (!paymentRecord?.stripeCustomerId) {
            return res.status(400).send({
                status: 'error',
                data: 'Stripe account not linked'
            });
        }

        // 5. Validate job status
        if (!job.acceptedQuoteId || (job.status !== 'In progress' && job.status !== 'Completed')) {
            return res.status(400).send({
                status: 'error',
                data: 'Job cannot be completed yet'
            });
        }

        // 6. Get accepted quote
        const quote = await Quotes.findById(job.acceptedQuoteId);
        if (!quote) {
            return res.status(404).send({
                status: 'error',
                data: 'Accepted quote not found'
            });
        }

        // 7. Verify payment methods
        const paymentMethods = await stripe.paymentMethods.list({
            customer: paymentRecord.stripeCustomerId,
            type: 'card'
        });

        if (paymentMethods.data.length === 0) {
            return res.status(400).send({
                status: 'error',
                data: 'No payment method found'
            });
        }

        // 8. Calculate amounts
        const platformFee = Math.round(quote.price * 0.10 * 100); // in cents
        const professionalAmount = quote.price - platformFee;

        // 9. Create combined payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: platformFee,
            currency: 'cad',
            customer: paymentRecord.stripeCustomerId,
            payment_method: paymentMethods.data[0].id,
            confirm: true,
            off_session: true,
            metadata: {
                jobId: jobId.toString(),
                professionalId: professional._id.toString(),
                purpose: 'platform_fee',
                quoteAmount: quote.price.toString()
            }
        });

        // 10. Update job status
        await Jobs.findByIdAndUpdate(jobId, { status: 'completed' });

        return res.send({
            status: 'success',
            data: {
                message: 'Payment processed successfully',
                amounts: {
                    total: quote.price,
                    platformFee: platformFee,
                    professionalAmount: professionalAmount
                },
                paymentIntentId: paymentIntent.id,
                jobStatus: 'completed'
            }
        });

    } catch (error) {
        console.error('Payment Error:', {
            message: error.message,
            code: error.code || 'N/A',
            type: error.type || 'GenericError',
            timestamp: new Date().toISOString()
        });

        if (error.type?.includes('Stripe')) {
            return res.status(400).send({
                status: 'error',
                data: 'Payment processing failed',
                details: {
                    code: error.code,
                    message: error.message
                }
            });
        }

        return res.status(500).send({
            status: 'error',
            data: 'Internal payment processing error'
        });
    }
}

module.exports = { deductCut };