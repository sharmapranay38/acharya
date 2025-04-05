import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"; // Needed for GET
import { db } from "@/db"; // Your Drizzle db instance
import { sessions } from "@/db/schema"; // Your sessions table schema
import { eq, desc } from "drizzle-orm"; // Drizzle functions

// --- POST Handler: Create a new session ---
export async function POST(request: NextRequest) {
  try {
    // 1. Parse Request Body
    const { userId, title, description } = await request.json();

    // 2. Validate Input
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }
    if (!title) {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      );
    }

    console.log("Creating session with data:", { userId, title, description });

    // 3. Insert into Database (without .returning())
    const insertResult = await db
      .insert(sessions)
      .values({
        userId,
        title,
        description: description || "", // Use provided description or default to empty string
      });

    // 4. Get the ID of the inserted row
    // Drizzle's MySQL drivers might return the ID differently. Check your driver's docs.
    // Common patterns include insertResult.insertId or insertResult[0].insertId
    // Using optional chaining and nullish coalescing for robustness:
    const insertedId = insertResult?.insertId ?? insertResult?.[0]?.insertId;

    // 5. Verify ID and Fetch the newly created session
    if (!insertedId) {
      // This case indicates an issue with the insert or how the ID is returned
      console.error("Insert might have failed or insertId was not found in the result:", insertResult);
      return NextResponse.json(
        { success: false, message: "Failed to create session or retrieve its ID" },
        { status: 500 }
      );
    }

    console.log("Session insertion successful. Inserted ID:", insertedId);

    // Fetch the complete session object using the obtained ID
    const [newSession] = await db
        .select()
        .from(sessions)
        // IMPORTANT: Replace 'sessions.id' below if your primary key column
        // in the 'sessions' table has a different name (e.g., sessions.sessionId)
        .where(eq(sessions.id, insertedId))
        .limit(1); // Ensure only one record is fetched

    // 6. Handle Fetch Result
    if (!newSession) {
         // This is unlikely if the insert succeeded but handle it just in case
         console.error("Failed to fetch newly created session with ID:", insertedId);
         // Return success=true because the insert worked, but indicate the fetch issue
         return NextResponse.json({
            success: true,
            message: "Session created but could not fetch details immediately",
            insertedId: insertedId // Optionally return the ID
        });
    }

    console.log("Session created and fetched successfully:", newSession);

    // 7. Return Success Response
    return NextResponse.json({ success: true, session: newSession });

  } catch (error) {
    // 8. Handle Generic Errors
    console.error("Error creating session:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error creating session",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// --- GET Handler: Fetch sessions for the authenticated user ---
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate User
    const session = await auth(); // Get user session from Clerk

    if (!session?.userId) {
      // User not logged in or session invalid
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.userId;
    console.log("Fetching sessions for user:", userId);

    // 2. Fetch Sessions from Database
    const userSessions = await db
      .select() // Select all columns
      .from(sessions) // From the sessions table
      .where(eq(sessions.userId, userId)) // Where userId matches the authenticated user
      .orderBy(desc(sessions.createdAt)); // Order by creation date, newest first

    console.log("Found sessions:", userSessions);

    // 3. Return Success Response
    return NextResponse.json({ success: true, sessions: userSessions });

  } catch (error) {
    // 4. Handle Generic Errors
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching sessions",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}