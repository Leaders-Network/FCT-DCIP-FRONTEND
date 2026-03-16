"use client";
import React from "react";
import { AlertCircle } from "lucide-react";

interface DashboardErrorBannerProps {
  message: string;
  className?: string;
}

const DashboardErrorBanner: React.FC<DashboardErrorBannerProps> = ({ message, className = "" }) => {
  return (
    <div className={`rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 mt-0.5" />
        <div>
          <p className="font-semibold">Dashboard data unavailable</p>
          <p className="text-sm mt-1">
            {message} If you need assistance, please reach out to the Gladfaith team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardErrorBanner;
