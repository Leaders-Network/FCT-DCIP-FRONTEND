import React from "react";
import DualAssignmentsList from "@/components/surveyor/DualAssignmentsList";

export default function DualAssignmentsPage() {
    return (
        <div className="h-full overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Dual Surveyor Assignments</h1>
                    <p className="text-gray-600 mt-1">
                        Collaborative assignments with partner surveyors from other organizations
                    </p>
                </div>

                <DualAssignmentsList />
            </div>
        </div>
    );
}