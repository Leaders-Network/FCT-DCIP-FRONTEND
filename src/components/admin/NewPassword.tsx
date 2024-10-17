'use client'
import React, { useState } from 'react'
import Input from '../Input';
import Button from '../Button';

const NewPassword = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempted with:", email, password);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <h2 className="text-xl md:text-3xl font-bold mb-7">
        Enter new password
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Input
            label=""
            type="email"
            placeholder="Enter your email Address"
            value={email}
            handleChange={setEmail}
            required
          />
        </div>
        <div className="mb-6">
          <Input
            label=""
            type="password"
            placeholder="Enter your password"
            value={password}
            handleChange={setPassword}
            required
          />
        </div>
        <div className="flex items-center justify-between mb-6">
          <Button title="Submit" onClick={() => {}} />
          
        </div>
      </form>
    </div>
  );
};

export default NewPassword
