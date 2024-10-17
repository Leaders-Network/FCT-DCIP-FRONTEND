import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import Button from "../Button";

interface OTPAuthenticationProps {
  onVerify: (otp: string) => void;
}

const OTPAuthentication: React.FC<OTPAuthenticationProps> = ({ onVerify }) => {
  const [otp, setOtp] = useState<string[]>(Array(5).fill(""));
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => Math.max(prevTimer - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onVerify(otp.join(""));
  }, [otp, onVerify]);

  const handleResend = useCallback(() => {
    // Implement resend logic here
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
            Didn't see it?
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