import express from "express";

const geoCodeRouter = express.Router();
const { getAddressFromCoords } = require("../utils/geoCoding");

geoCodeRouter.get("/address", async (req, res) => {
  const { lat, lng } = req.query;

  try {
    const address = await getAddressFromCoords(lat, lng);
    res.json({ address });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default geoCodeRouter;
