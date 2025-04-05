// app/upload/page.tsx (or your specific route file)

"use client";

import { useState, useRef, useEffect } from "react";
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
  Play,
  Pause,
  Volume2,
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

// --- Audio Player Component ---
function AudioPlayer({ audioSrc }: { audioSrc: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audioElement = audioRef.current;

    const handleEnded = () => {
      setIsPlaying(false);
    };

    if (audioElement) {
      audioElement.addEventListener("ended", handleEnded);
    }

    return () => {
      if (audioElement) {
        audioElement.removeEventListener("ended", handleEnded);
      }
    };
  }, []);

  return (
    <div className="mt-4 pt-4 border-t">
      <h3 className="font-semibold mb-2 text-lg flex items-center">
        <Volume2 className="mr-2 h-5 w-5" />
        Listen to the Monologue:
      </h3>
      <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
        <Button
          size="icon"
          variant="outline"
          onClick={togglePlay}
          className="h-10 w-10 rounded-full"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>
        <div className="flex-1">
          <audio ref={audioRef} src={audioSrc} />
          <div className="text-sm font-medium">Generated Monologue</div>
          <div className="text-xs text-muted-foreground">
            Click to {isPlaying ? "pause" : "play"} the monologue
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Component for Displaying Results ---
function ResultsDisplay({ resultState }: { resultState: ActionResult | null }) {
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

        {resultState.audioFilePath && resultState.success && (
          <AudioPlayer audioSrc={resultState.audioFilePath} />
        )}

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

// Processing options selector component
function ProcessingOptions({ 
  currentOption, 
  setOption 
}: { 
  currentOption: string, 
  setOption: (opt: string) => void 
}) {
  return (
    <div className="space-y-2">
      <h3 className="font-medium">Processing Options</h3>
      <div className="grid grid-cols-3 gap-2">
        <Button
          type="button"
          variant={currentOption === "flashcards" ? "default" : "outline"}
          className="flex flex-col h-auto py-3 text-xs sm:text-sm"
          onClick={() => setOption("flashcards")}
        >
          <span>Generate</span> <span className="font-medium">Flashcards</span>
        </Button>
        <Button
          type="button"
          variant={currentOption === "summary" ? "default" : "outline"}
          className="flex flex-col h-auto py-3 text-xs sm:text-sm"
          onClick={() => setOption("summary")}
        >
          <span>Generate</span> <span className="font-medium">Summary</span>
        </Button>
        <Button
          type="button"
          variant={currentOption === "conversation" ? "default" : "outline"}
          className="flex flex-col h-auto py-3 text-xs sm:text-sm"
          onClick={() => setOption("conversation")}
        >
          <span>Create</span> <span className="font-medium">Monologue</span>
        </Button>
      </div>
    </div>
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
  const [processingOption, setProcessingOption] = useState<string>("summary");
  const [displayState, setDisplayState] = useState<ActionResult | null>(null);

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
      // Add processing option to formData
      formData.append("processingOption", processingOption);
      formData.append("sessionId", sessionId);

      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload file");
      }

      // If we're staying on this page, update the display state
      setDisplayState(data);
      
      // If we're redirecting, navigate to the session page
      if (data.success) {
        router.push(`/sessions/${sessionId}`);
      }
    } catch (error) {
      console.error("Error in handleFileSubmit:", error);
      setError(error instanceof Error ? error.message : "Failed to process file");
      setDisplayState(null);
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
      // Add processing option to formData
      formData.append("processingOption", processingOption);
      formData.append("sessionId", sessionId);

      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/youtube`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          sessionId,
          userId,
          processingOption,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to process YouTube video");
      }

      // If we're staying on this page, update the display state
      setDisplayState(data);
      
      // If we're redirecting, navigate to the session page
      if (data.success) {
        router.push(`/sessions/${sessionId}`);
      }
    } catch (error) {
      console.error("Error in handleYoutubeSubmit:", error);
      setError(error instanceof Error ? error.message : "Failed to process YouTube video");
      setDisplayState(null);
    } finally {
      setIsProcessing(false);
    }
  }

  // Handle URL input change - reset display state
  const handleYoutubeUrlChange = () => {
    setDisplayState(null);
  };

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
        
        <Tabs defaultValue="document">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="document" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Document Upload
            </TabsTrigger>
            <TabsTrigger value="youtube" className="flex items-center">
              <Youtube className="mr-2 h-4 w-4" />
              YouTube Video
            </TabsTrigger>
          </TabsList>
          
          <div className="grid gap-6 md:grid-cols-2 mt-6">
            <TabsContent value="document" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Document</CardTitle>
                  <CardDescription>
                    Upload a document to generate summaries, flashcards, or audio monologues.
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
                        accept={ALLOWED_FILE_EXTENSIONS_ACCEPT}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Supported formats: {ALLOWED_FILE_EXTENSIONS_STR}. Max size: {MAX_FILE_SIZE_MB}MB
                      </p>
                    </div>
                    
                    <ProcessingOptions 
                      currentOption={processingOption}
                      setOption={setProcessingOption}
                    />
                    
                    {error && (
                      <div className="text-sm text-red-500">{error}</div>
                    )}
                    
                    <SubmitButton
                      text="Upload & Process Document"
                      pendingText="Processing Document..."
                      isProcessing={isProcessing}
                    />
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="youtube" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Process YouTube Video</CardTitle>
                  <CardDescription>
                    Enter a YouTube URL to generate summaries, flashcards, or audio monologues.
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
                        onChange={handleYoutubeUrlChange}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter a valid YouTube video URL
                      </p>
                    </div>
                    
                    <ProcessingOptions 
                      currentOption={processingOption}
                      setOption={setProcessingOption}
                    />
                    
                    {error && (
                      <div className="text-sm text-red-500">{error}</div>
                    )}
                    
                    <SubmitButton
                      text="Process YouTube Video"
                      pendingText="Processing Video..."
                      isProcessing={isProcessing}
                    />
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <ResultsDisplay resultState={displayState} />
          </div>
        </Tabs>
      </div>
    </div>
  );
}