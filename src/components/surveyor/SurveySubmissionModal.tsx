import React, { useState } from 'react';
import { X, Upload, Save, FileText, Camera, Phone, Mail, MessageSquare } from 'lucide-react';
import { SurveySubmissionData, Assignment, PolicyRequest } from '@/types/api.types';

interface SurveySubmissionModalProps {
    policy: PolicyRequest;
    assignment: Assignment;
    isOpen: boolean;
    onSubmit: (submission: SurveySubmissionData) => Promise<void>;
    onClose: () => void;
}

const SurveySubmissionModal: React.FC<SurveySubmissionModalProps> = ({
    policy,
    assignment,
    isOpen,
    onSubmit,
    onClose
}) => {
    const [formData, setFormData] = useState<SurveySubmissionData>({
        surveyNotes: '',
        recommendedAction: 'approve',
        contactLog: [],
        surveyDetails: {
            propertyCondition: '',
            structuralAssessment: '',
            riskFactors: '',
            recommendations: '',
            estimatedValue: 0,
            photos: []
        }
    });

    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'contact' | 'photos'>('details');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            await onSubmit(formData);
        } catch (error) {
            console.error('Error submitting survey:', error);
            alert('Failed to submit survey. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const addContactLogEntry = () => {
        const newEntry = {
            date: new Date().toISOString().split('T')[0],
            method: 'phone' as const,
            notes: '',
            successful: true
        };

        setFormData(prev => ({
            ...prev,
            contactLog: [...prev.contactLog, newEntry]
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-[#028835] text-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">Submit Survey Report</h2>
                            <p className="text-green-100 mt-1">
                                {policy.propertyDetails.propertyType} - {policy.propertyDetails.address}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-green-100 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'details'
                                    ? 'border-[#028835] text-[#028835]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <FileText className="w-4 h-4 inline mr-2" />
                            Survey Details
                        </button>
                        <button
                            onClick={() => setActiveTab('contact')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'contact'
                                    ? 'border-[#028835] text-[#028835]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Phone className="w-4 h-4 inline mr-2" />
                            Contact Log
                        </button>
                        <button
                            onClick={() => setActiveTab('photos')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'photos'
                                    ? 'border-[#028835] text-[#028835]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Camera className="w-4 h-4 inline mr-2" />
                            Photos & Documents
                        </button>
                    </nav>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {activeTab === 'details' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Property Condition Assessment *
                                </label>
                                <textarea
                                    value={formData.surveyDetails.propertyCondition}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        surveyDetails: { ...prev.surveyDetails, propertyCondition: e.target.value }
                                    }))}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
                                    placeholder="Describe the overall condition of the property..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Structural Assessment *
                                </label>
                                <textarea
                                    value={formData.surveyDetails.structuralAssessment}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        surveyDetails: { ...prev.surveyDetails, structuralAssessment: e.target.value }
                                    }))}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
                                    placeholder="Assess the structural integrity of the building..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Risk Factors *
                                </label>
                                <textarea
                                    value={formData.surveyDetails.riskFactors}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        surveyDetails: { ...prev.surveyDetails, riskFactors: e.target.value }
                                    }))}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
                                    placeholder="Identify any risk factors or potential hazards..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Recommendations *
                                </label>
                                <textarea
                                    value={formData.surveyDetails.recommendations}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        surveyDetails: { ...prev.surveyDetails, recommendations: e.target.value }
                                    }))}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
                                    placeholder="Provide your professional recommendations..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Estimated Property Value (₦)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.surveyDetails.estimatedValue || ''}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            surveyDetails: { ...prev.surveyDetails, estimatedValue: parseInt(e.target.value) || 0 }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Final Recommendation *
                                    </label>
                                    <select
                                        value={formData.recommendedAction}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            recommendedAction: e.target.value as 'approve' | 'reject' | 'request_more_info'
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
                                        required
                                    >
                                        <option value="approve">Approve Policy</option>
                                        <option value="reject">Reject Policy</option>
                                        <option value="request_more_info">Request More Information</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Survey Notes
                                </label>
                                <textarea
                                    value={formData.surveyNotes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, surveyNotes: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
                                    placeholder="Any additional notes or observations..."
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'contact' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Contact Log</h3>
                                <button
                                    type="button"
                                    onClick={addContactLogEntry}
                                    className="px-4 py-2 bg-[#028835] text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Add Contact Entry
                                </button>
                            </div>

                            {formData.contactLog.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                    <p>No contact entries yet. Add your first contact log entry.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {formData.contactLog.map((entry, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Date
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={entry.date}
                                                        onChange={(e) => {
                                                            const updatedLog = [...formData.contactLog];
                                                            updatedLog[index] = { ...entry, date: e.target.value };
                                                            setFormData(prev => ({ ...prev, contactLog: updatedLog }));
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Method
                                                    </label>
                                                    <select
                                                        value={entry.method}
                                                        onChange={(e) => {
                                                            const updatedLog = [...formData.contactLog];
                                                            updatedLog[index] = { ...entry, method: e.target.value as 'phone' | 'email' | 'sms' | 'visit' };
                                                            setFormData(prev => ({ ...prev, contactLog: updatedLog }));
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
                                                    >
                                                        <option value="phone">Phone Call</option>
                                                        <option value="email">Email</option>
                                                        <option value="sms">SMS</option>
                                                        <option value="visit">Site Visit</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Successful
                                                    </label>
                                                    <select
                                                        value={entry.successful ? 'yes' : 'no'}
                                                        onChange={(e) => {
                                                            const updatedLog = [...formData.contactLog];
                                                            updatedLog[index] = { ...entry, successful: e.target.value === 'yes' };
                                                            setFormData(prev => ({ ...prev, contactLog: updatedLog }));
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
                                                    >
                                                        <option value="yes">Yes</option>
                                                        <option value="no">No</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Notes
                                                </label>
                                                <textarea
                                                    value={entry.notes}
                                                    onChange={(e) => {
                                                        const updatedLog = [...formData.contactLog];
                                                        updatedLog[index] = { ...entry, notes: e.target.value };
                                                        setFormData(prev => ({ ...prev, contactLog: updatedLog }));
                                                    }}
                                                    rows={2}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
                                                    placeholder="Contact notes..."
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'photos' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Survey Documentation</h3>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                    <p className="text-gray-600 mb-2">Upload survey photos and documents</p>
                                    <p className="text-sm text-gray-500">Drag and drop files here, or click to select</p>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*,.pdf,.doc,.docx"
                                        className="hidden"
                                        onChange={(e) => {
                                            // Handle file upload
                                            console.log('Files selected:', e.target.files);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-[#028835] text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Submitting...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>Submit Survey</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SurveySubmissionModal;