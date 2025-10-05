"use client";

import { MoveRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

// Component for verifying password reset OTP
export default function ResetVerify() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem("resetEmail");
    if (!email) {
      router.push("/reset");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate OTP length
    if (otp.length !== 5) {
      setError("OTP must be 5 digits");
      return;
    }

    setIsLoading(true);
    const ApiKey = process.env.NEXT_PUBLIC_API_KEY || "4a8612b0162373aff93c2088780b42e77d06b22b9906a58f5940054b192695134262a4c481b9713426922f29b7bd44ea64dcc6e13a3d22d0f7d05044e9ca626c";
    const token = localStorage.getItem("resetToken");

    if (!token) {
      setError("Session expired. Please try the reset process again.");
      setIsLoading(false);
      return;
    }

    try {
      // Step 2: Verify reset password OTP
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://fct-dcip-backend.vercel.app/api/v1";
      const response = await fetch(
        `${apiBaseUrl}/auth/verify-otp-user`,
        {
          method: "POST",
          headers: {
            apiKey: ApiKey,
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Use token for authentication
          },
          body: JSON.stringify({ otp }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // Store new token and clean up old one
      localStorage.setItem("resetVerifyToken", data.token);
      localStorage.removeItem("resetToken"); // Clean up the initial reset token
      
      router.push("/change-password");
    } catch (error) {
      console.error("OTP verification error:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-col md:flex-row h-screen bg-white">
      <div className="w-full md:w-2/3 flex flex-col p-4 md:p-8">
        <Header />
        <div className="w-full h-px bg-gray-300 mb-6"></div>
        <main className="flex flex-col justify-center flex-grow max-w-md mx-auto w-full">
          <VerifyTitle />
          <VerifyForm
            otp={otp}
            setOtp={setOtp}
            error={error}
            isLoading={isLoading}
            handleSubmit={handleSubmit}
          />
        </main>
      </div>
      <div className="hidden md:block md:w-1/3 relative">
        <Image
          width={500}
          height={900}
          className="w-full h-full object-cover"
          src="/abuja-bg.png"
          alt="Abuja background"
        />
        <div className="absolute inset-0 bg-black opacity-20" />
      </div>
    </div>
  );
}

// Reuse the same components from Verify.tsx
function Header() {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center w-full mb-8">
      <Logo />
      <div className="flex items-center gap-4 mt-4 md:mt-0">
        <Link
          href="/login"
          className="text-black text-sm md:text-[17px] font-bold leading-[27px]"
        >
          Login
        </Link>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <div className="flex items-center">
      <svg
        width="45"
        height="32"
        viewBox="0 0 45 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* SVG paths from original component */}
        {/* ... */}
      </svg>
      <h1 className="ml-4 text-black text-[23px] font-bold">FCT- DCIP</h1>
    </div>
  );
}

function VerifyTitle() {
  return (
    <div className="mb-8">
      <h2 className="text-black text-3xl md:text-4xl font-bold mb-2">Verify OTP</h2>
      <p className="text-black text-sm md:text-base font-normal">
        Enter the OTP sent to your email for password reset.
      </p>
    </div>
  );
}

function VerifyForm({ 
  otp, 
  setOtp, 
  error, 
  isLoading, 
  handleSubmit 
}: { 
  otp: string; 
  setOtp: (otp: string) => void; 
  error: string | null; 
  isLoading: boolean; 
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}) {
  return (
    <form className="w-full gap-2" onSubmit={handleSubmit}>
      <div className="mb-8 relative">
        <input
          type="text"
          id="otp"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder=" "
          maxLength={6}
          className="peer w-full h-14 px-4 pt-5 rounded-md bg-gray-100 border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <label
          htmlFor="otp"
          className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 left-4 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-5 peer-focus:left-0 peer-focus:top-0 peer-focus:px-2 peer-focus:text-green-500"
        >
          OTP
        </label>
      </div>

      {error && <p className="text-red-500 text-xs md:text-sm mb-4">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full md:w-[200px] h-[50px] bg-[#028835] rounded-full text-white text-sm md:text-base font-semibold flex items-center justify-center md:justify-evenly ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? "Verifying..." : "Verify OTP"}
        {!isLoading && (
          <span className="w-[30px] h-[30px] ml-2 md:ml-5 flex items-center justify-center bg-white rounded-full">
            <MoveRight color="#000000" size={20} />
          </span>
        )}
      </button>
    </form>
  );
} 