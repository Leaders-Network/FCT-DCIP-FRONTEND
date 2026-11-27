import React from "react";
import AssignmentDetail from "@/components/surveyor/AssignmentDetail";

interface AssignmentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AssignmentDetailPage({ params }: AssignmentDetailPageProps) {
  const { id } = await params;
  return (
    <div className="mx-auto w-full max-w-7xl">
      <AssignmentDetail assignmentId={id} />
    </div>
  );
}
