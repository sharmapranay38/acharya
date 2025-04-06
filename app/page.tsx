import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brain, BookOpen, FileText, Youtube, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignedIn, SignedOut } from "@clerk/nextjs";

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
            <SignedIn>
              <Link
                href="/dashboard"
                className="text-sm font-medium hover:text-primary"
              >
                Dashboard
              </Link>
            </SignedIn>
            <SignedOut>
              <Link
                href="/sign-in"
                className="text-sm font-medium hover:text-primary"
              >
                Sign In
              </Link>
            </SignedOut>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
              Your AI Learning Assistant
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Transform your learning experience with AI-powered tools for
              creating flashcards, summarizing documents, and more.
            </p>
            <div className="space-x-4">
              <SignedIn>
                <Button asChild size="lg">
                  <Link href="/dashboard">Go to Workspace</Link>
                </Button>
              </SignedIn>
              <SignedOut>
                <Button asChild size="lg">
                  <Link href="/sign-in?redirect_url=/dashboard">
                    Get Started
                  </Link>
                </Button>
              </SignedOut>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
