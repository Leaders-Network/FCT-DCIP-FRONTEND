"use client";
import React, { useEffect, useState } from "react";
import { Search, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearAuthTokens } from "@/utils/auth"
import { getCookie } from "@/utils/cookies";
import { getSurveyorProfile } from "@/services/api";
import Swal from "sweetalert2";
import { useRouter } from 'next/navigation';
import NotificationBell from "@/components/shared/NotificationBell";

interface SurveyorHeaderProps {
  onMenuClick?: () => void;
}

const SurveyorHeader: React.FC<SurveyorHeaderProps> = ({ onMenuClick }) => {
  const [surveyorName, setSurveyorName] = useState("Surveyor");
  const initials = surveyorName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
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
    <header className="bg-white shadow-sm border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
            <span className="hidden sm:inline">AMMC Surveyor Portal</span>
            <span className="sm:hidden">Surveyor</span>
          </h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Search - hidden on mobile */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="block w-48 xl:w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#028835] focus:border-[#028835] sm:text-sm"
            />
          </div>

          <NotificationBell />

          {/* Profile */}
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-900 mr-2 hidden lg:inline truncate max-w-[120px]">
              {surveyorName}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 sm:w-9 sm:h-9 bg-[#028835] rounded-lg flex items-center justify-center text-white text-sm font-bold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#028835]">
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
