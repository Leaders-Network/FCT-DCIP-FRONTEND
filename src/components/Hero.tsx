"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShieldCheck, FileText, ArrowRight } from "lucide-react";

const Hero: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"auth" | "contact" | null>(null);
  const [currentImage, setCurrentImage] = useState(0)

  const backgroundImages = [
    "/bg-hero-1.jpg",
    "/bg-hero-4.jpg",
    "/bg-hero-5.jpg",
    "/bg-hero-6.jpg",
    "/bg-hero-7.jpg",
    "/bg-hero-8.jpg",
    "/bg-hero-9.jpg",
    "/bg-hero-11.jpg",
    "/bg-construct-2.webp",
    "/bg-construct-3.jpg",
  ]

  useEffect(() => {
    const interval = setInterval(()=> {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
    }, 6000); 
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const openModal = (type: "auth" | "contact") => {
    setModalType(type);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setModalType(null), 300); // allow transition
  };

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Prevent scroll when modal open
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isModalOpen]);

  return (
    <div className="relative h-[85vh] min-h-[600px] max-h-[800px] w-full overflow-hidden">
    
      {backgroundImages.map((src, index) => (
        <Image 
          key={index}
          src={src}
          alt={`Background ${index + 1}`}
          fill
          priority={index === 0}
          className={`object-cover transition-all duration-[2500ms] ease-in-out transform ${
            index === currentImage ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
        />
      ))}
      
      {/* Modern gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

      {/* Hero content */}
      <div className="absolute inset-0 flex items-center">
        <div data-aos="fade-up" data-aos-duration="1200" className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl relative">
            
            {/* Subtle decorative elements */}
            <div className="absolute -left-4 -top-4 w-20 h-20 bg-green-500/20 rounded-full blur-2xl"></div>
            <div className="absolute right-10 bottom-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"></div>
            
            {/* Glassmorphic content card */}
            <div className="relative z-10 rounded-[2rem] border border-white/10 bg-white/5 p-8 md:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-md">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-semibold uppercase tracking-widest text-emerald-300">FCT-DCIP Portal</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-[1.15] tracking-tight">
                Protect Your Properties <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  With Confidence
                </span>
              </h1>
              
              <p className="text-lg text-gray-300 mb-10 leading-relaxed max-w-xl font-medium">
                Comprehensive Builders Liability Insurance tailored for the FCT construction sector. Get legally compliant and secure your peace of mind today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => openModal('auth')}
                  className="group flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all duration-300 hover:-translate-y-1"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Get Insured Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={() => openModal('contact')}
                  className="group flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 font-bold py-4 rounded-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1"
                >
                  <FileText className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                  Contact Support
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Modern Glassmorphic Modals */}
      {isModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        >
          <div 
            className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/20 bg-white/95 shadow-[0_32px_120px_rgba(15,23,42,0.3)] backdrop-blur-xl animate-in zoom-in-95 duration-200"
          >
            {/* Gradient accent bar */}
            <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-[#028835] via-emerald-500 to-teal-400" />
            
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute right-4 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="px-8 pb-8 pt-6">
              {/* Auth Modal */}
              {modalType === "auth" && (
                <>
                  <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Welcome to FCT-DCIP</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Select an option below to access the Builders Liability portal.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Link
                      href="/login"
                      className="group relative flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-emerald-300 hover:shadow-md"
                    >
                      <div>
                        <p className="font-bold text-slate-900">Builder Login</p>
                        <p className="text-xs text-slate-500">Access your existing account</p>
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </Link>
                    
                    <Link
                      href="/signup"
                      className="group relative flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-emerald-300 hover:shadow-md"
                    >
                      <div>
                        <p className="font-bold text-slate-900">Builder Registration</p>
                        <p className="text-xs text-slate-500">Create a new builder profile</p>
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </Link>
                  </div>
                </>
              )}

              {/* Contact Modal */}
              {modalType === "contact" && (
                <>
                  <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                      <FileText className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Get in Touch</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Need help? Send us a message and our support team will respond shortly.
                    </p>
                  </div>

                  <form className="space-y-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Subject"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                      />
                    </div>
                    <div>
                      <textarea
                        rows={3}
                        placeholder="Your Message"
                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3 font-bold text-white shadow-md shadow-emerald-200 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      Send Message
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Hero;