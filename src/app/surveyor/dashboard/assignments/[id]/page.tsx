import React from "react";
import AssignmentDetail from "@/components/surveyor/AssignmentDetail";

interface AssignmentDetailPageProps {
  params: {
    id: string;
  };
}

export default function AssignmentDetailPage({ params }: AssignmentDetailPageProps) {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <AssignmentDetail assignmentId={params.id} />
    </div>
  );
}
