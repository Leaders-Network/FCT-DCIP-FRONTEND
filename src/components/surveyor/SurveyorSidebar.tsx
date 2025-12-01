"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Home, FileText, Upload, Settings, LogOut, X } from "lucide-react";

interface SurveyorSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

const SurveyorSidebar: React.FC<SurveyorSidebarProps> = ({
  isOpen = true,
  onClose,
  isMobile = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const showExpanded = isMobile || !isCollapsed;

  const handleLogout = () => {
    localStorage.removeItem("surveyorToken");
    localStorage.removeItem("surveyorName");
    localStorage.removeItem("surveyorRole");
    localStorage.removeItem("surveyorOrganization");
    localStorage.removeItem("surveyorInfo");
    router.push("/surveyor");
  };

  const menuItems = [
    { href: "/surveyor/dashboard", label: "Dashboard", icon: Home },
    { href: "/surveyor/dashboard/assignments", label: "My AMMC Assignments", icon: FileText },

    { href: "/surveyor/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside
      className={`bg-white shadow-md transition-all duration-300 flex flex-col fixed md:relative z-30 h-full border-r border-gray-200
        ${isMobile
          ? (isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64")
          : (isCollapsed ? "w-16" : "w-64")
        }
        md:translate-x-0`}
    >
      <div className="p-4 flex justify-between items-center relative border-b border-gray-200">
        {showExpanded ? (
          <Image
            src="/logoblack.svg"
            alt="Builders-Liability-AMMC Logo"
            className="cursor-pointer"
            width={120}
            height={40}
            onClick={() => !isMobile && toggleSidebar()}
          />
        ) : (
          <button
            onClick={toggleSidebar}
            className="p-1 text-2xl rounded-full hover:bg-gray-100 mx-auto"
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

      <nav className="mt-4 flex flex-col flex-grow px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors mb-1 ${pathname === item.href
                ? "bg-[#028835] text-white"
                : "text-gray-700 hover:bg-gray-100"
                } ${!showExpanded ? "justify-center" : ""}`}
            >
              <Icon
                className={`w-5 h-5 ${!showExpanded ? "" : "mr-3"
                  } ${pathname === item.href ? "text-white" : "text-gray-500"}`}
              />
              {showExpanded && <span>{item.label}</span>}
            </Link>
          );
        })}

        <div className="flex-grow"></div>

        <button
          onClick={handleLogout}
          className={`flex items-center px-4 py-3 mb-4 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors ${!showExpanded ? "justify-center" : ""}`}
        >
          <LogOut className={`w-5 h-5 ${!showExpanded ? "" : "mr-3"}`} />
          {showExpanded && <span>Logout</span>}
        </button>
      </nav>
    </aside>
  );
};

export default SurveyorSidebar;