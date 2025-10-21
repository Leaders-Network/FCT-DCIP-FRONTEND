"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Home, FileText, Upload, Settings, LogOut } from "lucide-react";

const SurveyorSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    localStorage.removeItem("surveyorToken");
    localStorage.removeItem("surveyorName");
    localStorage.removeItem("surveyorRole");
    router.push("/surveyor");
  };

  const menuItems = [
    { href: "/surveyor/dashboard", label: "Dashboard", icon: Home },
    { href: "/surveyor/dashboard/assignments", label: "My Assignments", icon: FileText },

    { href: "/surveyor/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside
      className={`bg-white shadow-md transition-all duration-300 flex flex-col ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-4 flex justify-between items-center relative">
        {!isCollapsed ? (
          <Image
            src="/logoblack.svg"
            alt="FCT-DCIP Logo"
            className="cursor-pointer"
            width={120}
            height={40}
            onClick={toggleSidebar}
          />
        ) : (
          <button
            onClick={toggleSidebar}
            className="p-1 text-2xl rounded-full hover:bg-gray-100"
          >
            ☰
          </button>
        )}
      </div>
      
      <nav className="mt-8 flex flex-col flex-grow">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 transition-colors ${
                pathname === item.href
                  ? "bg-[#028835] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              } ${isCollapsed ? "justify-center" : ""}`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isCollapsed ? "" : "mr-3"
                } ${pathname === item.href ? "text-white" : "text-gray-500"}`}
              />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
        
        <div className="flex-grow"></div>
        
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-3 mb-4 text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <LogOut className={`w-5 h-5 ${isCollapsed ? "" : "mr-3"}`} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </nav>
    </aside>
  );
};

export default SurveyorSidebar;