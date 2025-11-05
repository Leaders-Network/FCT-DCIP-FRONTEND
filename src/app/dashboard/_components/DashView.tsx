"use client";
import React, { useState, useEffect } from "react";
import PolicyRequestForm from "@/components/dashboard/PolicyRequestForm";
import ReportSection from "@/components/dashboard/ReportSection";
import MergedReportsSummary from "@/components/user/MergedReportsSummary";
import { CreatePolicyRequestData } from "@/types/api.types";
import Image from "next/image";
import { MoreVertical, Download, CreditCard, Eye, FileText } from "lucide-react";
import {
  PROPERTY_TYPES,
  CONSTRUCTION_MATERIALS,
  COVERAGE_TYPES,
  POLICY_DURATIONS
} from "@/constants/policyConstants";

const Dashview = () => {
  const [showPolicyRequest, setShowPolicyRequest] = useState(false);
  const [stats, setStats] = useState({
    active: 0,
    expired: 0,
    pending: 0,
    collaborators: 0
  });
  const [recentInsurances, setRecentInsurances] = useState<any[]>([]);
  const [surveyedPolicies, setSurveyedPolicies] = useState<any[]>([]);
  const [allPolicies, setAllPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'reports'>('overview');

  // Get user name from local storage
  const userName = typeof window !== 'undefined' ? localStorage.getItem("fullname") : null;
  const nameParts = userName?.split(" ") ?? [];
  const lastName = nameParts[nameParts.length - 1] || "User";

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token") || localStorage.getItem("authToken");
        if (!token) {
          // Not logged in, set empty state
          setStats({ active: 0, expired: 0, pending: 0, collaborators: 0 });
          setRecentInsurances([]);
          setSurveyedPolicies([]);
          setLoading(false);
          return;
        }

        const { getUserPolicyRequests } = await import("@/services/api");

        // Fetch all policy requests to calculate stats
        const [allPolicies, approvedPolicies, rejectedPolicies, pendingPolicies, surveyedPolicies] = await Promise.all([
          getUserPolicyRequests('all', 1, 100),
          getUserPolicyRequests('approved', 1, 100),
          getUserPolicyRequests('rejected', 1, 100),
          getUserPolicyRequests('submitted', 1, 100),
          getUserPolicyRequests('surveyed', 1, 100)
        ]);

        // Calculate collaborators from all policies
        const allPolicyData = allPolicies?.data?.policyRequests || [];
        const assignedPolicies = allPolicyData.filter((p: any) => p.status === 'assigned' || p.status === 'surveyed');
        const collaborators = assignedPolicies.length; // Simple count of policies with surveyors

        // Update stats
        setStats({
          active: approvedPolicies?.data?.policyRequests?.length || 0,
          expired: rejectedPolicies?.data?.policyRequests?.length || 0,
          pending: pendingPolicies?.data?.policyRequests?.length || 0,
          collaborators: collaborators
        });

        // Set recent insurances (first 5 items from all policies)
        setRecentInsurances(allPolicies?.data?.policyRequests?.slice(0, 5) || []);

        // Store all policies for report section
        setAllPolicies(allPolicyData);

        // Combine surveyed and approved policies for the "Surveyed Policies" table
        const surveyedData = surveyedPolicies?.data?.policyRequests || [];
        const approvedData = approvedPolicies?.data?.policyRequests || [];
        const combinedSurveyedPolicies = [...surveyedData, ...approvedData];
        setSurveyedPolicies(combinedSurveyedPolicies);

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

        </div>

        {/* Section Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveSection('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeSection === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Dashboard Overview
            </button>
            <button
              onClick={() => setActiveSection('reports')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeSection === 'reports'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Assessment Reports
            </button>
          </nav>
        </div>

        {/* Main Content and Right Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <main className="flex-1 pb-8 overflow-y-auto">
            {activeSection === 'overview' && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    {
                      title: "Approved Policies",
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
                      title: "Rejected Policies",
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
                      title: "Pending Policies",
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
                      title: "Assigned Policies",
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
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.75"
                            d="m3.282 21.782l4.278-4.278M21.782 3.282L17.673 7.39m-3.363 3.363a2.64 2.64 0 0 0-1.063-1.063a2.625 2.625 0 1 0-2.494 4.62m3.557-3.557l-3.557 3.557m3.557-3.557l3.363-3.363m-6.92 6.92L7.56 17.504M17.673 7.39c-.38-.319-.791-.621-1.232-.894C15.2 5.726 13.717 5.19 12 5.19c-4.956 0-7.948 4.459-8.91 6.16c-.11.196-.165.293-.197.446a1.2 1.2 0 0 0 0 .408c.032.152.088.25.198.445c.51.903 1.593 2.582 3.237 3.96c.38.319.791.621 1.232.895m12.18-7.925c.528.694.919 1.328 1.17 1.773c.11.194.165.292.197.444c.023.112.023.296 0 .408c-.032.152-.087.25-.197.444c-.96 1.702-3.95 6.162-8.91 6.162q-.714-.002-1.374-.117"
                          />
                        </svg>
                      ),
                    },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-[9px] p-4 flex items-center min-w-0 overflow-hidden"
                    >
                      <div
                        className={`w-[53px] h-[58px] ${stat.color} rounded-lg mr-4 flex items-center justify-center text-2xl flex-shrink-0`}
                      >
                        {stat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xl font-bold mb-2">{stat.count}</div>
                        <div className="text-[11px] text-[#817e7e] truncate">
                          {stat.title}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Merged Reports Summary */}
                <MergedReportsSummary />

                {/* Surveyed Policies Table */}
                <div className="w-full bg-white rounded-xl p-4 overflow-x-auto mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Surveyed Policies</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px]">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="pb-2 font-bold">Name</th>
                          <th className="pb-2 font-bold">Survey Date</th>
                          <th className="pb-2 font-bold">AMMC Policy ID</th>
                          <th className="pb-2 font-bold">Status</th>
                          <th className="pb-2 font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          // Loading state
                          Array.from({ length: 3 }).map((_, index) => (
                            <tr key={index} className="border-b animate-pulse">
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
                                <div className="w-32 h-8 bg-gray-200 rounded"></div>
                              </td>
                            </tr>
                          ))
                        ) : (surveyedPolicies || []).length > 0 ? (
                          (surveyedPolicies || []).map((item, index) => (
                            <tr key={item._id || index} className="border-b">
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
                                  className={`px-2.5 py-1.5 rounded-md text-white text-[15px] font-medium capitalize bg-blue-500`}
                                >
                                  {item.status || "Unknown"}
                                </span>
                              </td>
                              <td className="py-4">
                                <PolicyActionsDropdown policy={item} />
                              </td>
                            </tr>
                          ))
                        ) : (
                          // Empty state
                          <tr className="border-b">
                            <td colSpan={5} className="py-8 text-center text-gray-500">
                              <div className="flex flex-col items-center">
                                <svg className="w-12 h-12 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="font-medium">No surveyed policies</p>
                                <p className="text-sm">Your surveyed policies will appear here.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'reports' && (
              <ReportSection userPolicies={allPolicies} />
            )}
          </main>

          {/* Right Sidebar */}
          <aside className="w-[300px] space-y-6 p-4 hidden lg:block">
            {/* Collaboration */}
            <div className="bg-white rounded-xl p-4">
              <div className="flex border-b pb-2 justify-between items-center mb-4">
                <h3 className="text-[19px] font-bold">Collaboration</h3>
                <button className="text-[#2b172b] text-base hover:text-[#028835]">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentInsurances.slice(0, 2).map((policy, index) => (
                  <div key={policy._id || index} className="flex items-center">
                    <div className="w-8 h-8 rounded-full mr-2 bg-gray-100 flex items-center justify-center">
                      <svg
                        width="20"
                        height="20"
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
                        {policy.contactDetails?.fullName || 'Policy Holder'}
                      </div>
                      <div className="text-[13px] text-gray-500">
                        {policy.contactDetails?.email || 'No email'}
                      </div>
                    </div>
                  </div>
                ))}
                {recentInsurances.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">No collaborations yet</p>
                  </div>
                )}
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

      <PolicyRequestForm
        isOpen={showPolicyRequest}
        onClose={() => setShowPolicyRequest(false)}
        onSubmit={handlePolicyRequest}
      />
    </>
  );
};

// Policy Actions Dropdown Component
interface PolicyActionsDropdownProps {
  policy: any;
}

const PolicyActionsDropdown: React.FC<PolicyActionsDropdownProps> = ({ policy }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [surveyData, setSurveyData] = useState<any>(null);
  const [loadingSurveyData, setLoadingSurveyData] = useState(false);

  // Fetch survey data when dropdown opens
  useEffect(() => {
    if (showDropdown && !surveyData && !loadingSurveyData) {
      fetchSurveyData();
    }
  }, [showDropdown]);

  const fetchSurveyData = async () => {
    setLoadingSurveyData(true);
    try {
      console.log('Fetching survey data for policy:', policy._id);
      console.log('Policy status:', policy.status);

      const { getUserAssignmentByAmmcId } = await import('@/services/api');
      const assignmentResponse = await getUserAssignmentByAmmcId(policy._id);
      console.log('Assignment response:', assignmentResponse);

      if (assignmentResponse.success && assignmentResponse.data) {
        const assignment = assignmentResponse.data;
        console.log('Assignment data:', assignment);

        const { getSubmissionByAssignment } = await import('@/services/api');
        const surveyResponse = await getSubmissionByAssignment(assignment._id);
        console.log('Survey response:', surveyResponse);

        if (surveyResponse.success && surveyResponse.data.submission) {
          console.log('Survey data loaded:', surveyResponse.data.submission);
          setSurveyData(surveyResponse.data.submission);
        } else {
          console.log('No survey submission found');
        }
      } else {
        console.log('No assignment found for policy');
      }
    } catch (error) {
      console.error('Failed to fetch survey data:', error);
    } finally {
      setLoadingSurveyData(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showDropdown && !target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const handleInsuranceClick = () => {
    console.log('Insurance click - Policy status:', policy.status);
    console.log('Insurance click - Survey data:', surveyData);
    console.log('Insurance click - Recommended action:', surveyData?.recommendedAction);

    // If policy is already approved (admin approved), allow insurance regardless of survey recommendation
    if (policy.status === 'approved') {
      window.open('https://askniid.org/verifypolicy.aspx', '_blank');
      return;
    }

    // For surveyed policies, check the surveyor's recommendation
    if (surveyData?.recommendedAction === 'reject') {
      alert('❌ Insurance Disabled\n\nThis policy request has been rejected by the surveyor. Please review the survey report for details on why the policy was rejected.');
      return;
    }

    if (surveyData?.recommendedAction === 'request_more_info') {
      alert('⚠️ Insurance Disabled\n\nThe surveyor has requested additional information for this policy. Please edit and resubmit your policy request with the required information before proceeding to insurance.');
      return;
    }

    // If we have survey data and surveyor approved, allow insurance
    if (surveyData?.recommendedAction === 'approve') {
      window.open('https://niip.ng/', '_blank');
      return;
    }

    // Fallback: If no survey data but policy is surveyed, assume it's approved
    if (policy.status === 'surveyed' && !surveyData) {
      console.log('No survey data found, but policy is surveyed - allowing insurance');
      window.open('https://niip.ng/', '_blank');
      return;
    }

    // Default case
    alert('⚠️ Insurance Not Available\n\nInsurance is not available for this policy at this time. Please check the policy status.');
  };

  return (
    <div className="relative dropdown-container">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border">
          <div className="py-1">
            {/* Always show survey details */}
            <button
              onClick={() => {
                setShowSurveyModal(true);
                setShowDropdown(false);
              }}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              <Eye className="mr-3 h-4 w-4" />
              View Survey Details
            </button>

            {/* Always show survey document download if available */}
            {policy.surveyDocument && (
              <a
                href={policy.surveyDocument}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowDropdown(false)}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <Download className="mr-3 h-4 w-4" />
                Download Survey Report
              </a>
            )}

            {/* Conditional actions based on surveyor recommendation */}
            {loadingSurveyData ? (
              <div className="flex items-center px-4 py-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-3"></div>
                Loading...
              </div>
            ) : (
              <>
                {/* Insurance button - conditional based on recommendation */}
                <button
                  onClick={() => {
                    handleInsuranceClick();
                    setShowDropdown(false);
                  }}
                  className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                    // Enable if: approved by admin, approved by surveyor, or surveyed without explicit rejection
                    (policy.status === 'approved' ||
                      surveyData?.recommendedAction === 'approve' ||
                      (policy.status === 'surveyed' && !surveyData) ||
                      (policy.status === 'surveyed' && loadingSurveyData))
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-400 cursor-not-allowed'
                    }`}
                  disabled={
                    // Disable only if: explicitly rejected or explicitly requesting more info
                    surveyData?.recommendedAction === 'reject' ||
                    surveyData?.recommendedAction === 'request_more_info'
                  }
                >
                  <CreditCard className="mr-3 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>Proceed to Insure</span>
                    {policy.status === 'approved' && (
                      <span className="text-xs text-green-500">Policy Approved</span>
                    )}
                    {surveyData?.recommendedAction === 'approve' && policy.status !== 'approved' && (
                      <span className="text-xs text-blue-500">Survey Approved</span>
                    )}
                    {policy.status === 'surveyed' && !surveyData && !loadingSurveyData && (
                      <span className="text-xs text-green-500">Survey Completed</span>
                    )}
                    {loadingSurveyData && (
                      <span className="text-xs text-gray-500">Loading...</span>
                    )}
                    {surveyData?.recommendedAction === 'reject' && (
                      <span className="text-xs text-red-500">Policy Rejected</span>
                    )}
                    {surveyData?.recommendedAction === 'request_more_info' && (
                      <span className="text-xs text-orange-500">More Info Required</span>
                    )}
                  </div>
                </button>

                {/* Edit Policy - only show if more info is requested */}
                {surveyData?.recommendedAction === 'request_more_info' && (
                  <button
                    onClick={() => {
                      setShowEditModal(true);
                      setShowDropdown(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 w-full text-left"
                  >
                    <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <div className="flex flex-col">
                      <span>Edit Policy Request</span>
                      <span className="text-xs text-gray-500">Update & Resubmit</span>
                    </div>
                  </button>
                )}

                {/* Certificate download - for approved or surveyed policies */}
                {(surveyData?.recommendedAction === 'approve' ||
                  policy.status === 'approved' ||
                  (policy.status === 'surveyed' && surveyData?.recommendedAction !== 'reject' && surveyData?.recommendedAction !== 'request_more_info')) && (
                    <button
                      onClick={() => {
                        // Handle policy certificate download
                        setShowDropdown(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <FileText className="mr-3 h-4 w-4" />
                      Download Certificate
                    </button>
                  )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Survey Details Modal */}
      {showSurveyModal && (
        <SurveyDetailsModal
          policy={policy}
          onClose={() => setShowSurveyModal(false)}
        />
      )}

      {/* Edit Policy Modal */}
      {showEditModal && (
        <EditPolicyModal
          policy={policy}
          surveyData={surveyData}
          onClose={() => setShowEditModal(false)}
          onUpdate={() => {
            setShowEditModal(false);
            // Refresh the page or update the policy list
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

// Survey Details Modal Component
interface SurveyDetailsModalProps {
  policy: any;
  onClose: () => void;
}

const SurveyDetailsModal: React.FC<SurveyDetailsModalProps> = ({ policy, onClose }) => {
  const [surveyData, setSurveyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        // Get assignment for this policy
        const { getUserAssignmentByAmmcId } = await import('@/services/api');
        const assignmentResponse = await getUserAssignmentByAmmcId(policy._id);

        if (assignmentResponse.success && assignmentResponse.data) {
          const assignment = assignmentResponse.data;

          // Get survey submission
          const { getSubmissionByAssignment } = await import('@/services/api');
          const surveyResponse = await getSubmissionByAssignment(assignment._id);
          if (surveyResponse.success && surveyResponse.data.submission) {
            setSurveyData(surveyResponse.data.submission);
          }
        }
      } catch (error) {
        console.error('Failed to fetch survey data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyData();
  }, [policy._id]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Survey Details</h3>
              <p className="text-sm text-gray-500 mt-1">
                Policy #{policy._id?.substring(0, 8).toUpperCase()} • {policy.propertyDetails?.propertyType}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 bg-white overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading survey details...</p>
            </div>
          ) : !surveyData ? (
            <div className="text-center py-8 text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Survey details not available</p>
              <p className="text-sm">Unable to load survey information for this policy.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Property Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Property Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium text-gray-900">{policy.propertyDetails?.propertyType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Value:</span>
                      <span className="font-medium text-gray-900">₦{policy.propertyDetails?.buildingValue?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium text-gray-900 text-right">{policy.propertyDetails?.address}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Survey Results</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium px-2 py-1 rounded text-xs ${policy.status === 'surveyed' ? 'bg-blue-100 text-blue-800' :
                        policy.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {policy.status?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recommendation:</span>
                      <span className={`font-medium px-2 py-1 rounded text-xs ${surveyData.recommendedAction === 'approve' ? 'bg-green-100 text-green-800' :
                        surveyData.recommendedAction === 'reject' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                        {surveyData.recommendedAction === 'approve' && '✅ Approved'}
                        {surveyData.recommendedAction === 'reject' && '❌ Rejected'}
                        {surveyData.recommendedAction === 'request_more_info' && '📋 More Info Needed'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Survey Assessment */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Property Condition</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      {surveyData.surveyDetails?.propertyCondition || 'No assessment provided'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Structural Assessment</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      {surveyData.surveyDetails?.structuralAssessment || 'No assessment provided'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Risk Factors</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      {surveyData.surveyDetails?.riskFactors || 'No risk factors identified'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      {surveyData.surveyDetails?.recommendations || 'No recommendations provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Survey Notes */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Additional Survey Notes</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {surveyData.surveyNotes || 'No additional notes provided'}
                  </p>
                </div>
              </div>

              {/* Survey Document */}
              {surveyData.surveyDocument && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-6 w-6 text-blue-600 mr-3" />
                      <div>
                        <h5 className="font-medium text-blue-900">Survey Report</h5>
                        <p className="text-sm text-blue-700">Complete survey document (PDF)</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={surveyData.surveyDocument}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        View PDF
                      </a>
                      <a
                        href={surveyData.surveyDocument}
                        download
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Policy Modal Component
interface EditPolicyModalProps {
  policy: any;
  surveyData: any;
  onClose: () => void;
  onUpdate: () => void;
}

const EditPolicyModal: React.FC<EditPolicyModalProps> = ({ policy, surveyData, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    propertyDetails: {
      propertyType: policy.propertyDetails?.propertyType || '',
      address: policy.propertyDetails?.address || '',
      buildingValue: policy.propertyDetails?.buildingValue || 0,
      yearBuilt: policy.propertyDetails?.yearBuilt || '',
      squareFootage: policy.propertyDetails?.squareFootage || 0,
      constructionMaterial: policy.propertyDetails?.constructionMaterial || ''
    },
    contactDetails: {
      fullName: policy.contactDetails?.fullName || '',
      email: localStorage.getItem("email") || '',
      phoneNumber: policy.contactDetails?.phoneNumber || '',
      alternatePhone: policy.contactDetails?.alternatePhone || '',
      rcNumber: policy.contactDetails?.rcNumber || ''
    },
    requestDetails: {
      coverageType: policy.requestDetails?.coverageType || '',
      policyDuration: policy.requestDetails?.policyDuration || '',
      additionalCoverage: policy.requestDetails?.additionalCoverage || [],
      specialRequests: policy.requestDetails?.specialRequests || ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const api = await import('@/services/api');
      await api.updatePolicyRequest(policy._id, formData);
      alert('Policy request updated successfully! It will be reassigned for survey.');
      onUpdate();
    } catch (error) {
      console.error('Failed to update policy:', error);
      alert('Failed to update policy request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Edit Policy Request</h3>
              <p className="text-sm text-gray-500 mt-1">
                Update your policy information based on surveyor feedback
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Surveyor Feedback */}
          {surveyData && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">Surveyor Feedback</h4>
              <p className="text-sm text-orange-800 mb-2">
                <strong>Recommendation:</strong> {surveyData.recommendedAction === 'request_more_info' ? 'Additional Information Required' : surveyData.recommendedAction}
              </p>
              {surveyData.surveyNotes && (
                <p className="text-sm text-orange-800">
                  <strong>Notes:</strong> {surveyData.surveyNotes}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="p-6 bg-white overflow-y-auto flex-1">
              <div className="space-y-6">
                {/* Property Details */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Property Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                      <select
                        value={formData.propertyDetails.propertyType}
                        onChange={(e) => handleInputChange('propertyDetails', 'propertyType', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select property type</option>
                        {PROPERTY_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Building Value (₦)</label>
                      <input
                        type="number"
                        value={formData.propertyDetails.buildingValue}
                        onChange={(e) => handleInputChange('propertyDetails', 'buildingValue', Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Property Address</label>
                      <textarea
                        value={formData.propertyDetails.address}
                        onChange={(e) => handleInputChange('propertyDetails', 'address', e.target.value)}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                      <input
                        type="number"
                        value={formData.propertyDetails.yearBuilt}
                        onChange={(e) => handleInputChange('propertyDetails', 'yearBuilt', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Square Footage</label>
                      <input
                        type="number"
                        value={formData.propertyDetails.squareFootage}
                        onChange={(e) => handleInputChange('propertyDetails', 'squareFootage', Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Construction Material</label>
                      <select
                        value={formData.propertyDetails.constructionMaterial}
                        onChange={(e) => handleInputChange('propertyDetails', 'constructionMaterial', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select material</option>
                        {CONSTRUCTION_MATERIALS.map((material) => (
                          <option key={material} value={material}>
                            {material}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name of Builder/Contractor</label>
                      <input
                        type="text"
                        value={formData.contactDetails.fullName}
                        onChange={(e) => handleInputChange('contactDetails', 'fullName', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                        <span className="text-xs text-green-600 ml-2">(Auto-filled from your account)</span>
                      </label>
                      <input
                        type="email"
                        value={formData.contactDetails.email}
                        readOnly
                        disabled
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-700 cursor-not-allowed"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This email is automatically filled from your account and cannot be changed.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.contactDetails.phoneNumber}
                        onChange={(e) => handleInputChange('contactDetails', 'phoneNumber', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone</label>
                      <input
                        type="tel"
                        value={formData.contactDetails.alternatePhone}
                        onChange={(e) => handleInputChange('contactDetails', 'alternatePhone', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">RC Number *</label>
                      <input
                        type="text"
                        value={formData.contactDetails.rcNumber}
                        onChange={(e) => handleInputChange('contactDetails', 'rcNumber', e.target.value.toUpperCase())}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        style={{ textTransform: 'uppercase' }}
                        placeholder="RC123456"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter your company's Registration Certificate number
                      </p>
                    </div>
                  </div>
                </div>

                {/* Coverage Details */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Coverage Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Type</label>
                      <select
                        value={formData.requestDetails.coverageType}
                        onChange={(e) => handleInputChange('requestDetails', 'coverageType', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select coverage type</option>
                        {COVERAGE_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Policy Duration</label>
                      <select
                        value={formData.requestDetails.policyDuration}
                        onChange={(e) => handleInputChange('requestDetails', 'policyDuration', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select duration</option>
                        {POLICY_DURATIONS.map((duration) => (
                          <option key={duration} value={duration}>
                            {duration}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                      <textarea
                        value={formData.requestDetails.specialRequests}
                        onChange={(e) => handleInputChange('requestDetails', 'specialRequests', e.target.value)}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Any special requirements or additional information..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer - Now inside form */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Your updated policy will be reassigned for a new survey.
                </p>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                    {loading ? 'Updating...' : 'Update & Resubmit'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashview;
