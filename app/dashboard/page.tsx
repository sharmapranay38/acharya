import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard-header";
import { RecentUploads } from "@/components/recent-uploads";
import { UploadButton } from "@/components/upload-button";
import { Overview } from "@/components/overview";

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.userId) {
    redirect("/sign-in");
  }


  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      {/* <div>{modelinfo()}</div> */}
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <UploadButton />
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            <TabsTrigger value="summaries">Summaries</TabsTrigger>
            <TabsTrigger value="podcasts">Podcasts</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <Overview />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Documents
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    +2 from last week
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Flashcard Sets
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">
                    +1 from last week
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Summaries
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">10</div>
                  <p className="text-xs text-muted-foreground">
                    +3 from last week
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Podcasts
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground">
                    +1 from last week
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Recent Uploads</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentUploads />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your learning progress this week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          Flashcards: Machine Learning Basics
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Reviewed 20 cards
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        2h ago
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          Summary: Introduction to Neural Networks
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Read summary
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        5h ago
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          Podcast: History of Computing
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Listened for 15 minutes
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        1d ago
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          Uploaded: Data Structures PDF
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Generated learning materials
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        2d ago
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="flashcards" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Machine Learning Basics</CardTitle>
                  <CardDescription>
                    20 cards • Created 3 days ago
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Core concepts and terminology for machine learning
                    fundamentals.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Study Now</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Data Structures</CardTitle>
                  <CardDescription>
                    15 cards • Created 1 week ago
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Arrays, linked lists, trees, and other fundamental data
                    structures.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Study Now</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Web Development</CardTitle>
                  <CardDescription>
                    25 cards • Created 2 weeks ago
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    HTML, CSS, JavaScript and modern web development concepts.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Study Now</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="summaries" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Introduction to Neural Networks</CardTitle>
                  <CardDescription>
                    Generated from PDF • 3 days ago
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    A comprehensive overview of neural network architecture and
                    applications.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Read Summary</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>History of Computing</CardTitle>
                  <CardDescription>
                    Generated from YouTube • 1 week ago
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Evolution of computing from early mechanical devices to
                    modern computers.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Read Summary</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Quantum Computing Basics</CardTitle>
                  <CardDescription>
                    Generated from PDF • 2 weeks ago
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Introduction to quantum bits, quantum gates, and quantum
                    algorithms.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Read Summary</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="podcasts" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>History of Computing</CardTitle>
                  <CardDescription>
                    15:30 • Generated 3 days ago
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Listen to the evolution of computing from early mechanical
                    devices to modern computers.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Listen Now</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Machine Learning Explained</CardTitle>
                  <CardDescription>
                    12:45 • Generated 1 week ago
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    A beginner-friendly explanation of machine learning concepts
                    and applications.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Listen Now</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Web Development Trends</CardTitle>
                  <CardDescription>
                    18:20 • Generated 2 weeks ago
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Current trends and future directions in web development
                    technologies.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Listen Now</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
