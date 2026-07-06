"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { NotificationProvider } from "@/context/NotificationContext";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true); // desktop keeps sidebar open
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto close sidebar on route change (mobile only)
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  return (
    <NotificationProvider>
      <div className="flex h-screen gap-3 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-cyan-50/20 p-3 sm:p-4 print:block print:h-auto print:bg-white print:p-0">
        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden print:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />

        <div className="flex-1 flex flex-col overflow-visible print:block print:overflow-visible print:bg-white">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

          <main className="flex-1 overflow-auto rounded-[2rem] border border-white/70 bg-white/60 p-3 sm:p-4 md:p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl print:overflow-visible print:rounded-none print:border-0 print:bg-white print:p-0 print:shadow-none">
            {children}
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}
