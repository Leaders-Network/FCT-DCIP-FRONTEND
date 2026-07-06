"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles, ArrowRight, ShieldAlert, Clock3 } from "lucide-react";
import { BuilderLiabilityPolicyList } from "@/components/builderLiability/PolicyList";
import { useAuth } from "@/context/useAuth";
import { getCookie } from "@/utils/cookies";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserData {
  fullname?: string;
  firstname?: string;
}

const InsurancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("builder-liability");
  const router = useRouter();
  const { user } = useAuth();

  const getUserName = (): string => {
    if (user) {
      const userData = user as UserData;
      return userData.fullname || userData.firstname || "User";
    }

    const storedUser = typeof window !== "undefined" ? getCookie("user") : null;
    if (storedUser) {
      try {
        const userData: UserData = JSON.parse(storedUser);
        return userData.fullname || userData.firstname || "User";
      } catch {
        return "User";
      }
    }

    return "User";
  };

  const userName = getUserName();
  const nameParts = userName.split(" ");
  const lastName = nameParts[nameParts.length - 1] || "User";

  const handleOpenNewPolicyPage = (): void => {
    router.push("/dashboard/insurance/new");
  };

  return (
    <>
      <div className="space-y-6 px-4 py-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-[#015a23] via-[#028835] to-emerald-500 p-6 text-white shadow-[0_24px_80px_rgba(5,150,105,0.22)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_36%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-50">
                <Sparkles className="h-3.5 w-3.5" />
                Insurance center
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Hello {lastName}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/90 sm:text-base">
                Manage Builder Liability policies, start new applications, and keep your coverage journey in one modern workspace.
              </p>
            </div>

            <button
              onClick={handleOpenNewPolicyPage}
              className="inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/15 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#028835] shadow-sm">
                <Plus className="h-5 w-5" />
              </span>
              New Policy
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-slate-100/90 h-[3.5rem]">
              <TabsTrigger
                value="builder-liability"
                className="rounded-2xl py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-[#028835] data-[state=active]:shadow-sm"
              >
                Builder Liability
              </TabsTrigger>
              <TabsTrigger
                value="new-policy"
                className="rounded-2xl py-3 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-[#028835] data-[state=active]:shadow-sm"
              >
                New Policy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="builder-liability" className="mt-6">
              <div className="overflow-visible rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                <div className="p-5 sm:p-7 lg:p-10">
                  <BuilderLiabilityPolicyList />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="new-policy" className="mt-6">
              <Card className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                <CardHeader className="border-b border-slate-100 bg-slate-50/80">
                  <CardTitle className="text-xl text-slate-900">
                    Open the dedicated application page
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    Builder Liability applications now use a standalone page for a cleaner, full-screen workflow.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50/80 p-5">
                      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                        <ShieldAlert className="h-4 w-4" />
                        Full-page application
                      </div>
                      <p className="mt-3 text-sm leading-6 text-emerald-800/90">
                        Complete the Builder Liability policy application in a dedicated page with autosave, validation, and a calmer workflow.
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <Clock3 className="h-4 w-4" />
                        Renewal timing
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        Renewals are only available when a paid policy is close to expiry, so the current page focuses on fresh applications.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenNewPolicyPage}
                    className="inline-flex items-center gap-3 rounded-2xl bg-[#028835] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200/60 transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4" />
                    Start Builder Liability Application
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default InsurancePage;
