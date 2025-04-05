"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Youtube } from "lucide-react"
import Link from "next/link"

interface UploadButtonProps {
  sessionId?: string;
}

export function UploadButton({ sessionId }: UploadButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = (type: "file" | "youtube") => {
    // Here you would handle the upload/processing
    console.log(type === "file" ? file : youtubeUrl)
    setIsOpen(false)
    setFile(null)
    setYoutubeUrl("")
  }

  return (
    <div className="flex items-center space-x-2">
      <Button asChild variant="outline">
        <Link href={`/upload?type=file${sessionId ? `&sessionId=${sessionId}` : ""}`}>
          <FileText className="mr-2 h-4 w-4" />
          Upload File
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link href={`/upload?type=youtube${sessionId ? `&sessionId=${sessionId}` : ""}`}>
          <Youtube className="mr-2 h-4 w-4" />
          Add YouTube Video
        </Link>
      </Button>
    </div>
  )
}

