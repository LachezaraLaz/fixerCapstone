require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const professionalClientRoute = require('./routes/professionalClientRoute');
const fixerClientRoute = require('./routes/fixerClientRoute');
const createIssueRoute = require('./routes/createIssueRoute');
const resetPasswordRouter = require('./routes/passwordResetRoute');
const createIssueRouter = require('./routes/createIssueRoute');
const app = express();

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
app.use('/reset',resetPasswordRouter.resetPasswordRouter);
