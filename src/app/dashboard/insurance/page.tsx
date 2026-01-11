"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Filter, X, Plus, Building, Shield, Home } from "lucide-react";
import InsuranceSidebar from "@/components/dashboard/usersComponent/InsuranceSidebar";
import { BuilderLiabilityPolicyList } from "@/components/builderLiability/PolicyList";
import { PolicyFormRouter } from "@/components/dashboard/PolicyFormRouter";
import { getUserPolicyRequests, submitPolicyRequest } from "@/services/api";
import { useAuth } from "@/context/useAuth";
import { getCookie } from "@/utils/cookies";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreatePolicyRequestData } from "@/types/api.types";

// Define proper types instead of using 'any'
interface InsurancePolicy {
  _id: string;
  requestDetails?: {
    coverageType?: string;
  };
  updatedAt?: string;
  status?: 'active' | 'inactive' | 'expired' | 'pending' | 'assigned' | 'submitted';
}

interface FilterState {
  status: string;
  coverageType: string;
  dateFrom: string;
  dateTo: string;
}

interface UserData {
  fullname?: string;
  firstname?: string;
}

type PolicyType = 'builder-liability' | 'property';

const InsurancePage: React.FC = () => {
  const [showInsuranceSidebar, setShowInsuranceSidebar] = useState<boolean>(false);
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [showPolicyFormRouter, setShowPolicyFormRouter] = useState<boolean>(false);
  const [selectedPolicyType, setSelectedPolicyType] = useState<PolicyType | null>(null);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>({
    status: "",
    coverageType: "",
    dateFrom: "",
    dateTo: ""
  });

  // Get user from AuthContext or cookies with proper typing
  const { user } = useAuth();

  const getUserName = (): string => {
    if (user) {
      const userData = user as UserData;
      return userData.fullname || userData.firstname || "User";
    }

    const storedUser = typeof window !== 'undefined' ? getCookie('user') : null;
    if (storedUser) {
      try {
        const userData: UserData = JSON.parse(storedUser);
        return userData.fullname || userData.firstname || "User";
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        return "User";
      }
    }
    return "User";
  };

  const userName = getUserName();
  const nameParts = userName.split(" ");
  const lastName = nameParts[nameParts.length - 1] || "User";

  useEffect(() => {
    const fetchPolicies = async (): Promise<void> => {
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

  const handleNewPolicy = (policyType: PolicyType): void => {
    setSelectedPolicyType(policyType);
    setShowPolicyFormRouter(true);
  };

  const handlePolicyFormClose = (): void => {
    setShowPolicyFormRouter(false);
    setSelectedPolicyType(null);
  };

  const handlePropertyPolicySubmit = async (data: CreatePolicyRequestData): Promise<void> => {
    try {
      await submitPolicyRequest(data);
      // Refresh policies list
      const response = await getUserPolicyRequests("all", 1, 100);
      setPolicies(response.data.policyRequests);
      alert('Property insurance application submitted successfully!');
    } catch (error) {
      console.error('Failed to submit property policy:', error);
      throw error;
    }
  };

  // Filter policies based on search and filters
  const filteredPolicies = policies.filter((policy: InsurancePolicy): boolean => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const searchMatch: boolean = !searchQuery ||
      Boolean(policy._id?.toLowerCase().includes(searchLower)) ||
      Boolean(policy.requestDetails?.coverageType?.toLowerCase().includes(searchLower)) ||
      Boolean(policy.status?.toLowerCase().includes(searchLower));

    // Status filter
    const statusMatch: boolean = !filters.status || policy.status === filters.status;

    // Coverage Type filter
    const coverageMatch: boolean = !filters.coverageType ||
      policy.requestDetails?.coverageType === filters.coverageType;

    // Date range filter
    const dateFromMatch: boolean = !filters.dateFrom ||
      Boolean(policy.updatedAt && new Date(policy.updatedAt) >= new Date(filters.dateFrom));
    const dateToMatch: boolean = !filters.dateTo ||
      Boolean(policy.updatedAt && new Date(policy.updatedAt) <= new Date(filters.dateTo));

    return searchMatch && statusMatch && coverageMatch && dateFromMatch && dateToMatch;
  });

  const clearFilters = (): void => {
    setFilters({
      status: "",
      coverageType: "",
      dateFrom: "",
      dateTo: ""
    });
    setSearchQuery("");
  };

  const hasActiveFilters: boolean = Boolean(searchQuery) || Object.values(filters).some(v => v !== "");

  const getStatusBadgeClass = (status?: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'assigned':
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusColor = (status?: string): string => {
    switch (status) {
      case "active":
        return "bg-[#028835]";
      case "inactive":
      case "expired":
        return "bg-[#2a2a29]";
      case "pending":
      case "assigned":
        return "bg-[#ffc52b]";
      default:
        return "bg-[#bd2721]";
    }
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
              Comprehensive insurance solutions for builders and property owners.
            </div>
            <div className="text-white text-xs sm:text-sm md:text-base lg:text-[13px] font-semibold">
              We have you covered for all Builder Liability insurance need.
            </div>
          </div>
          <div className="absolute lg:mb-12 right-2 sm:right-4 bottom-2 sm:bottom-4">
            <button
              onClick={() => setActiveTab('new-policy')}
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
              New Policy
            </button>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <main className="flex-1 px-4 sm:px-8 pb-8 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="builder-liability">Builder Liability</TabsTrigger>
            <TabsTrigger value="new-policy">New Policy</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{policies.filter(p => p.status === 'active').length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{policies.filter(p => ['pending', 'submitted', 'assigned'].includes(p.status || '')).length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{policies.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Policy Activity</CardTitle>
                <CardDescription>Your latest insurance policy updates</CardDescription>
              </CardHeader>
              <CardContent>
                {policies.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No policies yet</h3>
                    <p className="text-gray-600 mb-4">Get started by creating your first insurance policy</p>
                    <Button onClick={() => setActiveTab('new-policy')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Policy
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {policies.slice(0, 5).map((policy) => (
                      <div key={policy._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{policy.requestDetails?.coverageType || 'Insurance Policy'}</h4>
                          <p className="text-sm text-gray-600">
                            Updated {policy.updatedAt ? new Date(policy.updatedAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(policy.status)}`}>
                          {policy.status || 'Unknown'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="builder-liability">
            <BuilderLiabilityPolicyList />
          </TabsContent>


          <TabsContent value="new-policy">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Insurance Policy</CardTitle>
                  <CardDescription>Choose the type of insurance policy you want to create</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div
                      className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#028835] transition-colors cursor-pointer"
                      onClick={() => handleNewPolicy('builder-liability')}
                    >
                      <Building className="h-12 w-12 text-[#028835] mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Builder Liability Insurance</h3>
                      <p className="text-gray-600 text-sm">
                        Comprehensive coverage for construction projects and builder liability
                      </p>
                    </div>
              
              

                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Policy Form Router Modal */}
      {showPolicyFormRouter && (
        <PolicyFormRouter
          isOpen={showPolicyFormRouter}
          onClose={handlePolicyFormClose}
          defaultPolicyType={selectedPolicyType}
          onSubmitPropertyPolicy={handlePropertyPolicySubmit}
        />
      )}

      {/* Insurance Sidebar */}
      <InsuranceSidebar
        isOpen={showInsuranceSidebar}
        onClose={() => setShowInsuranceSidebar(false)}
      />
    </>
  );
};

export default InsurancePage;