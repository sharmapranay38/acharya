// app/actions.ts
"use server";

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

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
    const textPrompt = getPromptForOption(processingOption, "document"); // Will now use the conversation prompt if option is 'conversation'
    const filePart = await fileToGenerativePart(file);

    console.log("Sending file request to Gemini...");
    const result = await model.generateContent([textPrompt, filePart]);
    const response = result.response;
    const generatedText = response.text();
    console.log("Gemini response received.");

    // Success message remains generic but accurate
    return {
      success: true,
      message: `Successfully processed '${file.name}' for ${
        processingOption || "summary"
      }.`,
      resultText: generatedText,
      inputSource: "file",
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
    const model = getGeminiModel("gemini-1.5-flash");
    const textPrompt = getPromptForOption(processingOption, "video"); // Will now use the conversation prompt if option is 'conversation'
    const videoPart = {
      fileData: {
        mimeType: "video/mp4",
        fileUri: youtubeUrl,
      },
    };

    console.log("Sending YouTube URL request to Gemini...");
    const result = await model.generateContent([textPrompt, videoPart]);
    const response = result.response;
    const generatedText = response.text();
    console.log("Gemini response received for YouTube video.");

    // Success message remains generic but accurate
    return {
      success: true,
      message: `Successfully processed YouTube video for ${
        processingOption || "summary"
      }.`,
      resultText: generatedText,
      inputSource: "youtube",
    };
  } catch (error: any) {
    console.error("Error processing YouTube URL with Gemini:", error);
    let errorMessage = "An unexpected error occurred during video processing.";
    if (
      error.message.includes("Failed to fetch") ||
      error.message.includes("Error fetching URI") ||
      error.message.includes("Cannot access URI")
    ) {
      errorMessage =
        "Could not access or process the provided YouTube URL. Please check the URL or try again later.";
    } else if (error.message.includes("SAFETY")) {
      errorMessage = "Content generation blocked due to safety settings.";
    } else if (error.message.includes("429")) {
      errorMessage = "Rate limit exceeded. Please try again later.";
    } else if (error.message.includes("API key not valid")) {
      errorMessage = "Invalid API Key.";
    } else if (error.message.includes("Could not initialize AI Model")) {
      errorMessage = error.message;
    } else if (
      error.status === "FAILED_PRECONDITION" ||
      error.message.includes("Media processing failed")
    ) {
      errorMessage =
        "Video processing failed. The video might be too long, unavailable, or in an unsupported format.";
    }

    return {
      success: false,
      message: errorMessage,
      error: error.message || "Unknown API error during video processing",
      inputSource: "youtube",
    };
  }
}
