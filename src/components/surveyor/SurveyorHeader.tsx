"use client";
import React, { useEffect, useState } from "react";
import {
  Bell,
  Calculator,
  ClipboardList,
  FileSearch,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearAuthTokens } from "@/utils/auth"
import { getCookie } from "@/utils/cookies";
import { getSurveyorProfile } from "@/services/api";
import Swal from "sweetalert2";
import { usePathname, useRouter } from "next/navigation";
import NotificationBell from "@/components/shared/NotificationBell";
import type { LucideIcon } from "lucide-react";

interface SurveyorHeaderProps {
  onMenuClick?: () => void;
}

interface PageContext {
  title: string;
  subtitle: string;
  icon: LucideIcon;
}

const getSurveyorPageContext = (pathname: string | null): PageContext => {
  if (!pathname) {
    return {
      title: "Surveyor Portal",
      subtitle: "Manage assignments, reports, and premium work in one place.",
      icon: Sparkles,
    };
  }

  if (pathname.includes("/survey-assessment-report")) {
    return {
      title: "Survey Assessment Report",
      subtitle: "Record findings, notes, and recommendations before submission.",
      icon: FileSearch,
    };
  }

  if (pathname.includes("/assignments/")) {
    return {
      title: "Assignment Details",
      subtitle: "Review the job context, status, and project information.",
      icon: ClipboardList,
    };
  }

  if (pathname.endsWith("/premium-calculator")) {
    return {
      title: "Premium Calculator",
      subtitle: "Estimate risk loading and premium from the survey data.",
      icon: Calculator,
    };
  }

  if (pathname.endsWith("/assignments")) {
    return {
      title: "Assignments",
      subtitle: "Track active survey jobs and progress at a glance.",
      icon: ClipboardList,
    };
  }

  if (pathname.endsWith("/notifications")) {
    return {
      title: "Notifications",
      subtitle: "Stay on top of alerts, updates, and new activity.",
      icon: Bell,
    };
  }

  if (pathname.endsWith("/settings")) {
    return {
      title: "Settings",
      subtitle: "Update your profile and portal preferences.",
      icon: Settings,
    };
  }

  return {
    title: "Surveyor Dashboard",
    subtitle: "Keep assignments, reports, and premium tasks organized.",
    icon: LayoutDashboard,
  };
};

const SurveyorHeader: React.FC<SurveyorHeaderProps> = ({ onMenuClick }) => {
  const [surveyorName, setSurveyorName] = useState("Surveyor");
  const pathname = usePathname();
  const pageContext = getSurveyorPageContext(pathname);
  const initials = surveyorName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  const PageIcon = pageContext.icon;
  const router = useRouter();
  const isDarkMode = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  useEffect(() => {
    const safeName = (value?: string) => {
      const name = (value || "").trim().replace(/\s+/g, " ");
      if (!name || name.toLowerCase() === "surveyor") return null;
      return name;
    };

    const applyName = (value?: string) => {
      const name = safeName(value);
      if (name) {
        setSurveyorName(name);
        localStorage.setItem("surveyorName", name);
        return true;
      }
      return false;
    };

    const hydrateName = async () => {
      const fromStorage = localStorage.getItem("surveyorName");
      if (applyName(fromStorage || undefined)) return;

      const infoCookie = getCookie("surveyorInfo");
      if (infoCookie) {
        try {
          const parsed = JSON.parse(infoCookie) as { name?: string };
          if (applyName(parsed?.name)) return;
        } catch (error) {
        }
      }

      const nameCookie = getCookie("surveyorName");
      if (applyName(nameCookie || undefined)) return;

      try {
        const profileResponse = await getSurveyorProfile();
        const surveyor = profileResponse?.data;
        const firstName = surveyor?.userId?.firstname || "";
        const lastName = surveyor?.userId?.lastname || "";
        applyName(`${firstName} ${lastName}`);
      } catch (error) {
      }
    };

    const onNameUpdated = () => {
      const value = localStorage.getItem("surveyorName");
      applyName(value || undefined);
    };

    hydrateName();
    window.addEventListener("surveyor-name-updated", onNameUpdated);
    return () => window.removeEventListener("surveyor-name-updated", onNameUpdated);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      background: isDarkMode ? '#111827' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#111827',
    });

    if (result.isConfirmed) {
      clearAuthTokens();
      localStorage.removeItem("surveyorToken");
      localStorage.removeItem("surveyorName");
      localStorage.removeItem("surveyorRole");
      localStorage.removeItem("surveyorOrganization");
      localStorage.removeItem("surveyorInfo");
      localStorage.removeItem("surveyorId");
      router.push('/surveyor');
    }
  };


  return (
    <header className="relative sticky top-3 z-20 mb-4 overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl print:hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_42%)]" />
      <div className="relative flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuClick}
            aria-label="Toggle sidebar"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-700 hover:shadow-md md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#028835] to-emerald-700 text-white shadow-lg shadow-emerald-200/60">
            <PageIcon className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
                Surveyor workspace
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            </div>
            <h1 className="truncate text-lg font-bold text-slate-900 sm:text-xl lg:text-2xl">
              {pageContext.title}
            </h1>
            <p className="truncate text-sm text-slate-500">{pageContext.subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="hidden xl:flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-left shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Active workspace
              </p>
              <p className="text-sm text-slate-500">Assignments, reports, premiums</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-1.5 shadow-sm backdrop-blur">
            <NotificationBell />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#028835]/20">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#028835] to-emerald-700 text-sm font-bold text-white shadow-md shadow-emerald-200/60 transition-transform duration-300 group-hover:scale-105">
                  {initials}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-sm font-semibold text-slate-900">
                    {surveyorName}
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    Surveyor profile
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
                  {surveyorName}
                </div>
                <div className="text-xs text-slate-500">Surveyor account</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1 bg-slate-200" />
              <DropdownMenuItem
                onSelect={() => router.push("/surveyor/dashboard/settings")}
                className="cursor-pointer rounded-2xl px-3 py-2.5 text-sm text-slate-700 transition-colors focus:bg-emerald-50 focus:text-emerald-800"
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

export default SurveyorHeader;
