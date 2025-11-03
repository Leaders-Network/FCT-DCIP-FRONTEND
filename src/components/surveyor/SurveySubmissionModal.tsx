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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
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
                    <div className="flex items-start text-gray-600 text-sm mt-4 min-w-0">
                        <span className="font-medium flex-shrink-0">Property Address:</span>
                        <span className="ml-2 break-words min-w-0">{policy.propertyDetails.address}</span>
                    </div>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 min-w-0">
                    {error && <ErrorMessage message={error} />}

                    {/* Contact Log Section */}
                    <div className="border-b border-gray-200 pb-6">
                        <div className="flex items-center mb-4">
                            <Phone className="h-5 w-5 text-blue-600 mr-2" />
                            <h3 className="text-lg font-medium text-gray-900">Contact Log</h3>
                        </div>
                        <p className="text-gray-600 mb-4">Record all contact attempts made with the property builder/contractor or occupant.</p>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end min-w-0">
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={newContact.date}
                                        onChange={(e) => setNewContact({ ...newContact, date: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                                    <select
                                        value={newContact.method}
                                        onChange={(e) => setNewContact({ ...newContact, method: e.target.value as any })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="phone">📞 Phone</option>
                                        <option value="email">📧 Email</option>
                                        <option value="sms">💬 SMS</option>
                                        <option value="visit">🏠 Site Visit</option>
                                    </select>
                                </div>
                                <div className="lg:col-span-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <textarea
                                        value={newContact.notes}
                                        onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                                        placeholder="Describe the contact attempt and outcome..."
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows={2}
                                    />
                                </div>
                                <div className="lg:col-span-3 flex flex-col space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={newContact.successful}
                                            onChange={(e) => setNewContact({ ...newContact, successful: e.target.checked })}
                                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Contact Successful</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addContactEntry}
                                        disabled={!newContact.notes.trim()}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Add Entry
                                    </button>
                                </div>
                            </div>
                        </div>

                        {contactLog.length > 0 && (
                            <div className="space-y-2 mt-4">
                                {contactLog.map((entry, index) => (
                                    <div key={index} className="flex items-start justify-between bg-white p-3 border rounded-md min-w-0">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1 flex-wrap">
                                                <Calendar className="h-4 w-4 flex-shrink-0" />
                                                <span className="whitespace-nowrap">{entry.date}</span>
                                                <span className="capitalize font-medium whitespace-nowrap">{entry.method}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${entry.successful ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {entry.successful ? 'Success' : 'Failed'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-800 break-words">{entry.notes}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeContactEntry(index)}
                                            className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Document Upload Section */}
                    <div className="border-b border-gray-200 pb-6">
                        <div className="flex items-center mb-4">
                            <FileText className="h-5 w-5 text-blue-600 mr-2" />
                            <h3 className="text-lg font-medium text-gray-900">Survey Document</h3>
                            <span className="text-red-500 ml-1">*</span>
                        </div>
                        <p className="text-gray-600 mb-4">Upload the completed survey report as a PDF document.</p>

                        <div className="mt-1 flex justify-center px-8 pt-8 pb-8 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors bg-gray-50">
                            <div className="space-y-3 text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-base text-gray-600">
                                    <label
                                        htmlFor="survey-document"
                                        className="relative cursor-pointer bg-white rounded-lg px-4 py-2 font-semibold text-blue-600 hover:text-blue-700 focus-within:outline-none border border-blue-600 hover:bg-blue-50 transition-colors"
                                    >
                                        <span>Choose PDF File</span>
                                        <input
                                            id="survey-document"
                                            name="survey-document"
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileChange}
                                            className="sr-only"
                                        />
                                    </label>
                                    <p className="pl-2 self-center">or drag and drop here</p>
                                </div>
                                <p className="text-sm text-gray-500">PDF files only • Maximum size: 10MB</p>
                            </div>
                        </div>
                        {uploadedDocument && (
                            <div className="mt-4 flex items-center justify-between text-sm bg-green-50 p-4 rounded-lg border border-green-200">
                                <div className="flex items-center text-green-800">
                                    <FileText className="h-5 w-5 mr-3" />
                                    <div>
                                        <span className="font-semibold">{uploadedDocument.name}</span>
                                        <p className="text-xs text-green-600">{(uploadedDocument.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <span className="text-green-800 font-bold text-lg">✓ Ready</span>
                            </div>
                        )}
                    </div>

                    {/* Survey Details Section */}
                    <div className="border-b border-gray-200 pb-6">
                        <div className="flex items-center mb-6">
                            <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                            <h3 className="text-lg font-medium text-gray-900">Survey Assessment</h3>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Property Condition <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={propertyCondition}
                                    onChange={(e) => setPropertyCondition(e.target.value)}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    placeholder="Describe the overall condition of the property, including exterior, interior, and general maintenance..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Structural Assessment <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={structuralAssessment}
                                    onChange={(e) => setStructuralAssessment(e.target.value)}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    placeholder="Assess the structural integrity, foundation, walls, roof, and any structural concerns..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Risk Factors <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={riskFactors}
                                    onChange={(e) => setRiskFactors(e.target.value)}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    placeholder="Identify potential risks such as flood zones, security concerns, environmental hazards..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Recommendations <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={recommendations}
                                    onChange={(e) => setRecommendations(e.target.value)}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    placeholder="Provide recommendations for improvements, repairs, or risk mitigation measures..."
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Additional Survey Notes <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={surveyNotes}
                                onChange={(e) => setSurveyNotes(e.target.value)}
                                rows={5}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="Provide comprehensive notes about the property survey, including detailed findings, observations, and any additional concerns or recommendations..."
                            />
                        </div>
                    </div>

                    {/* Recommendation Section */}
                    <div className="border-b border-gray-200 pb-6">
                        <div className="flex items-center mb-4">
                            <FileText className="h-5 w-5 text-blue-600 mr-2" />
                            <h3 className="text-lg font-medium text-gray-900">Final Recommendation</h3>
                            <span className="text-red-500 ml-1">*</span>
                        </div>
                        <p className="text-gray-600 mb-6">Based on your survey findings, select your recommendation for this policy application.</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-0">
                            {[
                                {
                                    value: 'approve',
                                    label: 'Approve Policy',
                                    description: 'Property meets all requirements',
                                    icon: '✅',
                                    color: 'green'
                                },
                                {
                                    value: 'reject',
                                    label: 'Reject Policy',
                                    description: 'Property does not meet requirements',
                                    icon: '❌',
                                    color: 'red'
                                },
                                {
                                    value: 'request_more_info',
                                    label: 'Request More Info',
                                    description: 'Additional information needed',
                                    icon: '📋',
                                    color: 'yellow'
                                }
                            ].map(option => (
                                <label key={option.value} className={`flex flex-col p-5 border-2 rounded-lg cursor-pointer transition-all ${recommendedAction === option.value
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                                    : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="recommendation"
                                        value={option.value}
                                        checked={recommendedAction === option.value}
                                        onChange={(e) => setRecommendedAction(e.target.value as any)}
                                        className="sr-only"
                                    />
                                    <div className="text-center">
                                        <div className="text-2xl mb-2">{option.icon}</div>
                                        <span className="text-base font-bold block mb-1">
                                            {option.label}
                                        </span>
                                        <span className={`text-sm ${recommendedAction === option.value ? 'text-blue-100' : 'text-gray-500'
                                            }`}>
                                            {option.description}
                                        </span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Submission Checklist */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-base font-medium text-blue-900 mb-3">📋 Submission Checklist</h4>
                        <div className="space-y-2 text-sm">
                            <div className={`flex items-center ${uploadedDocument ? 'text-green-700' : 'text-gray-500'}`}>
                                <span className="mr-2">{uploadedDocument ? '✅' : '⬜'}</span>
                                Survey document uploaded (PDF)
                            </div>
                            <div className={`flex items-center ${surveyNotes.trim() ? 'text-green-700' : 'text-gray-500'}`}>
                                <span className="mr-2">{surveyNotes.trim() ? '✅' : '⬜'}</span>
                                Survey notes completed
                            </div>
                            <div className={`flex items-center ${propertyCondition.trim() ? 'text-green-700' : 'text-gray-500'}`}>
                                <span className="mr-2">{propertyCondition.trim() ? '✅' : '⬜'}</span>
                                Property condition assessed
                            </div>
                            <div className={`flex items-center ${structuralAssessment.trim() ? 'text-green-700' : 'text-gray-500'}`}>
                                <span className="mr-2">{structuralAssessment.trim() ? '✅' : '⬜'}</span>
                                Structural assessment completed
                            </div>
                            <div className={`flex items-center ${recommendedAction ? 'text-green-700' : 'text-gray-500'}`}>
                                <span className="mr-2">{recommendedAction ? '✅' : '⬜'}</span>
                                Final recommendation selected
                            </div>
                        </div>
                    </div>
                </form>

                {/* Form Actions */}
                <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="survey-form"
                        disabled={loading || !uploadedDocument || !surveyNotes.trim()}
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? 'Submitting...' : 'Submit Survey Report'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SurveySubmissionModal;