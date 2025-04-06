import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, generatedContent } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createClient } from "@deepgram/sdk";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

// Function to generate audio from text using Deepgram
async function generateAudio(text: string): Promise<string | null> {
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
    if (text.length > MAX_CHARACTER_LIMIT) {
      console.warn(
        `Text exceeds ${MAX_CHARACTER_LIMIT} character limit. Truncating...`
      );
      text = text.substring(0, MAX_CHARACTER_LIMIT);
    }

    const deepgram = createClient(deepgramApiKey);

    // Create a unique filename
    const timestamp = new Date().getTime();
    const outputDir = path.join(process.cwd(), "public", "audio");
    const outputFileName = `regenerated-${timestamp}.mp3`;
    const outputPath = path.join(outputDir, outputFileName);
    const publicPath = `/audio/${outputFileName}`;

    // Ensure the directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const response = await deepgram.speak.request(
      { text },
      { model: "aura-arcas-en" }
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
  } catch (error) {
    console.error("Error generating audio with Deepgram:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  // Extract sessionId from the URL path segments
  const pathParts = request.nextUrl.pathname.split('/');
  const sessionId = pathParts[pathParts.indexOf('sessions') + 1];
  
  if (!sessionId) {
    return NextResponse.json({ error: "Invalid Session ID" }, { status: 400 });
  }

  const sessionIdNum = parseInt(sessionId, 10);

  if (isNaN(sessionIdNum)) {
    return NextResponse.json({ error: "Invalid Session ID" }, { status: 400 });
  }

  try {
    // Get body data
    const { contentId, contentType } = await request.json();

    if (!contentId) {
      return NextResponse.json(
        { error: "Content ID is required" },
        { status: 400 }
      );
    }

    // Find the content item
    const contentItems = await db
      .select()
      .from(generatedContent)
      .where(
        and(
          eq(generatedContent.id, contentId),
          eq(generatedContent.sessionId, sessionIdNum)
        )
      )
      .execute();

    if (!contentItems || contentItems.length === 0) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    const contentItem = contentItems[0];

    // Extract the text content based on content type (monologue, summary, etc.)
    let textToConvert = "";
    let originalContent = contentItem.content;

    console.log(
      `Processing content item ID ${contentId} of type ${contentType}`
    );
    console.log("Original content type:", typeof originalContent);

    // Log the first part of the content to understand its structure without logging everything
    if (typeof originalContent === "string") {
      console.log(
        "Content preview (string):",
        originalContent.substring(0, 200) + "..."
      );
    } else {
      console.log(
        "Content preview (object):",
        JSON.stringify(originalContent).substring(0, 200) + "..."
      );
    }

    if (typeof originalContent === "string") {
      try {
        const parsed = JSON.parse(originalContent);
        console.log("Parsed content type:", typeof parsed);

        if (contentType === "monologue" || contentType === "podcast") {
          // For audio content, try multiple possible text locations
          if (
            typeof parsed === "object" &&
            parsed !== null &&
            "text" in parsed
          ) {
            textToConvert = parsed.text as string;
          } else if (
            typeof parsed === "object" &&
            parsed !== null &&
            "content" in parsed &&
            typeof parsed.content === "string"
          ) {
            textToConvert = parsed.content;
          } else if (typeof parsed === "string") {
            textToConvert = parsed;
          } else {
            // Fallback to stringify if no text field is found
            textToConvert = JSON.stringify(parsed);
          }
        } else if (contentType === "summary") {
          // For summaries
          if (typeof parsed === "string") {
            textToConvert = parsed;
          } else if (
            typeof parsed === "object" &&
            parsed !== null &&
            "content" in parsed &&
            typeof parsed.content === "string"
          ) {
            textToConvert = parsed.content;
          } else {
            textToConvert = JSON.stringify(parsed);
          }
        } else {
          // For other content types
          textToConvert =
            typeof parsed === "string" ? parsed : JSON.stringify(parsed);
        }
      } catch (e) {
        console.log("Error parsing content as JSON, using as raw text");
        textToConvert = originalContent;
      }
    } else if (
      typeof originalContent === "object" &&
      originalContent !== null
    ) {
      // Content is already an object
      const contentObj = originalContent as Record<string, any>;
      if (contentType === "monologue" || contentType === "podcast") {
        textToConvert =
          contentObj.text || contentObj.content || JSON.stringify(contentObj);
      } else {
        textToConvert = JSON.stringify(contentObj);
      }
    } else {
      textToConvert = String(originalContent || "");
    }

    console.log(`Text to convert length: ${textToConvert.length}`);
    console.log(
      `Text to convert preview: ${textToConvert.substring(0, 100)}...`
    );

    // Generate audio from the text
    const audioPath = await generateAudio(textToConvert);

    if (!audioPath) {
      return NextResponse.json(
        {
          error: "Failed to generate audio",
        },
        { status: 500 }
      );
    }

    console.log(`Generated audio path: ${audioPath}`);

    // Update the content item with the new audio path
    let updatedContent;

    if (typeof originalContent === "string") {
      try {
        // Try to parse it as JSON first
        const parsed = JSON.parse(originalContent);
        if (typeof parsed === "object" && parsed !== null) {
          // For objects, add/update the audioPath property
          updatedContent = JSON.stringify({
            ...parsed,
            audioPath: audioPath,
          });
        } else {
          // For non-objects, create a new object with text and audioPath
          updatedContent = JSON.stringify({
            text: originalContent,
            audioPath: audioPath,
          });
        }
      } catch (e) {
        // If not valid JSON, create a new object
        updatedContent = JSON.stringify({
          text: originalContent,
          audioPath: audioPath,
        });
      }
    } else if (typeof originalContent === "object" && originalContent !== null) {
      // For objects, add/update the audioPath property
      const contentObj = originalContent as Record<string, any>;
      updatedContent = JSON.stringify({
        ...contentObj,
        audioPath: audioPath,
      });
    } else {
      // Fallback for any other type
      updatedContent = JSON.stringify({
        text: String(originalContent),
        audioPath: audioPath,
      });
    }

    console.log(
      "Updated content structure:",
      typeof updatedContent === "string"
        ? updatedContent.substring(0, 100) + "..."
        : JSON.stringify(updatedContent).substring(0, 100) + "..."
    );

    // Update the content item in the database
    await db
      .update(generatedContent)
      .set({
        content: updatedContent,
        updatedAt: new Date(),
      })
      .where(eq(generatedContent.id, contentId))
      .execute();

    return NextResponse.json({
      success: true,
      audioPath,
      message: "Audio regenerated successfully",
    });
  } catch (error) {
    console.error("Error in regenerate audio API:", error);
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
