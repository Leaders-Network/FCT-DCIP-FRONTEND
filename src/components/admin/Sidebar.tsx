"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home, Users, FileText, Settings, ClipboardList, Shield,
  AlertTriangle, UserCheck, X, LucideIcon
} from "lucide-react";
import { IoMdLogOut } from "react-icons/io";
import { useAuth } from "@/context/useAuth";

interface SidebarProps {
  isOpen?: boolean;     // mobile only
  onClose?: () => void; // mobile only
  isMobile?: boolean;
}

const NavItem = ({
  href,
  icon: Icon,
  label,
  collapsed,
  onClick
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  collapsed: boolean;
  onClick?: () => void;
}) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} onClick={onClick}>
      <div
        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors 
        ${isActive ? "bg-[#028835] text-white" : "text-gray-600 hover:bg-gray-100"}
        `}
      >
        <Icon className="h-5 w-5" />
        {!collapsed && <span className="ml-3">{label}</span>}
      </div>
    </Link>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isMobile }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();

  const sidebarWidth = isMobile
    ? "w-64"
    : collapsed
      ? "w-16"
      : "w-64";

  return (
    <aside
      className={`
        bg-white shadow-md border-r border-gray-200 fixed md:relative z-30 h-full
        transition-all duration-300 flex flex-col
        ${isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
        ${sidebarWidth}
      `}
    >
      {/* HEADER */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        {!collapsed ? (
          <Image
            src="/logoblack.svg"
            alt="Logo"
            width={120}
            height={40}
            className="cursor-pointer"
            onClick={() => !isMobile && setCollapsed(true)}
          />
        ) : (
          <button
            onClick={() => setCollapsed(false)}
            className="p-1 rounded-lg hover:bg-gray-100 mx-auto"
          >
            ☰
          </button>
        )}

        {isMobile && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* NAV */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <NavItem collapsed={collapsed} href="/admin/dashboard" icon={Home} label="Dashboard" onClick={isMobile ? onClose : undefined} />
        {/* <NavItem collapsed={collapsed} href="/admin/dashboard/property" icon={Building} label="Property" onClick={isMobile ? onClose : undefined} /> */}
        <NavItem collapsed={collapsed} href="/admin/dashboard/policies" icon={FileText} label="Policies" onClick={isMobile ? onClose : undefined} />
        <NavItem collapsed={collapsed} href="/admin/dashboard/assignments" icon={UserCheck} label="Assignments" onClick={isMobile ? onClose : undefined} />
        <NavItem collapsed={collapsed} href="/admin/dashboard/enforcement" icon={Shield} label="Enforcement" onClick={isMobile ? onClose : undefined} />
        <NavItem collapsed={collapsed} href="/admin/dashboard/surveyors" icon={Users} label="Surveyors" onClick={isMobile ? onClose : undefined} />
        <NavItem collapsed={collapsed} href="/admin/dashboard/administrators" icon={ClipboardList} label="Administrators" onClick={isMobile ? onClose : undefined} />
        <NavItem collapsed={collapsed} href="/admin/dashboard/user-inquiries" icon={AlertTriangle} label="User Inquiries" onClick={isMobile ? onClose : undefined} />
        {/* <NavItem collapsed={collapsed} href="/admin/dashboard/processing-monitor" icon={FileText} label="Processing Monitor" onClick={isMobile ? onClose : undefined} /> */}
        <NavItem collapsed={collapsed} href="/admin/dashboard/settings" icon={Settings} label="Settings" onClick={isMobile ? onClose : undefined} />
      </div>

      {/* LOGOUT */}
      <div className="p-4">
        <button
          onClick={logout}
          className="flex items-center px-4 py-3 text-sm font-medium rounded-lg w-full
          text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
          <IoMdLogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
