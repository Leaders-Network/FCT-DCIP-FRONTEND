"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SurveySubmissionForm from "@/components/surveyor/SurveySubmissionForm";
import { PolicyRequest, SurveySubmission } from "@/types/api.types";

interface SurveyPageProps {
  params: {
    id: string;
  };
}

export default function SurveyPage({ params }: SurveyPageProps) {
  const [policy, setPolicy] = useState<PolicyRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPolicy = async () => {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockPolicy: PolicyRequest = {
        _id: params.id,
        userId: "user1",
        propertyDetails: {
          address: "123 Main St, Wuse 2, Abuja, FCT",
          propertyType: "Residential House",
          buildingValue: 50000000,
          yearBuilt: 2020,
          squareFootage: 2500,
          constructionMaterial: "Concrete Block"
        },
        contactDetails: {
          fullName: "John Doe",
          email: "john.doe@email.com",
          phoneNumber: "+234 801 234 5678",
          alternatePhone: "+234 802 345 6789"
        },
        requestDetails: {
          coverageType: "Comprehensive Coverage",
          policyDuration: "2 Years",
          additionalCoverage: ["Flood Coverage", "Theft Protection"],
          specialRequests: "Property has a swimming pool and garage. Please inspect both areas thoroughly."
        },
        status: "assigned",
        assignedSurveyors: ["current_surveyor_id"],
        createdAt: "2024-10-01T10:00:00Z",
        updatedAt: "2024-10-01T10:00:00Z"
      };

      setPolicy(mockPolicy);
      setLoading(false);
    };

    fetchPolicy();
  }, [params.id]);

  const handleSurveySubmission = async (submission: SurveySubmission) => {
    try {
      // TODO: Call actual API
      console.log("Survey submission:", submission);
      alert("Survey submitted successfully!");
      router.push("/surveyor/dashboard/assignments");
    } catch (error) {
      console.error("Failed to submit survey:", error);
      throw error;
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Policy not found</h2>
          <p className="text-gray-600 mt-2">The policy you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <SurveySubmissionForm
        policy={policy}
        onSubmit={handleSurveySubmission}
        onCancel={handleCancel}
      />
    </div>
  );
}