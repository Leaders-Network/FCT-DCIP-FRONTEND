'use client'
import React, { useState } from 'react'
import Button from '../Button';
import Input from '../Input';

const ResetPassword = () => {
      const [email, setEmail] = useState("");
      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle login logic here
        console.log("Login attempted with:", email,);
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
              onChange={setEmail}
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
