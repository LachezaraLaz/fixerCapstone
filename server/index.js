require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const professionalClientRoute = require('./routes/professionalClientRoute');
const fixerClientRoute = require('./routes/fixerClientRoute');
const createIssueRoute = require('./routes/createIssueRoute');
const issueRoute = require('./routes/getIssuesRoute'); 
const resetPasswordRouter = require('./routes/passwordResetRoute');
// const createIssueRouter = require('./routes/createIssueRoute');
const notificationRouter = require('./routes/notificationRoute');
const quoteRouter = require('./routes/quoteRoute');
const userRouter = require('./routes/userRoute');
// const contractOfferRouter = require('./routes/contractOfferRoute');
const getMyProfessionalJobsRouter = require('./routes/getMyProfessionalJobsRoute'); // Import the new route
const { serverClient } = require('./services/streamClient');
const reviewRouter = require('./routes/reviewRoute');
const paymentRoutes = require('./routes/paymentRoute');
const geocodeRoute = require('./routes/geoCodeRoute');
const emailReportRouter = require('./routes/sendEmailReportRoute');
const chatRoute = require('./routes/chatRoute');

const app = express();
const cors = require('cors');
app.use(bodyParser.json());

app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log(err));

const server = app.listen(PORT, () => {
  console.log("server is running on port", server.address().port);
});

app.use('/professional', professionalClientRoute.professionalRouter);
app.use('/client', fixerClientRoute.fixerClientRouter);
app.use('/issue', createIssueRoute.createIssueRouter);
app.use('/issues', issueRoute.issueRouter);
//app.use('/professional/contractOffer', contractOfferRouter.contractOfferRouter);
app.use('/reset',resetPasswordRouter.resetPasswordRouter);
app.use('/quotes', quoteRouter.quoteRouter);

// New route for getting professional's jobs
app.use('/myJobs', getMyProfessionalJobsRouter.getMyProfessionalJobsRouter); // Mount the new route for jobs

// Email verification route
app.use('/verify-email', professionalClientRoute.professionalRouter);
app.use('/notification', notificationRouter);
app.use('/reviews', reviewRouter.reviewRouter);

app.use('/users', userRouter.userRouter);

app.use('/payment', paymentRoutes.paymentRouter);
app.use('/send-email-report', emailReportRouter);
app.use('/chat', chatRoute.chatRouter);

app.use(cors()); // duplicate ?
app.use('/api/geocode', geocodeRoute);


module.exports = app;
