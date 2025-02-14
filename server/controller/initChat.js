const { serverClient } = require('../services/streamClient');

async function initChat(issueTitle, clientId, professionalId) {

    const channel = serverClient.channel("messaging",{
        name: issueTitle,
        members: [clientId, professionalId],
        created_by_id: clientId
    });
    await channel.create();
}

module.exports = { initChat };
