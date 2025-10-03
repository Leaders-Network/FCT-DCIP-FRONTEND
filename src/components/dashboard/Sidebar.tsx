"use client"
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { IoMdLogOut } from "react-icons/io";
import { useAuth } from "@/context/useAuth";

const Sidebar = () => {
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: "/dashboard/dashboard.png" },
    { href: "/admin/dashboard/policies", label: "Policies", icon: "/dashboard/insurance.png" },
    { href: "/admin/dashboard/insurance", label: "Insurance", icon: "/dashboard/insurance.png" },
    { href: "/admin/dashboard/users", label: "Users", icon: "/dashboard/user.png" },
    { href: "/admin/dashboard/members", label: "Members", icon: "/dashboard/people.png" },
    { href: "/admin/dashboard/settings", label: "Settings", icon: "/dashboard/setting.png" },
  ];

  return (
    <aside
      className={`bg-white shadow-md transition-all duration-300 flex flex-col ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div></div>
      <div className="p-4 flex justify-between items-center relative">
        {!isCollapsed ? (
          <Image
            src="/logoblack.svg"
            alt="FCT-DCIP Logo"
            className="bg-black-500"
            width={isCollapsed ? 150 : 300}
            height={isCollapsed ? 150 : 300}
            onClick={toggleSidebar}
          />
        ) : (
          <button
            onClick={toggleSidebar}
            className="p-1 text-2xl rounded-full hover:bg-gray-100 "
          >
            ☰{/* {isCollapsed ? "☰" : "✕"} */}
          </button>
        )}
      </div>
      <nav className="mt-8 flex flex-col flex-grow">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-2 ${
              pathname === item.href
                ? "bg-green-500 text-white"
                : "text-gray-700 hover:bg-gray-100"
            } ${isCollapsed ? "justify-center" : ""}`}
          >
            <Image
              src={item.icon}
              alt={item.label}
              className={`${isCollapsed ? "" : "mr-2"} ${
                pathname === item.href ? "filter invert" : ""
              }`}
              width={20}
              height={20}
            />
            {!isCollapsed && item.label}
          </Link>
        ))}
        <div className="flex-grow"></div>
        <button
          onClick={logout}
          className="flex items-center px-4 py-2 mb-4 text-gray-700 hover:bg-gray-100"
        >
          <IoMdLogOut className="h-6 w-6 mr-2"/>

          {!isCollapsed && "Logout"}
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
