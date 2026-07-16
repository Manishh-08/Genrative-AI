import 'dotenv/config';
import {GoogleGenAI} from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: 'hey Gemini, my name is Manish',
  });
  console.log(response.text);
}

main();