"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import SurveyorSidebar from "@/components/surveyor/SurveyorSidebar";
import SurveyorHeader from "@/components/surveyor/SurveyorHeader";
import { NotificationProvider } from "@/context/NotificationContext";

interface SurveyorLayoutProps {
  children: React.ReactNode;
}

const SurveyorLayout: React.FC<SurveyorLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive sidebar
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on route change (mobile only)
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  return (
    <NotificationProvider>
      <div className="flex h-screen min-w-0 gap-0 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-cyan-50/20 p-0 sm:gap-3 sm:p-4 print:block print:h-auto print:bg-white print:p-0">
        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden print:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <SurveyorSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-visible print:block print:overflow-visible print:bg-white">
          <SurveyorHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="min-w-0 flex-1 overflow-auto rounded-none border border-white/70 bg-white/55 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:rounded-[2rem] sm:p-4 md:p-6 print:overflow-visible print:bg-white print:p-0 print:shadow-none print:border-0">
            {children}
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
};

export default SurveyorLayout;
