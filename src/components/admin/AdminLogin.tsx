"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Button from "../Button";
import Input from "../Input";
// import { useAuth } from "@/context/AuthProvider";

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  // const { user, isAuthenticated } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // if (!isAuthenticated) {
    //   setError("You must be logged in to perform this action.");
    //   return;
    // }

    try {
      const response = await axios.post(
        "https://fct-dcip-backend-1.onrender.com/api/v1/auth/loginEmployee",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
            apiKey: "4a8612b0162373aff93c2088780b42e77d06b22b9906a58f5940054b192695134262a4c481b9713426922f29b7bd44ea64dcc6e13a3d22d0f7d05044e9ca626c",
          },
        }
      );

      if (response.data && response.data.token) {
        localStorage.setItem("authToken", response.data.token);
        router.push("/admin/dashboard");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(`Login failed: ${error.response.data.message}`);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
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
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="flex items-center justify-between mb-6">
          <Button 
            title="Log-in" 
            onClick={() => {}} 
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
