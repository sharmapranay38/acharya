import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { SessionsListClient } from "./sessions-list-client";
import { unstable_cache } from "next/cache";

interface Session {
  id: number;
  userId: string;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

const getUserSessions = unstable_cache(
  async (userId: string): Promise<Session[]> => {
    try {
      const results = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, userId))
        .orderBy(desc(sessions.createdAt));

      return results.map(session => ({
        ...session,
        createdAt: session.createdAt || new Date(),
        updatedAt: session.updatedAt
      }));
    } catch (error) {
      console.error("Error fetching sessions:", error);
      return [];
    }
  },
  ["user-sessions"],
  {
    revalidate: 60, // Cache for 1 minute
    tags: ["sessions"],
  }
);

export default async function SessionsList() {
  const session = await auth();
  
  if (!session?.userId) {
    return null;
  }

  try {
    console.log("Fetching sessions for user:", session.userId);
    const userSessions = await getUserSessions(session.userId);
    console.log("Found sessions:", userSessions);

    if (!userSessions || userSessions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <h3 className="mt-4 text-lg font-semibold">No Sessions Yet</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Create a new session to get started.
          </p>
        </div>
      );
    }

    return <SessionsListClient sessions={userSessions} />;
  } catch (error) {
    console.error("Error in SessionsList:", error);
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h3 className="mt-4 text-lg font-semibold text-red-500">Error Loading Sessions</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Please try again later.
        </p>
      </div>
    );
  }
} 