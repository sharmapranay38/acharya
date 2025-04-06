"use client";

import { useEffect, useState } from "react";
import { EnhancedChat } from "@/components/enhanced-chat";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { documents, sessions, generatedContent } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Loader2, FileText, MessageSquare } from "lucide-react";

interface WorkspaceData {
  summary: string;
  monologue: string;
  flashcards: Array<{
    question: string;
    answer: string;
  }>;
}

interface GeneratedContentItem {
  type: "summary" | "monologue" | "flashcards";
  content: string;
}

type Tab = "flashcards" | "summary" | "monologue" | "chat";

function parseFlashcards(content: string) {
  try {
    // First try parsing as JSON
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed.map((card) => ({
        question: card.question
          .trim()
          .split(/\*\*A:\*\*|\*\*Answer:\*\*/i)[0]
          .trim(),
        answer: card.answer.trim(),
      }));
    }

    // If not JSON, try parsing text format
    const cards = [];
    const lines = content.split("\n");
    let currentQuestion = "";
    let currentAnswer = "";

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      if (line.startsWith("Q:") || line.startsWith("Question:")) {
        // If we have a previous Q&A pair, save it
        if (currentQuestion && currentAnswer) {
          cards.push({
            question: currentQuestion
              .split(/\*\*A:\*\*|\*\*Answer:\*\*/i)[0]
              .trim(),
            answer: currentAnswer.replace(/^A:\s*|^Answer:\s*/i, "").trim(),
          });
        }
        currentQuestion = line.replace(/^Q:\s*|^Question:\s*/i, "").trim();
        currentAnswer = "";
      } else if (
        line.startsWith("A:") ||
        line.startsWith("Answer:") ||
        line.includes("**A:**")
      ) {
        // Extract answer from the line if it's in the question
        if (line.includes("**A:**")) {
          const parts = line.split(/\*\*A:\*\*|\*\*Answer:\*\*/i);
          if (parts.length > 1) {
            currentQuestion = (currentQuestion + " " + parts[0]).trim();
            currentAnswer = parts[1].trim();
          }
        } else {
          currentAnswer = line.replace(/^A:\s*|^Answer:\s*/i, "").trim();
        }
      } else if (currentQuestion && !currentAnswer) {
        // Check if this line contains an embedded answer
        if (line.includes("**A:**")) {
          const parts = line.split(/\*\*A:\*\*|\*\*Answer:\*\*/i);
          if (parts.length > 1) {
            currentQuestion = (currentQuestion + " " + parts[0]).trim();
            currentAnswer = parts[1].trim();
          }
        } else {
          currentQuestion += " " + line;
        }
      } else if (currentAnswer) {
        currentAnswer += " " + line;
      }
    }

    // Don't forget to add the last pair
    if (currentQuestion && currentAnswer) {
      cards.push({
        question: currentQuestion
          .split(/\*\*A:\*\*|\*\*Answer:\*\*/i)[0]
          .trim(),
        answer: currentAnswer.replace(/^A:\s*|^Answer:\s*/i, "").trim(),
      });
    }

    return cards;
  } catch (error) {
    console.error("Error parsing flashcards:", error);
    return [];
  }
}

export default function WorkspacePage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("flashcards");

  useEffect(() => {
    async function fetchWorkspaceData() {
      try {
        const session = await db.query.sessions.findFirst({
          where: eq(sessions.id, parseInt(params.workspaceId)),
          with: {
            document: true,
            generatedContent: true,
          },
        });

        if (session) {
          const data: WorkspaceData = {
            summary: "",
            monologue: "",
            flashcards: [],
          };

          session.generatedContent.forEach((content: GeneratedContentItem) => {
            const parsedContent = JSON.parse(content.content);
            switch (content.type) {
              case "summary":
                data.summary = parsedContent.text || parsedContent;
                break;
              case "monologue":
                data.monologue = parsedContent.text || parsedContent;
                break;
              case "flashcards":
                data.flashcards = parseFlashcards(content.content);
                break;
            }
          });

          setWorkspaceData(data);
        }
      } catch (error) {
        console.error("Error fetching workspace data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorkspaceData();
  }, [params.workspaceId]);

  if (isLoading) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "flashcards":
        return workspaceData?.flashcards &&
          workspaceData.flashcards.length > 0 ? (
          <div className="space-y-2">
            {workspaceData.flashcards.map((card, index) => (
              <div key={index} className="border rounded p-3">
                <p className="text-sm font-medium mb-1">{card.question}</p>
                <p className="text-sm text-muted-foreground">{card.answer}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No flashcards available
          </p>
        );
      case "summary":
        return workspaceData?.summary ? (
          <div className="prose prose-sm dark:prose-invert">
            {workspaceData.summary}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No summary available</p>
        );
      case "monologue":
        return workspaceData?.monologue ? (
          <div className="prose prose-sm dark:prose-invert">
            {workspaceData.monologue}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No monologue available
          </p>
        );
      case "chat":
        return (
          <div className="h-full">
            <EnhancedChat
              documentContext={`Summary: ${
                workspaceData?.summary || ""
              }\n\nMonologue: ${
                workspaceData?.monologue || ""
              }\n\nFlashcards: ${
                workspaceData?.flashcards
                  ?.map((card) => `Q: ${card.question}\nA: ${card.answer}`)
                  .join("\n\n") || ""
              }`}
              className="h-full border-0 shadow-none"
              initialMessage="Hello! I'm your AI learning assistant. I've analyzed your document and I'm ready to help you understand it better. What would you like to know?"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setActiveTab("flashcards")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            activeTab === "flashcards"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          }`}
        >
          <FileText className="h-4 w-4" />
          Flashcards
        </button>
        <button
          onClick={() => setActiveTab("summary")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            activeTab === "summary"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          }`}
        >
          <FileText className="h-4 w-4" />
          Summary
        </button>
        <button
          onClick={() => setActiveTab("monologue")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            activeTab === "monologue"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          }`}
        >
          <FileText className="h-4 w-4" />
          Monologue
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            activeTab === "chat"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Chat
        </button>
      </div>

      <Card className="p-4 min-h-[calc(100vh-10rem)]">
        <div className="h-full">{renderContent()}</div>
      </Card>
    </div>
  );
}
