'use client'
import React, { useState } from 'react'
import Input from '../Input';
import Button from '../Button';
import axios from 'axios';
import { useRouter } from 'next/navigation';

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

    setLoading(true);
    setError("");

    const email = localStorage.getItem("resetEmail");
    const otp = localStorage.getItem("enteredOTP");

    if (!email || !otp) {
      setError(
        "Missing reset information. Please try again from the beginning."
      );
      setLoading(false);
      return;
    }

    try {
      await axios.patch(
        "https://fct-dcip-backend-1.onrender.com/api/v1/auth/employee-reset-password",
        {
          newpassword,
        },
        {
          headers: {
            apiKey:
              "4a8612b0162373aff93c2088780b42e77d06b22b9906a58f5940054b192695134262a4c481b9713426922f29b7bd44ea64dcc6e13a3d22d0f7d05044e9ca626c",
          },
        }
      );

      // Clear stored reset information
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("enteredOTP");

      router.push("/admin/registration-success");
    } catch (err) {
      setError("Failed to reset password. Please try again."+ err);
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
          <Button title="Submit" onClick={() => {}} isDisabled={loading} />
        </div>
      </form>
    </div>
  );
};

export default NewPassword
