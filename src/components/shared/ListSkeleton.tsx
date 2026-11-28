import { Skeleton } from "@/components/ui/skeleton";

interface ListSkeletonProps {
  rows?: number;
  /** Announced to screen readers while the list loads. */
  label: string;
}

/** Placeholder rows shaped like a list of records, so the page keeps its height while data loads. */
export default function ListSkeleton({ rows = 5, label }: ListSkeletonProps) {
  return (
    <div aria-busy="true" className="divide-y divide-slate-100">
      <p role="status" className="sr-only">
        {label}
      </p>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4 sm:px-6">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full bg-slate-200" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/5 bg-slate-200" />
            <Skeleton className="h-3 w-3/5 bg-slate-100" />
          </div>
          <Skeleton className="hidden h-6 w-20 rounded-full bg-slate-200 sm:block" />
        </div>
      ))}
    </div>
  );
}
