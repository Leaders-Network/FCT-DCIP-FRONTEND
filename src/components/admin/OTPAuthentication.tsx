'use client'
import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import Button from "../Button";
import { useRouter } from 'next/navigation';
import { resendResetPasswordOTP, verifyResetPasswordOTP } from "@/services/api";

const OTPAuthentication = () => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => Math.max(prevTimer - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    sendResetPasswordOTP();
  }, []);

  const sendResetPasswordOTP = async () => {
    const email = localStorage.getItem("resetEmail");
    if (!email) {
      setError("No email found. Please try again.");
      return;
    }

    try {
      const response = await resendResetPasswordOTP(email);
      console.log("✅ OTP resent:", response.data);
    } catch (err: unknown) {
      console.log(err, "err");
      const errorMessage = err instanceof Error
        ? err.message
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to send OTP. Please try again.";
      setError(errorMessage);
    }
  };

  const handleChange = useCallback((index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      setOtp((prevOtp) => {
        const newOtp = [...prevOtp];
        newOtp[index] = value;
        return newOtp;
      });

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError("");

      const enteredOTP = otp.join("");
      const email = localStorage.getItem("resetEmail");

      if (!email) {
        setError("No email found. Please try again.");
        setLoading(false);
        return;
      }

      try {
        const response = await verifyResetPasswordOTP(email, enteredOTP);
        console.log("✅ OTP verified:", response.data);

        // Store the reset token from the response
        const resetToken = response.data.resetToken;
        localStorage.setItem("resetToken", resetToken);
        localStorage.setItem("enteredOTP", enteredOTP);

        // Determine the correct route based on current path
        const currentPath = window.location.pathname;
        let newPasswordRoute = '/admin/new-password';
        if (currentPath.includes('/nia-admin')) {
          newPasswordRoute = '/nia-admin/new-password';
        } else if (currentPath.includes('/surveyor')) {
          newPasswordRoute = '/surveyor/new-password';
        }
        router.push(newPasswordRoute);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to verify OTP. Please try again.";
        setError(errorMessage);
        console.log(err, "err");
      } finally {
        setLoading(false);
      }
    },
    [otp, router]
  );

  const handleResend = useCallback(() => {
    sendResetPasswordOTP();
    setTimer(30);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
      <h2 className="text-3xl font-bold mb-2">OTP Authentication</h2>
      <p className="text-gray-600 mb-6">
        Please enter the OTP sent to your email
      </p>
      <form onSubmit={handleSubmit}>
        <div className="flex justify-between mb-6">
          {otp.map((digit, index) => (
            <Input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              className="w-12 h-12 text-center text-2xl"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-gray-600">
            Didn&apos;t see it?
            {timer > 0 ? (
              <span>
                Send a new code in {timer.toString().padStart(2, "0")}sec
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-blue-600 hover:underline"
              >
                Resend code
              </button>
            )}
          </span>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <Button
          title="Continue"
          onClick={() => handleSubmit(new Event('submit') as unknown as React.FormEvent)}
          isDisabled={loading}
        />
      </form>
    </div>
  );
};

export default OTPAuthentication;

