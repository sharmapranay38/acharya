// Indicate this is a Client Component because we need hooks (useState, useRef, useFormState)
"use client";

import { useState, useRef, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";

// Your existing imports
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
import { FileText, Youtube, Upload, Loader2 } from "lucide-react"; // Added Loader2

// Import the server action (we'll create this next)
import { uploadAndProcessDocument, ActionResult } from "@/lib/actions/gemini";

// --- Helper Component for Submit Button with Pending State ---
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
        </>
      ) : (
        "Upload & Process"
      )}
    </Button>
  );
}

// --- Main Upload Page Component ---
export default function UploadPage() {
  // State for the selected file display
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // State for the selected processing option
  const [processingOption, setProcessingOption] = useState<string>("summary"); // Default option

  // Ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hook to manage form state and server action result
  // `uploadAndProcessDocument` is the server action, `null` is the initial state
  const [state, formAction] = useFormState<ActionResult | null, FormData>(
    uploadAndProcessDocument,
    null
  );

  // Function to trigger the hidden file input
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Function to handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic validation (optional: add more checks like size, type)
      if (file.size > 10 * 1024 * 1024) {
        // Example: 10MB limit
        alert("File size exceeds 10MB limit.");
        setSelectedFile(null);
        event.target.value = ""; // Clear the input
        return;
      }
      const allowedTypes = [
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Unsupported file type. Please upload PDF, DOC, DOCX, or TXT.");
        setSelectedFile(null);
        event.target.value = ""; // Clear the input
        return;
      }
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  // Effect to reset file input if form submission is successful
  useEffect(() => {
    if (state?.success) {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset the actual file input
      }
      // Optionally reset processing option too, or keep it
      // setProcessingOption('summary');
    }
  }, [state?.success]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Assuming DashboardHeader is static or managed elsewhere */}
      {/* <DashboardHeader /> */}
      <DashboardShell>
        <div className="flex items-center justify-between mb-6">
          {" "}
          {/* Added margin */}
          <h2 className="text-3xl font-bold tracking-tight">Upload Content</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {" "}
          {/* Increased gap */}
          <Tabs defaultValue="file" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file">Upload File</TabsTrigger>
              <TabsTrigger value="youtube">YouTube Link</TabsTrigger>
            </TabsList>

            {/* --- File Upload Tab --- */}
            <TabsContent value="file" className="space-y-4 pt-6">
              {" "}
              {/* Added padding top */}
              {/* Wrap content in a form connected to the server action */}
              <form action={formAction} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Document</CardTitle>
                    <CardDescription>
                      Upload a document to generate learning materials like
                      flashcards, summaries, and podcasts.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {" "}
                    {/* Increased spacing */}
                    {/* Hidden File Input */}
                    <input
                      type="file"
                      name="file" // Name used in formData.get('file')
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt" // Specify accepted types
                      required // Make file input required by the form
                    />
                    {/* Clickable Area / Browse Button */}
                    <div
                      className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 text-center hover:border-primary cursor-pointer transition-colors"
                      onClick={handleBrowseClick} // Trigger file input on click
                    >
                      <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                      <div className="space-y-2">
                        <h3 className="font-medium">
                          {selectedFile
                            ? selectedFile.name
                            : "Click or drag file here"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Supports PDF, DOC, DOCX, and TXT files up to 10MB
                        </p>
                        {/* Button is now part of the clickable area */}
                        {!selectedFile && (
                          <span className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 mt-2">
                            Browse Files
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedFile && (
                      <p className="text-sm text-center text-green-600 font-medium">
                        Selected: {selectedFile.name} (
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                    {/* Processing Options */}
                    <div className="space-y-2">
                      <h3 className="font-medium">Processing Options</h3>
                      {/* Hidden input to pass the selected option */}
                      <input
                        type="hidden"
                        name="processingOption"
                        value={processingOption}
                      />
                      <div className="grid grid-cols-3 gap-2">
                        {/* Update state on click, add visual selection indicator */}
                        <Button
                          type="button" // Prevent form submission
                          variant={
                            processingOption === "flashcards"
                              ? "default"
                              : "outline"
                          }
                          className="flex flex-col h-auto py-3"
                          onClick={() => setProcessingOption("flashcards")}
                        >
                          <span className="text-xs">Generate</span>
                          <span className="font-medium">Flashcards</span>
                        </Button>
                        <Button
                          type="button"
                          variant={
                            processingOption === "summary"
                              ? "default"
                              : "outline"
                          }
                          className="flex flex-col h-auto py-3"
                          onClick={() => setProcessingOption("summary")}
                        >
                          <span className="text-xs">Generate</span>
                          <span className="font-medium">Summary</span>
                        </Button>
                        <Button
                          type="button"
                          variant={
                            processingOption === "podcast"
                              ? "default"
                              : "outline"
                          }
                          className="flex flex-col h-auto py-3"
                          onClick={() => setProcessingOption("podcast")}
                        >
                          <span className="text-xs">Generate</span>
                          <span className="font-medium">
                            Podcast Script
                          </span>{" "}
                          {/* Be specific */}
                        </Button>
                      </div>
                    </div>
                    {/* Submit Button using useFormStatus */}
                    <SubmitButton />
                    {/* Display Action Results/Feedback */}
                    {state && (
                      <div
                        className={`mt-4 p-4 rounded-md border ${
                          state.success
                            ? "bg-green-50 border-green-300 text-green-800"
                            : "bg-red-50 border-red-300 text-red-800"
                        }`}
                      >
                        <p className="font-semibold">
                          {state.success ? "Success!" : "Error!"}
                        </p>
                        <p className="text-sm">{state.message}</p>
                        {state.error && (
                          <p className="text-sm mt-1">Details: {state.error}</p>
                        )}
                        {state.resultText && (
                          <div className="mt-3 pt-3 border-t border-gray-300">
                            <p className="font-semibold mb-1">
                              Generated Content:
                            </p>
                            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-3 rounded">
                              {state.resultText}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </form>
            </TabsContent>

            {/* --- YouTube Tab (Unchanged for now) --- */}
            <TabsContent value="youtube" className="space-y-4 pt-6">
              {/* ... your existing YouTube tab content ... */}
              <Card>
                <CardHeader>
                  <CardTitle>Add YouTube Video</CardTitle>
                  <CardDescription>
                    Add a YouTube video link to extract and generate learning
                    materials. (Functionality not implemented yet)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">{/* ... */}</CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          {/* --- Processing Information Card (Unchanged) --- */}
          <Card>
            <CardHeader>
              <CardTitle>Processing Information</CardTitle>
              <CardDescription>
                How Acharya processes your content to generate learning
                materials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ... your existing info content ... */}
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </div>
  );
}
