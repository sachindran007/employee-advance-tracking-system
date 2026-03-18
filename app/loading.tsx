import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto grid min-h-screen w-full max-w-[1600px] gap-6 px-4 py-4 sm:px-6 xl:grid-cols-[280px_minmax(0,1fr)]">
      <Skeleton className="hidden h-[calc(100vh-2rem)] rounded-[28px] xl:block" />
      <div className="space-y-6">
        <Skeleton className="h-24 rounded-[28px]" />
        <Skeleton className="h-28 rounded-[28px]" />
        <Skeleton className="h-[420px] rounded-[28px]" />
      </div>
    </div>
  );
}
