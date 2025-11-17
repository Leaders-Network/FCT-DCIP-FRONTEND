'use client';

import React from 'react';
import { Clock, FileText, CheckCircle, XCircle } from 'lucide-react';

interface ClaimStatusBadgeProps {
    status: string;
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
}

const ClaimStatusBadge: React.FC<ClaimStatusBadgeProps> = ({ 
    status, 
    size = 'md',
    showIcon = true 
}) => {
    const getStatusConfig = (status: string) => {
        const configs = {
            pending: {
                bg: 'bg-yellow-100',
                text: 'text-yellow-800',
                border: 'border-yellow-200',
                icon: Clock,
                label: 'Pending'
            },
            under_review: {
                bg: 'bg-blue-100',
                text: 'text-blue-800',
                border: 'border-blue-200',
                icon: FileText,
                label: 'Under Review'
            },
            rejected: {
                bg: 'bg-red-100',
                text: 'text-red-800',
                border: 'border-red-200',
                icon: XCircle,
                label: 'Rejected'
            },
            completed: {
                bg: 'bg-green-100',
                text: 'text-green-800',
                border: 'border-green-200',
                icon: CheckCircle,
                label: 'Completed'
            }
        };
        return configs[status as keyof typeof configs] || configs.pending;
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base'
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center rounded-full border font-medium ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}>
            {showIcon && <Icon className={`${iconSizes[size]} mr-1`} />}
            {config.label}
        </span>
    );
};

export default ClaimStatusBadge;
