"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

// Define a type for the detailed session data including generated content
interface GeneratedContent {
  id: number;
  type: string; // 'summary', 'flashcards', 'podcast', etc.
  content: any; // Content can be JSON, string, etc.
  documentId?: number | null;
  createdAt: string;
}

interface SessionDetails {
  id: number;
  userId: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  generatedContent: GeneratedContent[];
}

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params?.sessionId;
  const [sessionData, setSessionData] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingContent, setAddingContent] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError("Session ID not found in URL.");
      setLoading(false);
      return;
    }

    const fetchSessionDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/sessions/${sessionId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }
        const data: SessionDetails = await response.json();
        setSessionData(data);
      } catch (err) {
        console.error("Failed to fetch session details:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [sessionId]);

  // Add this new function to add sample content
  const addSampleContent = async () => {
    if (!sessionId) return;

    try {
      setAddingContent(true);
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "PUT",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      // Refresh the session data to show the new content
      const sessionResponse = await fetch(`/api/sessions/${sessionId}`);
      const updatedSession = await sessionResponse.json();
      setSessionData(updatedSession);
    } catch (err) {
      console.error("Error adding sample content:", err);
      alert(
        "Failed to add sample content: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setAddingContent(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Skeleton className="h-4 w-1/2 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="p-8">
        <Alert>
          <AlertTitle>No Session Data</AlertTitle>
          <AlertDescription>Could not load session details.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Helper to render different content types
  const renderContent = (contentItem: GeneratedContent) => {
    switch (contentItem.type) {
      case "summary":
        return (
          <p>
            {typeof contentItem.content === "string"
              ? contentItem.content
              : JSON.stringify(contentItem.content)}
          </p>
        );
      case "podcast":
        // Assuming content for podcast is an object with an audioUrl field
        return contentItem.content?.audioUrl ? (
          <audio controls src={contentItem.content.audioUrl}>
            Your browser does not support the audio element.
          </audio>
        ) : (
          <p>Podcast audio not available.</p>
        );
      case "flashcards":
        // Add better type checking and safe rendering for flashcards
        const flashcards = contentItem.content;

        // Check if content is an array and has items
        const isValidFlashcardArray =
          Array.isArray(flashcards) &&
          flashcards.length > 0 &&
          typeof flashcards[0]?.question === "string";

        if (isValidFlashcardArray) {
          return (
            <ul className="list-disc pl-5 space-y-2">
              {flashcards.map((fc, index) => (
                <li key={index}>
                  <strong>{fc.question}:</strong> {fc.answer}
                </li>
              ))}
            </ul>
          );
        } else {
          return <p>Flashcards not available or in unexpected format.</p>;
        }
      // Add cases for other types as needed
      default:
        return <p>Unsupported content type: {contentItem.type}</p>;
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{sessionData.title}</CardTitle>
          <CardDescription>
            {sessionData.description || "No description provided."}
            <br />
            <span className="text-xs text-muted-foreground">
              Created: {new Date(sessionData.createdAt).toLocaleString()} |
              Updated: {new Date(sessionData.updatedAt).toLocaleString()}
            </span>
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Generated Content</h2>
        {/* Add the test button */}
        <button
          onClick={addSampleContent}
          disabled={addingContent}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {addingContent ? "Adding..." : "Add Test Content"}
        </button>
      </div>

      {sessionData.generatedContent.length > 0 ? (
        <div className="space-y-4">
          {sessionData.generatedContent.map((contentItem) => (
            <Card key={contentItem.id}>
              <CardHeader>
                <CardTitle className="capitalize">{contentItem.type}</CardTitle>
                <CardDescription>
                  Generated on:{" "}
                  {new Date(contentItem.createdAt).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>{renderContent(contentItem)}</CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p>No generated content found for this session.</p>
      )}
    </div>
  );
}
