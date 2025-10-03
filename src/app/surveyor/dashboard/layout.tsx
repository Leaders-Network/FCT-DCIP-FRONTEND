"use client";
import React from "react";
import SurveyorSidebar from "@/components/surveyor/SurveyorSidebar";
import SurveyorHeader from "@/components/surveyor/SurveyorHeader";

interface SurveyorLayoutProps {
  children: React.ReactNode;
}

const SurveyorLayout: React.FC<SurveyorLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <SurveyorSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <SurveyorHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SurveyorLayout;