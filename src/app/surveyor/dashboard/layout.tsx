"use client";
import React from "react";
import SurveyorSidebar from "@/components/surveyor/SurveyorSidebar";
import SurveyorHeader from "@/components/surveyor/SurveyorHeader";
import { useResponsiveSidebar } from "@/hooks/useResponsiveSidebar";

interface SurveyorLayoutProps {
  children: React.ReactNode;
}

const SurveyorLayout: React.FC<SurveyorLayoutProps> = ({ children }) => {
  const { isMobile, sidebarOpen, setSidebarOpen, toggleSidebar } = useResponsiveSidebar();

  return (
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
        <SurveyorHeader onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-auto bg-gray-100 p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SurveyorLayout;
