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
                        content: `You are a helpful assistant that refines job descriptions for home services and blue-collar work.
                        Your goal is to rewrite descriptions to be clear, precise, and professional.
                        Avoid marketing language, service offers, or exaggerated claims.
                        Only clarify what the problem is in a concise and neutral tone.
                        Do NOT add unnecessary details or assumptions.
                        If the description is **not** related to these fields (e.g., plumbing, electrical work, carpentry, roofing, HVAC, cleaning, painting, landscaping, handyman services, pest control, construction, installation, moving services. etc.), 
                        respond with exactly "INVALID CATEGORY" (no extra text). 
                        Otherwise, improve the description while keeping it concise, clear, and under 300 words.`
                    },
                    {
                        role: 'user',
                        content: userDescription
                    }
                ],
                max_tokens: 500, // to ensure response don't exceed 300 words (One token ~0.75 words, so 500 tokens is ~375 words.)                temperature: 0.7
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${OPENAI_API_KEY}`
                }
            }
        );

        const aiMessage = response.data.choices[0].message.content.trim();

        // Check if GPT says "INVALID CATEGORY"
        if (aiMessage === "INVALID CATEGORY") {
            return { error: "Invalid job category. Please provide a home service or blue-collar job description." };
        }

        return { improvedDescription: aiMessage };
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        throw error;
    }
}

module.exports = { enhanceIssueDescription };
