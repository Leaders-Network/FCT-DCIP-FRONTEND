"use client";
import React from "react";
import { Bell, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SurveyorHeader = () => {
  const surveyorName = localStorage.getItem("surveyorName") || "Surveyor";
  const initials = surveyorName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("surveyorToken");
    localStorage.removeItem("surveyorName");
    localStorage.removeItem("surveyorRole");
    window.location.href = "/surveyor";
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-900">AMMC Surveyor Portal</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search assignments..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#028835] focus:border-[#028835] sm:text-sm"
            />
          </div>

          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-500 relative">
            <Bell className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
          </button>

          {/* Profile */}
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-900 mr-3">
              {surveyorName}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 bg-[#028835] rounded-full flex items-center justify-center text-white text-sm font-bold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#028835]">
                  {initials}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onSelect={() => window.location.href = '/surveyor/dashboard/settings'}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SurveyorHeader;