'use client';

import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface SortableHeaderProps {
    label: string;
    sortKey: string;
    currentSortBy?: string;
    currentSortOrder?: 'asc' | 'desc';
    onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    className?: string;
}

export const SortableHeader: React.FC<SortableHeaderProps> = ({
    label,
    sortKey,
    currentSortBy,
    currentSortOrder,
    onSort,
    className = ""
}) => {
    const isActive = currentSortBy === sortKey;
    const isAsc = isActive && currentSortOrder === 'asc';
    const isDesc = isActive && currentSortOrder === 'desc';

    const handleClick = () => {
        if (isActive) {
            // Toggle between asc and desc
            onSort(sortKey, currentSortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // Default to desc for new sort
            onSort(sortKey, 'desc');
        }
    };

    const getSortIcon = () => {
        if (isAsc) {
            return <ChevronUp className="w-4 h-4" />;
        } else if (isDesc) {
            return <ChevronDown className="w-4 h-4" />;
        } else {
            return <ChevronsUpDown className="w-4 h-4 opacity-50" />;
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`inline-flex items-center space-x-1 text-left font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded ${isActive ? 'text-blue-600' : ''
                } ${className}`}
        >
            <span>{label}</span>
            {getSortIcon()}
        </button>
    );
};