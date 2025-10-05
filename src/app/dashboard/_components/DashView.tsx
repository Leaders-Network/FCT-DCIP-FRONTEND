"use client";
import React, { useState, useEffect } from "react";
import AddNewProperty from "@/components/dashboard/usersComponent/AddNewProperty";
import PolicyRequestForm from "@/components/dashboard/PolicyRequestForm";
import { CreatePolicyRequestData } from "@/types/api.types";
import Image from "next/image";

const Dashview = () => {
  const [showAddNewProperty, setShowAddNewProperty] = useState(false);
  const [showPolicyRequest, setShowPolicyRequest] = useState(false);
  const [stats, setStats] = useState({
    active: 0,
    expired: 0,
    pending: 0,
    collaborators: 0
  });
  const [recentInsurances, setRecentInsurances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get user name from local storage
  const userName = typeof window !== 'undefined' ? localStorage.getItem("fullname") : null;
  const nameParts = userName?.split(" ") ?? [];
  const lastName = nameParts[nameParts.length - 1] || "User";

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const { getUserPolicyRequests } = await import("@/services/api");
        
        // Fetch all policy requests to calculate stats
        const [allPolicies, activePolicies, expiredPolicies, pendingPolicies] = await Promise.all([
          getUserPolicyRequests('all', 1, 100),
          getUserPolicyRequests('active', 1, 100),
          getUserPolicyRequests('expired', 1, 100), 
          getUserPolicyRequests('pending', 1, 100)
        ]);

        // Update stats
        setStats({
          active: activePolicies?.data?.length || 0,
          expired: expiredPolicies?.data?.length || 0,
          pending: pendingPolicies?.data?.length || 0,
          collaborators: 5 // TODO: Replace with actual collaborator count when API is available
        });

        // Set recent insurances (first 5 items from all policies)
        setRecentInsurances(allPolicies?.data?.slice(0, 5) || []);
        
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Set fallback values if API fails
        setStats({
          active: 0,
          expired: 0,
          pending: 0,
          collaborators: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const toggleAddNewProperty = () => {
    setShowAddNewProperty(!showAddNewProperty);
  };

  const handlePolicyRequest = async (data: CreatePolicyRequestData) => {
    try {
      const { submitPolicyRequest } = await import("@/services/api");
      await submitPolicyRequest(data);
      alert("Policy request submitted successfully!");
    } catch (error) {
      console.error("Failed to submit policy request:", error);
      alert("Failed to submit policy request. Please try again.");
    }
  };

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden p-6">
        {/* Greeting */}
        <h1 className="text-[23px] font-extrabold pb-4">
          Hello {lastName}
        </h1>

      {/* Full-width Banner */}
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
            onClick={toggleAddNewProperty}
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
            New Property
          </button>
        </div>
      </div>

      {/* Main Content and Right Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 pb-8 overflow-y-auto">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  {
                    title: "Active Insurance",
                    count: loading ? "..." : stats.active,
                    color: "bg-[#fda5fc]",
                    icon: (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1em"
                        height="1em"
                        viewBox="0 0 15 15"
                      >
                        <path
                          fill="white"
                          fill-rule="evenodd"
                          d="M.877 7.5a6.623 6.623 0 1 1 13.246 0a6.623 6.623 0 0 1-13.246 0M7.5 1.827a5.673 5.673 0 0 0-4.193 9.494A4.97 4.97 0 0 1 7.5 9.025a4.97 4.97 0 0 1 4.193 2.296A5.673 5.673 0 0 0 7.5 1.827m3.482 10.152A4.02 4.02 0 0 0 7.5 9.975a4.02 4.02 0 0 0-3.482 2.004A5.65 5.65 0 0 0 7.5 13.173c1.312 0 2.52-.446 3.482-1.194M5.15 6.505a2.35 2.35 0 1 1 4.7 0a2.35 2.35 0 0 1-4.7 0m2.35-1.4a1.4 1.4 0 1 0 0 2.8a1.4 1.4 0 0 0 0-2.8"
                          clip-rule="evenodd"
                        />
                      </svg>
                    ),
                  },
                  {
                    title: "Expired Insurance",
                    count: loading ? "..." : stats.expired,
                    color: "bg-[#7be0d4]",
                    icon: (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="white"
                          d="M12 8H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h3l5 4V4zm3 7.6L13 14H4v-4h9l2-1.6zm6.5-3.6c0 1.71-.96 3.26-2.5 4V8c1.53.75 2.5 2.3 2.5 4"
                        />
                      </svg>
                    ),
                  },
                  {
                    title: "Pending Insurance",
                    count: loading ? "..." : stats.pending,
                    color: "bg-[#fad572]",
                    icon: (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1.2em"
                        height="1.2em"
                        viewBox="0 0 24 24"
                      >
                        <g fill="none" fill-rule="evenodd">
                          <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                          <path
                            fill="white"
                            fill-rule="nonzero"
                            d="M6.72 16.64a1 1 0 0 1 .56 1.92c-.5.146-.86.3-1.091.44c.238.143.614.303 1.136.452C8.48 19.782 10.133 20 12 20s3.52-.218 4.675-.548c.523-.149.898-.309 1.136-.452c-.23-.14-.59-.294-1.09-.44a1 1 0 0 1 .559-1.92c.668.195 1.28.445 1.75.766c.435.299.97.82.97 1.594c0 .783-.548 1.308-.99 1.607c-.478.322-1.103.573-1.786.768C15.846 21.77 14 22 12 22s-3.846-.23-5.224-.625c-.683-.195-1.308-.446-1.786-.768c-.442-.3-.99-.824-.99-1.607c0-.774.535-1.295.97-1.594c.47-.321 1.082-.571 1.75-.766M12 2a7.5 7.5 0 0 1 7.5 7.5c0 2.568-1.4 4.656-2.85 6.14a16.4 16.4 0 0 1-1.853 1.615c-.594.446-1.952 1.282-1.952 1.282a1.71 1.71 0 0 1-1.69 0a21 21 0 0 1-1.952-1.282A16 16 0 0 1 7.35 15.64C5.9 14.156 4.5 12.068 4.5 9.5A7.5 7.5 0 0 1 12 2m0 2a5.5 5.5 0 0 0-5.5 5.5c0 1.816.996 3.428 2.28 4.74c.966.988 2.03 1.74 2.767 2.202l.453.274l.453-.274c.736-.462 1.801-1.214 2.767-2.201c1.284-1.313 2.28-2.924 2.28-4.741A5.5 5.5 0 0 0 12 4m0 2.5a3 3 0 1 1 0 6a3 3 0 0 1 0-6m0 2a1 1 0 1 0 0 2a1 1 0 0 0 0-2"
                          />
                        </g>
                      </svg>
                    ),
                  },
                  {
                    title: "Collaborators",
                    count: loading ? "..." : stats.collaborators,
                    color: "bg-[#8b9fef]",
                    icon: (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1.2em"
                        height="1.2em"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="none"
                          stroke="white"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.75"
                          d="m3.282 21.782l4.278-4.278M21.782 3.282L17.673 7.39m-3.363 3.363a2.64 2.64 0 0 0-1.063-1.063a2.625 2.625 0 1 0-2.494 4.62m3.557-3.557l-3.557 3.557m3.557-3.557l3.363-3.363m-6.92 6.92L7.56 17.504M17.673 7.39c-.38-.319-.791-.621-1.232-.894C15.2 5.726 13.717 5.19 12 5.19c-4.956 0-7.948 4.459-8.91 6.16c-.11.196-.165.293-.197.446a1.2 1.2 0 0 0 0 .408c.032.152.088.25.198.445c.51.903 1.593 2.582 3.237 3.96c.38.319.791.621 1.232.895m12.18-7.925c.528.694.919 1.328 1.17 1.773c.11.194.165.292.197.444c.023.112.023.296 0 .408c-.032.152-.087.25-.197.444c-.96 1.702-3.95 6.162-8.91 6.162q-.714-.002-1.374-.117"
                        />
                      </svg>
                    ),
                  },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-[9px] p-4 flex items-center"
                  >
                    <div
                      className={`w-[53px] h-[58px] ${stat.color} rounded-lg mr-4 flex items-center justify-center text-2xl`}
                    >
                      {stat.icon}
                    </div>
                    <div>
                      <div className="text-xl font-bold mb-2">{stat.count}</div>
                      <div className="text-[11px] text-[#817e7e]">
                        {stat.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Table */}
              <div className="w-full bg-white rounded-xl p-4 overflow-x-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Recent</h3>
                  <a
                    href="/dashboard/property"
                    className="text-[#f2a3f0] text-[17px] font-medium"
                  >
                    View All
                  </a>
                </div>
                <div className="overflow-x-auto">
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
                        <th className="pb-2 font-bold">Building ID</th>
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
                        Array.from({ length: 3 }).map((_, index) => (
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
                      ) : recentInsurances.length > 0 ? (
                        recentInsurances.map((item, index) => (
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
                                className={`px-2.5 py-1.5 rounded-md text-white text-[15px] font-medium capitalize ${
                                  item.status === "active"
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
                              <p className="font-medium">No recent insurance policies</p>
                              <p className="text-sm">Your insurance policies will appear here once you have some.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="w-[300px] space-y-6 p-4 hidden lg:block">
            {/* Collaboration */}
            <div className="bg-white rounded-xl p-4">
              <div className="flex border-b pb-2 justify-between items-center mb-4">
                <h3 className="text-[19px] font-bold">Collaboration</h3>
                <a href="#" className="text-[#2b172b] text-base">
                  View All
                </a>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full mr-2">
                    <svg
                      width="29"
                      height="29"
                      viewBox="0 0 29 29"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14.5 2C7.59625 2 2 7.59625 2 14.5C2 21.4037 7.59625 27 14.5 27C21.4037 27 27 21.4037 27 14.5C27 7.59625 21.4037 2 14.5 2Z"
                        stroke="#827E7E"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4.83789 22.4327C4.83789 22.4327 7.62414 18.8752 14.4991 18.8752C21.3741 18.8752 24.1616 22.4327 24.1616 22.4327M14.4991 14.5002C15.4937 14.5002 16.4475 14.1051 17.1508 13.4018C17.8541 12.6986 18.2491 11.7447 18.2491 10.7502C18.2491 9.75562 17.8541 8.80179 17.1508 8.09853C16.4475 7.39527 15.4937 7.00018 14.4991 7.00018C13.5046 7.00018 12.5508 7.39527 11.8475 8.09853C11.1442 8.80179 10.7491 9.75562 10.7491 10.7502C10.7491 11.7447 11.1442 12.6986 11.8475 13.4018C12.5508 14.1051 13.5046 14.5002 14.4991 14.5002Z"
                        stroke="#827E7E"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[15px] font-bold">Paul Blessing</div>
                    <div className="text-[13px]">pblessing731@gmail.com</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full mr-2">
                    <svg
                      width="29"
                      height="29"
                      viewBox="0 0 29 29"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14.5 2C7.59625 2 2 7.59625 2 14.5C2 21.4037 7.59625 27 14.5 27C21.4037 27 27 21.4037 27 14.5C27 7.59625 21.4037 2 14.5 2Z"
                        stroke="#827E7E"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4.83789 22.4327C4.83789 22.4327 7.62414 18.8752 14.4991 18.8752C21.3741 18.8752 24.1616 22.4327 24.1616 22.4327M14.4991 14.5002C15.4937 14.5002 16.4475 14.1051 17.1508 13.4018C17.8541 12.6986 18.2491 11.7447 18.2491 10.7502C18.2491 9.75562 17.8541 8.80179 17.1508 8.09853C16.4475 7.39527 15.4937 7.00018 14.4991 7.00018C13.5046 7.00018 12.5508 7.39527 11.8475 8.09853C11.1442 8.80179 10.7491 9.75562 10.7491 10.7502C10.7491 11.7447 11.1442 12.6986 11.8475 13.4018C12.5508 14.1051 13.5046 14.5002 14.4991 14.5002Z"
                        stroke="#827E7E"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[15px] font-bold">
                      Emmanuel Semako
                    </div>
                    <div className="text-[13px]">emmasemako@gmail.com</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl p-4 h-full flex flex-col">
              <div className="flex border-b pb-2 justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Notifications</h3>
                <a href="#" className="text-[#2b172b] text-base">
                  View All
                </a>
              </div>
              <div className="space-y-4 flex-grow overflow-y-auto">
                <div className="border-b-2 border-dashed pb-2">
                  <div className="text-[17px] font-bold">
                    Insurance Renewal
                  </div>
                  <div className="text-xs">
                    A building with the ID: A012D30 just made a payment on
                    23rd of sept 2024.
                  </div>
                </div>
                <div className="border-b-2 border-dashed pb-2">
                  <div className="text-[17px] font-bold">
                    Expired Insurance
                  </div>
                  <div className="text-xs">
                    A building with the ID: A015D30 just expired 27th of sept
                    2024
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      
      <AddNewProperty
        isOpen={showAddNewProperty}
        onClose={() => setShowAddNewProperty(false)}
      />
      <PolicyRequestForm
        isOpen={showPolicyRequest}
        onClose={() => setShowPolicyRequest(false)}
        onSubmit={handlePolicyRequest}
      />
    </>
  );
};

export default Dashview;
