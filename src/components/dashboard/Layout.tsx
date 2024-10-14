import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
