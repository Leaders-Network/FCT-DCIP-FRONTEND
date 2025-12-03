"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import InsuranceSidebar from "@/components/dashboard/usersComponent/InsuranceSidebar";
import { getUserPolicyRequests } from "@/services/api";

interface InsurancePolicy {
  _id: string;
  requestDetails?: {
    coverageType?: string;
  };
  updatedAt?: string;
  status?: string;
}

const InsurancePage = () => {
  const [showInsuranceSidebar, setShowInsuranceSidebar] = useState(false);
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [loading, setLoading] = useState(true);

  // Get user name from localStorage with SSR safety
  const userName = typeof window !== 'undefined' ? localStorage.getItem("fullname") : null;
  const nameParts = userName?.split(" ") ?? [];
  const lastName = nameParts[nameParts.length - 1] || "User";

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoading(true);
        const response = await getUserPolicyRequests("all", 1, 100);
        setPolicies(response.data.policyRequests);
      } catch (error) {
        console.error("Failed to fetch policies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  const toggleInsuranceSidebar = () => {
    setShowInsuranceSidebar(!showInsuranceSidebar);
  };

  return (
    <>
      {/* Greeting */}
      <h1 className="text-[23px] font-extrabold p-4 sm:p-8 pb-4">
        Hello {lastName}
      </h1>
      {/* Full-width Banner */}
      <div className="px-4 sm:px-8">
        <div className="w-full h-[100px] sm:h-[120px] md:h-[140px] lg:h-[160px] relative mb-6">
          <div className="w-full h-full absolute">
            <div className="w-full h-full absolute opacity-20 bg-white rounded-xl border border-black" />
            <Image
              className="w-full h-full absolute rounded-xl object-cover"
              src="/abuja-bg.png"
              alt="Abuja background"
              width={500}
              height={500}
            />
            <div className="w-full h-full absolute opacity-20 bg-black rounded-xl" />
          </div>
          <div className="absolute inset-0 flex flex-col justify-center p-4">
            <div className="text-white text-sm sm:text-base md:text-lg lg:text-[17px] font-bold mb-2">
              Life is unpredictable, but your home insurance doesn&apos;t
              have to be.
            </div>
            <div className="text-white text-xs sm:text-sm md:text-base lg:text-[13px] font-semibold">
              Get peace of mind with a policy that covers you against
              life&apos;s unexpected twists
            </div>
          </div>
          <div className="absolute lg:mb-12 right-2 sm:right-4 bottom-2 sm:bottom-4">
            <button
              onClick={toggleInsuranceSidebar}
              className="px-2 sm:px-4 py-1 sm:py-2 bg-white rounded-[40px] text-[#028835] text-sm sm:text-base lg:text-lg font-semibold flex items-center"
            >
              <div className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-[#028835] rounded-full mr-1 sm:mr-2 flex items-center justify-center">
                <svg
                  width="12"
                  height="13"
                  viewBox="0 0 12 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 6.62816V5.70509H5.53846V0.166626H6.46154V5.70509H12V6.62816H6.46154V12.1666H5.53846V6.62816H0Z"
                    fill="white"
                  />
                </svg>
              </div>
              Renew Policy
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-8 pb-8 overflow-y-auto">
        {/* Insurance Table */}
        <div className="w-full bg-white rounded-xl p-4 overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-2 font-bold w-5 px-4">
                  <div className="w-5 h-5 opacity-30 bg-white rounded-[3px] border border-black">
                    <input
                      type="checkbox"
                      className="w-full h-full cursor-pointer opacity-0"
                    />
                  </div>
                </th>
                <th className="pb-2 font-bold">Name</th>
                <th className="pb-2 font-bold">Expiring Date</th>
                <th className="pb-2 font-bold">AMMC ID</th>
                <th className="pb-2 font-bold">Status</th>
                <th className="pb-2 font-bold w-5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Loading state
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b animate-pulse">
                    <td className="py-4 px-4">
                      <div className="w-5 h-5 bg-gray-200 rounded"></div>
                    </td>
                    <td className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </td>
                    <td className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="py-4">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="py-4">
                      <div className="w-6 h-6 bg-gray-200 rounded"></div>
                    </td>
                  </tr>
                ))
              ) : (policies || []).length > 0 ? (
                (policies || []).map((item, index) => (
                  <tr key={item._id || index} className="border-b">
                    <td className="py-4 px-4">
                      <div className="w-5 h-5 opacity-30 bg-white rounded-[3px] border border-black">
                        <input
                          type="checkbox"
                          className="w-full h-full cursor-pointer opacity-0"
                        />
                      </div>
                    </td>
                    <td className="py-4 text-[#1e1e1e] text-[17px] font-medium">
                      {item.requestDetails?.coverageType || "Insurance Policy"}
                    </td>
                    <td className="py-4 text-[#2a2828] text-base font-medium">
                      {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit'
                      }) : "N/A"}
                    </td>
                    <td className="py-4 text-[#2a2828] text-base font-medium">
                      {item._id?.substring(0, 7).toUpperCase() || "N/A"}
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-2.5 py-1.5 rounded-md text-white text-[15px] font-medium capitalize ${item.status === "active"
                            ? "bg-[#028835]"
                            : item.status === "inactive" || item.status === "expired"
                              ? "bg-[#2a2a29]"
                              : item.status === "pending" || item.status === "assigned"
                                ? "bg-[#ffc52b]"
                                : "bg-[#bd2721]"
                          }`}
                      >
                        {item.status || "Unknown"}
                      </span>
                    </td>
                    <td className="py-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="12" cy="5" r="1" />
                        <circle cx="12" cy="19" r="1" />
                      </svg>
                    </td>
                  </tr>
                ))
              ) : (
                // Empty state
                <tr className="border-b">
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="font-medium">No insurance policies found</p>
                      <p className="text-sm">Your insurance policies will appear here once you have some.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      <InsuranceSidebar
        isOpen={showInsuranceSidebar}
        onClose={() => setShowInsuranceSidebar(false)}
      />
    </>
  );
};

export default InsurancePage;