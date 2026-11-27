"use client";
import React from "react";
import { AlertCircle, RotateCw } from "lucide-react";

interface DashboardErrorBannerProps {
  message: string;
  className?: string;
  /** When given, shows a "Try again" button that re-runs the failed fetch. */
  onRetry?: () => void;
  retrying?: boolean;
}

const DashboardErrorBanner: React.FC<DashboardErrorBannerProps> = ({
  message,
  className = "",
  onRetry,
  retrying = false,
}) => {
  return (
    <div role="alert" className={`rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">Dashboard data unavailable</p>
            <p className="mt-1 text-sm">{message}</p>
            <p className="mt-1 text-sm">If this keeps happening, contact the Gladfaith support team.</p>
          </div>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-semibold text-red-800 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RotateCw className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`} aria-hidden="true" />
            {retrying ? "Trying again…" : "Try again"}
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardErrorBanner;
