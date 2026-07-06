"use client";
import React, { useState, useEffect } from "react";
import {
  Bell,
  Building2,
  CheckCircle,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { brokerAdminAPI } from "@/services/api";
import { removeAuthToken } from "@/utils/auth";
import NotificationBell from "@/components/shared/NotificationBell";
import Swal from "sweetalert2";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";

interface BrokerHeaderProps {
  onMenuClick?: () => void;
}

interface PageContext {
  title: string;
  subtitle: string;
  icon: LucideIcon;
}

const getBrokerPageContext = (pathname: string | null): PageContext => {
  if (!pathname) {
    return {
      title: "Broker Dashboard",
      subtitle: "Manage insurance claims and track completed policies.",
      icon: LayoutDashboard,
    };
  }

  if (pathname.includes("/claims")) {
    return {
      title: "Claims",
      subtitle: "Review and update claim submissions and status.",
      icon: FileText,
    };
  }

  if (pathname.includes("/administrators")) {
    return {
      title: "Administrators",
      subtitle: "Manage broker admin accounts and access.",
      icon: Users,
    };
  }

  if (pathname.includes("/notifications")) {
    return {
      title: "Notifications",
      subtitle: "Stay on top of alerts and system updates.",
      icon: Bell,
    };
  }

  if (pathname.includes("/settings")) {
    return {
      title: "Settings",
      subtitle: "Configure broker portal preferences.",
      icon: Settings,
    };
  }

  return {
    title: "Broker Dashboard",
    subtitle: "Manage insurance claims and track completed policies.",
    icon: LayoutDashboard,
  };
};

const BrokerHeader: React.FC<BrokerHeaderProps> = ({ onMenuClick }) => {
  const pathname = usePathname();
  const router = useRouter();
  const pageContext = getBrokerPageContext(pathname);
  const PageIcon = pageContext.icon;

  const [adminInfo, setAdminInfo] = useState<{
    fullname?: string;
    email?: string;
    firstname?: string;
    lastname?: string;
    brokerFirmName?: string;
  } | null>(null);

  const isDarkMode =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  useEffect(() => {
    try {
      const stored = localStorage.getItem("brokerAdminInfo");
      if (stored) {
        setAdminInfo(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const adminName =
    adminInfo?.fullname ||
    [adminInfo?.firstname, adminInfo?.lastname].filter(Boolean).join(" ").trim() ||
    "Broker Admin";

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
      try {
        await brokerAdminAPI.logout();
      } catch {
        // ignore
      } finally {
        removeAuthToken("broker-admin");
        localStorage.removeItem("brokerAdminInfo");
        router.push("/broker-admin/login");
      }
    }
  };

  return (
    <header className="relative sticky top-3 z-20 mb-4 rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl print:hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_42%)]" />
      <div className="relative flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: mobile toggle + page context */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuClick}
            aria-label="Toggle sidebar"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 hover:shadow-md md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-200/60">
            <PageIcon className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-blue-700">
                Broker workspace
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
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
          {adminInfo?.brokerFirmName && (
            <div className="hidden xl:flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-left shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Firm
                </p>
                <p className="text-sm text-slate-600 font-medium truncate max-w-[140px]">
                  {adminInfo.brokerFirmName}
                </p>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-1.5 shadow-sm backdrop-blur">
            <NotificationBell />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600/20">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-sm font-bold text-white shadow-md shadow-blue-200/60 transition-transform duration-300 group-hover:scale-105">
                  {initials}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-sm font-semibold text-slate-900">
                    {adminName}
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    Broker admin
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
                  {adminInfo?.email || "Broker admin account"}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1 bg-slate-200" />
              <DropdownMenuItem
                onSelect={() => router.push("/broker-admin/settings")}
                className="cursor-pointer rounded-2xl px-3 py-2.5 text-sm text-slate-700 transition-colors focus:bg-blue-50 focus:text-blue-800"
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

export default BrokerHeader;
