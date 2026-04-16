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
      <div className="flex h-screen bg-gray-100">
        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <SurveyorSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <SurveyorHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-auto bg-gray-100 p-3 sm:p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
};

export default SurveyorLayout;
