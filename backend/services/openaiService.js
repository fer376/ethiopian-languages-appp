// services/openaiService.js
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generateAmharicLesson = async (topic) => {
  const prompt = `Create a beginner Amharic lesson about "${topic}". 
  Return a JSON object with a "title" and an array "exercises".
  Each exercise must have:
  - "question": The Amharic word/sentence in Ge'ez script.
  - "phonetic": How to pronounce it.
  - "correctAnswer": The English translation.
  - "options": An array of 4 strings (the correct answer + 3 distractors).`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content);
};

module.exports = { generateAmharicLesson };