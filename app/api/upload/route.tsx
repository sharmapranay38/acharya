// app/api/upload/route.ts - API route handler for uploads

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const processingOption = formData.get("processingOption") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // Processing would typically be handled by backend logic
    // This would connect to your actual processing functions

    // Return a success response
    return NextResponse.json({
      success: true,
      message: "File received and being processed",
      processingOption,
      filename: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process the upload",
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Upload API is running" });
}
