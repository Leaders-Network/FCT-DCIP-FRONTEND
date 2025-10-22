import React from "react";
import AssignmentDetail from "@/components/surveyor/AssignmentDetail";

interface AssignmentDetailPageProps {
  params: {
    id: string;
  };
}

export default function AssignmentDetailPage({ params }: AssignmentDetailPageProps) {
  return (
    <div className="h-full overflow-y-auto p-6">
      <AssignmentDetail assignmentId={params.id} />
    </div>
  );
}