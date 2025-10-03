"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import AuthLayout from "@/components/surveyor/SurveyorLayout"; // <-- import layout

const SurveyorLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // TODO: Replace with real API call
      if (email && password) {
        localStorage.setItem("surveyorToken", "mock_token");
        localStorage.setItem("surveyorName", "John Surveyor");
        localStorage.setItem("surveyorRole", "surveyor");
        router.push("/surveyor/dashboard");
      } else {
        setError("Please enter both email and password");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full bg-white rounded-xl shadow-lg p-6 space-y-6">
        {/* Logo + Heading */}
        <div className="text-center">
          <Image
            src="/logoblack.svg"
            alt="FCT-DCIP Logo"
            width={80}
            height={80}
            className="mx-auto"
          />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Surveyor Login
          </h2>
          <p className="mt-1 text-gray-600 text-sm">
            Sign in to access your assigned property surveys
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                className="h-4 w-4 text-green-600 border-gray-300 rounded"
              />
              <span className="ml-2">Remember me</span>
            </label>
            <a
              href="/surveyor/reset-password"
              className="text-sm text-green-600 hover:underline"
            >
              Reset password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <a
            href="/surveyor/signup"
            className="font-medium text-green-600 hover:underline"
          >
            Sign up
          </a>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SurveyorLogin;
