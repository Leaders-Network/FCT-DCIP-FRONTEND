"use client";
import React, { useState, useEffect } from "react";
import {
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  FileText,
  User,
  MapPin,
  DollarSign,
  RefreshCw,
  CreditCard,
  TrendingUp,
  Search,
  Filter,
  X,
  Building,
  Calendar,
  ArrowRight
} from "lucide-react";

interface PolicyRequest {
  _id: string;
  propertyDetails: {
    propertyType: string;
    address: string;
    buildingValue: number;
  };
  contactDetails: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  requestDetails: {
    coverageType: string;
    policyDuration: string;
  };
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
  const [policies, setPolicies] = useState<PolicyRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'payment-verification' | 'webhook-test'>('payment-verification');
  const [filter, setFilter] = useState<'all' | 'approved' | 'payment_pending' | 'completed' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const { builderLiabilityPolicyAPI } = await import("@/services/api");

      const [approvedResponse, paymentPendingResponse, completedResponse, rejectedResponse] = await Promise.all([
        builderLiabilityPolicyAPI.getUserPolicies({ status: "approved", page: 1, limit: 100 }),
        builderLiabilityPolicyAPI.getUserPolicies({ status: "payment_pending", page: 1, limit: 100 }),
        builderLiabilityPolicyAPI.getUserPolicies({ status: "completed", page: 1, limit: 100 }),
        builderLiabilityPolicyAPI.getUserPolicies({ status: "rejected", page: 1, limit: 100 }),
      ]);

      const approved = approvedResponse.data?.policies || [];
      const paymentPending = paymentPendingResponse.data?.policies || [];
      const completed = completedResponse.data?.policies || [];
      const rejected = rejectedResponse.data?.policies || [];

      setPolicies([...approved, ...paymentPending, ...completed, ...rejected]);
    } catch (error) {
      console.error("Failed to fetch policies:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculatePolicyPremium = (policy: PolicyRequest) => {
    const baseRate = 0.005; // 0.5% of building value
    const buildingValue = policy.propertyDetails.buildingValue || 0;
    return Math.max(buildingValue * baseRate, 25000); // Minimum premium of ₦25,000
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved - Payment Required
          </span>
        );
      case 'payment_pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <Clock className="w-3 h-3 mr-1" />
            Payment Pending
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const handleWebhookTest = async (policyId: string, status: 'payment_approved' | 'payment_rejected') => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/v1/admin/enforcement/webhook/test/${policyId}?status=${status}`);
      const data = await response.json();

      if (response.ok) {
        alert(`✅ Webhook test successful!\n\nPolicy ${policyId} status updated:\n${data.data.oldStatus} → ${data.data.newStatus}`);
        fetchPolicies();
      } else {
        alert(`❌ Webhook test failed:\n${data.message}`);
      }
    } catch (error) {
      console.error('Webhook test failed:', error);
      alert('❌ Webhook test failed: Network error');
    } finally {
      setLoading(false);
    }
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesFilter = filter === 'all' || policy.status === filter;
    const matchesSearch = !searchQuery ||
      policy._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.contactDetails.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.propertyDetails.propertyType.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: policies.length,
    approved: policies.filter(p => p.status === 'approved').length,
    paymentPending: policies.filter(p => p.status === 'payment_pending').length,
    completed: policies.filter(p => p.status === 'completed').length,
    rejected: policies.filter(p => p.status === 'rejected').length,
    totalValue: policies.reduce((sum, p) => sum + (p.propertyDetails?.buildingValue || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Shield className="w-7 h-7 mr-3 text-blue-600" />
                Payment Enforcement Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor and manage payment verification workflow
              </p>
            </div>

            <button
              onClick={fetchPolicies}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-xl font-semibold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Payment Pending</p>
                <p className="text-xl font-semibold text-gray-900">{stats.paymentPending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-xl font-semibold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-xl font-semibold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-lg font-semibold text-gray-900 truncate">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Banner */}
        {stats.approved > 0 || stats.paymentPending > 0 ? (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Payment Verification Required</h3>
                  <p className="text-xs text-gray-600">
                    {stats.approved} policies awaiting payment, {stats.paymentPending} payments pending verification
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFilter('approved')}
                  className="px-3 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-md hover:bg-orange-200 transition-colors"
                >
                  View Approved ({stats.approved})
                </button>
                <button
                  onClick={() => setFilter('payment_pending')}
                  className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                >
                  View Pending ({stats.paymentPending})
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, name, or property type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'approved', label: 'Approved' },
                { key: 'payment_pending', label: 'Payment Pending' },
                { key: 'completed', label: 'Completed' },
                { key: 'rejected', label: 'Rejected' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as typeof filter)}
                  className={`px-3 py-2 text-sm rounded-md transition-colors ${filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Policies List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
              <p className="text-gray-600">Loading policies...</p>
            </div>
          ) : filteredPolicies.length > 0 ? (
            filteredPolicies.map((policy) => (
              <div key={policy._id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {policy.propertyDetails.propertyType}
                      </h3>
                      {getStatusBadge(policy.status)}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        <span>{policy.contactDetails.fullName}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{policy.propertyDetails.address}</span>
                      </div>
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-2" />
                        <span>₦{policy.propertyDetails.buildingValue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {policy.status === 'approved' && (
                      <div className="flex items-center px-3 py-1 bg-green-50 rounded-lg border border-green-200">
                        <CreditCard className="w-4 h-4 mr-2 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          Premium: {formatCurrency(calculatePolicyPremium(policy))}
                        </span>
                      </div>
                    )}
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
                </div>

                {/* Payment Actions & Workflow Progress */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-600">
                      Policy ID: <span className="font-medium">{policy._id.substring(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="text-sm font-bold text-gray-900">
                      {policy.status === 'approved' ? '80%' :
                        policy.status === 'payment_pending' ? '85%' :
                          policy.status === 'completed' ? '100%' : '75%'}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${policy.status === 'approved' ? 'bg-green-400' :
                        policy.status === 'payment_pending' ? 'bg-orange-400' :
                          policy.status === 'completed' ? 'bg-green-500' : 'bg-blue-400'
                        }`}
                      style={{
                        width: `${policy.status === 'approved' ? '80%' :
                          policy.status === 'payment_pending' ? '85%' :
                            policy.status === 'completed' ? '100%' : '75%'}`
                      }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Payment Status Indicator */}
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${policy.status === 'completed' ? 'bg-green-100' :
                          policy.status === 'approved' ? 'bg-yellow-100' :
                            policy.status === 'payment_pending' ? 'bg-orange-100' : 'bg-gray-100'
                          }`}>
                          <CreditCard className={`w-3 h-3 ${policy.status === 'completed' ? 'text-green-600' :
                            policy.status === 'approved' ? 'text-yellow-600' :
                              policy.status === 'payment_pending' ? 'text-orange-600' : 'text-gray-400'
                            }`} />
                        </div>
                        <div className="text-xs">
                          <div className="font-medium text-gray-900">Payment</div>
                          <div className="text-gray-600">
                            {policy.status === 'completed' ? 'Confirmed' :
                              policy.status === 'approved' ? 'Required' :
                                policy.status === 'payment_pending' ? 'Pending' : 'Not Required'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {(policy.status === 'approved' || policy.status === 'payment_pending') && (
                        <>
                          <button
                            onClick={() => handleWebhookTest(policy._id, 'payment_approved')}
                            disabled={loading}
                            className="flex items-center px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve Payment
                          </button>
                          <button
                            onClick={() => handleWebhookTest(policy._id, 'payment_rejected')}
                            disabled={loading}
                            className="flex items-center px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Reject Payment
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No policies found</h3>
              <p className="text-gray-500">
                {searchQuery || filter !== 'all'
                  ? "Try adjusting your search or filters"
                  : "Policies requiring payment verification will appear here"}
              </p>
            </div>
          )}
        </div>

        {/* Policy Details Modal */}
        {showModal && selectedPolicy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Policy Details - {selectedPolicy._id.substring(0, 8).toUpperCase()}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Current Status:</span>
                  {getStatusBadge(selectedPolicy.status)}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Full Name:</span>
                      <p className="font-medium">{selectedPolicy.contactDetails.fullName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p className="font-medium">{selectedPolicy.contactDetails.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <p className="font-medium">{selectedPolicy.contactDetails.phoneNumber}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <Building className="w-4 h-4 mr-2" />
                    Property Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <p className="font-medium">{selectedPolicy.propertyDetails.propertyType}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Value:</span>
                      <p className="font-medium">{formatCurrency(selectedPolicy.propertyDetails.buildingValue)}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Address:</span>
                      <p className="font-medium">{selectedPolicy.propertyDetails.address}</p>
                    </div>
                  </div>
                </div>

                {selectedPolicy.paymentInfo && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Payment Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Payment Status:</span>
                        <p className="font-medium">{selectedPolicy.paymentInfo.status}</p>
                      </div>
                      {selectedPolicy.paymentInfo.amount && (
                        <div>
                          <span className="text-gray-500">Amount:</span>
                          <p className="font-medium">{formatCurrency(selectedPolicy.paymentInfo.amount)}</p>
                        </div>
                      )}
                      {selectedPolicy.paymentInfo.transactionId && (
                        <div>
                          <span className="text-gray-500">Transaction ID:</span>
                          <p className="font-medium">{selectedPolicy.paymentInfo.transactionId}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(selectedPolicy.status === 'approved' || selectedPolicy.status === 'payment_pending') && (
                  <div className="flex space-x-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        handleWebhookTest(selectedPolicy._id, 'payment_approved');
                        setShowModal(false);
                      }}
                      disabled={loading}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Simulate Payment Success
                    </button>

                    <button
                      onClick={() => {
                        handleWebhookTest(selectedPolicy._id, 'payment_rejected');
                        setShowModal(false);
                      }}
                      disabled={loading}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Simulate Payment Failure
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnforcementPage;