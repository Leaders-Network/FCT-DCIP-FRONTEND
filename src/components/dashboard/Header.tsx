"use client";
import { useAuth } from "@/context/useAuth";
import Image from "next/image";
import React from "react";
import { FaSearch } from "react-icons/fa";

const Header = () => {
  const { user } = useAuth();
  const userName = user?.name || "User";

  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 ml-10">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search Insurance available"
            className="w-full px-3 py-2 pl-10 border rounded-md"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <div className="flex items-center ml-4">
          <Image
            src="/dashboard/bell.png"
            alt="Notification"
            className="mr-2"
            width={20}
            height={20}
          />
          <div className="flex items-center">
            <span className="mr-2 font-semibold">{userName}</span>
            <div className="w-8 h-8 bg-[#028835] rounded-md flex items-center justify-center text-white">
              PB
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
