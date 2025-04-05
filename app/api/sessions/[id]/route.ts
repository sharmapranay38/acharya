import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { sessions, documents, generatedContent } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const sessionId = parseInt(params.id, 10);
    if (isNaN(sessionId)) {
      return NextResponse.json(
        { success: false, message: "Invalid session ID" },
        { status: 400 }
      );
    }

    const [currentSession] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId));

    if (!currentSession) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 }
      );
    }

    const sessionDocuments = await db
      .select()
      .from(documents)
      .where(eq(documents.sessionId, sessionId));

    const sessionContent = await db
      .select()
      .from(generatedContent)
      .where(eq(generatedContent.sessionId, sessionId));

    const flashcards = sessionContent.filter((content) => content.type === "flashcards");
    const summaries = sessionContent.filter((content) => content.type === "summary");
    const podcasts = sessionContent.filter((content) => content.type === "podcast");

    return NextResponse.json({
      success: true,
      session: currentSession,
      documents: sessionDocuments,
      content: {
        flashcards,
        summaries,
        podcasts,
      },
    });
  } catch (error) {
    console.error("Error fetching session:", error); // Log the full error
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching session",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}