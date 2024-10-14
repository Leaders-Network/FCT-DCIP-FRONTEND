import Header from "@/components/dashboard/Header";
import MainView from "@/components/dashboard/MainView";
import Sidebar from "@/components/dashboard/Sidebar";
import React from "react";
import MainViewPage from "./mainview/page";


const DashboardPage = () => {
  return (
    <div className="flex h-screen bg-gray-100">
        <MainViewPage />
    </div>
  );
};

export default DashboardPage;
