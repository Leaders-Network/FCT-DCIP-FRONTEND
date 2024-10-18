'use client'
import React, { useState } from 'react'
import Button from '../Button';
import Input from '../Input';
import { useRouter } from 'next/navigation';
import axios from 'axios';

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
          const response = await axios.post('https://fct-dcip-backend-1.onrender.com/api/v1/auth/loginEmployee', {
            email,
            password: "placeholder" // We're not actually logging in, just getting a token
          }, {
            headers: {
              'apiKey': '4a8612b0162373aff93c2088780b42e77d06b22b9906a58f5940054b192695134262a4c481b9713426922f29b7bd44ea64dcc6e13a3d22d0f7d05044e9ca626c'
            }
          });

          const token = response.data.token;
          localStorage.setItem('resetToken', token);
          router.push("/admin/otp");
        } catch (err) {
          setError("Failed to initiate password reset. Please try again.");
        } finally {
          setLoading(false);
        }
      };

  return (
    <div>
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <h2 className="text-xl md:text-3xl font-bold mb-2">Reset Password</h2>
        <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6">
          We’ll send a confirmation code to this email
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

          <div className="flex items-center justify-between mb-6">
            <Button title="Send Code" onClick={() => {}} />
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword
