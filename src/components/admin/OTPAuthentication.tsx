'use client'
import React, { useState, useEffect, useCallback, useRef } from "react";
import Button from "../Button";
import { useRouter } from 'next/navigation';
import { resendResetPasswordOTP, verifyResetPasswordOTP } from "@/services/api";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const errorMessageFrom = (err: unknown, fallback: string): string =>
  err instanceof Error
    ? err.message
    : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

const OTPAuthentication = () => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => Math.max(prevTimer - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const focusBox = (index: number) => {
    const box = inputsRef.current[Math.max(0, Math.min(OTP_LENGTH - 1, index))];
    box?.focus();
    box?.select();
  };

  // Writes digits starting at `start`, so typing, autofill and paste share one path.
  const fillFrom = useCallback((start: number, digits: string) => {
    const clean = digits.replace(/\D/g, "").slice(0, OTP_LENGTH - start);
    if (!clean) return;
    setOtp((prev) => {
      const next = [...prev];
      clean.split("").forEach((d, i) => {
        next[start + i] = d;
      });
      return next;
    });
    focusBox(start + clean.length);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value === "") {
      setOtp((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }
    // A single box can receive several digits from SMS/email autofill.
    fillFrom(index, value.length > 1 ? value : value.slice(-1));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      e.preventDefault();
      setOtp((prev) => {
        const next = [...prev];
        next[index - 1] = "";
        return next;
      });
      focusBox(index - 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusBox(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusBox(index + 1);
    }
  };

  const handlePaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    fillFrom(index, e.clipboardData.getData("text"));
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setNotice("");

      const enteredOTP = otp.join("");
      if (enteredOTP.length !== OTP_LENGTH) {
        setError(`Enter all ${OTP_LENGTH} digits of the code.`);
        return;
      }

      const email = localStorage.getItem("resetEmail");
      if (!email) {
        setError("We could not find the email for this reset. Start the password reset again.");
        return;
      }

      setLoading(true);
      try {
        const response = await verifyResetPasswordOTP(email, enteredOTP);

        // Store the reset token from the response
        const resetToken = response.data.resetToken;
        localStorage.setItem("resetToken", resetToken);
        localStorage.setItem("enteredOTP", enteredOTP);

        // Determine the correct route based on current path
        const currentPath = window.location.pathname;
        let newPasswordRoute = '/admin/new-password';
        if (currentPath.includes('/nia-admin')) {
          newPasswordRoute = '/nia-admin/new-password';
        } else if (currentPath.includes('/underwriter')) {
          newPasswordRoute = '/underwriter/new-password';
        } else if (currentPath.includes('/surveyor')) {
          newPasswordRoute = '/surveyor/new-password';
        }
        router.push(newPasswordRoute);
      } catch (err: unknown) {
        setError(errorMessageFrom(err, "That code did not work. Check it and try again."));
      } finally {
        setLoading(false);
      }
    },
    [otp, router]
  );

  const handleResend = useCallback(async () => {
    setError("");
    setNotice("");
    const email = localStorage.getItem("resetEmail");
    if (!email) {
      setError("We could not find the email for this reset. Start the password reset again.");
      return;
    }
    setTimer(RESEND_SECONDS);
    try {
      await resendResetPasswordOTP(email);
      setNotice("A new code is on its way to your email.");
    } catch (err: unknown) {
      setError(errorMessageFrom(err, "We could not send a new code. Try again in a moment."));
    }
  }, []);

  const complete = otp.every((d) => d !== "");

  return (
    <div className="bg-white text-slate-900 rounded-lg shadow-lg p-5 sm:p-8 w-full max-w-md">
      <h2 className="text-2xl sm:text-3xl font-bold mb-2">Enter your reset code</h2>
      <p id="otp-help" className="text-slate-600 mb-6">
        We sent a {OTP_LENGTH}-digit code to your email. Enter it to choose a new password.
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <fieldset className="mb-6">
          <legend className="sr-only">Reset code</legend>
          <div className="grid grid-cols-6 gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                aria-describedby="otp-help"
                aria-invalid={error ? true : undefined}
                maxLength={OTP_LENGTH}
                className="h-12 w-full min-w-0 rounded-md border border-slate-300 bg-white text-center text-xl font-semibold text-slate-900 shadow-sm transition-colors focus-visible:border-[#028835] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#028835]/40 sm:h-14 sm:text-2xl"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={(e) => handlePaste(index, e)}
                onFocus={(e) => e.target.select()}
              />
            ))}
          </div>
        </fieldset>
        <div className="mb-6 text-sm text-slate-600" aria-live="polite">
          Didn&apos;t get it?{" "}
          {timer > 0 ? (
            <span>You can request a new code in {timer}s.</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="font-semibold text-[#028835] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#028835] rounded-sm"
            >
              Send a new code
            </button>
          )}
          {notice && <p className="mt-2 text-[#026c2a]">{notice}</p>}
        </div>
        {error && (
          <p role="alert" className="text-red-600 mb-4">
            {error}
          </p>
        )}
        <Button
          title="Continue"
          onClick={() => { }}
          isDisabled={!complete}
          isLoading={loading}
        />
      </form>
    </div>
  );
};

export default OTPAuthentication;
