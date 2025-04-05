import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { SessionsListClient } from "./sessions-list-client";

export default async function SessionsList() {
  const session = await auth();
  
  if (!session?.userId) {
    return null;
  }

  try {
    console.log("Fetching sessions for user:", session.userId);

    const userSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, session.userId))
      .orderBy(desc(sessions.createdAt));

    console.log("Found sessions:", userSessions);

    return <SessionsListClient sessions={userSessions} />;
  } catch (error) {
    console.error("Error in SessionsList:", error);
    return null;
  }
} 