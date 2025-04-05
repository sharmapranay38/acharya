// app/actions.ts
"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Define structure for action results ---
export interface ActionResult {
  success: boolean;
  message: string;
  resultText?: string; // To hold the generated text from Gemini
  error?: string;
}

// --- Helper function to determine the prompt based on the option ---
function getPromptForOption(option: string | null): string {
  switch (option) {
    case "flashcards":
      return "Generate concise flashcards (question/answer format) covering the key points of the attached document:";
    case "summary":
      return "Provide a detailed summary of the attached document, highlighting the main arguments and conclusions:";
    case "podcast":
      return "Create a script for a short podcast episode (around 2-3 minutes) explaining the core concepts of the attached document in an engaging way:";
    default: // Default or if option is missing
      return "Summarize the key information in the attached document:";
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

// --- Server Action ---
export async function uploadAndProcessDocument(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  console.log("Server Action: uploadAndProcessDocument triggered.");

  // --- !!! SECURITY WARNING !!! ---
  // --- NEVER Hardcode API Keys ---
  // Use Environment Variables
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    console.error("GEMINI_API_KEY environment variable not set!");
    return {
      success: false,
      message: "Server configuration error.",
      error: "API Key is missing.",
    };
  }
  // --- End Security Warning ---

  const file = formData.get("file") as File | null;
  const processingOption = formData.get("processingOption") as string | null;

  // --- Validation ---
  if (!file || file.size === 0) {
    return {
      success: false,
      message: "No file provided or file is empty.",
      error: "File Missing",
    };
  }
  // Add size/type validation on server too for robustness
  if (file.size > 10 * 1024 * 1024) {
    // 10MB limit
    return {
      success: false,
      message: "File exceeds 10MB limit.",
      error: "File Too Large",
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
      message: "Unsupported file type.",
      error: "Invalid File Type",
    };
  }

  console.log(
    `Processing file: ${file.name}, Type: ${file.type}, Size: ${file.size}`
  );
  console.log(`Processing option: ${processingOption}`);

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    // Use a model that supports text and general file understanding
    // gemini-1.5-flash is often a good choice for mixed tasks
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 1. Prepare the prompt based on the selected option
    const textPrompt = getPromptForOption(processingOption);

    // 2. Prepare the file data for inline use
    const filePart = await fileToGenerativePart(file);

    // 3. Generate content using the text prompt and the inline file data
    console.log("Sending request to Gemini...");
    const result = await model.generateContent([textPrompt, filePart]);
    const response = result.response;
    const generatedText = response.text();
    console.log("Gemini response received.");

    return {
      success: true,
      message: `Successfully processed '${file.name}' for ${
        processingOption || "summary"
      }.`,
      resultText: generatedText,
    };
  } catch (error: any) {
    console.error("Error processing file with Gemini:", error);
    // Provide more specific error messages if possible
    let errorMessage = "An unexpected error occurred during processing.";
    if (error.message.includes("SAFETY")) {
      errorMessage = "Content generation blocked due to safety settings.";
    } else if (error.message.includes("429")) {
      errorMessage = "Rate limit exceeded. Please try again later.";
    } else if (error.message.includes("API key not valid")) {
      errorMessage = "Invalid API Key. Please check server configuration.";
    }

    return {
      success: false,
      message: errorMessage,
      error: error.message || "Unknown Gemini API error",
    };
  }
}
