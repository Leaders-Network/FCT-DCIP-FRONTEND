'use client';

import React from 'react';
import DualAssignmentsList from '@/components/surveyor/DualAssignmentsList';

const DualAssignmentsPage: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dual Surveyor Assignments</h1>
                <p className="text-gray-600 mt-2">
                    Collaborative assignments between AMMC and NIA surveyors
                </p>
            </div>

            <DualAssignmentsList />
        </div>
    );
};

export default DualAssignmentsPage;