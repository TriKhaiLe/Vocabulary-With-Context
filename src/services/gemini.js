import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const translateWithGemini = async (text, isWord = false) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = isWord 
      ? `Translate the following English word to Vietnamese and return only the most accurate and concise meaning: "${text}". Provide no additional explanations.`
      : `Translate the following English sentence to Vietnamese and return only the most accurate and concise translation: "${text}". Provide no additional explanations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Failed to translate text');
  }
};
