import React from "react";
import AssignmentsList from "@/components/surveyor/AssignmentsList";

export default function AssignmentsPage() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        <AssignmentsList />
      </div>
    </div>
  );
}