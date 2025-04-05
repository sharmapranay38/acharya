import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadButton } from "@/components/upload-button";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SessionPage({ params }: { params: { id: string } }) {
  const session = await auth();
  
  if (!session?.userId) {
    redirect("/sign-in");
  }

  const response = await fetch(`/api/sessions/${params.id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    redirect("/dashboard");
  }

  const data = await response.json();
  const { session: currentSession, documents: sessionDocuments, content } = data;

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">{currentSession.title}</h2>
          <div className="flex items-center space-x-2">
            <UploadButton sessionId={params.id} />
          </div>
        </div>
        <Tabs defaultValue="documents" className="space-y-4">
          <TabsList>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            <TabsTrigger value="summaries">Summaries</TabsTrigger>
            <TabsTrigger value="podcasts">Podcasts</TabsTrigger>
          </TabsList>
          <TabsContent value="documents" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sessionDocuments.map((doc) => (
                <Card key={doc.id}>
                  <CardHeader>
                    <CardTitle>{doc.title}</CardTitle>
                    <CardDescription>
                      {doc.fileType} • {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Unknown date'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {doc.content.substring(0, 100)}...
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">View Document</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="flashcards" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {content.flashcards.map((flashcard) => (
                <Card key={flashcard.id}>
                  <CardHeader>
                    <CardTitle>Flashcards</CardTitle>
                    <CardDescription>
                      Generated {flashcard.createdAt ? new Date(flashcard.createdAt).toLocaleDateString() : 'Unknown date'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {flashcard.content.substring(0, 100)}...
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Study Flashcards</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="summaries" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {content.summaries.map((summary) => (
                <Card key={summary.id}>
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                    <CardDescription>
                      Generated {summary.createdAt ? new Date(summary.createdAt).toLocaleDateString() : 'Unknown date'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {summary.content.substring(0, 100)}...
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Read Summary</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="podcasts" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {content.podcasts.map((podcast) => (
                <Card key={podcast.id}>
                  <CardHeader>
                    <CardTitle>Podcast</CardTitle>
                    <CardDescription>
                      Generated {podcast.createdAt ? new Date(podcast.createdAt).toLocaleDateString() : 'Unknown date'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {podcast.content.substring(0, 100)}...
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Listen Now</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 