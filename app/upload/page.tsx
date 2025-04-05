// app/upload/page.tsx (or your specific route file)

"use client";

import { useState, useRef, useEffect } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { searchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";

// UI Components
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/ui/dashboard-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Icons
import {
  FileText,
  Youtube,
  Upload,
  Loader2,
  Terminal,
  Info,
} from "lucide-react";

// Server Actions & Types
import {
  uploadAndProcessDocument,
  processYouTubeVideo,
  ActionResult,
} from "@/lib/actions/gemini";

// --- Constants ---
const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_FILE_EXTENSIONS_STR = "PDF, DOC, DOCX, TXT"; // For display text
const ALLOWED_FILE_EXTENSIONS_ACCEPT = ".pdf,.doc,.docx,.txt"; // For input accept attribute

// --- Helper Component for Submit Button ---
function SubmitButton({ 
  text = "Submit", 
  pendingText = "Processing...",
  isProcessing = false 
}: { 
  text?: string;
  pendingText?: string;
  isProcessing?: boolean;
}) {
  return (
    <Button type="submit" className="w-full" disabled={isProcessing}>
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {pendingText}
        </>
      ) : (
        text
      )}
    </Button>
  );
}

// --- Helper Component for Displaying Results ---
function ResultsDisplay({ resultState }: { resultState: ActionResult | null }) {
  // ... (Keep ResultsDisplay component as is - it looks good)
  if (!resultState) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="mr-2 h-5 w-5 text-blue-600" />
            Processing Results
          </CardTitle>
          <CardDescription>
            Generated content (summaries, flashcards, etc.) will appear here
            after you process a file or YouTube video.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center h-full pb-16">
          <Terminal className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Waiting for input...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle
          className={`flex items-center ${
            resultState.success ? "text-green-700" : "text-red-700"
          }`}
        >
          {resultState.success ? "Processing Successful" : "Processing Failed"}
        </CardTitle>
        <CardDescription>
          Result from{" "}
          {resultState.inputSource === "file" ? "file upload" : "YouTube video"}
          .
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant={resultState.success ? "default" : "destructive"}>
          <AlertTitle>{resultState.success ? "Status" : "Error"}</AlertTitle>
          <AlertDescription>{resultState.message}</AlertDescription>
          {resultState.error && !resultState.success && (
            <p className="text-xs mt-2 font-mono bg-red-100 dark:bg-red-900 p-1 rounded inline-block">
              Details: {resultState.error}
            </p>
          )}
        </Alert>

        {resultState.resultText && resultState.success && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="font-semibold mb-2 text-lg">Generated Content:</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-gray-50 dark:bg-gray-800 rounded-md max-h-[60vh] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans text-sm">
                {resultState.resultText}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --- Main Upload Page Component ---
export default function UploadPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsProcessing(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const file = formData.get("file") as File;

    if (!file) {
      setError("Please select a file");
      setIsProcessing(false);
      return;
    }

    if (!sessionId) {
      setError("No session selected");
      setIsProcessing(false);
      return;
    }

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("sessionId", sessionId);

      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/upload`, {
        method: "POST",
        body: uploadData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload file");
      }

      // Process the file with Gemini
      const processResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId: data.fileId,
          sessionId,
          userId,
        }),
      });

      const processData = await processResponse.json();

      if (!processResponse.ok) {
        throw new Error(processData.message || "Failed to process file");
      }

      // Redirect to session page to see the generated content
      router.push(`/sessions/${sessionId}`);
    } catch (error) {
      console.error("Error in handleFileSubmit:", error);
      setError(error instanceof Error ? error.message : "Failed to process file");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleYoutubeSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsProcessing(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const url = formData.get("url") as string;

    if (!url) {
      setError("Please enter a YouTube URL");
      setIsProcessing(false);
      return;
    }

    if (!sessionId) {
      setError("No session selected");
      setIsProcessing(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/youtube`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          sessionId,
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to process YouTube video");
      }

      // Redirect to session page to see the generated content
      router.push(`/sessions/${sessionId}`);
    } catch (error) {
      console.error("Error in handleYoutubeSubmit:", error);
      setError(error instanceof Error ? error.message : "Failed to process YouTube video");
    } finally {
      setIsProcessing(false);
    }
  }

  if (!sessionId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Session Selected</CardTitle>
            <CardDescription>
              Please create a session first to upload content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/sessions/new")}>
              Create New Session
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Upload Content</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
              <CardDescription>
                Upload a document to generate summaries, flashcards, and podcasts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFileSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Document</Label>
                  <Input
                    id="file"
                    name="file"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    required
                  />
                </div>
                {error && (
                  <div className="text-red-500 text-sm">{error}</div>
                )}
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing ? "Processing..." : "Upload & Process"}
                </Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>YouTube Video</CardTitle>
              <CardDescription>
                Enter a YouTube URL to generate summaries, flashcards, and podcasts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleYoutubeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">YouTube URL</Label>
                  <Input
                    id="url"
                    name="url"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                </div>
                {error && (
                  <div className="text-red-500 text-sm">{error}</div>
                )}
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing ? "Processing..." : "Process Video"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
