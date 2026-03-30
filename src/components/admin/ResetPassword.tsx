'use client'
import React, { useState } from 'react'
import Button from '../Button';
import Input from '../Input';
import { useRouter } from 'next/navigation';
import { sendResetPasswordOTP } from '@/services/api';

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await sendResetPasswordOTP(email);
      console.log("✅ Reset password OTP sent:", response.data);
      localStorage.setItem("resetEmail", email);

      // Determine the correct route based on current path
      const currentPath = window.location.pathname;
      let otpRoute = '/admin/otp';
      if (currentPath.includes('/nia-admin')) {
        otpRoute = '/nia-admin/otp';
      } else if (currentPath.includes('/broker-admin')) {
        otpRoute = '/broker-admin/otp';
      } else if (currentPath.includes('/surveyor')) {
        otpRoute = '/surveyor/otp';
      }
      router.push(otpRoute);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to initiate password reset. Please try again.";
      setError(errorMessage);
      console.error("Password reset error:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <h2 className="text-xl md:text-3xl font-bold mb-2">Reset Password</h2>
        <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6">
          We&apos;ll send a confirmation code to this email
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <Input
              label=""
              type="email"
              placeholder="Enter your email Address"
              value={email}
              handleChange={setEmail}
              required
            />
          </div>

          {error && (
            <div className="mb-4 text-red-500 text-sm">{error}</div>
          )}

          <div className="flex items-center justify-between mb-6">
            <Button
              title={loading ? "Sending..." : "Send Code"}
              onClick={() => { }}
              isDisabled={loading}
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword

