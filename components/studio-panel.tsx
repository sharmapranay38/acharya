"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import {
  Headphones,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Info,
  Maximize2,
  Minimize2,
  FileText,
  BookOpen,
  Plus,
} from "lucide-react"

export function StudioPanel() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState([70])
  const [progress, setProgress] = useState([30])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Studio</h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="audio" className="flex-1 flex flex-col">
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="audio" className="flex-1 flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Audio Overview</h3>
              <Button variant="ghost" size="icon">
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Deep Dive Conversation</CardTitle>
                  <CardDescription>Two hosts (English only)</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                      <Headphones className="h-12 w-12 text-primary/60" />
                    </div>

                    <div className="w-full">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">4:15</span>
                        <span className="text-xs text-muted-foreground">15:30</span>
                      </div>
                      <Slider value={progress} max={100} step={1} className="mb-4" onValueChange={setProgress} />

                      <div className="flex items-center justify-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                          <SkipBack className="h-3 w-3" />
                        </Button>
                        <Button size="icon" className="h-10 w-10 rounded-full" onClick={() => setIsPlaying(!isPlaying)}>
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                          <SkipForward className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="flex items-center w-full gap-2">
                    <Volume2 className="h-3 w-3 text-muted-foreground" />
                    <Slider value={volume} max={100} step={1} className="flex-1" onValueChange={setVolume} />
                  </div>
                </CardFooter>
              </Card>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Available Podcasts</h3>
                <div className="space-y-2">
                  <Card className="cursor-pointer hover:bg-muted/50">
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">Neural Networks Explained</CardTitle>
                      <CardDescription className="text-xs">12:45 • Generated from PDF</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card className="cursor-pointer hover:bg-muted/50">
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">History of Computing</CardTitle>
                      <CardDescription className="text-xs">15:30 • Generated from YouTube</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card className="cursor-pointer hover:bg-muted/50">
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">Machine Learning Basics</CardTitle>
                      <CardDescription className="text-xs">10:15 • Generated from PDF</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </div>

              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Generate New Podcast
              </Button>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="notes" className="flex-1 flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Notes</h3>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-3 w-3" />
                Add note
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="justify-start h-auto py-2 px-3">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <span className="text-xs block">Study guide</span>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto py-2 px-3">
                  <FileText className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <span className="text-xs block">Briefing doc</span>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto py-2 px-3">
                  <FileText className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <span className="text-xs block">FAQ</span>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto py-2 px-3">
                  <FileText className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <span className="text-xs block">Timeline</span>
                  </div>
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Your Notes</h3>
                <Card>
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-sm">Neural Network Types</CardTitle>
                    <CardDescription className="text-xs">Created 2 days ago</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <p className="text-xs text-muted-foreground">
                      CNN: Good for images, RNN: Good for sequences, LSTM: Better for long sequences...
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-sm">Machine Learning Algorithms</CardTitle>
                    <CardDescription className="text-xs">Created 3 days ago</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <p className="text-xs text-muted-foreground">
                      Supervised: Classification, Regression. Unsupervised: Clustering...
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

