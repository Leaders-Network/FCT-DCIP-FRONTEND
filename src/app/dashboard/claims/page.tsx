"use client";

import React, { useState } from "react";
import { Plus, FileText, AlertCircle, Sparkles } from "lucide-react";
import { ClaimsList } from "@/components/user/ClaimsList";
import ClaimSubmissionForm from "@/components/user/ClaimSubmissionForm";
import { useAuth } from "@/context/useAuth";
import type { ClaimRequest } from "@/types/claims";

export default function ClaimsPage() {
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user } = useAuth();

  const handleSubmissionSuccess = (_claim: ClaimRequest) => {
    setShowSubmissionForm(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCancel = () => {
    setShowSubmissionForm(false);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50/30 to-cyan-50/20 px-4">
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold text-slate-900">Authentication Required</h2>
          <p className="text-sm text-slate-600">Please log in to view your claims.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-[#015a23] via-[#028835] to-emerald-500 p-6 text-white shadow-[0_24px_80px_rgba(5,150,105,0.22)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_36%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-50">
              <Sparkles className="h-3.5 w-3.5" />
              Claims center
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Insurance Claims</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/90 sm:text-base">
              Submit and track claims for Builder Liability policies in a clearer, more modern flow.
            </p>
          </div>
          {!showSubmissionForm && (
            <button
              onClick={() => setShowSubmissionForm(true)}
              className="inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/15 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#028835] shadow-sm">
                <Plus className="h-5 w-5" />
              </span>
              Submit New Claim
            </button>
          )}
        </div>
      </div>

      {showSubmissionForm ? (
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6">
          <ClaimSubmissionForm
            userId={user._id}
            onSubmitSuccess={handleSubmissionSuccess}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Your Claims</h2>
                <p className="text-sm text-slate-500">View and track the status of your insurance claims.</p>
              </div>
            </div>

            <ClaimsList refreshTrigger={refreshTrigger} />
          </div>

          <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50/80 p-6 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold text-emerald-900">Need Help with Claims?</h3>
            <div className="space-y-2 text-sm leading-6 text-emerald-800">
              <p>Claims can only be submitted for completed Builder Liability policies.</p>
              <p>Provide detailed information about the incident or damage.</p>
              <p>Upload supporting documents to speed up processing.</p>
              <p>Claims are reviewed by our broker admin team within 2-3 business days.</p>
              <p>You’ll receive notifications about claim status updates.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
