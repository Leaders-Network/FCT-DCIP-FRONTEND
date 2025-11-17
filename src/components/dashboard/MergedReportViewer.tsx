"use client";
import React, { useState, useEffect } from 'react';
import {
    FileText,
    Download,
    AlertTriangle,
    CheckCircle,
    Info,
    Building,
    MapPin,
    Calendar,
    DollarSign,
    Eye,
    EyeOff,
    RefreshCw,
    ExternalLink,
    Flag,
} from 'lucide-react';

interface MergedReportViewerProps {
    reportId: string;
    onClose?: () => void;
    className?: string;
}

const MergedReportViewer: React.FC<MergedReportViewerProps> = ({ reportId, onClose, className = '' }) => {
    return (
        <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
            <p>Merged Report Viewer for report ID: {reportId}</p>
            <button onClick={onClose} className="mt-4 bg-gray-200 px-4 py-2 rounded">Close</button>
        </div>
    );
};

export default MergedReportViewer;
