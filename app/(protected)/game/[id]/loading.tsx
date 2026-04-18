import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#99184e] gap-4">
      <Skeleton className="h-20 w-64 rounded-xl bg-white/20" />
      <Skeleton className="h-96 w-full max-w-xl rounded-xl bg-white/20" />
    </div>
  );
}