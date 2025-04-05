import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brain, BookOpen, FileText, Youtube, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Acharya</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary">
              Home
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:text-primary"
            >
              Dashboard
            </Link>
            <Link
              href="/flashcards"
              className="text-sm font-medium hover:text-primary"
            >
              Flashcard
            </Link>
            <Link
              href="/summaries"
              className="text-sm font-medium hover:text-primary"
            >
              Summaries
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/workspace">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                    Transform Your Learning Experience
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Acharya uses AI to convert your course materials and videos
                    into interactive learning content. Generate flashcards,
                    summaries, podcasts, and more with just a few clicks.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/workspace">
                    <Button size="lg" className="gap-1">
                      <Zap className="h-4 w-4" />
                      Start Learning
                    </Button>
                  </Link>
                  <Link href="/features">
                    <Button size="lg" variant="outline">
                      Explore Features
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full h-[400px] bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-4 p-6">
                      <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-primary/20">
                        <FileText className="h-8 w-8 text-primary mb-2" />
                        <h3 className="font-semibold">Document Processing</h3>
                        <p className="text-sm text-muted-foreground">
                          Upload course materials and PDFs
                        </p>
                      </div>
                      <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-primary/20">
                        <Youtube className="h-8 w-8 text-primary mb-2" />
                        <h3 className="font-semibold">Video Analysis</h3>
                        <p className="text-sm text-muted-foreground">
                          Extract knowledge from YouTube videos
                        </p>
                      </div>
                      <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-primary/20">
                        <BookOpen className="h-8 w-8 text-primary mb-2" />
                        <h3 className="font-semibold">Flashcards</h3>
                        <p className="text-sm text-muted-foreground">
                          Generate interactive study materials
                        </p>
                      </div>
                      <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-primary/20">
                        <Brain className="h-8 w-8 text-primary mb-2" />
                        <h3 className="font-semibold">AI Summaries</h3>
                        <p className="text-sm text-muted-foreground">
                          Get concise content overviews
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  How It Works
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Acharya makes learning more efficient and engaging with our
                  AI-powered platform
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4 rounded-lg border bg-background p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Upload Content</h3>
                  <p className="text-muted-foreground">
                    Upload your course documents or paste YouTube video links
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4 rounded-lg border bg-background p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">AI Processing</h3>
                  <p className="text-muted-foreground">
                    Our AI analyzes and extracts key information from your
                    materials
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4 rounded-lg border bg-background p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Learn Efficiently</h3>
                  <p className="text-muted-foreground">
                    Access flashcards, summaries, podcasts, and more learning
                    tools
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 Acharya. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
