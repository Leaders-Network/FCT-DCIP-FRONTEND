"use client";
import { useAuth } from "@/context/useAuth";
import Image from "next/image";
import React, { useEffect } from "react";
import { FaSearch } from "react-icons/fa";

const Header = () => {
  const { user } = useAuth();
  // Get firstname and create initials from firstname and lastname
  const firstName = (user as any)?.firstname || "User";
  const initials = user ? `${(user as any).firstname?.[0] || 'U'}${(user as any).lastname?.[0] || ''}`.toUpperCase() : "U";

  useEffect(() => {
    console.log("Auth Context User:", user);
    console.log("Local Storage User:", localStorage.getItem('user'));
    console.log("Auth Token:", localStorage.getItem('authToken'));
    console.log("First Name:", firstName);
    console.log("Initials:", initials);
  }, [user, firstName, initials]);

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
            <span className="mr-2 font-semibold">{firstName}</span>
            <div className="w-8 h-8 bg-[#028835] rounded-md flex items-center justify-center text-white">
              {initials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
