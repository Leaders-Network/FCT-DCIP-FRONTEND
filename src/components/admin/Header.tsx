"use client";
import React from "react";
import { User, Menu } from "lucide-react";
import NotificationBell from "@/components/shared/NotificationBell";
import GlobalSearch from "@/components/shared/GlobalSearch";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-3 sm:px-6 py-3">
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <GlobalSearch
            userType="admin"
            className="flex-1 max-w-[200px] sm:max-w-[300px] md:max-w-md"
          />
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <NotificationBell />
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <User className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}
