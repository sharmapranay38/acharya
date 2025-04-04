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
import { Upload } from "lucide-react"

export function UploadButton() {
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Content
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Learning Material</DialogTitle>
          <DialogDescription>
            Upload a document or add a YouTube video link to generate learning materials.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">Upload File</TabsTrigger>
            <TabsTrigger value="youtube">YouTube Link</TabsTrigger>
          </TabsList>
          <TabsContent value="file" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="file">Document</Label>
              <Input id="file" type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileChange} />
              <p className="text-xs text-muted-foreground">Supported formats: PDF, DOC, DOCX, TXT</p>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={!file} onClick={() => handleSubmit("file")}>
                Upload & Process
              </Button>
            </DialogFooter>
          </TabsContent>
          <TabsContent value="youtube" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube URL</Label>
              <Input
                id="youtube"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Paste a valid YouTube video URL</p>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={!youtubeUrl} onClick={() => handleSubmit("youtube")}>
                Add & Process
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

