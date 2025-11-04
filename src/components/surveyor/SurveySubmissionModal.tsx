"use client";
import React, { useState } from "react";
import { Upload, FileText, Phone, Calendar, X, Loader2, AlertCircle } from "lucide-react";
import { PolicyRequest, ContactLogEntry } from "@/types/api.types";

interface SurveySubmissionModalProps {
    policy: PolicyRequest;
    assignment?: any; // Assignment with dual-surveyor info
    isOpen: boolean;
    onSubmit: (submission: any) => Promise<void>;
    onClose: () => void;
}

const ErrorMessage = ({ message }: { message: string }) => (
    <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>{message}</span>
    </div>
);

const SurveySubmissionModal: React.FC<SurveySubmissionModalProps> = ({
    policy,
    assignment,
    isOpen,
    onSubmit,
    onClose
}) => {
    const [surveyNotes, setSurveyNotes] = useState("");
    const [propertyCondition, setPropertyCondition] = useState("");
    const [structuralAssessment, setStructuralAssessment] = useState("");
    const [riskFactors, setRiskFactors] = useState("");
    const [recommendations, setRecommendations] = useState("");
    const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
    const [contactLog, setContactLog] = useState<ContactLogEntry[]>([]);
    const [recommendedAction, setRecommendedAction] = useState<'approve' | 'reject' | 'request_more_info'>('approve');

    // Expense tracking
    const [expenses, setExpenses] = useState({
        transportation: 0,
        accommodation: 0,
        meals: 0,
        equipment: 0,
        other: 0
    });

    const [newContact, setNewContact] = useState<ContactLogEntry>({
        date: new Date().toISOString().split('T')[0],
        method: 'phone',
        notes: '',
        successful: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get surveyor organization from localStorage or assignment
    const surveyorOrganization = assignment?.organization ||
        (typeof window !== 'undefined' ? localStorage.getItem('surveyorOrganization') : null) || 'AMMC';

    // Check if this is a dual-surveyor assignment
    const isDualSurveyor = assignment?.dualAssignmentId || assignment?.isDualSurveyor;
    const otherOrganization = surveyorOrganization === 'AMMC' ? 'NIA' : 'AMMC';
    const otherSurveyorContact = assignment?.dualAssignmentInfo?.otherSurveyor;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type !== 'application/pdf') {
                setError('Please upload a PDF file only.');
                return;
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB
                setError('File size cannot exceed 10MB.');
                return;
            }

            setError(null);
            setUploadedDocument(file);
        }
    };

    const addContactEntry = () => {
        if (newContact.notes.trim()) {
            setContactLog([...contactLog, { ...newContact }]);
            setNewContact({
                date: new Date().toISOString().split('T')[0],
                method: 'phone',
                notes: '',
                successful: true
            });
        }
    };

    const removeContactEntry = (index: number) => {
        setContactLog(contactLog.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!uploadedDocument) {
            setError('Please upload a survey document.');
            return;
        }

        if (!surveyNotes.trim()) {
            setError('Please provide survey notes.');
            return;
        }

        if (!propertyCondition.trim()) {
            setError('Please provide property condition assessment.');
            return;
        }

        if (!structuralAssessment.trim()) {
            setError('Please provide structural assessment.');
            return;
        }

        if (!riskFactors.trim()) {
            setError('Please provide risk factors assessment.');
            return;
        }

        if (!recommendations.trim()) {
            setError('Please provide recommendations.');
            return;
        }

        setError(null);
        setLoading(true);
        try {
            const submission = {
                surveyDocument: uploadedDocument,
                surveyNotes,
                contactLog,
                recommendedAction,
                surveyDetails: {
                    propertyCondition,
                    structuralAssessment,
                    riskFactors,
                    recommendations
                },
                expenses
            };

            await onSubmit(submission);
        } catch (error) {
            console.error('Failed to submit survey:', error);
            setError('Failed to submit survey. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full min-h-[50vh] max-h-[95vh] my-4 overflow-hidden flex flex-col">
                {/* Header Section */}
                <div className="p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Submit Survey Report</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Policy #{policy._id} • {policy.propertyDetails.propertyType}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    {error && <ErrorMessage message={error} />}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Survey Document Upload */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                                <Upload className="w-5 h-5 mr-2" />
                                Survey Document Upload
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-blue-800 mb-2">
                                        Upload Survey Report (PDF only)
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        required
                                    />
                                    {uploadedDocument && (
                                        <p className="text-sm text-green-600 mt-2 flex items-center">
                                            <FileText className="w-4 h-4 mr-1" />
                                            {uploadedDocument.name} ({(uploadedDocument.size / 1024 / 1024).toFixed(2)} MB)
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Survey Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Survey Notes
                            </label>
                            <textarea
                                value={surveyNotes}
                                onChange={(e) => setSurveyNotes(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows={4}
                                placeholder="Additional notes, observations, or comments about the survey..."
                                required
                            />
                        </div>

                        {/* Survey Details */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Survey Assessment Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Property Condition Assessment
                                    </label>
                                    <textarea
                                        value={propertyCondition}
                                        onChange={(e) => setPropertyCondition(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows={3}
                                        placeholder="Describe the overall condition of the property..."
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Structural Assessment
                                    </label>
                                    <textarea
                                        value={structuralAssessment}
                                        onChange={(e) => setStructuralAssessment(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows={3}
                                        placeholder="Assess structural integrity, foundation, walls, roof..."
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Risk Factors
                                    </label>
                                    <textarea
                                        value={riskFactors}
                                        onChange={(e) => setRiskFactors(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows={3}
                                        placeholder="Identify potential risks, hazards, security concerns..."
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Recommendations
                                    </label>
                                    <textarea
                                        value={recommendations}
                                        onChange={(e) => setRecommendations(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows={3}
                                        placeholder="Provide recommendations for improvements, repairs, or actions..."
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Recommended Action */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Recommended Action
                            </label>
                            <select
                                value={recommendedAction}
                                onChange={(e) => setRecommendedAction(e.target.value as 'approve' | 'reject' | 'request_more_info')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="approve">Approve Policy</option>
                                <option value="reject">Reject Policy</option>
                                <option value="request_more_info">Request More Information</option>
                            </select>
                        </div>
                    </form>
                </div>

                {/* Form Actions */}
                <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading || !uploadedDocument}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Survey'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SurveySubmissionModal;