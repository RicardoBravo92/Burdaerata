import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-4 p-4">
      <Skeleton className="h-20 w-64 rounded-xl bg-white/20" />
      <Skeleton className="h-96 w-full max-w-xl rounded-xl bg-white/20" />
    </div>
  );
}