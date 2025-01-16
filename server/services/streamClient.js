const { StreamChat } = require('stream-chat');

const serverClient = new StreamChat(
    process.env.STREAM_API_KEY,
    process.env.STREAM_API_SECRET
);

module.exports = { serverClient };
