import { WorkspaceHeader } from "@/components/workspace-header"
import { SourcesPanel } from "@/components/sources-panel"
import { ChatPanel } from "@/components/chat-panel"
import { StudioPanel } from "@/components/studio-panel"
import { ResizablePanelGroup, ResizablePanel } from "@/components/ui/resizable"

export default function WorkspacePage() {
  return (
    <div className="flex flex-col h-screen">
      <WorkspaceHeader />
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={25} minSize={20} className="border-r">
            <SourcesPanel />
          </ResizablePanel>
          <ResizablePanel defaultSize={50} minSize={30}>
            <ChatPanel />
          </ResizablePanel>
          <ResizablePanel defaultSize={25} minSize={20} className="border-l">
            <StudioPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}

