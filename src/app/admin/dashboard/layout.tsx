"use client";
import React from "react";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { NotificationProvider } from "@/context/NotificationContext";
import { useResponsiveSidebar } from "@/hooks/useResponsiveSidebar";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { isMobile, sidebarOpen, setSidebarOpen, toggleSidebar } = useResponsiveSidebar();

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

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={toggleSidebar} />

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}
