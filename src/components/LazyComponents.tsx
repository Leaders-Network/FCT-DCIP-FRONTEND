/**
 * Centralized lazy loading for heavy components
 * Improves initial bundle size and page load performance
 */
import dynamic from 'next/dynamic';
import React from 'react';

// Loading fallback component
const LoadingFallback = () => (
    <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
);

// User Components
export const MergedReportDetailsModal = dynamic(
    () => import('@/components/user/MergedReportDetailsModal'),
    {
        loading: () => <LoadingFallback />,
        ssr: false
    }
);

export const ReportViewer = dynamic(
    () => import('@/components/user/ReportViewer'),
    {
        loading: () => <LoadingFallback />,
        ssr: false
    }
);

export const PaymentDecisionDisplay = dynamic(
    () => import('@/components/user/PaymentDecisionDisplay'),
    {
        loading: () => <LoadingFallback />,
        ssr: false
    }
);

export const PolicyEditInterface = dynamic(
    () => import('@/components/user/PolicyEditInterface'),
    {
        loading: () => <LoadingFallback />,
        ssr: false
    }
);

export const EnhancedPaymentDecisionHub = dynamic(
    () => import('@/components/user/EnhancedPaymentDecisionHub'),
    {
        loading: () => <LoadingFallback />,
        ssr: false
    }
);

// Admin Components
export const AMMCAssignmentManagement = dynamic(
    () => import('@/components/admin/AMMCAssignmentManagement'),
    {
        loading: () => <LoadingFallback />,
        ssr: false
    }
);

// NIA Admin Components
export const NIAAssignmentManagement = dynamic(
    () => import('@/components/nia-admin/NIAAssignmentManagement'),
    {
        loading: () => <LoadingFallback />,
        ssr: false
    }
);

// Surveyor Components
export const AssignmentDetail = dynamic(
    () => import('@/components/surveyor/AssignmentDetail'),
    {
        loading: () => <LoadingFallback />,
        ssr: false
    }
);
