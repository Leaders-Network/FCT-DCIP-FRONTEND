'use client'
import AuthLayout from '@/components/admin/AuthLayout'
import OTPAuthentication from '@/components/admin/OTPAuthentication'
import Image from 'next/image';
import React, { useState } from 'react'

const page = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showOTP, setShowOTP] = useState(false);

  const handleLogin = () => {
    // Simulating successful login
    setShowOTP(true);
  };

  const handleOTPVerify = (otp: string) => {
    // Simulating OTP verification
    console.log("OTP verified:", otp);
    setIsLoggedIn(true);
    setShowOTP(false);
  };

  return (
    <div
      className="items-center justify-center bg-cover bg-center min-h-screen"
      style={{ backgroundImage: "url(/abuja-bg.png)" }}
    >
      <div className="w-full px-8 flex items-center justify-start">
        <Image src="/logo.png" alt="Logo" width={180} height={180} />
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <main className="grid md:grid-cols-2 grid-cols-1 items-center justify-center md:space-x-10 p-5 md:p-0">
          <div className="text-center md:text-left">
            <h2 className="text-white text-2xl md:text-5xl max-w-xl font-bold mb-4">
              Defense Critical Infrastructure Program
            </h2>
            <h3 className="text-white text-base md:text-xl font-medium mb-8">
              Protect your Property with Confidence
            </h3>
          </div>
        <div className="w-full max-w-md">
          <OTPAuthentication onVerify={handleOTPVerify} />
          
          </div>
       </main>
      </div>
    </div>
  );
}

export default page
