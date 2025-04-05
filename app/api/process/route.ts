// /app/api/process/route.js
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import os from "os";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

// Get your API key from environment variables
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI("AIzaSyBOX8nx6a9E-R4vQ_sY9LRQ2qYYffxgOZI");

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const fileBase64 = formData.get("fileBase64");
    const fileName = formData.get("fileName") as string;
    const mimeType = formData.get("mimeType") as string;
    const optionsStr = formData.get("options");
    const options = optionsStr ? JSON.parse(optionsStr as string) : {};

    if (!file || !fileBase64) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Create a temporary file path
    const tempDir = os.tmpdir();
    const filePath = path.join(tempDir, fileName);

    // Convert base64 back to buffer and save temporarily
    const buffer = Buffer.from(fileBase64 as string, "base64");
    await writeFile(filePath, buffer);

    // Initialize the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    // Prepare the prompt based on selected options
    let promptText = "Analyze this content";
    if (options.flashcards) promptText += " and create flashcards";
    if (options.summary) promptText += " and generate a comprehensive summary";
    if (options.podcast) promptText += " and create a podcast script";

    // Generate content using the file
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: promptText },
            {
              inlineData: {
                mimeType: mimeType,
                data: fileBase64 as string,
              },
            },
          ],
        },
      ],
    });

    // Clean up the temp file
    fs.unlinkSync(filePath);

    // Return the result
    return NextResponse.json({
      success: true,
      text: result.response.text(),
      options: options,
    });
  } catch (error: any) {
    console.error("Error processing file:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process the file" },
      { status: 500 }
    );
  }
}
