"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Calendar, User, Phone, Mail, FileText, Upload, CheckCircle, Clock, Camera, RefreshCw, Download, Eye } from "lucide-react";
import { Assignment } from "@/types/api.types";
import type { BuilderLiabilityPolicy } from "@/types/builderLiabilityPolicy.types";
import { useRouter } from "next/navigation";
import { downloadSubmissionZipByAssignment } from "@/services/api";
import {
  getProjectAddress,
  getProjectDistrict,
  getProjectEstimateBand,
  getProjectLga,
  getPolicyDisplayTitle
} from "@/utils/builderLiability";

interface AssignmentDetailProps {
  assignmentId: string;
}

interface EnhancedAssignment extends Omit<Assignment, 'policyId'> {
  policyId: BuilderLiabilityPolicy | string;
}

const AssignmentDetail: React.FC<AssignmentDetailProps> = ({ assignmentId }) => {
  const [assignment, setAssignment] = useState<EnhancedAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAssignment = async () => {
      setLoading(true);
      try {
        const { getSurveyorAssignmentById } = await import("@/services/api");
        const response = await getSurveyorAssignmentById(assignmentId);
        if (response.success) {
          setAssignment(response.data);
        } else {
        }
      } catch (error) {
        // Handle error
      }
      setLoading(false);
    };

    fetchAssignment();
  }, [assignmentId]);

  const handleContactUser = (method: 'phone' | 'email') => {
    if (!assignment || typeof assignment.policyId === 'string') return;

    const policy = assignment.policyId as BuilderLiabilityPolicy;
    const contractorPhone = policy.builder.telNo || '';
    const contractorEmail = policy.builder.customerEmail || '';
    if (method === 'phone') {
      window.open(`tel:${contractorPhone}`);
    } else if (method === 'email') {
      window.open(`mailto:${contractorEmail}`);
    }
  };

  const handleDownloadDocs = async () => {
    setIsDownloading(true);
    try {
      await downloadSubmissionZipByAssignment(assignmentId);
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-1/3 rounded-2xl bg-gray-300"></div>
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm">
          <div className="mb-4 h-6 w-1/2 rounded-full bg-gray-300"></div>
          <div className="space-y-2">
            <div className="h-4 w-3/4 rounded-full bg-gray-300"></div>
            <div className="h-4 w-1/2 rounded-full bg-gray-300"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="rounded-3xl border border-white/70 bg-white/85 py-12 text-center shadow-sm backdrop-blur-xl">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900">Assignment not found</h2>
        <p className="text-gray-600 mt-2">The assignment you're looking for doesn't exist.</p>
      </div>
    );
  }

  const assignmentPolicy =
    typeof assignment.policyId === 'object' ? (assignment.policyId as BuilderLiabilityPolicy) : null;
  const projectTitle = assignmentPolicy 
    ? getPolicyDisplayTitle(assignmentPolicy) 
    : 'Construction Project';
  const projectAddress =
    getProjectAddress(assignmentPolicy?.project, assignmentPolicy?.builder) ||
    assignment.location?.address ||
    'Address not available';
  const projectLga = getProjectLga(assignmentPolicy?.project);
  const projectDistrict = getProjectDistrict(assignmentPolicy?.project);
  const projectEstimateBand = getProjectEstimateBand(assignmentPolicy?.project);
  const contractorName =
    assignmentPolicy?.builder?.nameOfBuilder ||
    'N/A';
  const contractorPhone =
    assignmentPolicy?.builder?.telNo ||
    'N/A';
  const contractorEmail =
    assignmentPolicy?.builder?.customerEmail ||
    'N/A';



  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_24px_80px_rgba(15,23,42,0.1)]">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start sm:items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 rounded-full p-2 text-gray-500 transition-all duration-300 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-md"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Builder Liability Survey Assignment</h1>
                <p className="text-gray-600 mt-1">
                  {projectTitle}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Policy #{assignmentPolicy?.policyNumber || 'N/A'} • Assignment ID: {assignment._id}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="sm:text-right">
                <div className="flex flex-wrap items-center gap-2 mb-2 sm:justify-end">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium shadow-sm ${assignment.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                    assignment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      assignment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                    {assignment.status === 'assigned' ? <Clock className="w-3 h-3 mr-1" /> :
                      assignment.status === 'in_progress' ? <FileText className="w-3 h-3 mr-1" /> :
                        assignment.status === 'completed' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                          <FileText className="w-3 h-3 mr-1" />}
                    {assignment.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium shadow-sm ${assignment.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    assignment.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      assignment.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                    }`}>
                    {assignment.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Deadline: {new Date(assignment.deadline).toLocaleDateString()}
                  </div>
                </div>
              </div>
              {assignment.status === 'assigned' && (
                <button
                  onClick={() => router.push(`/surveyor/dashboard/assignments/${assignmentId}/survey-assessment-report`)}
                  className="w-full rounded-full bg-gradient-to-r from-[#028835] to-emerald-700 px-6 py-3 font-medium text-white shadow-md shadow-emerald-200/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#028835] sm:w-auto"
                >
                  Start Survey
                </button>
              )}
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/60">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Status</p>
              <p className="mt-2 text-sm font-medium text-slate-800">{assignment.status.replace('_', ' ').toUpperCase()}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/60">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Priority</p>
              <p className="mt-2 text-sm font-medium text-slate-800">{assignment.priority.toUpperCase()} PRIORITY</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/60">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Deadline</p>
              <p className={`mt-2 text-sm font-medium ${new Date(assignment.deadline) < new Date() ? 'text-red-600' : 'text-slate-800'}`}>
                {new Date(assignment.deadline).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Property Information */}
      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_24px_80px_rgba(15,23,42,0.1)]">
        <div className="border-b border-white/70 bg-slate-50/80 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-gray-900">Property Information</h2>
            <span className="text-sm text-gray-500">
              Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="p-6">
          {/* Property Overview */}
          <div className="mb-6 rounded-2xl border border-gray-100 bg-gray-50/80 p-4 transition-all duration-300 hover:border-emerald-100 hover:bg-emerald-50/60">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold tracking-tight text-gray-900">
                  {projectTitle}
                </h3>
                <p className="text-gray-600 mt-1 flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                  <span className="break-words">
                    {projectAddress}
                  </span>
                </p>
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  Policy Created: {assignmentPolicy?.createdAt
                    ? new Date(assignmentPolicy.createdAt).toLocaleDateString()
                    : 'N/A'}
                </div>
                {projectLga && (
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    LGA: {projectLga}
                    {projectDistrict ? ` • District: ${projectDistrict}` : ''}
                  </div>
                )}
                {assignmentPolicy?.project?.cadastralZone && (
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    Cadastral Zone: {assignmentPolicy.project.cadastralZone}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  ₦{assignmentPolicy?.project?.totalEstimateSum?.toLocaleString() || 'N/A'}
                </div>
                <div className="text-sm text-gray-500">Stored Ceiling</div>
                <div className="text-xs text-gray-500 mt-1">Range: {projectEstimateBand || 'Not provided'}</div>
              </div>
            </div>
          </div>

          {/* Property Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Project Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Project Type:</span>
                  <span className="font-medium text-gray-900">
                    {assignmentPolicy?.project?.projectType || assignmentPolicy?.project?.coverTypeIdxDetails || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contractor Type:</span>
                  <span className="font-medium text-gray-900">
                    {assignmentPolicy?.project?.contractorType || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">LGA:</span>
                  <span className="font-medium text-gray-900">
                    {projectLga || 'N/A'}
                  </span>
                </div>
                {projectDistrict && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">District:</span>
                    <span className="font-medium text-gray-900">
                      {projectDistrict}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Contractor:</span>
                  <span className="font-medium text-gray-900">{contractorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cadastral Zone:</span>
                  <span className="font-medium text-gray-900">{assignmentPolicy?.project?.cadastralZone || 'Not provided'}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Assignment Timeline</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Assigned:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(assignment.assignedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deadline:</span>
                  <span className={`font-medium ${new Date(assignment.deadline) < new Date() ? 'text-red-600' : 'text-gray-900'
                    }`}>
                    {new Date(assignment.deadline).toLocaleDateString()}
                  </span>
                </div>
                {assignment.estimatedDuration && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Duration:</span>
                    <span className="font-medium text-gray-900">
                      {assignment.estimatedDuration} hours
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Survey Requirements</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Priority:</span>
                  <span className={`font-medium ${assignment.priority === 'urgent' ? 'text-red-600' :
                    assignment.priority === 'high' ? 'text-orange-600' :
                      assignment.priority === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                    }`}>
                    {assignment.priority.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-gray-900">
                    {assignment.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                {assignment.instructions && (
                  <div className="mt-2">
                    <span className="text-gray-600 text-xs">Special Instructions:</span>
                    <p className="text-xs text-gray-700 mt-1 bg-yellow-50 p-2 rounded">
                      {assignment.instructions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_24px_80px_rgba(15,23,42,0.1)]">
        <div className="border-b border-white/70 bg-slate-50/80 px-6 py-4">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900">Contact Information</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Property Builder/Contractor Details */}
            <div>
              <h4 className="mb-3 text-sm font-medium text-gray-500">Contractor Information</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-base font-medium text-gray-900">
                      {typeof assignment.policyId === 'object' && (assignment.policyId as BuilderLiabilityPolicy)?.builder?.nameOfBuilder || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">Contractor Name</p>
                  </div>
                </div>

                {typeof assignment.policyId === 'object' && (assignment.policyId as BuilderLiabilityPolicy)?.builder?.telNo && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-base text-gray-900">
                        {(assignment.policyId as BuilderLiabilityPolicy).builder.telNo}
                      </p>
                      <p className="text-sm text-gray-500">Phone Number</p>
                    </div>
                  </div>
                )}

                {typeof assignment.policyId === 'object' && (assignment.policyId as BuilderLiabilityPolicy)?.builder?.customerEmail && (
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-base text-gray-900">
                        {(assignment.policyId as BuilderLiabilityPolicy).builder.customerEmail}
                      </p>
                      <p className="text-sm text-gray-500">Email Address</p>
                    </div>
                  </div>
                )}

                {typeof assignment.policyId === 'object' && (assignment.policyId as BuilderLiabilityPolicy)?.builder?.address && (
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-base text-gray-900">
                        {(assignment.policyId as BuilderLiabilityPolicy).builder.address}
                      </p>
                      <p className="text-sm text-gray-500">Location / Address</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Actions & Site Contact */}
            <div>
              <h4 className="mb-3 text-sm font-medium text-gray-500">Primary Contractor Contact</h4>
              <div className="space-y-3 mb-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-base font-medium text-gray-900">{contractorName}</p>
                    <p className="text-sm text-gray-500">Contractor / Primary Contact</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-base text-gray-900">{contractorPhone}</p>
                    <p className="text-sm text-gray-500">Phone Number</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-base text-gray-900">{contractorEmail}</p>
                    <p className="text-sm text-gray-500">Email Address</p>
                  </div>
                </div>
              </div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Contact Actions</h4>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleContactUser('phone')}
                    className="flex-1 inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#028835]"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Contractor
                  </button>
                  <button
                    onClick={() => handleContactUser('email')}
                    className="flex-1 inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#028835]"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email Contractor
                  </button>
                </div>

                {/* Site Contact Information */}
                {assignment.location?.contactPerson && (
                  <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50/80 p-4 shadow-sm">
                    <h5 className="text-sm font-medium text-blue-900 mb-2">Site Contact Person</h5>
                    <div className="space-y-1 text-sm">
                      <p className="text-blue-800">
                        <span className="font-medium">Name:</span> {assignment.location.contactPerson.name}
                      </p>
                      <p className="text-blue-800">
                        <span className="font-medium">Phone:</span> {assignment.location.contactPerson.phone}
                      </p>
                      {assignment.location.contactPerson.email && (
                        <p className="text-blue-800">
                          <span className="font-medium">Email:</span> {assignment.location.contactPerson.email}
                        </p>
                      )}
                      {assignment.location.contactPerson.availableHours && (
                        <p className="text-blue-800">
                          <span className="font-medium">Available:</span> {assignment.location.contactPerson.availableHours}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Access Instructions */}
                {assignment.location?.accessInstructions && (
                  <div className="mt-3 rounded-2xl border border-yellow-200 bg-yellow-50/80 p-4 shadow-sm">
                    <h5 className="text-sm font-medium text-yellow-900 mb-1">Access Instructions</h5>
                    <p className="text-sm text-yellow-800">{assignment.location.accessInstructions}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Details */}
      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-sm backdrop-blur-xl">
        <div className="border-b border-white/70 bg-slate-50/80 px-6 py-4">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900">Policy Details</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="mb-3 text-sm font-medium text-gray-500">Policy Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Policy Number:</span>
                  <span className="font-medium text-gray-900">
                    {typeof assignment.policyId === 'object' && (assignment.policyId as BuilderLiabilityPolicy)?.policyNumber || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Policy Type:</span>
                  <span className="font-medium text-gray-900">
                    Builder Liability Insurance
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-gray-900">
                    {typeof assignment.policyId === 'object' && (assignment.policyId as BuilderLiabilityPolicy)?.status || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-medium text-gray-500">Survey Focus Areas</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>• Construction quality assessment</p>
                <p>• Structural integrity verification</p>
                <p>• Safety compliance check</p>
                <p>• Risk factors identification</p>
                <p>• Builder liability evaluation</p>
              </div>
            </div>
          </div>

          {assignment.specialRequirements && assignment.specialRequirements.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-500">Survey Requirements</h4>
              <div className="rounded-2xl border border-green-200 bg-green-50/80 p-3 shadow-sm">
                <ul className="space-y-1 text-sm text-green-800">
                  {assignment.specialRequirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{req.replace(/_/g, ' ')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Survey Guidelines & Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-[2rem] border border-blue-200 bg-blue-50/80 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
          <div className="p-6">
            <h2 className="mb-4 flex items-center text-lg font-semibold text-blue-900">
              <FileText className="h-5 w-5 mr-2" />
              Builder Liability Survey Guidelines
            </h2>
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Conduct thorough inspection of construction site and completed structures</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Document construction quality, materials used, and workmanship</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Verify project details match the policy information provided</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Assess compliance with building codes and safety standards</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Interview builder about construction methods and timeline</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Provide detailed risk assessment and recommendations</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-green-200 bg-green-50/80 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
          <div className="p-6">
            <h2 className="mb-4 flex items-center text-lg font-semibold text-green-900">
              <Upload className="h-5 w-5 mr-2" />
              Required Documentation
            </h2>
            <div className="space-y-3 text-sm text-green-800">
              <div className="flex items-start">
                <Camera className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Construction site photos (all angles, progress stages)</span>
              </div>
              <div className="flex items-start">
                <Camera className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Materials and workmanship documentation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Start Survey */}
      {assignment.status === 'assigned' && (
        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_24px_80px_rgba(15,23,42,0.1)]">
          <div className="p-6">
            <h3 className="mb-4 text-lg font-semibold tracking-tight text-gray-900">Ready to Start?</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push(`/surveyor/dashboard/assignments/${assignmentId}/survey-assessment-report`)}
                className="flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-[#028835] to-emerald-700 px-6 py-3 font-medium text-white shadow-md shadow-emerald-200/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#028835]"
              >
                <FileText className="h-5 w-5 mr-2" />
                Start Survey Process
              </button>
              <button
                onClick={() => handleContactUser('phone')}
                className="flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-medium text-white shadow-md shadow-blue-200/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Phone className="h-5 w-5 mr-2" />
                Contact Contractor
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3 text-center">
              Make sure to contact the contractor before visiting the construction site
            </p>
          </div>
        </div>
      )}

      {/* Completed Assignment – Download Documents */}
      {assignment.status === 'completed' && (
        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_24px_80px_rgba(15,23,42,0.1)]">
          <div className="p-6">
            <h3 className="mb-4 flex items-center text-lg font-semibold tracking-tight text-gray-900">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Survey Completed
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This assignment has been completed and the survey documents have been submitted.
              You can view the SAR report or download your site pictures below.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  import('@/components/builderLiability/SARReportGenerator').then(m => {
                    m.openSARReport(assignment.policyId as BuilderLiabilityPolicy);
                  });
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-100 hover:shadow-lg"
              >
                <Eye className="h-4 w-4" />
                View SAR Report
              </button>
              
              <button
                onClick={() => {
                  import('@/components/builderLiability/SARReportGenerator').then(m => {
                    m.downloadSARReport(assignment.policyId as BuilderLiabilityPolicy);
                  });
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-100 hover:shadow-lg"
              >
                <Download className="h-4 w-4" />
                Download SAR
              </button>

              <button
                onClick={handleDownloadDocs}
                disabled={isDownloading}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-100 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Camera className="h-4 w-4" />
                {isDownloading ? 'Downloading...' : 'Download Site Pictures'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AssignmentDetail;
