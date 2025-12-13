'use client';

import React, { useState, useEffect } from 'react';
import { MoveRight, ArrowLeft, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

type Step = 'email' | 'otp' | 'password' | 'success';
type UserType = 'user' | 'employee';

interface ResetPasswordState {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
  resetToken: string;
  userType: UserType;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  resetToken?: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

/**
 * ResetPassword Component
 * 
 * A multi-step password reset component that handles:
 * 1. Email verification
 * 2. OTP verification  
 * 3. New password creation
 * 4. Success confirmation
 * 
 * Features:
 * - Type-safe form handling
 * - Multi-step wizard interface
 * - Real-time validation
 * - Responsive design
 * - Background image carousel
 */
export function ResetPassword(): JSX.Element {
  const router = useRouter();

  // Constants
  const OTP_LENGTH = 6;
  const MIN_PASSWORD_LENGTH = 8;

  // State management
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [formData, setFormData] = useState<ResetPasswordState>({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
    resetToken: '',
    userType: 'user'
  });

  const handleInputChange = (field: keyof ResetPasswordState, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= MIN_PASSWORD_LENGTH;
  };

  /**
   * Validates OTP format (6 digits)
   */
  const validateOtp = (otp: string): boolean => {
    const otpRegex = new RegExp(`^\\d{${OTP_LENGTH}}$`);
    return otpRegex.test(otp);
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post<ApiResponse>('/auth/forgot-password', {
        email: formData.email,
        userType: formData.userType
      });

      if (response.data.success) {
        setSuccess('OTP sent to your email address');
        setCurrentStep('otp');
      } else {
        setError(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validateOtp(formData.otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post<ApiResponse>('/auth/verify-reset-otp', {
        email: formData.email,
        otp: formData.otp,
        userType: formData.userType
      });

      if (response.data.success) {
        setFormData(prev => ({ ...prev, resetToken: response.data.resetToken || '' }));
        setSuccess('OTP verified successfully');
        setCurrentStep('password');
      } else {
        setError(response.data.message || 'Invalid OTP');
      }
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validatePassword(formData.newPassword)) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post<ApiResponse>('/auth/reset-password', {
        resetToken: formData.resetToken,
        newPassword: formData.newPassword,
        userType: formData.userType
      });

      if (response.data.success) {
        setSuccess('Password reset successfully');
        setCurrentStep('success');
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = (): JSX.Element => (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-black text-3xl md:text-4xl font-bold mb-3">
          Reset Password
        </h2>
        <p className="text-sm md:text-lg text-gray-600 leading-relaxed">
          Enter your email address and we will send you an OTP to reset your password.
        </p>
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email address"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Type
          </label>
          <select
            value={formData.userType}
            onChange={(e) => handleInputChange('userType', e.target.value as 'user' | 'employee')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="user">User Account</option>
            <option value="employee">Employee Account</option>
          </select>
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-2 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              Send OTP
              <MoveRight className="ml-2 w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login" className="text-green-600 hover:underline text-sm">
          Back to Login
        </Link>
      </div>
    </div>
  );

  const renderOtpStep = (): JSX.Element => (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-black text-3xl md:text-4xl font-bold mb-3">
          Verify OTP
        </h2>
        <p className="text-sm md:text-lg text-gray-600 leading-relaxed">
          Enter the 6-digit OTP sent to {formData.email}
        </p>
      </div>

      <form onSubmit={handleOtpSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            OTP Code
          </label>
          <input
            type="text"
            value={formData.otp}
            onChange={(e) => handleInputChange('otp', e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
            placeholder="000000"
            maxLength={OTP_LENGTH}
            required
          />
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-2 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              Verify OTP
              <MoveRight className="ml-2 w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center space-x-4">
        <button
          onClick={() => setCurrentStep('email')}
          className="text-gray-600 hover:underline text-sm"
        >
          <ArrowLeft className="inline w-4 h-4 mr-1" />
          Back
        </button>
        <button
          onClick={() => handleEmailSubmit({ preventDefault: () => { } } as React.FormEvent<HTMLFormElement>)}
          className="text-green-600 hover:underline text-sm"
        >
          Resend OTP
        </button>
      </div>
    </div>
  );

  const renderPasswordStep = (): JSX.Element => (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-black text-3xl md:text-4xl font-bold mb-3">
          Create New Password
        </h2>
        <p className="text-sm md:text-lg text-gray-600 leading-relaxed">
          Your account is secure. We will guide you through the process step by step.
        </p>
      </div>

      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-2 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p>Password must be at least {MIN_PASSWORD_LENGTH} characters long</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              Reset Password
              <MoveRight className="ml-2 w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setCurrentStep('otp')}
          className="text-gray-600 hover:underline text-sm"
        >
          <ArrowLeft className="inline w-4 h-4 mr-1" />
          Back
        </button>
      </div>
    </div>
  );

  const renderSuccessStep = (): JSX.Element => (
    <div className="w-full text-center">
      <div className="mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-black text-3xl md:text-4xl font-bold mb-3">
          Password Reset Successfully
        </h2>
        <p className="text-sm md:text-lg text-gray-600 leading-relaxed">
          Your password has been reset successfully. You can now login with your new password.
        </p>
      </div>

      <div className="space-y-4">
        <Link
          href="/login"
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
        >
          Continue to Login
          <MoveRight className="ml-2 w-5 h-5" />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {currentStep === 'email' && renderEmailStep()}
          {currentStep === 'otp' && renderOtpStep()}
          {currentStep === 'password' && renderPasswordStep()}
          {currentStep === 'success' && renderSuccessStep()}
        </div>
      </div>

      {/* Right side - Background Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/90 to-blue-600/90 z-10"></div>
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: `url('/bg-construct-2.webp')`,
            opacity: 1
          }}
        ></div>
        <div className="absolute inset-0 z-20 flex items-center justify-center p-8">
          <div className="text-white text-center">
            <h1 className="text-4xl font-bold mb-4">
              Secure Password Reset
            </h1>
            <p className="text-xl opacity-90">
              Reset your password securely with our step-by-step process
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}