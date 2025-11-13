"use client";
import React from "react";
import BrokerAdminManagement from "@/components/admin/BrokerAdminManagement";
import BrokerAdminSidebar from "@/components/brokerAdmin/BrokerAdminSideBar";

export default function BrokerAdministratorsPage() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <BrokerAdminSidebar />
            <div className="flex-1">
                <BrokerAdminManagement />
            </div>
        </div>
    );
}
