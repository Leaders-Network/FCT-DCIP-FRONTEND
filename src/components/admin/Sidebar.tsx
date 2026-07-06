"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Users,
  FileText,
  Settings,
  ClipboardList,
  Shield,
  AlertTriangle,
  UserCheck,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import Swal from "sweetalert2";
import { clearAuthTokens } from "@/utils/auth";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Home },
  { href: "/admin/dashboard/policies", label: "Policies", icon: FileText },
  { href: "/admin/dashboard/assignments", label: "Assignments", icon: UserCheck },
  { href: "/admin/dashboard/enforcement", label: "Enforcement", icon: Shield },
  { href: "/admin/dashboard/surveyors", label: "Surveyors", icon: Users },
  { href: "/admin/dashboard/administrators", label: "Administrators", icon: ClipboardList },
  { href: "/admin/dashboard/user-inquiries", label: "User Inquiries", icon: AlertTriangle },
  { href: "/admin/dashboard/settings", label: "Settings", icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isMobile }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isDarkMode =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const showExpanded = isMobile || !isCollapsed;

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

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
      router.push("/admin/login");
    }
  };

  const sidebarWidth = isMobile
    ? isOpen
      ? "translate-x-0 w-64"
      : "-translate-x-full w-64"
    : isCollapsed
      ? "w-16"
      : "w-64";

  return (
    <aside
      className={`fixed z-30 flex h-full flex-col overflow-hidden rounded-r-[2rem] border border-white/70 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-all duration-300 print:hidden md:relative md:translate-x-0 ${sidebarWidth}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-white/70 bg-gradient-to-r from-white via-white to-emerald-50/70 p-4">
        {showExpanded ? (
          <button
            type="button"
            onClick={() => !isMobile && toggleSidebar()}
            className="flex min-w-0 items-center gap-3 text-left transition-transform duration-300 hover:-translate-y-0.5"
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
                Admin Portal
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
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-2xl border border-slate-200/80 bg-white/90 p-2 text-slate-500 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="mt-4 flex flex-1 flex-col px-3 pb-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && onClose?.()}
              aria-current={isActive ? "page" : undefined}
              title={!showExpanded ? item.label : undefined}
              className={`group mb-1.5 flex items-center rounded-2xl px-4 py-3 transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-[#028835] to-[#0a7f37] text-white shadow-lg shadow-emerald-200/60"
                  : "text-slate-700 hover:-translate-y-0.5 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-md"
              } ${!showExpanded ? "justify-center px-0" : ""}`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
                  isActive
                    ? "text-white"
                    : "text-slate-500 group-hover:scale-105 group-hover:text-emerald-700"
                } ${showExpanded ? "mr-3" : ""}`}
              />
              {showExpanded && (
                <span className="truncate text-sm font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}

        <div className="flex-1" />

        <button
          type="button"
          onClick={onLogout}
          title={!showExpanded ? "Logout" : undefined}
          className={`mb-4 flex items-center rounded-2xl px-4 py-3 text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-50 hover:text-red-600 hover:shadow-md ${
            !showExpanded ? "justify-center px-0" : ""
          }`}
        >
          <LogOut
            className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
              showExpanded ? "mr-3" : ""
            }`}
          />
          {showExpanded && <span className="text-sm font-medium">Logout</span>}
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
