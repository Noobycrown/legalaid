const axios = require('axios');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Shared function to call Gemini API
const callGeminiAPI = async (prompt) => {
  try {
    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    throw new Error('Gemini API request failed.');
  }
};

// Summarize Indian legal case
const summarizeCase = async (caseText) => {
  const prompt = `
You are a legal assistant trained in Indian law.
Please summarize the following legal case clearly and concisely.
Mention the issue, facts, important sections involved (IPC/CrPC/Constitution), and conclusion in bullet points if possible.

Case Text:
"${caseText}"
`;
  return await callGeminiAPI(prompt);
};

// Analyze legal contract
const analyzeContract = async (contractText) => {
  const prompt = `
You are a legal assistant specialized in Indian law.
Analyze the following contract text and provide a concise summary highlighting key clauses, risks, obligations, and recommendations.

Contract Text:
"${contractText}"
`;
  return await callGeminiAPI(prompt);
};

// Recommend legal sections based on case
const recommendSections = async (caseText) => {
  const prompt = `
You are a legal assistant AI trained in Indian law.
Given the following case details, identify the most relevant legal sections (IPC, CrPC, Contract Act, etc.) that apply.
Mention the section number and name, and explain briefly why it applies.

Case:
${caseText}

Respond in bullet points.
`;
  return await callGeminiAPI(prompt);
};

module.exports = {
  summarizeCase,
  analyzeContract,
  recommendSections,
};
