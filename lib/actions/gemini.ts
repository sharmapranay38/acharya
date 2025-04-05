// app/actions.ts
"use server";

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
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
      // Changed from "podcast" to "conversation"
      // Updated prompt to generate a ~2000 character conversation
      return `Create a coherent and engaging conversation (around 2000 characters total) between two people (e.g., Alex and Ben) discussing the core concepts and key takeaways presented in ${contentDesc}. Ensure the dialogue flows naturally, explores the main topics, and could be used for further analysis or understanding. Structure it clearly, indicating the speakers (e.g., Alex:, Ben:).`;
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

    revalidatePath("/sessions/[id]");
    return {
      success: true,
      message: "Document processed successfully",
      inputSource: "file",
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

    revalidatePath("/sessions/[id]");
    return {
      success: true,
      message: "YouTube video processed successfully",
      inputSource: "youtube",
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
