import { WorkspaceHeader } from "./workspace-header";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <WorkspaceHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
