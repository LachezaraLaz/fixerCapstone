const { serverClient } = require('../services/streamClient');

/**
 * @module server/controller
 */

/**
 * Initializes a chat channel for a given issue.
 *
 * @param {string} issueTitle - The title of the issue to be discussed in the chat.
 * @param {string} clientId - The ID of the client initiating the chat.
 * @param {string} professionalId - The ID of the professional to be added to the chat.
 * @returns {Promise<void>} A promise that resolves when the chat channel is created.
 */
async function initChat(issueTitle, clientId, professionalId) {

    const channel = serverClient.channel("messaging",{
        name: issueTitle,
        members: [clientId, professionalId],
        created_by_id: clientId
    });
    await channel.create();
}

module.exports = { initChat };
