// services/aiEnhancementService.js
const axios = require('axios');

async function enhanceIssueDescription(userDescription) {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions';

    try {
        const response = await axios.post(url,
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are a helpful assistant that improves home service and blue-collar job descriptions.
                        If the description is **not** related to these fields (e.g., programming, finance, consulting, AI, etc.), 
                        respond with exactly "INVALID CATEGORY" (no extra text). Otherwise, improve the description while keeping it concise, clear, and under 300 words.`
                    },
                    {
                        role: 'user',
                        content: userDescription
                    }
                ],
                max_tokens: 500, // to ensure response don't exceed 300 words (One token ~0.75 words, so 500 tokens is ~375 words.)
                temperature: 0.7
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${OPENAI_API_KEY}`
                }
            }
        );

        const aiMessage = response.data.choices[0].message.content;
        return aiMessage.trim();
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        throw error;
    }
}

module.exports = { enhanceIssueDescription };
