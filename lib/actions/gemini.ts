// app/actions.ts
"use server";

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { createClient } from "@deepgram/sdk";
import fs from "fs";
import { pipeline } from "stream/promises";
import path from "path";
import { Readable } from "stream";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { documents, sessions, generatedContent } from "@/db/schema";
import { eq } from "drizzle-orm";

// --- Define structure for action results (shared by both actions) ---
export interface ActionResult {
  success: boolean;
  message: string;
  resultText?: string; // To hold the generated text from Gemini
  error?: string;
  inputSource?: "file" | "youtube"; // Optional: Track which action ran
  audioFilePath?: string; // Path to the generated audio file for conversations
  flashcardsText?: string; // To hold generated flashcards
  summaryText?: string; // To hold generated summary
  monologueText?: string; // To hold generated monologue
}

// --- Helper function to determine the prompt based on the option ---
// Updated to handle conversation generation
function getPromptForOption(
  option: string | null,
  contentType: "document" | "video"
): string {
  const contentDesc =
    contentType === "video" ? "this video" : "the attached document";
  switch (option) {
    case "flashcards":
      return `Generate concise flashcards (question/answer format) covering the key points of ${contentDesc}:`;
    case "summary":
      return `Provide a detailed summary of ${contentDesc}, highlighting the main arguments, topics, and conclusions:`;
    // --- MODIFIED CASE ---
    case "conversation":
      // Updated to request a single-speaker monologue of 1800-2000 characters
      return `Create a comprehensive spoken monologue by a single speaker (named Alex) discussing the key points from ${contentDesc}. The monologue should be between 1800-2000 characters (aim for close to 2000 but do not exceed it). Make it sound natural and conversational, as if Alex is presenting a podcast episode discussing the content. Structure the response simply as "Alex: [monologue content]" without additional formatting.`;
    // --- END MODIFICATION ---
    case "all":
      return `Process ${contentDesc} and provide: 
      1. FLASHCARDS: Generate a set of concise flashcards (question/answer format) covering the key points.
      2. SUMMARY: Provide a detailed summary highlighting the main arguments, topics, and conclusions.
      3. MONOLOGUE: Create a comprehensive spoken monologue by a single speaker (named Alex) discussing the key points. The monologue should be between 1800-2000 characters (aim for close to 2000 but do not exceed it). Make it sound natural and conversational, as if Alex is presenting a podcast episode.
      
      Format your response with clear headings (FLASHCARDS, SUMMARY, MONOLOGUE) separating each section.`;
    default: // Default or if option is missing
      return `Summarize the key information in ${contentDesc}:`;
  }
}

// --- Helper function to convert File to Gemini Part (for inline data) ---
async function fileToGenerativePart(file: File) {
  const base64EncodedData = Buffer.from(await file.arrayBuffer()).toString(
    "base64"
  );
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
}

// --- Shared Gemini Initialization Logic ---
function getGeminiModel(modelName: string = "gemini-1.5-flash") {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    console.error("GEMINI_API_KEY environment variable not set!");
    throw new Error("Server configuration error: API Key is missing.");
  }
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    return genAI.getGenerativeModel({
      model: modelName,
      // safetySettings: [ // Optional: Keep or remove safety settings as needed
      //     { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }
      // ]
    });
  } catch (error: any) {
    console.error("Error initializing Gemini SDK:", error);
    throw new Error(
      "Server configuration error: Could not initialize AI Model."
    );
  }
}

// --- Function to generate audio from conversation text using Deepgram ---
async function generateConversationAudio(
  conversationText: string
): Promise<string | null> {
  try {
    const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
    if (!deepgramApiKey) {
      console.error("DEEPGRAM_API_KEY environment variable not set!");
      throw new Error(
        "Server configuration error: Deepgram API Key is missing."
      );
    }

    // Enforce strict 2000 character limit for Deepgram
    const MAX_CHARACTER_LIMIT = 2000;
    if (conversationText.length > MAX_CHARACTER_LIMIT) {
      console.warn(
        `Conversation text exceeds ${MAX_CHARACTER_LIMIT} character limit. Truncating...`
      );
      conversationText = conversationText.substring(0, MAX_CHARACTER_LIMIT);
    }

    const deepgram = createClient(deepgramApiKey);

    // Create a unique filename for this conversation
    const timestamp = new Date().getTime();
    const outputDir = path.join(process.cwd(), "public", "audio");
    const outputFileName = `conversation-${timestamp}.mp3`;
    const outputPath = path.join(outputDir, outputFileName);
    const publicPath = `/audio/${outputFileName}`;

    // Ensure the directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const response = await deepgram.speak.request(
      { text: conversationText },
      {
        model: "aura-arcas-en",
      }
    );

    const stream = await response.getStream();
    if (stream) {
      const file = fs.createWriteStream(outputPath);

      // Convert Web Stream to Node.js Readable stream
      const chunks: Uint8Array[] = [];
      const reader = stream.getReader();

      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          chunks.push(value);
        }
      }

      // Create a readable stream from the chunks
      const nodeStream = Readable.from(Buffer.concat(chunks));

      // Pipe to file using Node.js streams
      await pipeline(nodeStream, file);

      console.log(`Audio file written to ${outputPath}`);
      return publicPath;
    } else {
      console.error("Error generating audio: No stream returned");
      return null;
    }
  } catch (error: any) {
    console.error("Error generating audio with Deepgram:", error);
    return null;
  }
}

// Helper function to extract content from all-in-one response
function extractContentSections(text: string) {
  // Initialize with empty values
  let flashcards = "";
  let summary = "";
  let monologue = "";

  // Extract flashcards section
  const flashcardsMatch = text.match(
    /FLASHCARDS:?([\s\S]*?)(?=SUMMARY:|MONOLOGUE:|$)/i
  );
  if (flashcardsMatch && flashcardsMatch[1]) {
    flashcards = flashcardsMatch[1].trim();
  }

  // Extract summary section
  const summaryMatch = text.match(
    /SUMMARY:?([\s\S]*?)(?=FLASHCARDS:|MONOLOGUE:|$)/i
  );
  if (summaryMatch && summaryMatch[1]) {
    summary = summaryMatch[1].trim();
  }

  // Extract monologue section (might contain "Alex:" prefix)
  const monologueMatch = text.match(
    /MONOLOGUE:?([\s\S]*?)(?=FLASHCARDS:|SUMMARY:|$)/i
  );
  if (monologueMatch && monologueMatch[1]) {
    monologue = monologueMatch[1].trim();
    // If monologue contains "Alex:" prefix, keep only what follows
    const alexMatch = monologue.match(/Alex:?([\s\S]*)/i);
    if (alexMatch && alexMatch[1]) {
      monologue = alexMatch[1].trim();
    }
  }

  return { flashcards, summary, monologue };
}

// --- Server Action for File Uploads ---
export async function uploadAndProcessDocument(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  console.log("Server Action: uploadAndProcessDocument triggered.");
  const file = formData.get("file") as File | null;
  const processingOption = formData.get("processingOption") as string | null;

  // Validation (remains the same)
  if (!file || file.size === 0) {
    return {
      success: false,
      message: "No file provided.",
      error: "File Missing",
      inputSource: "file",
    };
  }
  if (file.size > 15 * 1024 * 1024) {
    return {
      success: false,
      message: "File exceeds 15MB limit.",
      error: "File Too Large",
      inputSource: "file",
    };
  }
  const allowedTypes = [
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      message: "Unsupported file type (PDF, DOC, DOCX, TXT only).",
      error: "Invalid File Type",
      inputSource: "file",
    };
  }

  console.log(
    `File: ${file.name}, Type: ${file.type}, Option: ${processingOption}`
  );

  try {
    const model = getGeminiModel("gemini-1.5-flash");
    const textPrompt = getPromptForOption(processingOption, "document");
    const filePart = await fileToGenerativePart(file);

    console.log("Sending file request to Gemini...");
    const result = await model.generateContent([textPrompt, filePart]);
    const response = result.response;
    const generatedText = response.text();
    console.log("Gemini response received.");

    // For "all" option, extract individual content sections
    let flashcardsText, summaryText, monologueText;
    let audioFilePath = null;

    if (processingOption === "all") {
      const sections = extractContentSections(generatedText);
      flashcardsText = sections.flashcards;
      summaryText = sections.summary;
      monologueText = sections.monologue;

      // Generate audio for the monologue part
      if (monologueText) {
        console.log("Generating audio for monologue...");
        audioFilePath = await generateConversationAudio(monologueText);
      }
    } else {
      // Generate audio if the option is "conversation"
      if (processingOption === "conversation") {
        console.log("Generating audio for conversation...");
        audioFilePath = await generateConversationAudio(generatedText);
      }
    }

    // Success message remains generic but accurate
    return {
      success: true,
      message: `Successfully processed '${file.name}' for ${
        processingOption === "all"
          ? "flashcards, summary & monologue"
          : processingOption || "summary"
      }.${audioFilePath ? " Audio generated." : ""}`,
      resultText: generatedText,
      inputSource: "file",
      audioFilePath: audioFilePath || undefined,
      flashcardsText: flashcardsText,
      summaryText: summaryText,
      monologueText: monologueText,
    };
  } catch (error: any) {
    console.error("Error processing file with Gemini:", error);
    let errorMessage = "An unexpected error occurred during processing.";
    if (error.message.includes("SAFETY")) {
      errorMessage = "Content generation blocked due to safety settings.";
    } else if (error.message.includes("429")) {
      errorMessage = "Rate limit exceeded. Please try again later.";
    } else if (error.message.includes("API key not valid")) {
      errorMessage = "Invalid API Key.";
    } else if (error.message.includes("Could not initialize AI Model")) {
      errorMessage = error.message;
    }

    return {
      success: false,
      message: errorMessage,
      error: error.message || "Unknown API error",
      inputSource: "file",
    };
  }
}

// --- Server Action for YouTube Videos ---
export async function processYouTubeVideo(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  console.log("Server Action: processYouTubeVideo triggered.");
  const youtubeUrl = formData.get("youtubeUrl") as string | null;
  const processingOption = formData.get("processingOption") as string | null;

  // Validation (remains the same)
  if (
    !youtubeUrl ||
    typeof youtubeUrl !== "string" ||
    youtubeUrl.trim() === ""
  ) {
    return {
      success: false,
      message: "YouTube URL is required.",
      error: "URL Missing",
      inputSource: "youtube",
    };
  }
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/;
  if (!youtubeRegex.test(youtubeUrl)) {
    return {
      success: false,
      message: "Please enter a valid YouTube URL.",
      error: "Invalid URL Format",
      inputSource: "youtube",
    };
  }

  console.log(`Processing URL: ${youtubeUrl}, Option: ${processingOption}`);

  try {
    // Assuming there's some function to extract YouTube content (transcript/summary)
    // This would be implementation-specific to your needs
    // For now, let's call our model directly with the YouTube URL as context

    const model = getGeminiModel("gemini-1.5-flash");
    const textPrompt = `${getPromptForOption(processingOption, "video")} 
    YouTube Link: ${youtubeUrl}`;

    // Typical safety check (you can adjust thresholds as needed)
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    console.log("Sending YouTube URL request to Gemini...");
    const result = await model.generateContent(textPrompt);
    const response = result.response;
    const generatedText = response.text();
    console.log("Gemini response received for YouTube URL.");

    // For "all" option, extract individual content sections
    let flashcardsText, summaryText, monologueText;
    let audioFilePath = null;

    if (processingOption === "all") {
      const sections = extractContentSections(generatedText);
      flashcardsText = sections.flashcards;
      summaryText = sections.summary;
      monologueText = sections.monologue;

      // Generate audio for the monologue part
      if (monologueText) {
        console.log("Generating audio for monologue...");
        audioFilePath = await generateConversationAudio(monologueText);
      }
    } else {
      // Generate audio if the option is "conversation"
      if (processingOption === "conversation") {
        console.log("Generating audio for conversation...");
        audioFilePath = await generateConversationAudio(generatedText);
      }
    }

    return {
      success: true,
      message: `Successfully processed YouTube video for ${
        processingOption === "all"
          ? "flashcards, summary & monologue"
          : processingOption || "summary"
      }.${audioFilePath ? " Audio generated." : ""}`,
      resultText: generatedText,
      inputSource: "youtube",
      audioFilePath: audioFilePath || undefined,
      flashcardsText: flashcardsText,
      summaryText: summaryText,
      monologueText: monologueText,
    };
  } catch (error: any) {
    console.error("Error processing YouTube URL with Gemini:", error);
    let errorMessage = "An unexpected error occurred during processing.";
    if (error.message.includes("SAFETY")) {
      errorMessage = "Content generation blocked due to safety settings.";
    } else if (error.message.includes("429")) {
      errorMessage = "Rate limit exceeded. Please try again later.";
    } else if (error.message.includes("API key not valid")) {
      errorMessage = "Invalid API Key.";
    }

    return {
      success: false,
      message: errorMessage,
      error: error.message || "Unknown API error",
      inputSource: "youtube",
    };
  }
}
