"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Plus, Youtube, File, Maximize2, Minimize2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export function SourcesPanel() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [sources, setSources] = useState([
    { id: 1, name: "Introduction to Neural Networks.pdf", type: "pdf", selected: false },
    { id: 2, name: "Machine Learning Basics.pdf", type: "pdf", selected: false },
    { id: 3, name: "History of Computing", type: "youtube", selected: false },
  ])

  const toggleSourceSelection = (id: number) => {
    setSources(sources.map((source) => (source.id === id ? { ...source, selected: !source.selected } : source)))
  }

  const toggleAllSources = (selected: boolean) => {
    setSources(sources.map((source) => ({ ...source, selected })))
  }

  const areAllSourcesSelected = sources.every((source) => source.selected)
  const areSomeSourcesSelected = sources.some((source) => source.selected) && !areAllSourcesSelected

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Sources</h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="p-4">
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add
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
                  <Input id="file" type="file" accept=".pdf,.doc,.docx,.txt" />
                  <p className="text-xs text-muted-foreground">Supported formats: PDF, DOC, DOCX, TXT</p>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={() => setIsUploadDialogOpen(false)}>
                    Upload & Process
                  </Button>
                </DialogFooter>
              </TabsContent>
              <TabsContent value="youtube" className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube URL</Label>
                  <Input id="youtube" placeholder="https://www.youtube.com/watch?v=..." />
                  <p className="text-xs text-muted-foreground">Paste a valid YouTube video URL</p>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={() => setIsUploadDialogOpen(false)}>
                    Add & Process
                  </Button>
                </DialogFooter>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
      <div className="px-4 py-2 border-b">
        <div className="flex items-center">
          <Checkbox
            id="select-all"
            checked={areAllSourcesSelected}
            indeterminate={areSomeSourcesSelected}
            onCheckedChange={(checked) => toggleAllSources(!!checked)}
          />
          <Label htmlFor="select-all" className="ml-2 text-sm">
            Select all sources
          </Label>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {sources.map((source) => (
            <div
              key={source.id}
              className="flex items-center p-2 rounded-md hover:bg-muted/50 cursor-pointer"
              onClick={() => toggleSourceSelection(source.id)}
            >
              <Checkbox
                id={`source-${source.id}`}
                checked={source.selected}
                onCheckedChange={() => toggleSourceSelection(source.id)}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="ml-2 flex items-center">
                {source.type === "pdf" ? (
                  <FileText className="h-4 w-4 text-red-500 mr-2" />
                ) : (
                  <Youtube className="h-4 w-4 text-red-500 mr-2" />
                )}
                <Label htmlFor={`source-${source.id}`} className="text-sm cursor-pointer">
                  {source.name}
                </Label>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="flex flex-col space-y-2">
          <Button variant="outline" size="sm" disabled={!areSomeSourcesSelected && !areAllSourcesSelected}>
            <File className="mr-2 h-4 w-4" />
            Generate Flashcards
          </Button>
          <Button variant="outline" size="sm" disabled={!areSomeSourcesSelected && !areAllSourcesSelected}>
            <File className="mr-2 h-4 w-4" />
            Generate Summary
          </Button>
          <Button variant="outline" size="sm" disabled={!areSomeSourcesSelected && !areAllSourcesSelected}>
            <File className="mr-2 h-4 w-4" />
            Generate Podcast
          </Button>
        </div>
      </div>
    </div>
  )
}

