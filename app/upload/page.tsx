// app/upload/page.tsx (or your specific route file)

"use client";

import { useState, useRef, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";

// UI Components
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
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
function SubmitButton({ text = "Submit", pendingText = "Processing..." }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingOption, setProcessingOption] = useState<string>("summary");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const youtubeUrlInputRef = useRef<HTMLInputElement>(null);

  const [fileState, fileFormAction] = useFormState<
    ActionResult | null,
    FormData
  >(uploadAndProcessDocument, null);
  const [youtubeState, youtubeFormAction] = useFormState<
    ActionResult | null,
    FormData
  >(processYouTubeVideo, null);
  const [displayState, setDisplayState] = useState<ActionResult | null>(null);

  useEffect(() => {
    if (fileState?.inputSource === "file") {
      // Optional chaining for safety
      setDisplayState(fileState);
      if (fileState.success) {
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  }, [fileState]);

  useEffect(() => {
    if (youtubeState?.inputSource === "youtube") {
      // Optional chaining for safety
      setDisplayState(youtubeState);
      if (youtubeState.success && youtubeUrlInputRef.current) {
        youtubeUrlInputRef.current.value = "";
      }
    }
  }, [youtubeState]);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        alert(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
        setSelectedFile(null);
        event.target.value = ""; // Reset file input
        return;
      }
      // Client-side type check (supplementary to server-side)
      // Checking file.type is generally more reliable than just extension
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        // Check common edge cases like empty type for some OS/browser combos if needed
        if (
          !ALLOWED_FILE_EXTENSIONS_ACCEPT.split(",").some((ext) =>
            file.name.toLowerCase().endsWith(ext)
          )
        ) {
          alert(
            `Unsupported file type. Allowed: ${ALLOWED_FILE_EXTENSIONS_STR}.`
          );
          setSelectedFile(null);
          event.target.value = ""; // Reset file input
          return;
        }
      }
      setSelectedFile(file);
      setDisplayState(null);
    } else {
      setSelectedFile(null);
    }
  };

  const handleYoutubeUrlChange = () => {
    setDisplayState(null);
  };

  const renderProcessingOptions = (
    currentOption: string,
    setOption: (opt: string) => void
  ) => (
    // ... (Keep renderProcessingOptions as is - it looks good)
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
          variant={currentOption === "deepDive" ? "default" : "outline"}
          className="flex flex-col h-auto py-3 text-xs sm:text-sm"
          onClick={() => setOption("deepDive")}
        >
          <span>Create</span>{" "}
          <span className="font-medium">Deep Dive Convo</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col">
      {/* <DashboardHeader /> */}
      <DashboardShell>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold tracking-tight">
            Upload & Process Content
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* --- Left Column: Input Tabs --- */}
          <div className="md:col-span-1">
            <Tabs defaultValue="file" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="file">Upload File</TabsTrigger>
                <TabsTrigger value="youtube">YouTube Link</TabsTrigger>
              </TabsList>

              {/* File Upload Tab */}
              <TabsContent value="file" className="pt-6">
                <form action={fileFormAction} className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Upload Document</CardTitle>
                      <CardDescription>
                        Upload {ALLOWED_FILE_EXTENSIONS_STR} (max{" "}
                        {MAX_FILE_SIZE_MB}MB).
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Consider the Label approach mentioned earlier if preferred */}
                      <input
                        type="file"
                        name="file"
                        id="file-input" // Added ID if using Label htmlFor
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept={ALLOWED_FILE_EXTENSIONS_ACCEPT}
                        required
                      />
                      <div
                        className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 sm:p-8 text-center hover:border-primary cursor-pointer transition-colors"
                        onClick={handleBrowseClick} // Keep if not using Label wrapper
                        // Add appropriate aria attributes if not using Label
                      >
                        <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-3" />
                        <div className="space-y-1">
                          <h3 className="text-sm sm:text-base font-medium break-all px-2">
                            {selectedFile
                              ? selectedFile.name
                              : "Click or drag file here"}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Supports {ALLOWED_FILE_EXTENSIONS_STR} up to{" "}
                            {MAX_FILE_SIZE_MB}MB
                          </p>
                          {!selectedFile && (
                            <span className="mt-2 inline-flex items-center justify-center rounded-md text-xs sm:text-sm font-medium ... h-8 px-3">
                              Browse Files
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedFile && (
                        <p className="text-xs sm:text-sm text-center text-green-600 font-medium">
                          Selected: {selectedFile.name} (
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                      {renderProcessingOptions(
                        processingOption,
                        setProcessingOption
                      )}
                      <input
                        type="hidden"
                        name="processingOption"
                        value={processingOption}
                      />
                      <SubmitButton
                        text="Upload & Process File"
                        pendingText="Processing File..."
                      />
                    </CardContent>
                  </Card>
                </form>
              </TabsContent>

              {/* YouTube Tab */}
              <TabsContent value="youtube" className="pt-6">
                <form action={youtubeFormAction} className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Add YouTube Video</CardTitle>
                      <CardDescription>
                        Paste a YouTube video link to generate learning
                        materials.
                        <span className="block text-xs text-amber-700 mt-1">
                          Note: Processing may take longer. Success depends on
                          URL accessibility and transcript availability.
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-1">
                        <Label htmlFor="youtube-url">YouTube URL</Label>
                        <Input
                          ref={youtubeUrlInputRef}
                          id="youtube-url"
                          name="youtubeUrl"
                          placeholder="https://www.youtube.com/watch?v=..." // Updated placeholder
                          required
                          type="url" // Use type="url" for basic browser validation
                          onChange={handleYoutubeUrlChange}
                        />
                      </div>
                      {/* Simplified placeholder visual */}
                      <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6 text-center bg-gray-50 dark:bg-gray-900/50">
                        <Youtube className="h-10 w-10 text-red-600 mr-4" />
                        <p className="text-sm text-muted-foreground">
                          Enter a valid YouTube video URL above.
                        </p>
                      </div>
                      {renderProcessingOptions(
                        processingOption,
                        setProcessingOption
                      )}
                      <input
                        type="hidden"
                        name="processingOption"
                        value={processingOption}
                      />
                      <SubmitButton
                        text="Process YouTube Video"
                        pendingText="Processing Video..."
                      />
                    </CardContent>
                  </Card>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          {/* --- Right Column: Results Display --- */}
          <div className="md:col-span-1">
            <ResultsDisplay resultState={displayState} />
          </div>
        </div>{" "}
        {/* End Grid */}
      </DashboardShell>
    </div>
  );
}
