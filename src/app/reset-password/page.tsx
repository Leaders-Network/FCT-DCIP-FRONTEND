'use client';

import React, { useState } from 'react';
import { Mail, ArrowLeft, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { ErrorWithResponse } from '@/types';

const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as ErrorWithResponse;
        return apiError.response?.data?.message || apiError.response?.data?.error || 'An error occurred';
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unknown error occurred';
};

type Step = 'email' | 'otp' | 'password' | 'success';

interface ResetPasswordState {
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
    resetToken: string;
    userType: 'user' | 'employee';
}

interface ApiResponse {
    success: boolean;
    userType?: 'user' | 'employee';
    resetToken?: string;
    message?: string;
}

export default function ResetPasswordPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<Step>('email');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState<ResetPasswordState>({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: '',
        resetToken: '',
        userType: 'user'
    });

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await api.post<ApiResponse>('/reset-password/send-otp', {
                email: formData.email
            });

            if (response.data.success) {
                setFormData(prev => ({ ...prev, userType: response.data.userType || 'user' }));
                setSuccess('OTP sent to your email successfully!');
                setCurrentStep('otp');
            }
        } catch (error: unknown) {
            setError(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await api.post<ApiResponse>('/reset-password/verify-otp', {
                email: formData.email,
                otp: formData.otp
            });

            if (response.data.success) {
                setFormData(prev => ({ ...prev, resetToken: response.data.resetToken || '' }));
                setSuccess('OTP verified successfully!');
                setCurrentStep('password');
            }
        } catch (error: unknown) {
            setError(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post<ApiResponse>('/reset-password/reset', {
                email: formData.email,
                resetToken: formData.resetToken,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword
            });

            if (response.data.success) {
                setCurrentStep('success');
            }
        } catch (error: unknown) {
            setError(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.post<ApiResponse>('/reset-password/resend-otp', {
                email: formData.email
            });

            if (response.data.success) {
                setSuccess('New OTP sent to your email!');
            }
        } catch (error: unknown) {
            setError(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const renderEmailStep = () => (
        <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
                <p className="text-gray-600">Enter your email address to receive a reset code</p>
            </div>

            <form onSubmit={handleSendOTP} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter your email address"
                        />
                    </div>
                </div>

                {error && (
                    <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        <p className="text-green-700">{success}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !formData.email}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Sending...' : 'Send Reset Code'}
                </button>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={() => router.push('/login')}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                        Back to Login
                    </button>
                </div>
            </form>
        </div>
    );

    const renderOTPStep = () => (
        <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Code</h1>
                <p className="text-gray-600">
                    Enter the 6-digit code sent to <span className="font-medium">{formData.email}</span>
                </p>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Verification Code
                    </label>
                    <input
                        type="text"
                        required
                        maxLength={6}
                        value={formData.otp}
                        onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '') }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center text-2xl tracking-widest"
                        placeholder="000000"
                    />
                </div>

                {error && (
                    <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        <p className="text-green-700">{success}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || formData.otp.length !== 6}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Verifying...' : 'Verify Code'}
                </button>

                <div className="text-center space-y-2">
                    <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={loading}
                        className="text-green-600 hover:text-green-700 text-sm font-medium disabled:opacity-50"
                    >
                        Resend Code
                    </button>
                    <br />
                    <button
                        type="button"
                        onClick={() => setCurrentStep('email')}
                        className="text-gray-600 hover:text-gray-700 text-sm"
                    >
                        <ArrowLeft className="inline h-4 w-4 mr-1" />
                        Back to Email
                    </button>
                </div>
            </form>
        </div>
    );

    const renderPasswordStep = () => (
        <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">New Password</h1>
                <p className="text-gray-600">Create a strong password for your account</p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={formData.newPassword}
                            onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter new password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Confirm new password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {formData.newPassword && formData.newPassword.length < 6 && (
                    <p className="text-sm text-red-600">Password must be at least 6 characters long</p>
                )}

                {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                    <p className="text-sm text-red-600">Passwords do not match</p>
                )}

                {error && (
                    <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Resetting...' : 'Reset Password'}
                </button>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={() => setCurrentStep('otp')}
                        className="text-gray-600 hover:text-gray-700 text-sm"
                    >
                        <ArrowLeft className="inline h-4 w-4 mr-1" />
                        Back to Verification
                    </button>
                </div>
            </form>
        </div>
    );

    const renderSuccessStep = () => (
        <div className="max-w-md mx-auto text-center">
            <div className="mb-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Password Reset Successful</h1>
                <p className="text-gray-600">
                    Your password has been successfully reset. You can now log in with your new password.
                </p>
            </div>

            <button
                onClick={() => router.push('/login')}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
                Continue to Login
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                {currentStep === 'email' && renderEmailStep()}
                {currentStep === 'otp' && renderOTPStep()}
                {currentStep === 'password' && renderPasswordStep()}
                {currentStep === 'success' && renderSuccessStep()}
            </div>
        </div>
    );
}