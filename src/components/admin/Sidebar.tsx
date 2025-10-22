"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, FileText, Settings, Briefcase, Building, ClipboardList, Shield } from "lucide-react";

import { useAuth } from "@/context/useAuth";
import { IoMdLogOut } from "react-icons/io";

const NavItem = ({ href, icon, label }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href}>
      <div
        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
          isActive
            ? "bg-[#028835] text-white"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}>
        {React.createElement(icon, { className: "h-5 w-5 mr-3" })}
        <span>{label}</span>
      </div>
    </Link>
  );
};

export default function Sidebar() {
  const { logout } = useAuth();
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <NavItem href="/admin/dashboard" icon={Home} label="Dashboard" />
        <NavItem href="/admin/dashboard/property" icon={Building} label="Property" />
        <NavItem href="/admin/dashboard/policies" icon={FileText} label="Policies" />
        <NavItem href="/admin/dashboard/assignments" icon={Briefcase} label="Assignments" />
        <NavItem href="/admin/dashboard/enforcement" icon={Shield} label="Enforcement" />
        <NavItem href="/admin/dashboard/surveyors" icon={Users} label="Surveyors" />
        <NavItem href="/admin/dashboard/users" icon={Users} label="Users" />
        <NavItem href="/admin/dashboard/administrators" icon={ClipboardList} label="Administrators" />
        <NavItem href="/admin/dashboard/settings" icon={Settings} label="Settings" />
      </nav>
      <div className="p-4">
        <button
          onClick={logout}
          className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 w-full"
        >
          <IoMdLogOut className="h-5 w-5 mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
