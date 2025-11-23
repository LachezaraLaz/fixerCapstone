// routes/chatRoute.js
import express, { Request, Response } from "express";

import { initChat } from "../controller/initChat";
import fixerClient from "../model/fixerClient";

interface InitChatRequestBody {
  issueTitle: string;
  clientEmail: string;
  professionalId: string;
}

const chatRouter = express.Router();

chatRouter.post(
  "/init",
  async (req: Request<{}, {}, InitChatRequestBody>, res: Response) => {
    try {
      const { issueTitle, clientEmail, professionalId } = req.body;

      // Fetch clientId from DB using the clientEmail
      const client = await fixerClient.findOne({
        email: clientEmail,
      });

      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      const clientId = client._id.toString();

      // Call initChat with the clientId
      await initChat(issueTitle, clientId, professionalId);

      return res
        .status(200)
        .json({ message: "Chat channel created successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  }
);

export default chatRouter;
