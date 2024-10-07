"use client"
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  if (!isOpen) {
    return (
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 p-2 bg-white shadow-md rounded-full"
      >
        ☰
      </button>
    );
  }

  return (
    <aside className="w-64 bg-white shadow-md">
      <div className="p-4 flex justify-between items-center">
        <Image src="/logoblack.svg" alt="FCT-DCIP Logo" className="bg-black-500" width={100} height={100} />
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          ✕
        </button>
      </div>
      <nav className="mt-8">
        <Link
          href="/dashboard"
          className="flex items-center px-4 py-2 bg-green-500 text-white"
        >
          <Image src="/dashboard/dashboard.png" alt="Dashboard" className="mr-2" width={20} height={20} />
          Dashboard
        </Link>
        <Link
          href="/insurance"
          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          <Image src="/dashboard/insurance.png" alt="Insurance" className="mr-2" width={20} height={20} />
          Insurance
        </Link>
        <Link
          href="/users"
          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          <Image src="/dashboard/people.png" alt="Users" className="mr-2" width={20} height={20} />
          Users
        </Link>
        <Link
          href="/settings"
          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          <Image src="/dashboard/setting.png" alt="Settings" className="mr-2" width={20} height={20} />
          Settings
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
