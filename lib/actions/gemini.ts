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
import { documents, sessions, generated_content } from "@/db/schema";
import { eq } from "drizzle-orm";

// --- Define structure for action results (shared by both actions) ---
export interface ActionResult {
  success: boolean;
  message: string;
  resultText?: string; // To hold the generated text from Gemini
  error?: string;
  inputSource?: "file" | "youtube"; // Optional: Track which action ran
  audioFilePath?: string; // Path to the generated audio file for conversations
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

// Helper functions for content generation
async function generateFlashcards(content: string): Promise<string> {
  // Implement flashcard generation with Gemini
  const model = getGeminiModel();
  const prompt = getPromptForOption("flashcards", "document");
  const result = await model.generateContent(prompt + "\n\n" + content);
  return result.response.text();
}

async function generateSummary(content: string): Promise<string> {
  // Implement summary generation with Gemini
  const model = getGeminiModel();
  const prompt = getPromptForOption("summary", "document");
  const result = await model.generateContent(prompt + "\n\n" + content);
  return result.response.text();
}

async function startConversation(content: string): Promise<string> {
  // Implement conversation generation with Gemini
  const model = getGeminiModel();
  const prompt = getPromptForOption("conversation", "document");
  const result = await model.generateContent(prompt + "\n\n" + content);
  return result.response.text();
}

// Missing functions for content processing from the original file
async function uploadAndProcessDocument(file: File): Promise<string> {
  // Implement document content extraction
  // This could be parsing a PDF, extracting text from a document, etc.
  // For now, let's just return a placeholder
  const text = await file.text();
  return text;
}

async function processYouTubeVideo(url: string): Promise<string> {
  // Implement YouTube video processing
  // This could be fetching transcripts, descriptions, etc.
  // For now, let's just return a placeholder
  return `Content extracted from ${url}`;
}

// --- Server Action for File Uploads ---
export async function uploadAndProcessDocument(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  
  if (!session?.userId) {
    redirect("/sign-in");
  }

  const file = formData.get("file") as File;
  const processingOption = formData.get("processingOption") as string;
  const sessionId = formData.get("sessionId") as string;

  if (!file) {
    return {
      success: false,
      message: "No file provided",
      error: "No file provided",
      inputSource: "file",
    };
  }

  try {
    // Create or get session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const [newSession] = await db
        .insert(sessions)
        .values({
          userId: session.userId,
          title: file.name,
          description: "Document upload session",
        })
        .returning();
      currentSessionId = newSession.id;
    }

    // Upload file and get content
    const content = await uploadAndProcessDocument(file);

    // Save document
    const [document] = await db
      .insert(documents)
      .values({
        userId: session.userId,
        sessionId: currentSessionId,
        title: file.name,
        content,
        fileUrl: file.name,
        fileType: file.type,
      })
      .returning();

    // Generate content based on option
    let generatedContent;
    switch (processingOption) {
      case "flashcards":
        generatedContent = await generateFlashcards(content);
        break;
      case "summary":
        generatedContent = await generateSummary(content);
        break;
      case "conversation":
        generatedContent = await startConversation(content);
        break;
      default:
        generatedContent = await generateSummary(content);
    }

    // Save generated content
    await db.insert(generated_content).values({
      userId: session.userId,
      sessionId: currentSessionId,
      documentId: document.id,
      type: processingOption,
      content: generatedContent,
    });

    // Generate audio if the option is "conversation"
    let audioFilePath = null;
    if (processingOption === "conversation") {
      console.log("Generating audio for conversation...");
      audioFilePath = await generateConversationAudio(generatedContent);
    }

    revalidatePath("/sessions/[id]");
    return {
      success: true,
      message: `Document processed successfully${audioFilePath ? " with audio" : ""}`,
      resultText: generatedContent,
      inputSource: "file",
      audioFilePath: audioFilePath || undefined,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error processing document",
      error: error instanceof Error ? error.message : "Unknown error",
      inputSource: "file",
    };
  }
}

// --- Server Action for YouTube Videos ---
export async function processYouTubeVideo(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  
  if (!session?.userId) {
    redirect("/sign-in");
  }

  const url = formData.get("url") as string;
  const processingOption = formData.get("processingOption") as string;
  const sessionId = formData.get("sessionId") as string;

  if (!url) {
    return {
      success: false,
      message: "No URL provided",
      error: "No URL provided",
      inputSource: "youtube",
    };
  }

  try {
    // Create or get session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const [newSession] = await db
        .insert(sessions)
        .values({
          userId: session.userId,
          title: "YouTube Video",
          description: "YouTube video processing session",
        })
        .returning();
      currentSessionId = newSession.id;
    }

    // Process YouTube video and get content
    const content = await processYouTubeVideo(url);

    // Save document
    const [document] = await db
      .insert(documents)
      .values({
        userId: session.userId,
        sessionId: currentSessionId,
        title: url,
        content,
        fileUrl: url,
        fileType: "youtube",
      })
      .returning();

    // Generate content based on option
    let generatedContent;
    switch (processingOption) {
      case "flashcards":
        generatedContent = await generateFlashcards(content);
        break;
      case "summary":
        generatedContent = await generateSummary(content);
        break;
      case "conversation":
        generatedContent = await startConversation(content);
        break;
      default:
        generatedContent = await generateSummary(content);
    }

    // Save generated content
    await db.insert(generated_content).values({
      userId: session.userId,
      sessionId: currentSessionId,
      documentId: document.id,
      type: processingOption,
      content: generatedContent,
    });

    // Generate audio if the option is "conversation"
    let audioFilePath = null;
    if (processingOption === "conversation") {
      console.log("Generating audio for conversation...");
      audioFilePath = await generateConversationAudio(generatedContent);
    }

    revalidatePath("/sessions/[id]");
    return {
      success: true,
      message: `YouTube video processed successfully${audioFilePath ? " with audio" : ""}`,
      resultText: generatedContent,
      inputSource: "youtube",
      audioFilePath: audioFilePath || undefined,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error processing YouTube video",
      error: error instanceof Error ? error.message : "Unknown error",
      inputSource: "youtube",
    };
  }
}