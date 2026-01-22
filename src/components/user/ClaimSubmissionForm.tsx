'use client';

import React, { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { Policy, FormErrors, ClaimRequest } from '@/types/claims';
import api from '@/services/api';

interface ClaimSubmissionFormProps {
    userId: string;
    onSubmitSuccess: (claim: ClaimRequest) => void;
    onCancel: () => void;
}

const ClaimSubmissionForm: React.FC<ClaimSubmissionFormProps> = ({
    userId,
    onSubmitSuccess,
    onCancel
}) => {
    const [policyNumber, setPolicyNumber] = useState('');
    const [claimReason, setClaimReason] = useState('');
    const [policyDetails, setPolicyDetails] = useState<Policy | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isValidatingPolicy, setIsValidatingPolicy] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [successMessage, setSuccessMessage] = useState('');

    const validatePolicyNumber = async (policyNum: string) => {
        if (!policyNum.trim()) {
            setPolicyDetails(null);
            return;
        }

        setIsValidatingPolicy(true);
        setErrors(prev => ({ ...prev, policyNumber: undefined }));

        try {
            const response = await api.get(
                `/builder-liability-policy/validate/${encodeURIComponent(policyNum)}?userId=${userId}`
            );

            const data = response.data;

            if (data.success && data.policy) {
                setPolicyDetails(data.policy);
                setErrors(prev => ({ ...prev, policyNumber: undefined }));
            } else {
                setPolicyDetails(null);
                setErrors(prev => ({
                    ...prev,
                    policyNumber: data.error || 'Policy number not found'
                }));
            }
        } catch (error) {
            setPolicyDetails(null);
            setErrors(prev => ({
                ...prev,
                policyNumber: 'Failed to validate policy number'
            }));
        } finally {
            setIsValidatingPolicy(false);
        }
    };

    const handlePolicyNumberChange = (value: string) => {
        setPolicyNumber(value);
        if (value.trim().length > 3) {
            validatePolicyNumber(value);
        } else {
            setPolicyDetails(null);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newFiles = Array.from(files);
        const validFiles: File[] = [];
        const fileErrors: string[] = [];

        // Validate each file
        newFiles.forEach(file => {
            const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!validTypes.includes(file.type)) {
                fileErrors.push(`${file.name}: Invalid file type`);
            } else if (file.size > maxSize) {
                fileErrors.push(`${file.name}: File size exceeds 5MB`);
            } else if (uploadedFiles.length + validFiles.length >= 5) {
                fileErrors.push('Maximum 5 files allowed');
            } else {
                validFiles.push(file);
            }
        });

        if (fileErrors.length > 0) {
            setErrors(prev => ({ ...prev, files: fileErrors.join('; ') }));
        } else {
            setErrors(prev => ({ ...prev, files: undefined }));
        }

        setUploadedFiles(prev => [...prev, ...validFiles].slice(0, 5));
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
        setErrors(prev => ({ ...prev, files: undefined }));
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!policyNumber.trim()) {
            newErrors.policyNumber = 'Policy number is required';
        } else if (!policyDetails) {
            newErrors.policyNumber = 'Please enter a valid policy number';
        }

        if (!claimReason.trim()) {
            newErrors.claimReason = 'Claim reason is required';
        } else if (claimReason.trim().length < 20) {
            newErrors.claimReason = 'Claim reason must be at least 20 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        setErrors({});

        try {
            const formData = new FormData();
            formData.append('policyNumber', policyNumber.trim());
            formData.append('claimReason', claimReason.trim());

            uploadedFiles.forEach(file => {
                formData.append('documents', file);
            });

            const response = await api.post('/claims/submit', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const data = response.data;

            if (data.success) {
                setSuccessMessage(`Claim submitted successfully! Reference: ${data.referenceNumber}`);
                setTimeout(() => {
                    onSubmitSuccess({
                        _id: data.claimId,
                        referenceNumber: data.referenceNumber,
                        policyNumber,
                        claimReason,
                        status: 'submitted',
                        submissionDate: new Date().toISOString(),
                        lastUpdated: new Date().toISOString(),
                        coverageType: policyDetails?.coverageType || '',
                        address: policyDetails?.address || '',
                        documentsCount: uploadedFiles.length
                    });
                }, 2000);
            } else {
                setErrors({ general: data.error || 'Failed to submit claim' });
            }
        } catch (error) {
            setErrors({ general: 'An error occurred while submitting the claim' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (successMessage) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-green-900 mb-2">Claim Submitted Successfully!</h3>
                    <p className="text-green-700 mb-4">{successMessage}</p>
                    <div className="space-x-4">
                        <button
                            onClick={() => onSubmitSuccess({} as ClaimRequest)}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                        >
                            View Claims
                        </button>
                        <button
                            onClick={() => {
                                setSuccessMessage('');
                                setPolicyNumber('');
                                setClaimReason('');
                                setPolicyDetails(null);
                                setUploadedFiles([]);
                            }}
                            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
                        >
                            Submit Another Claim
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit New Claim</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Policy Number */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Policy Number *
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={policyNumber}
                            onChange={(e) => handlePolicyNumberChange(e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.policyNumber ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter policy number"
                        />
                        {isValidatingPolicy && (
                            <Loader2 className="absolute right-3 top-3 w-5 h-5 text-blue-600 animate-spin" />
                        )}
                    </div>
                    {errors.policyNumber && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.policyNumber}
                        </p>
                    )}
                    {policyDetails && (
                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Policy found: {policyDetails.policyType} - {policyDetails.coverageType}
                            </p>
                        </div>
                    )}
                </div>

                {/* Claim Reason */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Claim Reason * (minimum 20 characters)
                    </label>
                    <textarea
                        value={claimReason}
                        onChange={(e) => setClaimReason(e.target.value)}
                        rows={5}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.claimReason ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="Describe the reason for your claim..."
                    />
                    <div className="flex justify-between mt-1">
                        <div>
                            {errors.claimReason && (
                                <p className="text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    {errors.claimReason}
                                </p>
                            )}
                        </div>
                        <p className="text-sm text-gray-500">{claimReason.length} characters</p>
                    </div>
                </div>

                {/* File Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Supporting Documents (Optional - Max 5 files, 5MB each)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                            Drag and drop files here, or click to browse
                        </p>
                        <p className="text-xs text-gray-500 mb-4">
                            Accepted: PDF, JPG, PNG, DOCX
                        </p>
                        <input
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.docx"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="file-upload"
                            disabled={uploadedFiles.length >= 5}
                        />
                        <label
                            htmlFor="file-upload"
                            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
                        >
                            Choose Files
                        </label>
                    </div>
                    {errors.files && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.files}
                        </p>
                    )}
                    {uploadedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {uploadedFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <Upload className="w-5 h-5 text-gray-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* General Error */}
                {errors.general && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800 flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            {errors.general}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex space-x-4">
                    <button
                        type="submit"
                        disabled={isSubmitting || !policyDetails}
                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Claim'
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ClaimSubmissionForm;
