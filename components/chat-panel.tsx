"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Brain, Send, User, Maximize2, Minimize2, FileText } from "lucide-react"

type Message = {
  id: number
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function ChatPanel() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hello! I'm Acharya, your AI learning assistant. I've analyzed your documents and I'm ready to help you learn. What would you like to know about the materials you've uploaded?",
      timestamp: new Date(),
    },
  ])

  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = () => {
    if (input.trim()) {
      // Add user message
      const userMessage: Message = {
        id: messages.length + 1,
        role: "user",
        content: input,
        timestamp: new Date(),
      }

      setMessages([...messages, userMessage])
      setInput("")

      // Simulate AI response after a short delay
      setTimeout(() => {
        const aiResponse: Message = {
          id: messages.length + 2,
          role: "assistant",
          content: getAIResponse(input),
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, aiResponse])
      }, 1000)
    }
  }

  const getAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase()

    if (lowerInput.includes("neural network") || lowerInput.includes("neural networks")) {
      return "Neural networks are computational models inspired by the human brain. They consist of layers of interconnected nodes or 'neurons' that process information and learn patterns from data through a process called training. Would you like me to explain more about specific types of neural networks or their applications?"
    } else if (lowerInput.includes("machine learning")) {
      return "Machine Learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It focuses on developing algorithms that can access data, learn from it, and make predictions or decisions. The uploaded documents cover various ML algorithms including supervised, unsupervised, and reinforcement learning approaches."
    } else if (lowerInput.includes("history") || lowerInput.includes("computing history")) {
      return "The history of computing spans from early mechanical calculators to modern quantum computers. Key milestones include the development of the first electronic general-purpose computer (ENIAC) in the 1940s, the invention of the transistor in 1947, the microprocessor in the 1970s, and the rise of personal computing in the 1980s. Would you like me to elaborate on a specific era or development?"
    } else if (lowerInput.includes("summary") || lowerInput.includes("summarize")) {
      return "I've analyzed your documents and here's a brief summary: The materials cover fundamental concepts in neural networks, machine learning basics, and the history of computing. The neural networks document explains network architecture, training methods, and applications. The machine learning document covers algorithms, data preprocessing, and evaluation metrics. The computing history video discusses the evolution from mechanical calculators to modern computers."
    } else {
      return "I'm here to help you understand the content in your uploaded materials. You can ask me specific questions about neural networks, machine learning basics, or the history of computing. I can also generate summaries, flashcards, or explain complex concepts in simpler terms."
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <FileText className="h-5 w-5 mr-2 text-primary" />
          <h2 className="text-lg font-semibold">Chat with Acharya</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div
                  className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full ${
                    message.role === "user" ? "bg-primary ml-2" : "bg-muted mr-2"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="h-4 w-4 text-primary-foreground" />
                  ) : (
                    <Brain className="h-4 w-4 text-foreground" />
                  )}
                </div>
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Ask about your documents..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} type="submit">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

