"use client";
import React, { useState } from "react";
import Button from "../Button";
import Input from "../Input";

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    //log out details 
    console.log("Login attempted with:", email, password);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <h2 className="text-xl md:text-3xl font-bold mb-2">
        Administrative login
      </h2>
      <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6">
        Welcome! Please enter your details
      </p>
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
          <Button title="Log-in" onClick={() => {}} />
          <a
            href="#"
            className="text-sm md:text-base text-gray-600 hover:underline"
          >
            Reset your password?
          </a>
        </div>
      </form>
    </div>
  );
};

export default AdminLogin;
