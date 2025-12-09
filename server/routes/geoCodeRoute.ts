import express from "express";

import { getAddressFromCoords } from "../utils/geoCoding";

const geoCodeRouter = express.Router();

// TODO: extract logic in a geoCode controller to fit codebase flow
geoCodeRouter.get("/address", async (req, res) => {
  const { lat, lng } = req.query;

  try {
    const address = await getAddressFromCoords(Number(lat), Number(lng));
    res.json({ address });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default geoCodeRouter;
