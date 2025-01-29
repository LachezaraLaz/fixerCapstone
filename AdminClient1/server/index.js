// const mongoose = require('mongoose');
// require('dotenv').config(); 

// const connectDB = async () => {
//     console.log("Server is starting...");

//     try {
//         await mongoose.connect(process.env.MONGO_URL, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true
//         });
//         console.log('MongoDB Connected Successfully');
//     } catch (error) {
//         console.error('MongoDB Connection Error:', error);
//         process.exit(1);
//     }
// };

// module.exports = connectDB;

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const adminRoute = require("./routes/fixerAdminRoutes");

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 5003; // Change the port if needed

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("Connected to MongoDB from AdminClient1"))
    .catch(err => console.error("MongoDB connection error:", err));

const server = app.listen(PORT, () => {
    console.log(`AdminClient1 server running on port ${PORT}`);
});

// Use routes
app.use('/admin', adminRoute.adminRouter);

module.exports = app;

