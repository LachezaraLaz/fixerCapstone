const express = require("express");
const { getClients, banUser } = require("../controller/clientController");

const router = express.Router();

router.get("/users", getClients);
router.patch("/users/ban/:userId", banUser); // New route for banning/unbanning users

module.exports = router;
