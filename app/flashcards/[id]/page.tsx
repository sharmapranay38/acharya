import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Shuffle, RotateCcw } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function FlashcardStudyPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <DashboardShell>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Machine Learning Basics</h2>
            <p className="text-muted-foreground">Studying 20 cards • Card 5 of 20</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Shuffle className="mr-2 h-4 w-4" />
              Shuffle
            </Button>
            <Button variant="outline" size="sm">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        <Progress value={25} className="mb-8" />

        <div className="flex justify-center mb-8">
          <div className="w-full max-w-3xl perspective">
            <div className="relative preserve-3d card-flip-container">
              <Card className="w-full h-[400px] flex items-center justify-center p-8 text-center card-front">
                <CardContent className="flex flex-col items-center justify-center h-full">
                  <h3 className="text-2xl font-bold mb-4">What is a neural network?</h3>
                  <p className="text-muted-foreground text-sm">Click to reveal answer</p>
                </CardContent>
              </Card>
              <Card className="w-full h-[400px] flex items-center justify-center p-8 text-center card-back absolute inset-0 backface-hidden">
                <CardContent className="flex flex-col items-center justify-center h-full">
                  <h3 className="text-xl font-bold mb-4">Neural Network</h3>
                  <p>
                    A neural network is a computational model inspired by the human brain. It consists of layers of
                    interconnected nodes or "neurons" that process information and learn patterns from data through a
                    process called training.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button variant="outline" size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button size="lg">
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DashboardShell>
    </div>
  )
}

