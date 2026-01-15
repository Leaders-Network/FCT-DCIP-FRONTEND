"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Plus, Building } from "lucide-react";
import InsuranceSidebar from "@/components/dashboard/usersComponent/InsuranceSidebar";
import { BuilderLiabilityPolicyList } from "@/components/builderLiability/PolicyList";
import { PolicyFormRouter } from "@/components/dashboard/PolicyFormRouter";
import { useAuth } from "@/context/useAuth";
import { getCookie } from "@/utils/cookies";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserData {
  fullname?: string;
  firstname?: string;
}

type PolicyType = 'builder-liability' | 'property';

const InsurancePage: React.FC = () => {
  const [showInsuranceSidebar, setShowInsuranceSidebar] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("builder-liability");
  const [showPolicyFormRouter, setShowPolicyFormRouter] = useState<boolean>(false);
  const [selectedPolicyType, setSelectedPolicyType] = useState<PolicyType | null>(null);

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

  const handleNewPolicy = (policyType: PolicyType): void => {
    setSelectedPolicyType(policyType);
    setShowPolicyFormRouter(true);
  };

  const handlePolicyFormClose = (): void => {
    setShowPolicyFormRouter(false);
    setSelectedPolicyType(null);
  };

  const handleBuilderLiabilityPolicyCreated = (): void => {
    // Switch to the Builder Liability tab to show the new policy
    setActiveTab('builder-liability');
    // The BuilderLiabilityPolicyList component will automatically fetch and display the new policy
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
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="builder-liability">Builder Liability</TabsTrigger>
            <TabsTrigger value="new-policy">New Policy</TabsTrigger>
          </TabsList>

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
          onPolicyCreated={handleBuilderLiabilityPolicyCreated}
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