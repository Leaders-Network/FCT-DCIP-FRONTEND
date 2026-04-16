'use client'
import React, { useState } from 'react'
import Input from '../Input';
import Button from '../Button';
import { useRouter } from 'next/navigation';
import { resetPasswordWithToken } from '@/services/api';

const NewPassword = () => {
  const [newpassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newpassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newpassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");

    const email = localStorage.getItem("resetEmail");
    const resetToken = localStorage.getItem("resetToken");

    if (!email || !resetToken) {
      setError(
        "Missing reset information. Please try again from the beginning."
      );
      setLoading(false);
      return;
    }

    try {
      const response = await resetPasswordWithToken(email, resetToken, newpassword, confirmPassword);

      // Clean up localStorage
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("enteredOTP");
      localStorage.removeItem("resetToken");

      // Determine the correct route based on current path
      const currentPath = window.location.pathname;
      let successRoute = '/admin/registration-success';
      if (currentPath.includes('/nia-admin')) {
        successRoute = '/nia-admin/registration-success';
      } else if (currentPath.includes('/broker-admin')) {
        successRoute = '/broker-admin/registration-success';
      } else if (currentPath.includes('/surveyor')) {
        successRoute = '/surveyor/registration-success';
      }
      router.push(successRoute);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? err.message
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to reset password. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <h2 className="text-xl md:text-3xl font-bold mb-7">
        Enter new password
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Input
            label=""
            type="password"
            placeholder="Enter new password"
            value={newpassword}
            handleChange={setNewPassword}
            required
          />
        </div>
        <div className="mb-6">
          <Input
            label=""
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            handleChange={setConfirmPassword}
            required
          />
        </div>
        <div className="flex items-center justify-between mb-6">
          <Button title="Submit" onClick={() => { }} isDisabled={loading} />
        </div>
      </form>
    </div>
  );
};

export default NewPassword
