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
    const { setAuthToken, clearAuthTokens } = await import("@/utils/auth");
    const { setCookie, getCookie } = await import("@/utils/cookies");

    // Clear all existing tokens first
    clearAuthTokens();

    const response = await loginEmployee(email, password);

    if (!response.data?.token || !response.data?.employee) {
      toast.error("Invalid response from server. Please try again.");
      setLoading(false);
      return;
    }

    const { token, employee } = response.data;
    const isSuperAdmin = employee.employeeRole.role === "Super-admin";

    // ❌ Block non-surveyors
    if (employee.employeeRole.role !== "Surveyor" && !isSuperAdmin) {
      setError("Access denied. This portal is for surveyors and super admins only.");
      toast.error("Access denied. This portal is for surveyors and super admins only.");
      setLoading(false);
      return;
    }

    // ✅ CLEAR ERROR ON SUCCESS
    setError("");

    // Store token
    setAuthToken(token, isSuperAdmin ? "super-admin" : "surveyor");

    const storedToken = getCookie("surveyorToken");

    const fullName = `${employee.firstname} ${employee.lastname}`;

    const organization: string =
      (response.data.organization as string) ||
      ("organization" in employee ? (employee.organization as string) : "AMMC");

    const surveyorInfo = {
      id: employee._id,
      name: fullName,
      email: employee.email,
      role: employee.employeeRole.role,
      organization: organization,
      surveyorInfo: response.data.surveyorInfo,
    };

    setCookie("surveyorInfo", JSON.stringify(surveyorInfo), {
      expires: 7,
      path: "/",
      secure: window.location.protocol === "https:",
      sameSite: "lax",
    });

    setCookie("surveyorOrganization", organization, {
      expires: 7,
      path: "/",
      secure: window.location.protocol === "https:",
      sameSite: "lax",
    });

    setCookie("surveyorName", fullName, {
      expires: 7,
      path: "/",
      secure: window.location.protocol === "https:",
      sameSite: "lax",
    });

    setCookie("surveyorId", employee._id, {
      expires: 7,
      path: "/",
      secure: window.location.protocol === "https:",
      sameSite: "lax",
    });

    localStorage.setItem("surveyorName", fullName);
    localStorage.setItem("surveyorId", employee._id);
    localStorage.setItem("surveyorOrganization", organization);
    localStorage.setItem("surveyorInfo", JSON.stringify(surveyorInfo));
    window.dispatchEvent(new Event("surveyor-name-updated"));

    toast.success(`Welcome back, ${fullName}!`);

    // Small delay to ensure cookies persist
    await new Promise((res) => setTimeout(res, 150));

    router.push("/surveyor/dashboard");
    return; // ⛔ Stop execution
  } catch (error: unknown) {

    const err = error as {
      response?: { status?: number; data?: { message?: string } };
    };

    if (err.response?.status === 401) {
      setError("Invalid email or password.");
    } else if (err.response?.status === 403) {
      setError("Account access denied. Please contact administrator.");
    } else if (err.response?.data?.message) {
      setError(err.response.data.message);
    } else {
      toast.error("Login failed. Please check your connection and try again.");
    }

    setLoading(false);
  }
};



  
  return (
    <div className="h-screen w-full grid md:grid-cols-2 overflow-hidden bg-white">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          opacity: 0;
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .delay-100 {
          animation-delay: 100ms;
        }
      `}</style>
      
      {/* Left Image Section */}
      <div className="relative hidden md:flex items-center justify-center overflow-hidden bg-black">
        <Image
          src="/bg-hero-11.jpg"
          alt="Surveyor dashboard illustration"
          fill
          className="object-cover opacity-50 scale-105 transition-transform duration-[20s] ease-out hover:scale-110"
          priority
        />
        {/* Modern multi-layer gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#028835]/90 via-black/60 to-black/90 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Glassmorphic content container */}
        <div className="relative z-10 px-12 text-white max-w-2xl animate-fade-in-up">
          <div className="backdrop-blur-md bg-white/10 p-10 rounded-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="flex items-center mb-8 gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-lg">
                <Image
                  src="/logo.svg"
                  alt="Builders-Liability-AMMC Logo"
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </div>
              <div className="text-xl font-bold tracking-wider text-green-400 uppercase">
                Builders Liability
              </div>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
              Surveyor Portal
            </h2>
            <p className="text-lg text-gray-200 leading-relaxed font-light">
              Empowering surveyors with cutting-edge tools to manage inspections, 
              update reports, and ensure safety compliance across the FCT region.
            </p>
            
            <div className="mt-10 flex gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-green-300 bg-green-900/40 px-4 py-2 rounded-full border border-green-500/30">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                Secure Access
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-blue-300 bg-blue-900/40 px-4 py-2 rounded-full border border-blue-500/30">
                Real-time Sync
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex flex-col justify-center items-center bg-white h-screen p-6 md:p-10 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2 animate-fade-in-up">
             {/* Logo for mobile */}
            <div className="md:hidden flex justify-center mb-6">
              <Image
                src="/logo.svg"
                alt="Builders-Liability-AMMC Logo"
                width={80}
                height={80}
                className="mx-auto drop-shadow-sm"
              />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h2>
            <p className="text-sm md:text-base text-gray-500">
              Sign in to access your assigned property surveys
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 animate-fade-in-up delay-100">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="surveyor@example.com"
                    className="block w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#028835]/20 focus:border-[#028835] transition-all duration-200 sm:text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter your password"
                      className="block w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#028835]/20 focus:border-[#028835] transition-all duration-200 sm:text-sm pr-12"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-xl text-sm text-red-600 flex items-start animate-fade-in-up">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-gray-700 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                    />
                    <div className="h-5 w-5 border border-gray-300 rounded peer-checked:bg-[#028835] peer-checked:border-[#028835] transition-all"></div>
                    <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <span className="ml-2.5 group-hover:text-gray-900 transition-colors">Remember me</span>
                </label>
                <a href="/surveyor/reset-password" className="font-semibold text-[#028835] hover:text-green-800 transition-colors">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading || !email || !password}
                className={`group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white transition-all duration-300 shadow-sm ${loading || !email || !password
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-[#028835] to-[#016828] hover:shadow-[0_8px_20px_rgba(2,136,53,0.3)] hover:-translate-y-0.5'
                  }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign in to Portal"
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 animate-fade-in-up delay-100">
            Need access?{" "}
            <a
              href="/contact"
              className="font-semibold text-gray-700 hover:text-[#028835] transition-colors"
            >
              Contact Administrator
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SurveyorLogin;
