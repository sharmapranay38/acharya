import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI("AIzaSyBOX8nx6a9E-R4vQ_sY9LRQ2qYYffxgOZI");

async function main() {
  const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
  const response = await model.generateContent("Explain how AI works");
  const result = response.response;
  console.log(result.text());
}

await main();
