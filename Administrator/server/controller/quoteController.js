const quoteModel = require("../model/fixerQuoteModel");

const getQuotes = async (req, res) => {
    try {
        // Fetch all quotes from the database
        const quotes = await quoteModel.find({});

        // Return the data
        res.status(200).json({ quotes });
    } catch (error) {
        console.error("Error fetching quotes:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = { getQuotes };