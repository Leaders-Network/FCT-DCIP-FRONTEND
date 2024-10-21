// ... existing imports ...

// ... existing code ...
import { Skeleton } from "@/components/ui/skeleton";


const SkeletonLoader: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-4">
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-10 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-2/3" />
      </div>
      <Skeleton className="h-40 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-2/3" />
      </div>
      <Skeleton className="h-40 w-full" />
    </div>
  );
};

export default SkeletonLoader;
