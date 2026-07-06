"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock3, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { BuilderLiabilityPolicyForm } from "@/components/builderLiability/PolicyForm";

export default function NewBuilderLiabilityPolicyPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/dashboard/insurance");
  };

  const handleSuccess = (policyId: string) => {
    toast.success(
      policyId
        ? `Builder Liability Policy ${policyId} submitted successfully.`
        : "Builder Liability Policy submitted successfully."
    );
    router.push("/dashboard/insurance");
  };

  return (
    <div className="mx-auto w-full max-w-6xl min-w-0 space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Insurance
        </button>
        <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
          New Policy Application
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-[#015a23] via-[#028835] to-emerald-500 p-6 text-white shadow-[0_24px_80px_rgba(5,150,105,0.22)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_36%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-50">
              <Sparkles className="h-3.5 w-3.5" />
              Dedicated workflow
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Builder Liability Policy Application
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/90 sm:text-base">
              Complete the application in a standalone page with autosave, validation, and a calmer step-by-step experience.
            </p>
          </div>
          <div className="grid gap-2 text-sm text-emerald-50/90">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2">
              <ShieldCheck className="h-4 w-4" />
              Full-page form
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2">
              <Clock3 className="h-4 w-4" />
              Renewals available near expiry
            </div>
          </div>
        </div>
      </div>

      <BuilderLiabilityPolicyForm onSuccess={handleSuccess} onCancel={handleBack} />
    </div>
  );
}
