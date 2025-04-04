import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col h-screen">
      <div className="h-14 border-b flex items-center px-4">
        <Skeleton className="h-6 w-24" />
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      <div className="flex-1 flex">
        <div className="w-1/4 border-r p-4">
          <Skeleton className="h-8 w-full mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
        <div className="w-2/4 p-4">
          <Skeleton className="h-8 w-full mb-4" />
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-20 w-3/4 rounded-lg" />
            </div>
            <div className="flex items-start gap-2 justify-end">
              <Skeleton className="h-16 w-2/3 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
        <div className="w-1/4 border-l p-4">
          <Skeleton className="h-8 w-full mb-4" />
          <Skeleton className="h-40 w-full rounded-lg mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

