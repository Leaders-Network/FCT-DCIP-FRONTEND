"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Shield,
  CheckCircle,
  Eye,
  User,
  MapPin,
  DollarSign,
  RefreshCw,
  CreditCard,
  Search,
  X,
  Building,
  Calendar,
  FileText,
} from "lucide-react";
import { adminEnforcementAPI } from "@/services/api";
import type { BuilderLiabilityPolicy } from "@/types/builderLiabilityPolicy.types";
import { getProjectEstimateBand } from "@/utils/builderLiability";

interface EnforcementPolicy {
  _id: string;
  policyNumber: string;
  builderName: string;
  email: string;
  phoneNumber: string;
  address: string;
  coverType: string;
  projectAddress: string;
  sumInsured: number;
  estimatedSumRange: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  paymentInfo?: {
    status: string;
    amount?: number;
    transactionId?: string;
    paidAt?: string;
    method?: string;
  };
}

const EnforcementPage = () => {
  const [policies, setPolicies] = useState<EnforcementPolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<EnforcementPolicy | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const mapPolicyForDisplay = (policy: BuilderLiabilityPolicy): EnforcementPolicy => ({
    _id: policy._id,
    policyNumber: policy.policyNumber,
    builderName: policy.builder?.nameOfBuilder || "N/A",
    email: policy.builder?.customerEmail || "N/A",
    phoneNumber: policy.builder?.telNo || "N/A",
    address: policy.builder?.address || "N/A",
    coverType: policy.project?.coverTypeIdxDetails || "Builder Liability",
    projectAddress: policy.project?.address || policy.builder?.address || "N/A",
    sumInsured: Number(policy.project?.totalEstimateSum || 0),
    estimatedSumRange: getProjectEstimateBand(policy.project) || "Not provided",
    status: policy.status,
    createdAt: String(policy.createdAt),
    updatedAt: String(policy.updatedAt),
    paymentInfo: policy.paymentInfo as EnforcementPolicy["paymentInfo"],
  });

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await adminEnforcementAPI.getCompletedPolicies({ page: 1, limit: 250 });
      const completedPolicies = response.data?.policies || [];
      setPolicies(completedPolicies.map(mapPolicyForDisplay));
    } catch (error) {
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const filteredPolicies = useMemo(() => {
    if (!searchQuery) {
      return policies;
    }

    const normalizedSearch = searchQuery.toLowerCase();
    return policies.filter((policy) =>
      policy.policyNumber?.toLowerCase().includes(normalizedSearch) ||
      policy.builderName.toLowerCase().includes(normalizedSearch) ||
      policy.email.toLowerCase().includes(normalizedSearch) ||
      policy.projectAddress.toLowerCase().includes(normalizedSearch)
    );
  }, [policies, searchQuery]);

  const stats = useMemo(() => {
    const today = new Date().toDateString();

    return {
      totalPolicies: policies.length,
      totalSumInsured: policies.reduce((sum, policy) => sum + (policy.sumInsured || 0), 0),
      totalPremiumPaid: policies.reduce((sum, policy) => sum + Number(policy.paymentInfo?.amount || 0), 0),
      paidToday: policies.filter((policy) =>
        policy.paymentInfo?.paidAt && new Date(policy.paymentInfo.paidAt).toDateString() === today
      ).length,
    };
  }, [policies]);

  const formatCurrency = (amount?: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(Number(amount || 0));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Shield className="w-7 h-7 mr-3 text-blue-600" />
                Enforcement Completion Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Review all paid builder liability policies completed for AMMC enforcement follow-up.
              </p>
            </div>

            <button
              onClick={fetchPolicies}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Paid Policies</p>
                <p className="text-xl font-semibold text-gray-900">{stats.totalPolicies}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Sum Insured</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(stats.totalSumInsured)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Premium Paid</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(stats.totalPremiumPaid)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Calendar className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Paid Today</p>
                <p className="text-xl font-semibold text-gray-900">{stats.paidToday}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by policy number, builder name, email, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
              <p className="text-gray-600">Loading completed policies...</p>
            </div>
          ) : filteredPolicies.length > 0 ? (
            filteredPolicies.map((policy) => (
              <div key={policy._id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {policy.policyNumber || policy.coverType}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Paid & Completed
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        <span>{policy.builderName}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{policy.projectAddress}</span>
                      </div>
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-2" />
                        <span>Estimated sum range: {policy.estimatedSumRange}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPolicy(policy);
                      setShowModal(true);
                    }}
                    className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Premium Paid</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(policy.paymentInfo?.amount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Transaction ID</p>
                    <p className="font-semibold text-gray-900 break-all">{policy.paymentInfo?.transactionId || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Paid At</p>
                    <p className="font-semibold text-gray-900">{formatDate(policy.paymentInfo?.paidAt)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No completed paid policies found</h3>
              <p className="text-gray-500">
                {searchQuery ? "Try adjusting your search." : "Completed and paid enforcement records will appear here."}
              </p>
            </div>
          )}
        </div>

        {showModal && selectedPolicy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Enforcement Policy Review
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{selectedPolicy.policyNumber}</p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm font-medium text-green-800">Workflow Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Paid & Completed
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Builder Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Builder Name:</span>
                      <p className="font-medium">{selectedPolicy.builderName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p className="font-medium">{selectedPolicy.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <p className="font-medium">{selectedPolicy.phoneNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Address:</span>
                      <p className="font-medium">{selectedPolicy.address}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <Building className="w-4 h-4 mr-2" />
                    Policy Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Policy Number:</span>
                      <p className="font-medium">{selectedPolicy.policyNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Cover Type:</span>
                      <p className="font-medium">{selectedPolicy.coverType}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Project Address:</span>
                      <p className="font-medium">{selectedPolicy.projectAddress}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Estimated Sum Range:</span>
                      <p className="font-medium">{selectedPolicy.estimatedSumRange}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Sum Insured:</span>
                      <p className="font-medium">{formatCurrency(selectedPolicy.sumInsured)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Payment Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Payment Status:</span>
                      <p className="font-medium">{selectedPolicy.paymentInfo?.status || "paid"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Amount:</span>
                      <p className="font-medium">{formatCurrency(selectedPolicy.paymentInfo?.amount)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Transaction ID:</span>
                      <p className="font-medium break-all">{selectedPolicy.paymentInfo?.transactionId || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Payment Method:</span>
                      <p className="font-medium">{selectedPolicy.paymentInfo?.method || "external_payment_service"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Paid At:</span>
                      <p className="font-medium">{formatDate(selectedPolicy.paymentInfo?.paidAt)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Created At:</span>
                      <p className="font-medium">{formatDate(selectedPolicy.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnforcementPage;
