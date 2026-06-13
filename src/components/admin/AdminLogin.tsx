"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Button from "../Button";
import Input from "../Input";
import { useAuth } from "@/context/useAuth";
import { toast } from "sonner";

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    toast.loading("Signing in...", { id: 'admin-login-toast' });

    try {
      await login(email, password, 'employee');

      toast.success("Login successful! 🎉", 
      { id: 'admin-login-toast' 
      });
      setIsLoading(false);
      // Navigation happens in AuthProvider, no need to call router.push here
    } catch (error) {
    setIsLoading(false);

    let errorMessage = "Login failed. Please try again.";

    if (axios.isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data.message || "Invalid credentials";
    } 
      setError(errorMessage);
      toast.error(`Login failed: ${errorMessage}`, { 
        id: 'admin-login-toast',
        description: "Please check your credentials and try again.",
        duration: 3000,
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
        Sign in
      </h2>
      <p className="text-gray-500 text-sm md:text-base mb-6">
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
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="flex items-center justify-between mb-6">
          <Button
            title="Log-in"
            onClick={() => { }}
            isLoading={isLoading}
            isDisabled={!email || !password}
          />
          <a
            href="/admin/reset-password"
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