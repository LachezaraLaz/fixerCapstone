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
const app = express();
const cors = require('cors');
app.use(cors({
  origin: ['https://fixercapstone-production.up.railway.app'],
}));

// custom error imports
const { errorHandler } = require('./middlewares/errorHandler');
const NotFoundError = require("./utils/errors/NotFoundError");
const BadRequestError = require("./utils/errors/BadRequestError");
const UnauthorizedError = require("./utils/errors/UnauthorizedError");
const ForbiddenError = require("./utils/errors/ForbiddenError");
const InternalServerError = require("./utils/errors/InternalServerError");


app.use(bodyParser.json());

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


// If a route is not found
app.all('*', (req, res, next) => {
    next(new NotFoundError('index.js', `${req.originalUrl} is not found!`, 404 ));

    // Testing
    // Uncomment only one at a time to see different error displayed:
  //   next(new NotFoundError('index.js', `${req.originalUrl}: From Not Found Error`, 404));
  //   next(new BadRequestError('index.js', `${req.originalUrl}: From Bad Request Error`, 400));
  //   next(new UnauthorizedError('index.js', `${req.originalUrl}: From Unauthorized Error`, 401));
  //   next(new ForbiddenError('index.js', `${req.originalUrl}: From Forbidden Error`, 403));
  //   next(new InternalServerError('index.js', `${req.originalUrl}: From Internal Server Error`, 500));
});

// Custom Error Handling Middleware (ALWAYS call it last in order to catch errors from
// middlewares and routes called above)
app.use(errorHandler);


const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log(err));

const server = app.listen(PORT, () => {
  console.log("server is running on port", server.address().port);
});

// Testing the middleware to see if the error is caught
// Comment the following when done with testing
// app.get('/test-error', (req, res, next) => {
//   // Force an error
//   next(new NotFoundError());
// });
//
// const IP_ADDRESS = 'xxx.xxx.xxx.xxx'; // Input your IP address to see custom error
//
// fetch(`http://${IP_ADDRESS}:${PORT}/test-error`)
//     .then(response => response.json())
//     .then(data => {
//       console.log('Response data:', data);
//     })
//     .catch(error => {
//       console.error('Error:', error);
//     });

module.exports = app;
