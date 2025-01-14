import { GoogleGenerativeAI } from "@google/generative-ai";

// Replace with your API key
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const translateWithGemini = async (text, isWord = false) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = isWord 
      ? `Translate this English word to Vietnamese and provide its meaning: "${text}"`
      : `Translate this English sentence to Vietnamese: "${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Failed to translate text');
  }
};
