import { StreamChat } from "stream-chat";

const STREAM_API_KEY = process.env.STREAM_API_KEY || "";
const STREAM_API_SECRET = process.env.STREAM_API_SECRET || "";

const serverClient = new StreamChat(STREAM_API_KEY, STREAM_API_SECRET);

export default serverClient;
