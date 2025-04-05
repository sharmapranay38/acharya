import { UploadDocument } from "@/components/upload-document";
import { DashboardShell } from "@/components/shell";

export default function DocumentsPage() {
  return (
    <DashboardShell>
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Upload Document</h1>
          <UploadDocument />
        </div>
      </div>
    </DashboardShell>
  );
}
