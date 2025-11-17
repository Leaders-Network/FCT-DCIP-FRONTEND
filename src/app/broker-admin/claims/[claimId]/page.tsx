"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { brokerAdminAPI } from "@/services/api";
import { FileText, ArrowLeft } from "lucide-react";
import type { BrokerPolicyRequest } from "@/types/api.types";

export default function BrokerClaimDetailPageClient() {
  const params = useParams();
  const router = useRouter();
  const claimId = params?.claimId as string | undefined;

  const [claim, setClaim] = useState<BrokerPolicyRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!claimId) return;
    const fetchClaim = async () => {
      setLoading(true);
      try {
        const res = await brokerAdminAPI.getClaimById(claimId);
        if (res?.success && res?.claim) {
          setClaim(res.claim);
        } else {
          setError("Failed to load claim");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load claim");
      } finally {
        setLoading(false);
      }
    };

    fetchClaim();
  }, [claimId]);

  if (!claimId) {
    return (
      <div className="p-8">
        <p className="text-sm text-gray-600">No claimId provided in route.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center mb-6 text-sm text-indigo-600 hover:text-indigo-900"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      {!claim && error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">{error}</div>
      )}

      {!claim && !error && (
        <div className="text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Claim not found</p>
        </div>
      )}

      {claim && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Claim {claim._id}</h2>
          <div className="text-sm text-gray-600 mb-4">Policy: {claim.policyNumber}</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Property</h3>
              <div className="text-sm text-gray-900">{claim.propertyDetails.address}</div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700">Contact</h3>
              <div className="text-sm text-gray-900">{claim.contactDetails.fullName}</div>
              <div className="text-xs text-gray-500">{claim.contactDetails.email}</div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700">Status</h3>
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {(claim.brokerStatus || 'pending').replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
