"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  AlertTriangle,
  Clock,
  CheckSquare,
  XCircle,
  Loader2,
  ExternalLink
} from "lucide-react";
import { adminEnforcementAPI, downloadPolicyCertificate, downloadProtectedFileByPath } from "@/services/api";
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
    niipInvoice?: string;
    niipReference?: string;
    paidAt?: string;
    method?: string;
    confirmedAt?: string;
    egolepayConfirmed?: boolean;
    confirmationDetails?: any;
  };
  canConfirm?: boolean;
  confirmationStatus?: string;
  paymentExtractionDetails?: {
    yourRef: string;
    egoleRef: string;
    date: string;
    policyId: string;
    policyNumber: string;
  };
  clientDetails?: Record<string, any>;
  organizationDetails?: Record<string, any>;
  projectDetails?: Record<string, any>;
  workforceDetails?: Record<string, any>;
  complianceDetails?: Record<string, any>;
  metaDetails?: Record<string, any>;
  niipPayload?: Record<string, any>;
}

type ViewMode = 'completed' | 'pending';

const EnforcementPage = () => {
  const [policies, setPolicies] = useState<EnforcementPolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<EnforcementPolicy | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>('completed');
  const [confirmingPayment, setConfirmingPayment] = useState<string | null>(null);
  const [batchConfirming, setBatchConfirming] = useState(false);
  const [manualConfirming, setManualConfirming] = useState<string | null>(null);
  const [downloadingDocument, setDownloadingDocument] = useState<string | null>(null);
  const [selectedPolicies, setSelectedPolicies] = useState<Set<string>>(new Set());
  const modalRef = useRef<HTMLDivElement | null>(null);

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
    canConfirm: (policy as any).canConfirm,
    confirmationStatus: (policy as any).confirmationStatus,
    paymentExtractionDetails: (policy as any).paymentExtractionDetails,
    clientDetails: (policy as any).client,
    organizationDetails: (policy as any).organization,
    projectDetails: (policy as any).project,
    workforceDetails: (policy as any).workforce,
    complianceDetails: (policy as any).compliance,
    metaDetails: (policy as any).meta,
    niipPayload: (policy as any).niipPayload,
  });

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      let response;
      
      if (viewMode === 'completed') {
        response = await adminEnforcementAPI.getCompletedPolicies({ page: 1, limit: 250 });
      } else {
        response = await adminEnforcementAPI.getPendingPaymentPolicies({ page: 1, limit: 250, hasPaymentInfo: true });
      }
      
      const fetchedPolicies = response.data?.policies || [];
      setPolicies(fetchedPolicies.map(mapPolicyForDisplay));
    } catch (error) {
      console.error('Error fetching policies:', error);
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (policyId: string) => {
    try {
      setConfirmingPayment(policyId);
      const policy = policies.find(item => item._id === policyId);
      const extractedDetails = policy?.paymentExtractionDetails;
      const amount = Number(policy?.paymentInfo?.amount);
      const receiptReference =
        extractedDetails?.yourRef ||
        policy?.paymentInfo?.transactionId ||
        `ADMIN_${policyId}_${Date.now()}`;
      const receiptDate = extractedDetails?.date || new Date().toISOString();

      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('A valid premium amount is required before confirming payment.');
      }

      console.debug('[Admin enforcement] Confirming payment and triggering NIIP withdrawal', {
        policyId,
        receiptReference,
        amount,
        receiptDate
      });
      const result = await adminEnforcementAPI.manuallyConfirmBankPayment(policyId, {
        receiptReference,
        egoleRef: extractedDetails?.egoleRef,
        receiptDate,
        amount,
        reason: 'Admin enforcement confirmation; EgolePay verification bypassed'
      });
      console.debug('[Admin enforcement] Direct NIIP withdrawal response', {
        policyId,
        success: result.success,
        message: result.message,
        error: result.error,
        data: result.data
      });
      
      if (result.success) {
        alert(`Payment confirmed and NIIP withdrawal succeeded for policy ${result.data?.policyNumber}`);
        // Refresh the policies list
        await fetchPolicies();
      } else {
        const withdrawal = result.data?.niipWithdrawal;
        const withdrawalMessage =
          withdrawal?.error ||
          withdrawal?.body?.error ||
          withdrawal?.body?.message ||
          result.error ||
          result.message;
        alert(
          `Payment was recorded, but NIIP withdrawal failed.\n\n` +
          `Reason: ${withdrawalMessage}\n` +
          `NIIP status: ${withdrawal?.status ?? 'unknown'}\n` +
          `URL: ${withdrawal?.url ?? 'unknown'}`
        );
      }
    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      alert(`Error confirming payment: ${error.message || 'Unknown error'}`);
    } finally {
      setConfirmingPayment(null);
    }
  };

  const handleBatchConfirmPayments = async () => {
    if (selectedPolicies.size === 0) {
      alert('Please select at least one policy to confirm');
      return;
    }

    try {
      setBatchConfirming(true);
      const result = await adminEnforcementAPI.confirmPaymentsBatch({
        policyIds: Array.from(selectedPolicies),
        autoExtract: true
      });
      
      if (result.success) {
        alert(`Batch confirmation completed! ${result.data.policiesUpdated} policies updated successfully.`);
        setSelectedPolicies(new Set());
        await fetchPolicies();
      } else {
        alert(`Batch confirmation failed: ${result.error || result.message}`);
      }
    } catch (error: any) {
      console.error('Batch confirmation error:', error);
      alert(`Error in batch confirmation: ${error.message || 'Unknown error'}`);
    } finally {
      setBatchConfirming(false);
    }
  };

  const handleManualBankConfirmation = async (policy: EnforcementPolicy) => {
    const receiptReference = window.prompt('Bank receipt transaction reference:')?.trim();
    if (!receiptReference) return;

    const receiptDate = window.prompt('Receipt date (YYYY-MM-DD):')?.trim();
    if (!receiptDate) return;

    const amountInput = window.prompt(`Receipt amount in NGN (expected ${formatCurrency(policy.paymentInfo?.amount)}):`);
    const amount = Number(amountInput);
    if (!Number.isFinite(amount)) {
      alert('Enter a valid receipt amount.');
      return;
    }

    const reason = window.prompt('Reason for manual bank confirmation (required):')?.trim();
    if (!reason) return;

    const egoleRef = window.prompt('EgolePay reference (optional, press Cancel to skip):')?.trim() || undefined;
    if (!window.confirm(`Confirm bank receipt ${receiptReference} for ${policy.policyNumber} and trigger NIIP withdrawal?`)) {
      return;
    }

    try {
      setManualConfirming(policy._id);
      const result = await adminEnforcementAPI.manuallyConfirmBankPayment(policy._id, {
        receiptReference,
        egoleRef,
        receiptDate,
        amount,
        reason
      });

      if (result.success) {
        alert(`Payment confirmed and NIIP withdrawal succeeded for ${result.data?.policyNumber}.`);
      } else {
        alert(`Payment recorded, but NIIP withdrawal failed: ${result.message}`);
      }
      await fetchPolicies();
    } catch (error: any) {
      console.error('Manual bank confirmation error:', error);
      alert(`Manual confirmation failed: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    } finally {
      setManualConfirming(null);
    }
  };

  const handleDownloadReceipt = async (policy: EnforcementPolicy) => {
    try {
      setDownloadingDocument(`${policy._id}-receipt`);
      await downloadProtectedFileByPath(
        `/payment/receipt/${policy._id}`,
        `payment-receipt-${policy.policyNumber || 'policy'}.pdf`
      );
    } catch (error: any) {
      alert(error?.response?.data?.message || error?.message || 'Unable to download the payment receipt.');
    } finally {
      setDownloadingDocument(null);
    }
  };

  const handleDownloadCertificate = async (policy: EnforcementPolicy) => {
    try {
      setDownloadingDocument(`${policy._id}-certificate`);
      await downloadPolicyCertificate(policy._id, policy.policyNumber);
    } catch (error: any) {
      alert(error?.response?.data?.message || error?.message || 'Unable to download the policy certificate.');
    } finally {
      setDownloadingDocument(null);
    }
  };

  const togglePolicySelection = (policyId: string) => {
    const newSelection = new Set(selectedPolicies);
    if (newSelection.has(policyId)) {
      newSelection.delete(policyId);
    } else {
      newSelection.add(policyId);
    }
    setSelectedPolicies(newSelection);
  };

  const selectAllPolicies = () => {
    const confirmablePolicies = filteredPolicies.filter(p => p.canConfirm).map(p => p._id);
    setSelectedPolicies(new Set(confirmablePolicies));
  };

  const clearSelection = () => {
    setSelectedPolicies(new Set());
  };

  useEffect(() => {
    fetchPolicies();
  }, [viewMode]);

  // Lock scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        modalRef.current?.focus();
      });
      
      // Add ESC key listener
      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setShowModal(false);
        }
      };
      
      document.addEventListener('keydown', handleEsc);
      
      return () => {
        document.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on component unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

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

    if (viewMode === 'completed') {
      return {
        totalPolicies: policies.length,
        totalSumInsured: policies.reduce((sum, policy) => sum + (policy.sumInsured || 0), 0),
        totalPremiumPaid: policies.reduce((sum, policy) => sum + Number(policy.paymentInfo?.amount || 0), 0),
        paidToday: policies.filter((policy) =>
          policy.paymentInfo?.paidAt && new Date(policy.paymentInfo.paidAt).toDateString() === today
        ).length,
      };
    } else {
      return {
        totalPending: policies.length,
        canConfirm: policies.filter(p => p.canConfirm).length,
        needsReview: policies.filter(p => !p.canConfirm).length,
        selected: selectedPolicies.size,
      };
    }
  }, [policies, selectedPolicies, viewMode]);

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

  const getPaymentStatusBadge = (policy: EnforcementPolicy) => {
    const paymentStatus = policy.paymentInfo?.status?.toLowerCase();
    const isConfirmed = policy.paymentInfo?.egolepayConfirmed;
    
    if (viewMode === 'completed') {
      return (
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid & Completed
          </span>
          {isConfirmed && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <ExternalLink className="w-3 h-3 mr-1" />
              EgolePay Confirmed
            </span>
          )}
        </div>
      );
    }

    // For pending payments
    if (paymentStatus === 'paid') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Paid
        </span>
      );
    } else if (['pending', 'processing', 'initialized'].includes(paymentStatus || '')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Payment Pending
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Needs Review
        </span>
      );
    }
  };

  const getConfirmationStatusBadge = (policy: EnforcementPolicy) => {
    if (!policy.canConfirm) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Missing Details
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckSquare className="w-3 h-3 mr-1" />
        Ready to Confirm
      </span>
    );
  };

  return (
    <div className="min-h-screen min-w-0 bg-gray-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Shield className="w-7 h-7 mr-3 text-blue-600" />
                Enforcement & Payment Management
              </h1>
              <p className="text-gray-600 mt-1">
                {viewMode === 'completed' 
                  ? 'Review all paid builder liability policies completed for AMMC enforcement follow-up.'
                  : 'Confirm payment status for pending policies using EgolePay API.'
                }
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('completed')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'completed'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Completed Policies
                </button>
                <button
                  onClick={() => setViewMode('pending')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'pending'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Payment Confirmation
                </button>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {viewMode === 'completed' ? (
            <>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Paid Policies</p>
                    <p className="text-xl font-semibold text-gray-900">{(stats as any).totalPolicies}</p>
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
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency((stats as any).totalSumInsured)}</p>
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
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency((stats as any).totalPremiumPaid)}</p>
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
                    <p className="text-xl font-semibold text-gray-900">{(stats as any).paidToday}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                    <p className="text-xl font-semibold text-gray-900">{(stats as any).totalPending}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckSquare className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Ready to Confirm</p>
                    <p className="text-xl font-semibold text-gray-900">{(stats as any).canConfirm}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Need Review</p>
                    <p className="text-xl font-semibold text-gray-900">{(stats as any).needsReview}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Selected</p>
                    <p className="text-xl font-semibold text-gray-900">{(stats as any).selected}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {viewMode === 'pending' && (
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={selectAllPolicies}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Select All Ready
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={clearSelection}
                    className="text-sm text-gray-600 hover:text-gray-700"
                  >
                    Clear Selection
                  </button>
                </div>
                {selectedPolicies.size > 0 && (
                  <span className="text-sm text-gray-600">
                    {selectedPolicies.size} policies selected
                  </span>
                )}
              </div>

              {selectedPolicies.size > 0 && (
                <button
                  onClick={handleBatchConfirmPayments}
                  disabled={batchConfirming}
                  title="Confirm all selected payments and trigger NIIP wallet withdrawals without EgolePay verification."
                  aria-label="Confirm selected payments and trigger NIIP withdrawals"
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {batchConfirming ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckSquare className="w-4 h-4" />
                  )}
                  <span>
                    {batchConfirming ? 'Confirming...' : `Confirm ${selectedPolicies.size} Payment${selectedPolicies.size > 1 ? 's' : ''}`}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

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
                  <div className="flex items-start space-x-3 flex-1">
                    {viewMode === 'pending' && (
                      <input
                        type="checkbox"
                        checked={selectedPolicies.has(policy._id)}
                        onChange={() => togglePolicySelection(policy._id)}
                        disabled={!policy.canConfirm}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                      />
                    )}

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {policy.policyNumber || policy.coverType}
                        </h3>
                        {getPaymentStatusBadge(policy)}
                        {viewMode === 'pending' && getConfirmationStatusBadge(policy)}
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
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 max-w-full">
                    {viewMode === 'pending' && policy.canConfirm && (
                      <button
                        onClick={() => handleConfirmPayment(policy._id)}
                        disabled={confirmingPayment === policy._id}
                        title="Confirm this payment using the recorded premium amount and trigger the NIIP wallet withdrawal directly. EgolePay verification is bypassed."
                        aria-label={`Confirm payment and trigger NIIP withdrawal for ${policy.policyNumber}`}
                        className="group flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 border border-green-600 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
                      >
                        {confirmingPayment === policy._id ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <CheckSquare className="w-4 h-4 mr-1" />
                        )}
                        {confirmingPayment === policy._id ? 'Confirming...' : 'Confirm & Withdraw'}
                      </button>
                    )}

                    {viewMode === 'pending' && (
                      <button
                        onClick={() => handleManualBankConfirmation(policy)}
                        disabled={manualConfirming === policy._id || confirmingPayment === policy._id}
                        title="Record a bank receipt manually, mark the payment as paid, and trigger the NIIP wallet withdrawal without EgolePay verification."
                        aria-label={`Record bank receipt and trigger NIIP withdrawal for ${policy.policyNumber}`}
                        className="group flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-700 border border-amber-600 rounded-lg hover:bg-amber-50 transition-colors disabled:opacity-50"
                      >
                        {manualConfirming === policy._id ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <CreditCard className="w-4 h-4 mr-1" />
                        )}
                        {manualConfirming === policy._id ? 'Processing...' : 'Bank Receipt Override'}
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        setSelectedPolicy(policy);
                        setShowModal(true);
                      }}
                      className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      title="View the full policy, payment, NIIP, and enforcement details."
                      aria-label={`View details for ${policy.policyNumber}`}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                  </div>
                </div>

                {viewMode === 'completed' && (
                  <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
                    <button
                      onClick={() => handleDownloadReceipt(policy)}
                      disabled={downloadingDocument !== null}
                      className="flex items-center gap-1.5 rounded-lg border border-emerald-600 px-3 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-50"
                      title="Download the payment receipt"
                    >
                      {downloadingDocument === `${policy._id}-receipt` ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                      Receipt
                    </button>
                    <button
                      onClick={() => handleDownloadCertificate(policy)}
                      disabled={downloadingDocument !== null}
                      className="flex items-center gap-1.5 rounded-lg border border-indigo-600 px-3 py-1.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50 disabled:opacity-50"
                      title="Download the NIIP policy certificate"
                    >
                      {downloadingDocument === `${policy._id}-certificate` ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                      Certificate
                    </button>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {viewMode === 'completed' ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-gray-500">Payment Status</p>
                        <p className="font-semibold text-gray-900">{policy.paymentInfo?.status || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Sum Insured</p>
                        <p className="font-semibold text-gray-900">{policy.estimatedSumRange}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Updated</p>
                        <p className="font-semibold text-gray-900">{formatDate(policy.updatedAt)}</p>
                      </div>
                    </>
                  )}
                </div>

                {viewMode === 'pending' && policy.paymentExtractionDetails && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-medium text-blue-800 mb-2">EgolePay Reference Details:</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-blue-600">Your Ref:</span>
                        <p className="font-mono text-blue-900">{policy.paymentExtractionDetails.yourRef}</p>
                      </div>
                      <div>
                        <span className="text-blue-600">Egole Ref:</span>
                        <p className="font-mono text-blue-900">{policy.paymentExtractionDetails.egoleRef}</p>
                      </div>
                      <div>
                        <span className="text-blue-600">Date:</span>
                        <p className="font-mono text-blue-900">{policy.paymentExtractionDetails.date}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {viewMode === 'completed' ? 'No completed paid policies found' : 'No pending payment policies found'}
              </h3>
              <p className="text-gray-500">
                {searchQuery ? "Try adjusting your search." : 
                  viewMode === 'completed' 
                    ? "Completed and paid enforcement records will appear here."
                    : "Policies with pending payments that need confirmation will appear here."
                }
              </p>
            </div>
          )}
        </div>

        {showModal && selectedPolicy && typeof window !== 'undefined' && createPortal(
          <div 
            className="fixed inset-0 z-[9999] flex items-stretch justify-stretch bg-black/60"
            style={{ 
              position: 'fixed', 
              inset: 0,
              zIndex: 9999,
              margin: 0,
              padding: 0
            }}
            onClick={(e) => {
              // Close modal when clicking backdrop
              if (e.target === e.currentTarget) {
                setShowModal(false);
              }
            }}
          >
            <div 
              ref={modalRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby="enforcement-modal-title"
              className="flex h-full w-full flex-col overflow-hidden bg-white outline-none animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: 'none',
                maxHeight: '100vh'
              }}
            >
              {/* Header - Fixed at top */}
              <div className="shrink-0 border-b border-gray-200 bg-white px-8 py-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 id="enforcement-modal-title" className="text-xl font-semibold text-gray-900">
                      Enforcement Policy Review
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{selectedPolicy.policyNumber}</p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                    aria-label="Close modal"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="px-8 py-6 space-y-6">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm font-medium text-green-800">
                    {viewMode === 'completed' ? 'Workflow Status' : 'Payment Status'}
                  </span>
                  <div className="flex items-center space-x-2">
                    {getPaymentStatusBadge(selectedPolicy)}
                    {viewMode === 'pending' && getConfirmationStatusBadge(selectedPolicy)}
                  </div>
                </div>

                {viewMode === 'completed' && (
                  <div className="flex flex-wrap justify-end gap-2 border-b border-gray-100 pb-5">
                    <button
                      onClick={() => handleDownloadReceipt(selectedPolicy)}
                      disabled={downloadingDocument !== null}
                      className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                    >
                      {downloadingDocument === `${selectedPolicy._id}-receipt` ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                      Download Receipt
                    </button>
                    <button
                      onClick={() => handleDownloadCertificate(selectedPolicy)}
                      disabled={downloadingDocument !== null}
                      className="inline-flex items-center gap-2 rounded-lg border border-indigo-600 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
                    >
                      {downloadingDocument === `${selectedPolicy._id}-certificate` ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                      Download Certificate
                    </button>
                  </div>
                )}

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
                      <span className="text-gray-500">Sum Insured:</span>
                      <p className="font-medium">{selectedPolicy.estimatedSumRange}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Client Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div><span className="text-gray-500">Name:</span><p className="font-medium">{selectedPolicy.clientDetails?.name || 'N/A'}</p></div>
                      <div><span className="text-gray-500">Email:</span><p className="font-medium break-all">{selectedPolicy.clientDetails?.email || 'N/A'}</p></div>
                      <div><span className="text-gray-500">Phone:</span><p className="font-medium">{selectedPolicy.clientDetails?.phoneNumber || 'N/A'}</p></div>
                      <div><span className="text-gray-500">RC Number:</span><p className="font-medium">{selectedPolicy.clientDetails?.rcNumber || 'N/A'}</p></div>
                      <div><span className="text-gray-500">ID Type:</span><p className="font-medium">{selectedPolicy.clientDetails?.identificationType || 'N/A'}</p></div>
                      <div><span className="text-gray-500">ID Number:</span><p className="font-medium">{selectedPolicy.clientDetails?.identificationNumber || 'N/A'}</p></div>
                      <div className="md:col-span-2"><span className="text-gray-500">Address:</span><p className="font-medium">{selectedPolicy.clientDetails?.address || 'N/A'}</p></div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Organization Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div><span className="text-gray-500">Professional Body:</span><p className="font-medium">{selectedPolicy.organizationDetails?.professionalBody || 'N/A'}</p></div>
                      <div><span className="text-gray-500">Registration Number:</span><p className="font-medium">{selectedPolicy.organizationDetails?.professionalRegistrationNumber || selectedPolicy.organizationDetails?.niobRegNo || 'N/A'}</p></div>
                      <div><span className="text-gray-500">Specialization:</span><p className="font-medium">{selectedPolicy.organizationDetails?.areaOfSpecialization || 'N/A'}</p></div>
                      <div><span className="text-gray-500">Permanent Staff:</span><p className="font-medium">{selectedPolicy.organizationDetails?.noOfPermanentStaff ?? 'N/A'}</p></div>
                      <div><span className="text-gray-500">Year Registered:</span><p className="font-medium">{selectedPolicy.organizationDetails?.yearOfRegistration ? formatDate(selectedPolicy.organizationDetails.yearOfRegistration) : 'N/A'}</p></div>
                      <div><span className="text-gray-500">Assessor:</span><p className="font-medium">{selectedPolicy.organizationDetails?.assessorName || 'N/A'}</p></div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Project and Coverage</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div><span className="text-gray-500">Project Title:</span><p className="font-medium">{selectedPolicy.projectDetails?.projectTitle || selectedPolicy.projectDetails?.projectName || 'N/A'}</p></div>
                      <div><span className="text-gray-500">Project Type:</span><p className="font-medium">{selectedPolicy.projectDetails?.projectType || 'N/A'}</p></div>
                      <div><span className="text-gray-500">Contractor Category:</span><p className="font-medium">{selectedPolicy.projectDetails?.contractorCategory || selectedPolicy.projectDetails?.categoryOfContractorId || 'N/A'}</p></div>
                      <div><span className="text-gray-500">Statutory Cover:</span><p className="font-medium">{selectedPolicy.projectDetails?.isStatutory ?? selectedPolicy.projectDetails?.coverTypeIdx ? 'Yes' : 'No'}</p></div>
                      <div><span className="text-gray-500">Cadastral Zone:</span><p className="font-medium">{selectedPolicy.projectDetails?.cadastralZone || 'N/A'}</p></div>
                      <div><span className="text-gray-500">LGA / District:</span><p className="font-medium">{[selectedPolicy.projectDetails?.lga || selectedPolicy.projectDetails?.projectLga, selectedPolicy.projectDetails?.district || selectedPolicy.projectDetails?.projectDistrict].filter(Boolean).join(' / ') || 'N/A'}</p></div>
                      <div className="md:col-span-2"><span className="text-gray-500">Work Details:</span><p className="font-medium whitespace-pre-wrap">{selectedPolicy.projectDetails?.workDetails || 'N/A'}</p></div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Risk and Compliance</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div><span className="text-gray-500">Extra Hazardous Work:</span><p className="font-medium">{selectedPolicy.projectDetails?.extraHazardous ?? selectedPolicy.projectDetails?.extraHazardousWork ? 'Yes' : 'No'}</p></div>
                      <div><span className="text-gray-500">Existing Insurance:</span><p className="font-medium">{selectedPolicy.complianceDetails?.HasInsurance ? 'Yes' : 'No'}</p></div>
                      <div><span className="text-gray-500">Investigation:</span><p className="font-medium">{selectedPolicy.complianceDetails?.investigation ? 'Yes' : 'No'}</p></div>
                      <div><span className="text-gray-500">Disciplinary Committee:</span><p className="font-medium">{selectedPolicy.complianceDetails?.disciplinaryCommittee ? 'Yes' : 'No'}</p></div>
                      <div><span className="text-gray-500">Pre-employment Check:</span><p className="font-medium">{selectedPolicy.complianceDetails?.preEmploymentCheck ? 'Yes' : 'No'}</p></div>
                      <div><span className="text-gray-500">Practice Outside Nigeria:</span><p className="font-medium">{selectedPolicy.complianceDetails?.PracticeOutsideNigeria || 'N/A'}</p></div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <h4 className="text-sm font-semibold text-blue-950 mb-3">NIIP and Policy Metadata</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div><span className="text-blue-700">NIIP Policy Number:</span><p className="font-mono font-medium break-all">{selectedPolicy.niipPayload?.policyNumber || selectedPolicy.niipPayload?.PolicyNumber || selectedPolicy.policyNumber}</p></div>
                    <div><span className="text-blue-700">NIIP Invoice:</span><p className="font-mono font-medium break-all">{selectedPolicy.paymentInfo?.niipInvoice || selectedPolicy.niipPayload?.invoiceNumber || 'N/A'}</p></div>
                    <div><span className="text-blue-700">NIIP Reference:</span><p className="font-mono font-medium break-all">{selectedPolicy.paymentInfo?.niipReference || selectedPolicy.niipPayload?.transactionReference || 'N/A'}</p></div>
                    <div><span className="text-blue-700">Product ID:</span><p className="font-medium">{selectedPolicy.metaDetails?.ProductId || 'N/A'}</p></div>
                    <div><span className="text-blue-700">Sales Outlet:</span><p className="font-medium">{selectedPolicy.metaDetails?.salesOutlet || 'N/A'}</p></div>
                    <div><span className="text-blue-700">Broker / Agent:</span><p className="font-medium">{selectedPolicy.metaDetails?.brokerOrAgentName || 'N/A'}</p></div>
                    <div><span className="text-blue-700">Policy Status:</span><p className="font-medium">{selectedPolicy.status}</p></div>
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
                    {selectedPolicy.paymentInfo?.egolepayConfirmed && (
                      <>
                        <div>
                          <span className="text-gray-500">EgolePay Confirmed:</span>
                          <p className="font-medium text-green-600">✓ Yes</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Confirmed At:</span>
                          <p className="font-medium">{formatDate(selectedPolicy.paymentInfo?.confirmedAt)}</p>
                        </div>
                      </>
                    )}
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

                {viewMode === 'pending' && selectedPolicy.paymentExtractionDetails && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      EgolePay Confirmation Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Your Reference:</span>
                        <p className="font-mono text-sm">{selectedPolicy.paymentExtractionDetails.yourRef}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">EgolePay Reference:</span>
                        <p className="font-mono text-sm">{selectedPolicy.paymentExtractionDetails.egoleRef}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Transaction Date:</span>
                        <p className="font-medium">{selectedPolicy.paymentExtractionDetails.date}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Confirmation Status:</span>
                        <p className="font-medium">{selectedPolicy.canConfirm ? 'Ready to Confirm' : 'Missing Details'}</p>
                      </div>
                    </div>
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

export default EnforcementPage;
