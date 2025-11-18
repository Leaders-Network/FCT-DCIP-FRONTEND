"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";


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
      const { loginEmployee } = await import("@/services/api");
      const { setAuthToken } = await import("@/utils/auth");
      const { setCookie } = await import("@/utils/cookies");

      const response = await loginEmployee(email, password);

      if (response.data?.token && response.data?.employee) {
        const { token, employee } = response.data;

        if (employee.employeeRole.role !== "Surveyor") {
          toast.error("Access denied. This portal is for surveyors only.");
          return;
        }

        // Store token in cookies using the auth utility
        setAuthToken(token, 'surveyor');

        // Store surveyor information in cookies
        const fullName = `${employee.firstname} ${employee.lastname}`;
        const surveyorInfo = {
          id: employee._id,
          name: fullName,
          email: employee.email,
          role: employee.employeeRole.role,
          organization: response.data.organization || employee.organization || 'AMMC',
          surveyorInfo: response.data.surveyorInfo
        };

        setCookie('surveyorInfo', JSON.stringify(surveyorInfo), {
          expires: 7,
          path: '/',
          secure: window.location.protocol === 'https:',
          sameSite: 'lax'
        });

        setCookie('surveyorOrganization', surveyorInfo.organization, {
          expires: 7,
          path: '/',
          secure: window.location.protocol === 'https:',
          sameSite: 'lax'
        });

        toast.success(`Welcome back, ${fullName}!`);
        router.push("/surveyor/dashboard");
      } else {
        toast.error("Invalid response from server. Please try again.");
      }
    } catch (error: unknown) {
      console.error("Login failed:", error);

      // Handle different error types
      const err = error as any;
      if (err.response?.status === 401) {
        setError("Invalid email or password.");
      } else if (err.response?.status === 403) {
        setError("Account access denied. Please contact administrator.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        toast.error("Login failed. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full grid md:grid-cols-2 overflow-hidden">
      {/* Left Image Section */}
      <div className="relative hidden md:flex bg-gray-900 items-center justify-center">
        <Image
          src="/bg-hero-11.jpg"
          alt="Surveyor dashboard illustration"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/50 " />
        <div className="relative z-10 px-10 text-center text-white">
          <div className=" flex justify-center mb-2">
            <Image
              src="/logo.png"
              alt="FCT-DCIP Logo"
              width={180}
              height={180}
              className="mx-auto"
            />
          </div>
          <h2 className="text-2xl md:text-4xl font-bold mb-3 typing-text">FCT-DCIP Surveyor Portal</h2>
          <p className="text-sm md:text-[1.1rem] leading-relaxed fade-in-text mt-2">
            Empowering surveyors with tools to manage inspections, update
            reports, and ensure safety compliance across the FCT region.
          </p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex flex-col justify-center items-center bg-gray-50 h-screen p-6 md:p-10 overflow-hidden">
        <div className="max-w-md w-full space-y-6">
          {/* Logo for mobile */}
          <div className="md:hidden flex justify-center mb-2">
            <Image
              src="/logoblack.svg"
              alt="FCT-DCIP Logo"
              width={120}
              height={120}
              className="mx-auto"
            />
          </div>

          <div>
            <h2 className="text-center text-2xl md:text-3xl font-extrabold text-gray-900">
              Surveyor Portal
            </h2>
            <p className="mt-1 text-center text-sm text-gray-600">
              Sign in to access your assigned property surveys
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-4">
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Email address"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-[#028835] focus:border-[#028835] sm:text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-[#028835] focus:border-[#028835] sm:text-sm"
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
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-900">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-[#028835] border-gray-300 rounded focus:ring-[#028835]"
                />
                <span className="ml-2">Remember me</span>
              </label>
              <a href="#" className="text-[#028835] hover:text-green-700">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-all duration-200 ${loading || !email || !password
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#028835] hover:bg-green-700 hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#028835]'
                }`}
            >
              {loading ? "Signing in..." : "Sign in to Portal"}
            </button>

            <p className="text-center text-sm text-gray-600">
              Need access?{" "}
              <a
                href="/contact"
                className="font-medium text-[#028835] hover:text-green-700"
              >
                Contact Administrator
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SurveyorLogin;
