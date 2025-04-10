require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');


const adminRoute = require("./routes/fixerAdminRoutes");

const app = express();
app.use(bodyParser.json());

app.use(cors({
    origin: 'http://localhost:5173', // Your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const PORT = process.env.PORT || 5003; // Change the port if needed

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("Connected to MongoDB from Administrator"))
    .catch(err => console.error("MongoDB connection error:", err));

const server = app.listen(PORT, () => {
    console.log(`AdminClient1 server running on port ${PORT}`);
});

// Use routes
app.use('/admin', adminRoute.adminRouter);

module.exports = app;

