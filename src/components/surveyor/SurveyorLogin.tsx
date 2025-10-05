"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

const SurveyorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Use the real login API for surveyors
      const { loginEmployee } = await import("@/services/api");
      const response = await loginEmployee(email, password);
      
      if (response.data?.token && response.data?.user) {
        const { token, user } = response.data;
        
        // Check if user is a surveyor
        if (user.role !== 'surveyor') {
          setError("Access denied. This portal is for surveyors only.");
          return;
        }
        
        // Store authentication data
        localStorage.setItem("surveyorToken", token);
        localStorage.setItem("authToken", token);
        localStorage.setItem("token", token);
        localStorage.setItem("surveyorName", user.fullname || user.name || "Surveyor");
        localStorage.setItem("surveyorRole", user.role);
        localStorage.setItem("surveyorId", user._id);
        
        router.push("/surveyor/dashboard");
      } else {
        setError("Invalid response from server. Please try again.");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      
      // Handle different error types
      if (error.response?.status === 401) {
        setError("Invalid email or password.");
      } else if (error.response?.status === 403) {
        setError("Account access denied. Please contact administrator.");
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Login failed. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Image
              src="/logoblack.svg"
              alt="FCT-DCIP Logo"
              width={120}
              height={120}
              className="h-12 w-auto"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Surveyor Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access your assigned property surveys
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#028835] focus:border-[#028835] focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#028835] focus:border-[#028835] focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#028835] focus:ring-[#028835] border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-[#028835] hover:text-green-700">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#028835] hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#028835] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Need access?{" "}
              <a href="/admin/dashboard" className="font-medium text-[#028835] hover:text-green-700">
                Contact Administrator
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SurveyorLogin;
