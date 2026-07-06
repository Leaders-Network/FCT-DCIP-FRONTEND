"use client";
import React, { useState, useEffect } from "react";
import {
  Bell,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  UserCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearAuthTokens, decodeToken, getAuthToken } from "@/utils/auth";
import NotificationBell from "@/components/shared/NotificationBell";
import Swal from "sweetalert2";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";

interface NIAAdminHeaderProps {
  onMenuClick?: () => void;
}

interface PageContext {
  title: string;
  subtitle: string;
  icon: LucideIcon;
}

const getNIAPageContext = (pathname: string | null): PageContext => {
  if (!pathname) {
    return {
      title: "NIA Dashboard",
      subtitle: "Overview of assignments, surveyors, and policy operations.",
      icon: LayoutDashboard,
    };
  }

  if (pathname.includes("/surveyors")) {
    return {
      title: "Surveyors",
      subtitle: "Manage surveyor registrations and availability.",
      icon: Users,
    };
  }

  if (pathname.includes("/assignments")) {
    return {
      title: "Assignments",
      subtitle: "Track automated assignment workflows and status.",
      icon: ClipboardList,
    };
  }

  if (pathname.includes("/administrators")) {
    return {
      title: "Administrators",
      subtitle: "Manage NIA administrator accounts.",
      icon: UserCheck,
    };
  }

  if (pathname.includes("/notifications")) {
    return {
      title: "Notifications",
      subtitle: "Stay on top of system alerts and activity.",
      icon: Bell,
    };
  }

  if (pathname.includes("/settings")) {
    return {
      title: "Settings",
      subtitle: "Configure NIA portal preferences and options.",
      icon: Settings,
    };
  }

  return {
    title: "NIA Dashboard",
    subtitle: "Overview of assignments, surveyors, and policy operations.",
    icon: LayoutDashboard,
  };
};

const NIAAdminHeader: React.FC<NIAAdminHeaderProps> = ({ onMenuClick }) => {
  const pathname = usePathname();
  const router = useRouter();
  const pageContext = getNIAPageContext(pathname);
  const PageIcon = pageContext.icon;

  const [adminInfo, setAdminInfo] = useState<{
    fullname?: string;
    email?: string;
    organization?: string;
  } | null>(null);

  const isDarkMode =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  useEffect(() => {
    try {
      const stored = localStorage.getItem("niaAdminInfo");
      if (stored) {
        setAdminInfo(JSON.parse(stored));
      } else {
        const token = getAuthToken("nia-admin");
        const decoded = decodeToken(token ?? undefined) as { fullname?: string } | null;
        if (decoded?.fullname) {
          setAdminInfo({ fullname: decoded.fullname, email: "", organization: "NIA" });
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const adminName = adminInfo?.fullname || "NIA Admin";

  const initials = adminName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      background: isDarkMode ? "#111827" : "#ffffff",
      color: isDarkMode ? "#ffffff" : "#111827",
    });

    if (result.isConfirmed) {
      clearAuthTokens();
      localStorage.removeItem("niaAdminToken");
      localStorage.removeItem("niaAdminInfo");
      localStorage.removeItem("organization");
      router.push("/nia-admin/login");
    }
  };

  return (
    <header className="relative sticky top-3 z-20 mb-4 rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl print:hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(139,92,246,0.12),_transparent_42%)]" />
      <div className="relative flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: mobile toggle + page context */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuClick}
            aria-label="Toggle sidebar"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:text-violet-700 hover:shadow-md md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 text-white shadow-lg shadow-violet-200/60">
            <PageIcon className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-700">
                NIA workspace
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                Live
              </span>
            </div>
            <h1 className="truncate text-lg font-bold text-slate-900 sm:text-xl lg:text-2xl">
              {pageContext.title}
            </h1>
            <p className="truncate text-sm text-slate-500">{pageContext.subtitle}</p>
          </div>
        </div>

        {/* Right: notifications + user menu */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-1.5 shadow-sm backdrop-blur">
            <NotificationBell />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-600/20">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 text-sm font-bold text-white shadow-md shadow-violet-200/60 transition-transform duration-300 group-hover:scale-105">
                  {initials}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-sm font-semibold text-slate-900">
                    {adminName}
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    NIA Administrator
                  </span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 rounded-3xl border border-slate-200/80 bg-white/95 p-2 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl"
            >
              <DropdownMenuLabel className="px-3 py-2">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                  Signed in as
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  {adminName}
                </div>
                <div className="text-xs text-slate-500">
                  {adminInfo?.email || "NIA admin account"}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1 bg-slate-200" />
              <DropdownMenuItem
                onSelect={() => router.push("/nia-admin/settings")}
                className="cursor-pointer rounded-2xl px-3 py-2.5 text-sm text-slate-700 transition-colors focus:bg-violet-50 focus:text-violet-800"
              >
                <Settings className="h-4 w-4 text-slate-500" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={handleLogout}
                className="cursor-pointer rounded-2xl px-3 py-2.5 text-sm text-red-600 transition-colors focus:bg-red-50 focus:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default NIAAdminHeader;
