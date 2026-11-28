"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { hasSession, LOGIN_PATHS, type SessionArea } from "@/utils/session";

interface RequireSessionProps {
  area: SessionArea;
  children: React.ReactNode;
}

/**
 * Renders its children only when a session for `area` exists, otherwise sends
 * the visitor to that area's login page. Shows a layout-shaped skeleton while
 * it checks, so the dashboard shell never flashes for signed-out visitors.
 */
export default function RequireSession({ area, children }: RequireSessionProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "allowed" | "redirecting">("checking");

  useEffect(() => {
    if (hasSession(area)) {
      setStatus("allowed");
    } else {
      setStatus("redirecting");
      router.replace(LOGIN_PATHS[area]);
    }
  }, [area, router]);

  if (status === "allowed") {
    return <>{children}</>;
  }

  return <SessionCheckSkeleton redirecting={status === "redirecting"} />;
}

function SessionCheckSkeleton({ redirecting }: { redirecting: boolean }) {
  return (
    <div
      className="flex h-screen gap-3 bg-slate-50 p-0 sm:p-4"
      aria-busy="true"
    >
      <p className="sr-only" role="status">
        {redirecting ? "You are signed out. Taking you to the sign-in page." : "Checking your session."}
      </p>
      <div className="hidden w-64 shrink-0 flex-col gap-3 rounded-[2rem] bg-white p-4 md:flex">
        <Skeleton className="h-12 w-40" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <Skeleton className="h-20 w-full rounded-none sm:rounded-[2rem]" />
        <div className="flex-1 space-y-4 rounded-none bg-white p-4 sm:rounded-[2rem] md:p-6">
          <Skeleton className="h-8 w-1/3" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}
