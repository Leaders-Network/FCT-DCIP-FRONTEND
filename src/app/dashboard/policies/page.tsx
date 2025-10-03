"use client";
import React from "react";
import PolicyCompletion from "@/components/dashboard/PolicyCompletion";

export default function PoliciesPage() {
  // In a real implementation, get userId from auth context
  const userId = "current_user_id";

  return (
    <div className="p-6">
      <PolicyCompletion userId={userId} />
    </div>
  );
}