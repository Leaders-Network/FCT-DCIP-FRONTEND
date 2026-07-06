"use client";

import { useEffect, useState } from "react";
import type React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Shield,
  User,
  X,
  Building2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationProvider } from "@/context/NotificationContext";
import NotificationBell from "@/components/shared/NotificationBell";
import GlobalSearch from "@/components/shared/GlobalSearch";
import { useAuth } from "@/context/useAuth";
import { getCookie } from "@/utils/cookies";
import { clearAuthTokens } from "@/utils/auth";
import Swal from "sweetalert2";

interface UserLayoutProps {
  children: React.ReactNode;
}

interface PageContext {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const getDashboardPageContext = (pathname: string | null): PageContext => {
  if (!pathname) {
    return {
      title: "Dashboard",
      subtitle: "Overview of your policies, claims, and updates.",
      icon: LayoutDashboard,
    };
  }

  if (pathname.includes("/dashboard/insurance")) {
    return {
      title: "Insurance",
      subtitle: "Review your policies, coverage, and related details.",
      icon: Shield,
    };
  }

  if (pathname.includes("/dashboard/contacts")) {
    return {
      title: "Contacts",
      subtitle: "Keep your important contacts and support links close.",
      icon: Building2,
    };
  }

  if (pathname.includes("/dashboard/inquiries")) {
    return {
      title: "My Inquiries",
      subtitle: "Track questions, follow-ups, and responses.",
      icon: MessageSquare,
    };
  }

  if (pathname.includes("/dashboard/claims")) {
    return {
      title: "Claims",
      subtitle: "Manage your claim submissions and progress.",
      icon: FileText,
    };
  }

  if (pathname.includes("/dashboard/notifications")) {
    return {
      title: "Notifications",
      subtitle: "Stay on top of alerts, reminders, and changes.",
      icon: Bell,
    };
  }

  if (pathname.includes("/dashboard/settings")) {
    return {
      title: "Settings",
      subtitle: "Adjust your account and portal preferences.",
      icon: Settings,
    };
  }

  return {
    title: "Dashboard",
    subtitle: "Overview of your policies, claims, and updates.",
    icon: LayoutDashboard,
  };
};

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const pageContext = getDashboardPageContext(pathname);
  const PageIcon = pageContext.icon;
  const router = useRouter();
  const { user, logout } = useAuth();
  const isDarkMode =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  const getUserName = (): string => {
    if (user) {
      const userData = user as { fullname?: string; firstname?: string };
      return userData.fullname || userData.firstname || "User";
    }

    const storedUser = typeof window !== "undefined" ? getCookie("user") : null;
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser) as { fullname?: string; firstname?: string };
        return userData.fullname || userData.firstname || "User";
      } catch {
        return "User";
      }
    }

    return "User";
  };

  const displayName = getUserName();
  const initials = displayName
    .split(" ")
    .map((word: string) => word[0])
    .join("")
    .toUpperCase();

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const onLogout = async () => {
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
      logout();
      router.push("/login");
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "Insurance", path: "/dashboard/insurance", icon: Shield },
    { name: "Contacts", path: "/dashboard/contacts", icon: Building2 },
    { name: "My Inquiries", path: "/dashboard/inquiries", icon: MessageSquare },
    { name: "Claims", path: "/dashboard/claims", icon: FileText },
    { name: "Notifications", path: "/dashboard/notifications", icon: Bell },
    { name: "Settings", path: "/dashboard/settings", icon: Settings },
  ];

  const sidebarWidth = isMobile
    ? sidebarOpen
      ? "translate-x-0 w-64"
      : "-translate-x-full w-64"
    : sidebarOpen
      ? "w-64"
      : "w-16";

  return (
    <NotificationProvider>
      <div className="flex h-screen gap-3 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-cyan-50/20 p-3 sm:p-4 print:block print:h-auto print:bg-white print:p-0">
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 print:hidden md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed z-30 flex h-full flex-col overflow-hidden rounded-r-[2rem] border border-white/70 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-all duration-300 print:hidden md:relative md:translate-x-0 ${sidebarWidth}`}
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/70 bg-gradient-to-r from-white via-white to-emerald-50/70 p-4">
            {sidebarOpen || isMobile ? (
              <button
                type="button"
                className="flex min-w-0 items-center gap-3 text-left transition-transform duration-300 hover:-translate-y-0.5"
                onClick={() => !isMobile && toggleSidebar()}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#028835] to-emerald-700 shadow-lg shadow-emerald-200/60">
                  <Image
                    src="/logo.svg"
                    alt="Builders Liability Logo"
                    className="h-6 w-6 object-contain"
                    width={24}
                    height={24}
                  />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold tracking-tight text-slate-900">
                    Builders Liability
                  </span>
                  <span className="block truncate text-[11px] text-slate-500">
                    Client Portal
                  </span>
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={toggleSidebar}
                aria-label="Expand sidebar"
                className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-700 hover:shadow-md"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            {isMobile && (
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
                className="rounded-2xl border border-slate-200/80 bg-white/90 p-2 text-slate-500 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <nav className="mt-4 flex flex-1 flex-col px-3 pb-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === "/dashboard"
                  ? pathname === item.path
                  : pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  title={!sidebarOpen && !isMobile ? item.name : undefined}
                  className={`group mb-1.5 flex items-center rounded-2xl px-4 py-3 transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-[#028835] to-[#0a7f37] text-white shadow-lg shadow-emerald-200/60"
                      : "text-slate-700 hover:-translate-y-0.5 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-md"
                  } ${!sidebarOpen && !isMobile ? "justify-center px-0" : ""}`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
                      isActive
                        ? "text-white"
                        : "text-slate-500 group-hover:scale-105 group-hover:text-emerald-700"
                    } ${sidebarOpen || isMobile ? "mr-3" : ""}`}
                  />
                  {(sidebarOpen || isMobile) && (
                    <span className="truncate text-sm font-medium">{item.name}</span>
                  )}
                </Link>
              );
            })}

            <div className="flex-1" />

            <button
              type="button"
              onClick={onLogout}
              title={!sidebarOpen && !isMobile ? "Logout" : undefined}
              className={`mb-4 flex items-center rounded-2xl px-4 py-3 text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-50 hover:text-red-600 hover:shadow-md ${
                !sidebarOpen && !isMobile ? "justify-center px-0" : ""
              }`}
            >
              <LogOut
                className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
                  sidebarOpen || isMobile ? "mr-3" : ""
                }`}
              />
              {(sidebarOpen || isMobile) && <span className="text-sm font-medium">Logout</span>}
            </button>
          </nav>
        </aside>

        <div className="flex flex-1 flex-col overflow-visible print:block print:overflow-visible print:bg-white">
          <header className="relative sticky top-3 z-40 mb-4 overflow-visible rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl print:hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_42%)]" />
            <div className="relative flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-700 hover:shadow-md md:hidden"
                  onClick={toggleSidebar}
                  aria-label="Toggle sidebar"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#028835] to-emerald-700 text-white shadow-lg shadow-emerald-200/60">
                  <PageIcon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
                      Client workspace
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
                <div className="hidden xl:block">
                  <GlobalSearch
                    userType="user"
                    className="w-full min-w-[360px] max-w-[460px]"
                  />
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
                          {displayName}
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          Profile and settings
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
                        {displayName}
                      </div>
                      <div className="text-xs text-slate-500">Client account</div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1 bg-slate-200" />
                    <DropdownMenuItem
                      onSelect={() => router.push("/dashboard/settings")}
                      className="cursor-pointer rounded-2xl px-3 py-2.5 text-sm text-slate-700 transition-colors focus:bg-emerald-50 focus:text-emerald-800"
                    >
                      <User className="h-4 w-4 text-slate-500" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={onLogout}
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

          <main className="flex-1 overflow-auto rounded-[2rem] border border-white/70 bg-white/60 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl print:overflow-visible print:rounded-none print:border-0 print:bg-white print:p-0 print:shadow-none sm:p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
};

export default UserLayout;
