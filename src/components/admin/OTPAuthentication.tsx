'use client'
import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import Button from "../Button";
import axios from 'axios';
import { useRouter } from 'next/navigation';

const OTPAuthentication = () => {
  const [otp, setOtp] = useState<string[]>(Array(5).fill(""));
  const [timer, setTimer] = useState(30);
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
    const token = localStorage.getItem('resetToken');
    if (!token) {
      console.error("No reset token found. Please try again.");
      return;
    }

    try {
      await axios.post('https://fct-dcip-backend-1.onrender.com/api/v1/auth/send-reset-password-otp', {}, {
        headers: {
          'apiKey': '4a8612b0162373aff93c2088780b42e77d06b22b9906a58f5940054b192695134262a4c481b9713426922f29b7bd44ea64dcc6e13a3d22d0f7d05044e9ca626c',
          'Authorization': `Bearer ${token}`
        }
      });
    } catch {
      console.error("Failed to send OTP. Please try again.");
    }
  };

  const handleChange = useCallback((index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      setOtp((prevOtp) => {
        const newOtp = [...prevOtp];
        newOtp[index] = value;
        return newOtp;
      });

      if (value && index < 4) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOTP = otp.join("");
    localStorage.setItem('enteredOTP', enteredOTP);
    router.push("/admin/new-password");
  }, [otp, router]);

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
        <Button title="Continue" onClick={() => handleSubmit(new Event('submit') as unknown as React.FormEvent)} />
      </form>
    </div>
  );
};

export default OTPAuthentication;

