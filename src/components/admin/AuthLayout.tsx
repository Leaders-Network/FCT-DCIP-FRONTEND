import React from "react";
import Image from "next/image";

interface AuthLayoutProps {
  children: React.ReactNode;
//   title: string;
//   subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
//   title,
//   subtitle,
}) => {
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
          src="/abuja-bg.png"
          alt="Dashboard background illustration"
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
              Administrative Portal
            </h2>
            <p className="text-lg text-gray-200 leading-relaxed font-light">
              Securely manage policies, monitor operations, and ensure safety compliance across the FCT region.
            </p>
            
            <div className="mt-10 flex gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-green-300 bg-green-900/40 px-4 py-2 rounded-full border border-green-500/30">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                Secure Connection
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-blue-300 bg-blue-900/40 px-4 py-2 rounded-full border border-blue-500/30">
                Encrypted Data
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex flex-col justify-center items-center bg-gray-50 h-screen p-6 md:p-10 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up delay-100">
          <div className="md:hidden flex flex-col items-center justify-center mb-6 space-y-4">
            <Image
              src="/logo.svg"
              alt="Builders-Liability-AMMC Logo"
              width={80}
              height={80}
              className="drop-shadow-sm"
            />
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 text-center">
              Administrative Portal
            </h2>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
