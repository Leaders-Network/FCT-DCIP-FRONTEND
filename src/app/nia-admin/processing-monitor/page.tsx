"use client";
import React, { useState, useEffect } from 'react';
// Import token setup for development
import '@/utils/tokenSetup';
import {
    FileText,
    Clock,
    CheckCircle,
    AlertTriangle,
    RefreshCw,
    Eye,
    Download,
    Filter,
    Search,
    Activity,
    Zap,
    TrendingUp,
    AlertCircle
} from 'lucide-react';

interface SurveyorReport {
    reportId: string;
    surveyorName: string;
    surveyorEmail: string;
    surveyorLicense: string;
    submittedAt: string;
    reportDocument?: string; // URL to PDF
    findings: {
        propertyCondition: string;
        structuralAssessment: string;
        riskFactors: string;
        recommendations: string;
        estimatedValue?: number;
    };
    recommendation: 'approve' | 'reject' | 'request_more_info';
    surveyNotes?: string;
}

interface ProcessingJob {
    _id: string;
    policyId: string;
    ammcReportId: string;
    niaReportId: string;
    mergedReportId?: string;
    processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
    conflictDetected: boolean;
    conflictSeverity?: 'low' | 'medium' | 'high';
    conflictFlags?: string[];
    processingStartedAt: string;
    processingCompletedAt?: string;
    processingDuration?: number; // in seconds
    errorMessage?: string;
    userNotified: boolean;
    policyDetails: {
        propertyType: string;
        address: string;
        userEmail: string;
        userName: string;
    };
    // Enhanced report details
    ammcReport?: SurveyorReport;
    niaReport?: SurveyorReport;
    mergedReportDocument?: string;
}

const ProcessingMonitorPage = () => {
    const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedJob, setSelectedJob] = useState<ProcessingJob | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        conflictDetected: 'all',
        search: ''
    });
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        fetchProcessingJobs();

        // Set up auto-refresh every 30 seconds
        let interval: NodeJS.Timeout;
        if (autoRefresh) {
            interval = setInterval(fetchProcessingJobs, 30000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh]);

    const fetchProcessingJobs = async () => {
        try {
            setLoading(true);
            // Try multiple token keys for flexibility
            const token = localStorage.getItem('niaAdminToken') ||
                localStorage.getItem('adminToken') ||
                localStorage.getItem('token') ||
                localStorage.getItem('authToken');

            if (!token) {
                console.warn('No authentication token found, using mock data');
                console.log('Available localStorage keys:', Object.keys(localStorage));
                // Continue with mock data instead of throwing error
            } else {
                console.log('Found authentication token');
            }

            // Mock data for demonstration - replace with actual API call
            const mockJobs: ProcessingJob[] = [
                {
                    _id: '1',
                    policyId: 'POL-2024-001',
                    ammcReportId: 'AMMC-RPT-001',
                    niaReportId: 'NIA-RPT-001',
                    mergedReportId: 'MR-2024-001',
                    processingStatus: 'completed',
                    conflictDetected: true,
                    conflictSeverity: 'medium',
                    conflictFlags: ['Property Value Discrepancy', 'Structural Assessment Difference'],
                    processingStartedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
                    processingCompletedAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
                    processingDuration: 180, // 3 minutes
                    userNotified: true,
                    policyDetails: {
                        propertyType: 'Residential Building',
                        address: '123 Garki District, Abuja',
                        userEmail: 'john.adebayo@email.com',
                        userName: 'John Adebayo'
                    },
                    ammcReport: {
                        reportId: 'AMMC-RPT-001',
                        surveyorName: 'Engr. Michael Okafor',
                        surveyorEmail: 'm.okafor@ammc.gov.ng',
                        surveyorLicense: 'AMMC-LIC-2024-045',
                        submittedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                        reportDocument: '/reports/ammc-rpt-001.pdf',
                        findings: {
                            propertyCondition: 'Good overall condition with minor maintenance needs',
                            structuralAssessment: 'Foundation is solid, walls show minor cracks that need attention',
                            riskFactors: 'Low flood risk, moderate fire risk due to electrical wiring age',
                            recommendations: 'Recommend approval with electrical system upgrade within 6 months',
                            estimatedValue: 45000000
                        },
                        recommendation: 'approve',
                        surveyNotes: 'Property is well-maintained. Owner has been proactive with maintenance. Electrical system needs updating but not critical for approval.'
                    },
                    niaReport: {
                        reportId: 'NIA-RPT-001',
                        surveyorName: 'Dr. Sarah Adebayo',
                        surveyorEmail: 's.adebayo@nia.org.ng',
                        surveyorLicense: 'NIA-LIC-2024-089',
                        submittedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                        reportDocument: '/reports/nia-rpt-001.pdf',
                        findings: {
                            propertyCondition: 'Satisfactory condition with some structural concerns',
                            structuralAssessment: 'Foundation shows signs of settling, wall cracks indicate potential structural issues',
                            riskFactors: 'Moderate structural risk, low environmental risk',
                            recommendations: 'Recommend structural engineer evaluation before approval',
                            estimatedValue: 38000000
                        },
                        recommendation: 'request_more_info',
                        surveyNotes: 'Discrepancies noted in foundation assessment. Recommend independent structural evaluation before proceeding with insurance approval.'
                    },
                    mergedReportDocument: '/reports/merged-mr-2024-001.pdf'
                },
                {
                    _id: '2',
                    policyId: 'POL-2024-002',
                    ammcReportId: 'AMMC-RPT-002',
                    niaReportId: 'NIA-RPT-002',
                    processingStatus: 'processing',
                    conflictDetected: false,
                    processingStartedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
                    userNotified: false,
                    policyDetails: {
                        propertyType: 'Commercial Building',
                        address: '456 Wuse II, Abuja',
                        userEmail: 'sarah.okafor@email.com',
                        userName: 'Sarah Okafor'
                    },
                    ammcReport: {
                        reportId: 'AMMC-RPT-002',
                        surveyorName: 'Engr. Ibrahim Musa',
                        surveyorEmail: 'i.musa@ammc.gov.ng',
                        surveyorLicense: 'AMMC-LIC-2024-067',
                        submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                        reportDocument: '/reports/ammc-rpt-002.pdf',
                        findings: {
                            propertyCondition: 'Excellent condition, recently renovated',
                            structuralAssessment: 'All structural elements in excellent condition',
                            riskFactors: 'Low risk across all categories',
                            recommendations: 'Recommend approval without conditions',
                            estimatedValue: 120000000
                        },
                        recommendation: 'approve',
                        surveyNotes: 'Commercial property recently underwent major renovation. All systems are modern and up to code.'
                    },
                    niaReport: {
                        reportId: 'NIA-RPT-002',
                        surveyorName: 'Arch. Fatima Hassan',
                        surveyorEmail: 'f.hassan@nia.org.ng',
                        surveyorLicense: 'NIA-LIC-2024-123',
                        submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                        reportDocument: '/reports/nia-rpt-002.pdf',
                        findings: {
                            propertyCondition: 'Excellent condition with modern amenities',
                            structuralAssessment: 'Superior structural integrity, meets all current standards',
                            riskFactors: 'Minimal risk, excellent fire safety systems',
                            recommendations: 'Strongly recommend approval',
                            estimatedValue: 125000000
                        },
                        recommendation: 'approve',
                        surveyNotes: 'Outstanding commercial property. Recent renovation includes state-of-the-art safety systems.'
                    }
                },
                {
                    _id: '3',
                    policyId: 'POL-2024-003',
                    ammcReportId: 'AMMC-RPT-003',
                    niaReportId: 'NIA-RPT-003',
                    processingStatus: 'failed',
                    conflictDetected: false,
                    processingStartedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
                    errorMessage: 'Report format validation failed - NIA report missing required sections',
                    userNotified: false,
                    policyDetails: {
                        propertyType: 'Industrial Facility',
                        address: '789 Jabi District, Abuja',
                        userEmail: 'michael.okonkwo@email.com',
                        userName: 'Michael Okonkwo'
                    },
                    ammcReport: {
                        reportId: 'AMMC-RPT-003',
                        surveyorName: 'Engr. Aisha Bello',
                        surveyorEmail: 'a.bello@ammc.gov.ng',
                        surveyorLicense: 'AMMC-LIC-2024-089',
                        submittedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
                        reportDocument: '/reports/ammc-rpt-003.pdf',
                        findings: {
                            propertyCondition: 'Industrial facility in good operational condition',
                            structuralAssessment: 'Heavy-duty construction suitable for industrial use',
                            riskFactors: 'Moderate fire risk due to industrial processes, low flood risk',
                            recommendations: 'Recommend approval with enhanced fire safety measures',
                            estimatedValue: 250000000
                        },
                        recommendation: 'approve',
                        surveyNotes: 'Industrial facility meets all safety standards. Fire suppression system is adequate but could be enhanced.'
                    },
                    niaReport: {
                        reportId: 'NIA-RPT-003',
                        surveyorName: 'Dr. Yusuf Abdullahi',
                        surveyorEmail: 'y.abdullahi@nia.org.ng',
                        surveyorLicense: 'NIA-LIC-2024-156',
                        submittedAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
                        reportDocument: '/reports/nia-rpt-003-incomplete.pdf',
                        findings: {
                            propertyCondition: 'Report incomplete - missing environmental assessment',
                            structuralAssessment: 'Structural evaluation pending completion',
                            riskFactors: 'Assessment incomplete',
                            recommendations: 'Report requires completion before processing',
                            estimatedValue: 0
                        },
                        recommendation: 'request_more_info',
                        surveyNotes: 'Report submission was incomplete. Missing environmental impact assessment and detailed structural analysis sections.'
                    }
                },
                {
                    _id: '4',
                    policyId: 'POL-2024-004',
                    ammcReportId: 'AMMC-RPT-004',
                    niaReportId: 'NIA-RPT-004',
                    mergedReportId: 'MR-2024-004',
                    processingStatus: 'completed',
                    conflictDetected: false,
                    processingStartedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
                    processingCompletedAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
                    processingDuration: 120, // 2 minutes
                    userNotified: true,
                    policyDetails: {
                        propertyType: 'Residential Building',
                        address: '321 Maitama District, Abuja',
                        userEmail: 'fatima.abdullahi@email.com',
                        userName: 'Fatima Abdullahi'
                    },
                    ammcReport: {
                        reportId: 'AMMC-RPT-004',
                        surveyorName: 'Engr. David Okoro',
                        surveyorEmail: 'd.okoro@ammc.gov.ng',
                        surveyorLicense: 'AMMC-LIC-2024-112',
                        submittedAt: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
                        reportDocument: '/reports/ammc-rpt-004.pdf',
                        findings: {
                            propertyCondition: 'Excellent condition, luxury residential property',
                            structuralAssessment: 'Superior construction quality, all systems modern',
                            riskFactors: 'Very low risk profile, excellent location',
                            recommendations: 'Highly recommend approval',
                            estimatedValue: 85000000
                        },
                        recommendation: 'approve',
                        surveyNotes: 'Premium residential property in exclusive neighborhood. Construction quality exceeds standards.'
                    },
                    niaReport: {
                        reportId: 'NIA-RPT-004',
                        surveyorName: 'Arch. Kemi Adeyemi',
                        surveyorEmail: 'k.adeyemi@nia.org.ng',
                        surveyorLicense: 'NIA-LIC-2024-178',
                        submittedAt: new Date(Date.now() - 46 * 60 * 60 * 1000).toISOString(),
                        reportDocument: '/reports/nia-rpt-004.pdf',
                        findings: {
                            propertyCondition: 'Outstanding condition with premium finishes',
                            structuralAssessment: 'Exceptional structural integrity and design',
                            riskFactors: 'Minimal risk, premium security systems installed',
                            recommendations: 'Strongly recommend approval',
                            estimatedValue: 87000000
                        },
                        recommendation: 'approve',
                        surveyNotes: 'Luxury property with exceptional build quality. All safety and security systems are state-of-the-art.'
                    },
                    mergedReportDocument: '/reports/merged-mr-2024-004.pdf'
                }
            ];

            setProcessingJobs(mockJobs);
        } catch (error) {
            console.error('Failed to fetch processing jobs:', error);
            setError(error instanceof Error ? error.message : 'Failed to load processing jobs');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'failed': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="h-4 w-4" />;
            case 'processing': return <RefreshCw className="h-4 w-4 animate-spin" />;
            case 'completed': return <CheckCircle className="h-4 w-4" />;
            case 'failed': return <AlertTriangle className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    const getConflictSeverityColor = (severity?: string) => {
        switch (severity) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds) return 'N/A';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    const handleRetryProcessing = async (jobId: string) => {
        try {
            // Retry failed processing job
            setProcessingJobs(prev => prev.map(job =>
                job._id === jobId
                    ? { ...job, processingStatus: 'pending', errorMessage: undefined }
                    : job
            ));
        } catch (error) {
            console.error('Failed to retry processing:', error);
        }
    };

    const filteredJobs = processingJobs.filter(job => {
        const matchesStatus = filters.status === 'all' || job.processingStatus === filters.status;
        const matchesConflict = filters.conflictDetected === 'all' ||
            (filters.conflictDetected === 'true' && job.conflictDetected) ||
            (filters.conflictDetected === 'false' && !job.conflictDetected);
        const matchesSearch = filters.search === '' ||
            job.policyDetails.userName.toLowerCase().includes(filters.search.toLowerCase()) ||
            job.policyDetails.propertyType.toLowerCase().includes(filters.search.toLowerCase()) ||
            job.policyId.toLowerCase().includes(filters.search.toLowerCase());

        return matchesStatus && matchesConflict && matchesSearch;
    });

    const stats = {
        total: processingJobs.length,
        pending: processingJobs.filter(j => j.processingStatus === 'pending').length,
        processing: processingJobs.filter(j => j.processingStatus === 'processing').length,
        completed: processingJobs.filter(j => j.processingStatus === 'completed').length,
        failed: processingJobs.filter(j => j.processingStatus === 'failed').length,
        withConflicts: processingJobs.filter(j => j.conflictDetected).length,
        avgProcessingTime: processingJobs
            .filter(j => j.processingDuration)
            .reduce((acc, j) => acc + (j.processingDuration || 0), 0) /
            processingJobs.filter(j => j.processingDuration).length || 0
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border h-24"></div>
                        ))}
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border h-32"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Processing Jobs</h3>
                <p className="text-sm text-red-600 text-center mb-4">{error}</p>
                <button
                    onClick={fetchProcessingJobs}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Automatic Processing Monitor</h1>
                    <p className="text-gray-600 mt-1">
                        Monitor automatic report merging and conflict detection processes
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="autoRefresh"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="autoRefresh" className="text-sm text-gray-700">
                            Auto-refresh
                        </label>
                    </div>
                    <button
                        onClick={fetchProcessingJobs}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Activity className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Processing</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.pending + stats.processing}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Completed</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <AlertCircle className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">With Conflicts</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.withConflicts}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Processing Performance</h3>
                        <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Avg Processing Time:</span>
                            <span className="text-sm font-medium text-gray-900">
                                {formatDuration(Math.round(stats.avgProcessingTime))}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Success Rate:</span>
                            <span className="text-sm font-medium text-green-600">
                                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Failed Jobs:</span>
                            <span className="text-sm font-medium text-red-600">{stats.failed}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Conflict Detection</h3>
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Conflict Rate:</span>
                            <span className="text-sm font-medium text-orange-600">
                                {stats.total > 0 ? Math.round((stats.withConflicts / stats.total) * 100) : 0}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">High Severity:</span>
                            <span className="text-sm font-medium text-red-600">
                                {processingJobs.filter(j => j.conflictSeverity === 'high').length}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Auto-Resolved:</span>
                            <span className="text-sm font-medium text-green-600">0</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
                        <Zap className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">System Status:</span>
                            <span className="text-sm font-medium text-green-600">Healthy</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Queue Length:</span>
                            <span className="text-sm font-medium text-gray-900">{stats.pending}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Last Update:</span>
                            <span className="text-sm font-medium text-gray-900">
                                {new Date().toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                placeholder="Search by policy, user, or property..."
                                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Conflicts</label>
                        <select
                            value={filters.conflictDetected}
                            onChange={(e) => setFilters(prev => ({ ...prev, conflictDetected: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Jobs</option>
                            <option value="true">With Conflicts</option>
                            <option value="false">No Conflicts</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Processing Jobs List */}
            <div className="space-y-4">
                {filteredJobs.length === 0 ? (
                    <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
                        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No processing jobs found</h3>
                        <p className="text-gray-600">
                            {filters.search || filters.status !== 'all' || filters.conflictDetected !== 'all'
                                ? 'Try adjusting your filters to see more results.'
                                : 'Processing jobs will appear here when reports are submitted for merging.'}
                        </p>
                    </div>
                ) : (
                    filteredJobs.map((job) => (
                        <div key={job._id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {job.policyDetails.propertyType}
                                        </h3>
                                        <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.processingStatus)}`}>
                                            {getStatusIcon(job.processingStatus)}
                                            <span className="ml-1">{job.processingStatus.toUpperCase()}</span>
                                        </span>
                                        {job.conflictDetected && (
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getConflictSeverityColor(job.conflictSeverity)}`}>
                                                CONFLICT {job.conflictSeverity?.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-2">
                                        <p><strong>User:</strong> {job.policyDetails.userName}</p>
                                        <p><strong>Address:</strong> {job.policyDetails.address}</p>
                                        <p><strong>Policy ID:</strong> {job.policyId}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-gray-500">Started</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {new Date(job.processingStartedAt).toLocaleString()}
                                    </p>
                                </div>
                                {job.processingCompletedAt && (
                                    <div>
                                        <p className="text-xs text-gray-500">Completed</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {new Date(job.processingCompletedAt).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                                {job.processingDuration && (
                                    <div>
                                        <p className="text-xs text-gray-500">Duration</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {formatDuration(job.processingDuration)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Report Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {job.ammcReport && (
                                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h5 className="text-sm font-medium text-green-900">AMMC Report</h5>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.ammcReport.recommendation === 'approve' ? 'bg-green-100 text-green-800' :
                                                job.ammcReport.recommendation === 'reject' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {job.ammcReport.recommendation.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-green-700 mb-1">
                                            <strong>Surveyor:</strong> {job.ammcReport.surveyorName}
                                        </p>
                                        <p className="text-xs text-green-700 mb-1">
                                            <strong>Value:</strong> ₦{job.ammcReport.findings.estimatedValue?.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-green-600">
                                            Submitted: {new Date(job.ammcReport.submittedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}

                                {job.niaReport && (
                                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h5 className="text-sm font-medium text-blue-900">NIA Report</h5>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.niaReport.recommendation === 'approve' ? 'bg-green-100 text-green-800' :
                                                job.niaReport.recommendation === 'reject' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {job.niaReport.recommendation.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-blue-700 mb-1">
                                            <strong>Surveyor:</strong> {job.niaReport.surveyorName}
                                        </p>
                                        <p className="text-xs text-blue-700 mb-1">
                                            <strong>Value:</strong> ₦{job.niaReport.findings.estimatedValue?.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-blue-600">
                                            Submitted: {new Date(job.niaReport.submittedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {job.errorMessage && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-800">
                                        <strong>Error:</strong> {job.errorMessage}
                                    </p>
                                </div>
                            )}

                            {job.conflictFlags && job.conflictFlags.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-xs text-gray-500 mb-2">Detected Conflicts:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {job.conflictFlags.map((flag, index) => (
                                            <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                                {flag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <div>
                                        User Notified: {job.userNotified ?
                                            <span className="text-green-600">Yes</span> :
                                            <span className="text-red-600">No</span>
                                        }
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => {
                                            setSelectedJob(job);
                                            setShowDetailsModal(true);
                                        }}
                                        className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        Details
                                    </button>

                                    {job.processingStatus === 'failed' && (
                                        <button
                                            onClick={() => handleRetryProcessing(job._id)}
                                            className="flex items-center px-3 py-1 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 transition-colors"
                                        >
                                            <RefreshCw className="h-4 w-4 mr-1" />
                                            Retry
                                        </button>
                                    )}

                                    {job.ammcReport?.reportDocument && (
                                        <button className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors">
                                            <Download className="h-4 w-4 mr-1" />
                                            AMMC PDF
                                        </button>
                                    )}

                                    {job.niaReport?.reportDocument && (
                                        <button className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                                            <Download className="h-4 w-4 mr-1" />
                                            NIA PDF
                                        </button>
                                    )}

                                    {job.mergedReportDocument && (
                                        <button className="flex items-center px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors">
                                            <Download className="h-4 w-4 mr-1" />
                                            Merged PDF
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedJob && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Processing Job Details
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Policy: {selectedJob.policyId} • {selectedJob.policyDetails.userName}
                            </p>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Processing Information</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Status:</span>
                                            <span className={`text-sm font-medium ${selectedJob.processingStatus === 'completed' ? 'text-green-600' :
                                                selectedJob.processingStatus === 'failed' ? 'text-red-600' :
                                                    'text-blue-600'
                                                }`}>
                                                {selectedJob.processingStatus.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Started:</span>
                                            <span className="text-sm text-gray-900">
                                                {new Date(selectedJob.processingStartedAt).toLocaleString()}
                                            </span>
                                        </div>
                                        {selectedJob.processingCompletedAt && (
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Completed:</span>
                                                <span className="text-sm text-gray-900">
                                                    {new Date(selectedJob.processingCompletedAt).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                        {selectedJob.processingDuration && (
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Duration:</span>
                                                <span className="text-sm text-gray-900">
                                                    {formatDuration(selectedJob.processingDuration)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* AMMC Report Details */}
                                {selectedJob.ammcReport && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">AMMC Survey Report</h4>
                                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-green-900">{selectedJob.ammcReport.surveyorName}</p>
                                                    <p className="text-sm text-green-700">{selectedJob.ammcReport.surveyorEmail}</p>
                                                    <p className="text-xs text-green-600">License: {selectedJob.ammcReport.surveyorLicense}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-green-700">
                                                        {new Date(selectedJob.ammcReport.submittedAt).toLocaleDateString()}
                                                    </p>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedJob.ammcReport.recommendation === 'approve' ? 'bg-green-100 text-green-800' :
                                                        selectedJob.ammcReport.recommendation === 'reject' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {selectedJob.ammcReport.recommendation.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <p className="font-medium text-green-900">Property Condition:</p>
                                                    <p className="text-green-700">{selectedJob.ammcReport.findings.propertyCondition}</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-green-900">Structural Assessment:</p>
                                                    <p className="text-green-700">{selectedJob.ammcReport.findings.structuralAssessment}</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-green-900">Risk Factors:</p>
                                                    <p className="text-green-700">{selectedJob.ammcReport.findings.riskFactors}</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-green-900">Estimated Value:</p>
                                                    <p className="text-green-700">₦{selectedJob.ammcReport.findings.estimatedValue?.toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="font-medium text-green-900">Recommendations:</p>
                                                <p className="text-green-700">{selectedJob.ammcReport.findings.recommendations}</p>
                                            </div>

                                            {selectedJob.ammcReport.surveyNotes && (
                                                <div>
                                                    <p className="font-medium text-green-900">Survey Notes:</p>
                                                    <p className="text-green-700">{selectedJob.ammcReport.surveyNotes}</p>
                                                </div>
                                            )}

                                            {selectedJob.ammcReport.reportDocument && (
                                                <div className="flex items-center justify-between pt-2 border-t border-green-200">
                                                    <span className="text-sm font-medium text-green-900">Report Document:</span>
                                                    <button className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors">
                                                        <Download className="h-4 w-4 mr-1" />
                                                        Download PDF
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* NIA Report Details */}
                                {selectedJob.niaReport && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">NIA Survey Report</h4>
                                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-blue-900">{selectedJob.niaReport.surveyorName}</p>
                                                    <p className="text-sm text-blue-700">{selectedJob.niaReport.surveyorEmail}</p>
                                                    <p className="text-xs text-blue-600">License: {selectedJob.niaReport.surveyorLicense}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-blue-700">
                                                        {new Date(selectedJob.niaReport.submittedAt).toLocaleDateString()}
                                                    </p>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedJob.niaReport.recommendation === 'approve' ? 'bg-green-100 text-green-800' :
                                                        selectedJob.niaReport.recommendation === 'reject' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {selectedJob.niaReport.recommendation.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <p className="font-medium text-blue-900">Property Condition:</p>
                                                    <p className="text-blue-700">{selectedJob.niaReport.findings.propertyCondition}</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-blue-900">Structural Assessment:</p>
                                                    <p className="text-blue-700">{selectedJob.niaReport.findings.structuralAssessment}</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-blue-900">Risk Factors:</p>
                                                    <p className="text-blue-700">{selectedJob.niaReport.findings.riskFactors}</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-blue-900">Estimated Value:</p>
                                                    <p className="text-blue-700">₦{selectedJob.niaReport.findings.estimatedValue?.toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="font-medium text-blue-900">Recommendations:</p>
                                                <p className="text-blue-700">{selectedJob.niaReport.findings.recommendations}</p>
                                            </div>

                                            {selectedJob.niaReport.surveyNotes && (
                                                <div>
                                                    <p className="font-medium text-blue-900">Survey Notes:</p>
                                                    <p className="text-blue-700">{selectedJob.niaReport.surveyNotes}</p>
                                                </div>
                                            )}

                                            {selectedJob.niaReport.reportDocument && (
                                                <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                                                    <span className="text-sm font-medium text-blue-900">Report Document:</span>
                                                    <button className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                                                        <Download className="h-4 w-4 mr-1" />
                                                        Download PDF
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Merged Report */}
                                {selectedJob.mergedReportId && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Merged Report</h4>
                                        <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-purple-900">Report ID: {selectedJob.mergedReportId}</p>
                                                    <p className="text-sm text-purple-700">
                                                        Combined AMMC and NIA findings
                                                    </p>
                                                </div>
                                                {selectedJob.mergedReportDocument && (
                                                    <button className="flex items-center px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors">
                                                        <Download className="h-4 w-4 mr-1" />
                                                        Download Merged PDF
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedJob.conflictDetected && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Conflict Information</h4>
                                        <div className="bg-orange-50 p-4 rounded-lg">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm text-gray-600">Severity:</span>
                                                <span className={`text-sm font-medium ${selectedJob.conflictSeverity === 'high' ? 'text-red-600' :
                                                    selectedJob.conflictSeverity === 'medium' ? 'text-yellow-600' :
                                                        'text-green-600'
                                                    }`}>
                                                    {selectedJob.conflictSeverity?.toUpperCase()}
                                                </span>
                                            </div>
                                            {selectedJob.conflictFlags && (
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-2">Detected Issues:</p>
                                                    <ul className="list-disc list-inside space-y-1">
                                                        {selectedJob.conflictFlags.map((flag, index) => (
                                                            <li key={index} className="text-sm text-gray-700">{flag}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selectedJob.errorMessage && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Error Details</h4>
                                        <div className="bg-red-50 p-4 rounded-lg">
                                            <p className="text-sm text-red-800">{selectedJob.errorMessage}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setSelectedJob(null);
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProcessingMonitorPage;