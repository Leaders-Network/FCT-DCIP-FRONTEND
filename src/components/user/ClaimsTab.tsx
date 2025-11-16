'use client';

import React from 'react';
import { ClaimsList } from './ClaimsList';

interface ClaimsTabProps {
    userId: string;
}

const ClaimsTab: React.FC<ClaimsTabProps> = ({ userId }) => {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <ClaimsList />
            </div>
        </div>
    );
};

export default ClaimsTab;
