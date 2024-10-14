"use client"
import React from "react";
import StatCard from "./mainviewComponents/StatCard";
import PropertyRegistrationChart from "./mainviewComponents/PropertyRegistrationChart";
import InsurancePaymentChart from "./mainviewComponents/InsurancePaymentChart";
import PropertyStatusChart from "./mainviewComponents/PropertyStatusChart";
import NotificationPanel from "./mainviewComponents/NotificationPanel";
import profile from "../../../public/dashboard/profile.png"
import property from "../../../public/dashboard/sho.png"
import lga from "../../../public/dashboard/loca.png"
import insurance from "../../../public/dashboard/eye.png"


const MainView = () => {
  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="flex flex-col mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Hi Blessing</h1>
          <button className="bg-[#028835] text-white px-4 py-2 rounded-full flex items-center">
            <span className="bg-black rounded-full w-6 h-6 pt-[2px] items-center justify-center mr-2  leading-none">
              +
            </span>
            New Insurance
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={profile}
              value="12,481"
              label="Total Users"
              color="bg-pink-100"
            />
            <StatCard
              icon={property}
              value="42,432"
              label="Total Properties"
              color="bg-cyan-100"
            />
            <StatCard
              icon={lga}
              value="2,567"
              label="L.G.A Covered"
              color="bg-yellow-100"
            />
            <StatCard
              icon={insurance}
              value="57,480"
              label="Insurance Company"
              color="bg-blue-100"
            />
          </div>
          <PropertyRegistrationChart />
          <InsurancePaymentChart />
        </div>
        <div className="space-y-6">
          <PropertyStatusChart />
          <NotificationPanel />
        </div>
      </div>
    </main>
  );
};

export default MainView;
