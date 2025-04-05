import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { documents } from "@/db/schema";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const sessionId = formData.get("sessionId") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "No session ID provided" },
        { status: 400 }
      );
    }

    // In a real application, you would:
    // 1. Upload the file to a storage service (e.g., S3)
    // 2. Get the file URL
    // 3. Store the file metadata in the database

    // For now, we'll just store the file name and type
    const [newDocument] = await db
      .insert(documents)
      .values({
        sessionId,
        title: file.name,
        fileType: file.type,
        content: "", // This would be the file content or URL in a real app
      })
      .returning();

    return NextResponse.json({
      success: true,
      fileId: newDocument.id,
    });
  } catch (error) {
    console.error("Error in upload route:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error uploading file",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 