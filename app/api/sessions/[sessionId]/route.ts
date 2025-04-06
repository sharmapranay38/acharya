import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db"; // Assuming @/ is configured for your src directory
import { sessions, generatedContent } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  // Extract sessionId from the URL path segments
  const pathParts = request.nextUrl.pathname.split('/');
  const sessionIdString = pathParts[pathParts.indexOf('sessions') + 1];

  if (!sessionIdString) {
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 }
    );
  }

  const sessionId = parseInt(sessionIdString, 10);
  if (isNaN(sessionId)) {
    return NextResponse.json(
      { error: "Invalid Session ID format" },
      { status: 400 }
    );
  }

  try {
    // Get the session using PostgreSQL query format
    const sessionResults = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .execute();

    if (!sessionResults || sessionResults.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const session = sessionResults[0];

    // Fetch related generated content separately using PostgreSQL query format
    const relatedContent = await db
      .select()
      .from(generatedContent)
      .where(eq(generatedContent.sessionId, sessionId))
      .execute();

    // Debug: Log what we found
    console.log(`Session ${sessionId} found:`, session);
    console.log(
      `Related content for session ${sessionId}:`,
      relatedContent.length > 0 ? "Found content" : "No content found"
    );
    if (relatedContent.length > 0) {
      console.log(
        `Content types:`,
        relatedContent.map((item) => item.type).join(", ")
      );
    }

    // Combine session data with its generated content
    const result = {
      ...session,
      generatedContent: relatedContent,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
  // No need to disconnect with serverless functions usually, connection pooling handles it.
}

// TEST ENDPOINT: Add sample content to a session
export async function PUT(request: NextRequest) {
  // Extract sessionId from the URL path segments
  const pathParts = request.nextUrl.pathname.split('/');
  const sessionIdString = pathParts[pathParts.indexOf('sessions') + 1];

  if (!sessionIdString) {
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 }
    );
  }

  const sessionId = parseInt(sessionIdString, 10);
  if (isNaN(sessionId)) {
    return NextResponse.json(
      { error: "Invalid Session ID format" },
      { status: 400 }
    );
  }

  try {
    // 1. Check if session exists using PostgreSQL query format
    const sessionResults = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .execute();

    if (!sessionResults || sessionResults.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const session = sessionResults[0];

    // 2. Create sample content entries
    const sampleContentTypes = [
      {
        type: "summary",
        content:
          "This is a sample summary of the session content. It highlights the key points that were discussed during the session.",
      },
      {
        type: "flashcards",
        content: JSON.stringify([
          { question: "What is the main topic?", answer: "Sample topic 1" },
          {
            question: "What is an important concept?",
            answer: "Sample concept explanation",
          },
        ]),
      },
      {
        type: "podcast",
        content: JSON.stringify({
          audioUrl: "https://example.com/sample-podcast.mp3",
          title: "Sample Podcast",
          duration: "10:30",
        }),
      },
    ];

    // 3. Insert the sample content using PostgreSQL query format
    const insertPromises = sampleContentTypes.map((sample) =>
      db.insert(generatedContent).values({
        sessionId,
        userId: session.userId,
        type: sample.type,
        content: sample.content,
      }).execute()
    );

    await Promise.all(insertPromises);

    // 4. Return success
    return NextResponse.json({
      success: true,
      message: "Sample content created for session",
      contentTypes: sampleContentTypes.map((c) => c.type),
    });
  } catch (error) {
    console.error("Error creating sample content:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
