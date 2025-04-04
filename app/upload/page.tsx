import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FileText, Youtube, Upload } from "lucide-react"

export default function UploadPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <DashboardShell>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Upload Content</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <Tabs defaultValue="file" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file">Upload File</TabsTrigger>
              <TabsTrigger value="youtube">YouTube Link</TabsTrigger>
            </TabsList>
            <TabsContent value="file" className="space-y-4 p-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Document</CardTitle>
                  <CardDescription>
                    Upload a document to generate learning materials like flashcards, summaries, and podcasts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center">
                    <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                    <div className="space-y-2">
                      <h3 className="font-medium">Drag and drop your file</h3>
                      <p className="text-sm text-muted-foreground">Supports PDF, DOC, DOCX, and TXT files up to 10MB</p>
                      <Button size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Browse Files
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Processing Options</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" className="flex flex-col h-auto py-4">
                        <span className="text-xs">Generate</span>
                        <span className="font-medium">Flashcards</span>
                      </Button>
                      <Button variant="outline" className="flex flex-col h-auto py-4">
                        <span className="text-xs">Generate</span>
                        <span className="font-medium">Summary</span>
                      </Button>
                      <Button variant="outline" className="flex flex-col h-auto py-4">
                        <span className="text-xs">Generate</span>
                        <span className="font-medium">Podcast</span>
                      </Button>
                    </div>
                  </div>
                  <Button className="w-full">Upload & Process</Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="youtube" className="space-y-4 p-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add YouTube Video</CardTitle>
                  <CardDescription>
                    Add a YouTube video link to extract and generate learning materials.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="youtube-url">YouTube URL</Label>
                    <div className="flex gap-2">
                      <Input id="youtube-url" placeholder="https://www.youtube.com/watch?v=..." />
                      <Button variant="outline">Validate</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Paste a valid YouTube video URL</p>
                  </div>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center">
                    <Youtube className="h-10 w-10 text-muted-foreground mb-4" />
                    <div className="space-y-2">
                      <h3 className="font-medium">Video Preview</h3>
                      <p className="text-sm text-muted-foreground">Enter a valid YouTube URL to see a preview</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Processing Options</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" className="flex flex-col h-auto py-4">
                        <span className="text-xs">Generate</span>
                        <span className="font-medium">Flashcards</span>
                      </Button>
                      <Button variant="outline" className="flex flex-col h-auto py-4">
                        <span className="text-xs">Generate</span>
                        <span className="font-medium">Summary</span>
                      </Button>
                      <Button variant="outline" className="flex flex-col h-auto py-4">
                        <span className="text-xs">Generate</span>
                        <span className="font-medium">Podcast</span>
                      </Button>
                    </div>
                  </div>
                  <Button className="w-full">Add & Process</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          <Card>
            <CardHeader>
              <CardTitle>Processing Information</CardTitle>
              <CardDescription>How Acharya processes your content to generate learning materials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">How it works</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li className="text-muted-foreground">
                    <span className="font-medium text-foreground">Upload content</span> - Upload a document or add a
                    YouTube video link
                  </li>
                  <li className="text-muted-foreground">
                    <span className="font-medium text-foreground">AI processing</span> - Our AI analyzes and extracts
                    key information
                  </li>
                  <li className="text-muted-foreground">
                    <span className="font-medium text-foreground">Generate materials</span> - Create flashcards,
                    summaries, and podcasts
                  </li>
                  <li className="text-muted-foreground">
                    <span className="font-medium text-foreground">Learn efficiently</span> - Study with personalized
                    learning materials
                  </li>
                </ol>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Supported Content</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Documents:</span> PDF, DOC, DOCX, TXT (up to 10MB)
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Videos:</span> YouTube videos (up to 2 hours)
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Processing Time</h3>
                <p className="text-sm text-muted-foreground">
                  Processing typically takes 1-5 minutes depending on the content length and complexity.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </div>
  )
}

