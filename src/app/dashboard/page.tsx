import Header from "@/components/dashboard/Header";
import MainView from "@/components/dashboard/MainView";
import Sidebar from "@/components/dashboard/Sidebar";
import React from "react";


const DashboardPage = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <MainView />
      </div>
    </div>
  );
};

export default DashboardPage;
