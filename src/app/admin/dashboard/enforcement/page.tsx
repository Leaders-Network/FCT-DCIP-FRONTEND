"use client";
import React, { useState } from "react";
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
  RefreshCw
} from "lucide-react";

// Placeholder data structure for paid policies from third party platform
interface PaidPolicy {
  policyId: string;
  ammcId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  propertyAddress: string;
  propertyType: string;
  coverageAmount: number;
  premiumAmount: number;
  paymentDate: string;
  policyStartDate: string;
  policyEndDate: string;
  status: 'awaiting_approval' | 'approved' | 'rejected';
  thirdPartyReference: string;
  paymentReference: string;
}

// Mock data - this will be replaced with actual API calls later
const mockPaidPolicies: PaidPolicy[] = [
  {
    policyId: "POL-2024-001",
    ammcId: "AMMC-A012D30",
    fullName: "John Doe",
    email: "john.doe@email.com",
    phoneNumber: "+234-801-234-5678",
    propertyAddress: "123 Victoria Island, Lagos State",
    propertyType: "Residential",
    coverageAmount: 50000000,
    premiumAmount: 125000,
    paymentDate: "2024-10-20T10:30:00Z",
    policyStartDate: "2024-10-21T00:00:00Z",
    policyEndDate: "2025-10-21T00:00:00Z",
    status: "awaiting_approval",
    thirdPartyReference: "TP-REF-789123",
    paymentReference: "PAY-456789"
  },
  {
    policyId: "POL-2024-002",
    ammcId: "AMMC-B045X21",
    fullName: "Sarah Wilson",
    email: "sarah.wilson@email.com",
    phoneNumber: "+234-802-345-6789",
    propertyAddress: "456 Abuja Central Area, FCT",
    propertyType: "Commercial",
    coverageAmount: 100000000,
    premiumAmount: 250000,
    paymentDate: "2024-10-19T14:15:00Z",
    policyStartDate: "2024-10-20T00:00:00Z",
    policyEndDate: "2025-10-20T00:00:00Z",
    status: "awaiting_approval",
    thirdPartyReference: "TP-REF-789124",
    paymentReference: "PAY-456790"
  },
  {
    policyId: "POL-2024-003",
    ammcId: "AMMC-C078M15",
    fullName: "Michael Johnson",
    email: "michael.johnson@email.com",
    phoneNumber: "+234-803-456-7890",
    propertyAddress: "789 Port Harcourt GRA, Rivers State",
    propertyType: "Residential",
    coverageAmount: 75000000,
    premiumAmount: 187500,
    paymentDate: "2024-10-18T09:45:00Z",
    policyStartDate: "2024-10-19T00:00:00Z",
    policyEndDate: "2025-10-19T00:00:00Z",
    status: "approved",
    thirdPartyReference: "TP-REF-789125",
    paymentReference: "PAY-456791"
  }
];

const EnforcementPage = () => {
  const [policies, setPolicies] = useState<PaidPolicy[]>(mockPaidPolicies);
  const [loading, setLoading] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<PaidPolicy | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'awaiting_approval' | 'approved' | 'rejected'>('all');

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'awaiting_approval':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'awaiting_approval':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleApprovePolicy = async (policyId: string) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call to approve policy
      // This should update the policy status in the backend and sync with user dashboard
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPolicies(prev => 
        prev.map(policy => 
          policy.policyId === policyId 
            ? { ...policy, status: 'approved' as const }
            : policy
        )
      );
      
      alert('Policy approved successfully! This will now appear as approved in the user dashboard.');
    } catch (error) {
      console.error('Failed to approve policy:', error);
      alert('Failed to approve policy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPolicy = async (policyId: string) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call to reject policy
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPolicies(prev => 
        prev.map(policy => 
          policy.policyId === policyId 
            ? { ...policy, status: 'rejected' as const }
            : policy
        )
      );
      
      alert('Policy rejected successfully!');
    } catch (error) {
      console.error('Failed to reject policy:', error);
      alert('Failed to reject policy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPolicies = filter === 'all' 
    ? policies 
    : policies.filter(policy => policy.status === filter);

  const stats = {
    total: policies.length,
    awaiting: policies.filter(p => p.status === 'awaiting_approval').length,
    approved: policies.filter(p => p.status === 'approved').length,
    rejected: policies.filter(p => p.status === 'rejected').length,
    totalValue: policies.reduce((sum, p) => sum + p.coverageAmount, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Shield className="w-8 h-8 mr-3 text-blue-600" />
              Policy Enforcement
            </h1>
            <p className="text-gray-600 mt-2">
              Manage paid policies from third-party platform requiring approval
            </p>
          </div>
          
          <button
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border min-w-0 overflow-hidden">
            <div className="flex items-center min-w-0">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">Total Policies</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border min-w-0 overflow-hidden">
            <div className="flex items-center min-w-0">
              <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">Awaiting Approval</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.awaiting}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border min-w-0 overflow-hidden">
            <div className="flex items-center min-w-0">
              <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border min-w-0 overflow-hidden">
            <div className="flex items-center min-w-0">
              <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border min-w-0 overflow-hidden">
            <div className="flex items-center min-w-0">
              <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">Total Coverage</p>
                <p className="text-lg font-semibold text-gray-900 truncate">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'All Policies' },
                { key: 'awaiting_approval', label: 'Awaiting Approval' },
                { key: 'approved', label: 'Approved' },
                { key: 'rejected', label: 'Rejected' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    filter === key
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

        {/* Policies Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Paid Policies ({filteredPolicies.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Policy Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coverage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPolicies.map((policy) => (
                  <tr key={policy.policyId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {policy.policyId}
                        </div>
                        <div className="text-sm text-gray-500">
                          AMMC: {policy.ammcId}
                        </div>
                        <div className="text-xs text-gray-400">
                          Ref: {policy.thirdPartyReference}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {policy.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {policy.email}
                        </div>
                        <div className="text-xs text-gray-400">
                          {policy.phoneNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(policy.coverageAmount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {policy.propertyType}
                        </div>
                        <div className="text-xs text-gray-400 truncate max-w-32">
                          {policy.propertyAddress}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(policy.premiumAmount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(policy.paymentDate)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {policy.paymentReference}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(policy.status)}`}>
                        {getStatusIcon(policy.status)}
                        <span className="ml-1 capitalize">
                          {policy.status.replace('_', ' ')}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex flex-col sm:flex-row gap-2 min-w-0">
                        <button
                          onClick={() => {
                            setSelectedPolicy(policy);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center whitespace-nowrap"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                        
                        {policy.status === 'awaiting_approval' && (
                          <>
                            <button
                              onClick={() => handleApprovePolicy(policy.policyId)}
                              disabled={loading}
                              className="text-green-600 hover:text-green-900 inline-flex items-center disabled:opacity-50 whitespace-nowrap"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </button>
                            
                            <button
                              onClick={() => handleRejectPolicy(policy.policyId)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-900 inline-flex items-center disabled:opacity-50 whitespace-nowrap"
                            >
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredPolicies.length === 0 && (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No policies found for the selected filter.</p>
            </div>
          )}
        </div>

        {/* Policy Details Modal */}
        {showModal && selectedPolicy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Policy Details - {selectedPolicy.policyId}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Customer Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Full Name:</span>
                      <p className="font-medium">{selectedPolicy.fullName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p className="font-medium">{selectedPolicy.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <p className="font-medium">{selectedPolicy.phoneNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Property Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Property Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <p className="font-medium">{selectedPolicy.propertyType}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Address:</span>
                      <p className="font-medium">{selectedPolicy.propertyAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Policy Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Policy Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">AMMC ID:</span>
                      <p className="font-medium">{selectedPolicy.ammcId}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Coverage Amount:</span>
                      <p className="font-medium">{formatCurrency(selectedPolicy.coverageAmount)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Premium:</span>
                      <p className="font-medium">{formatCurrency(selectedPolicy.premiumAmount)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Start Date:</span>
                      <p className="font-medium">{formatDate(selectedPolicy.policyStartDate)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">End Date:</span>
                      <p className="font-medium">{formatDate(selectedPolicy.policyEndDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Payment Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Payment Date:</span>
                      <p className="font-medium">{formatDate(selectedPolicy.paymentDate)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Payment Reference:</span>
                      <p className="font-medium">{selectedPolicy.paymentReference}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Third Party Reference:</span>
                      <p className="font-medium">{selectedPolicy.thirdPartyReference}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {selectedPolicy.status === 'awaiting_approval' && (
                  <div className="flex space-x-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        handleApprovePolicy(selectedPolicy.policyId);
                        setShowModal(false);
                      }}
                      disabled={loading}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Policy
                    </button>
                    
                    <button
                      onClick={() => {
                        handleRejectPolicy(selectedPolicy.policyId);
                        setShowModal(false);
                      }}
                      disabled={loading}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Reject Policy
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