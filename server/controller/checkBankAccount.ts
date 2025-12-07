import {Request, Response, NextFunction} from "express"

import { ProfessionalPayment } from "../model/professionalPayment"

interface CheckBankAccountRequest extends Request{
    body:{
        professionalId: string
    }
}

export async function checkBankAccount(req: CheckBankAccountRequest, res:Response, next:NextFunction) {
    const { professionalId } = req.body;

    try {
        const professionalPayment = await ProfessionalPayment.findOne({ professionalId });

        //TODO: Check where bankAccountId comes from. Is it stripeCustomerId?
        if (!professionalPayment || !professionalPayment.stripeCustomerId) {
            return res.status(400).send({ status: 'error', data: 'Bank account not linked' });
        }

        next();
    } catch (error) {
        console.error('Error checking bank account:', error);

        res.status(500).send({ status: 'error', data: 'Failed to check bank account' });
    }
}
