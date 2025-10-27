"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Phone, Mail, MapPin, Calendar, Eye, Clock, CheckCircle, Search } from "lucide-react";
import { Assignment } from "@/types/api.types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSurveyorAssignments } from "@/services/api";
import SurveySubmissionModal from "./SurveySubmissionModal";

const AssignmentsList = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const response = await getSurveyorAssignments(filter, 1, 10);
        console.log("Assignments List Response:", response);
        console.log("Response data:", response.data);

        if (response.data && response.data.assignments) {
          const data = response.data.assignments;
          console.log("Assignments data:", data);
          console.log("Number of assignments:", data.length);
          if (data.length > 0) {
            console.log("First assignment:", data[0]);
          }
          setAssignments(Array.isArray(data) ? data : []);
        } else {
          console.log("No assignments data in response");
          setAssignments([]);
        }
      } catch (error) {
        console.error("Error fetching assignments:", error);
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [filter]);

  const handleStartSurvey = (assignment: Assignment) => {
    console.log('Start Survey clicked', assignment);
    setSelectedAssignment(assignment);
    setShowSurveyModal(true);
  };

  const handleSurveySubmission = async (submission: any) => {
    try {
      const { submitSurvey } = await import("@/services/api");

      const formData = new FormData();
      formData.append('ammcId', typeof selectedAssignment!.ammcId === 'object' ? selectedAssignment!.ammcId._id : selectedAssignment!.ammcId);
      formData.append('assignmentId', selectedAssignment!._id);
      formData.append('surveyNotes', submission.surveyNotes);
      formData.append('recommendedAction', submission.recommendedAction);
      formData.append('contactLog', JSON.stringify(submission.contactLog));
      formData.append('surveyDetails', JSON.stringify(submission.surveyDetails));
      if (submission.surveyDocument) {
        formData.append('surveyDocument', submission.surveyDocument);
      }

      await submitSurvey(formData);
      alert("Survey submitted successfully!");
      setShowSurveyModal(false);
      setSelectedAssignment(null);
      // Refresh assignments list
      const response = await getSurveyorAssignments(filter, 1, 10);
      if (response.data && response.data.assignments) {
        setAssignments(response.data.assignments);
      }
    } catch (error) {
      console.error("Failed to submit survey:", error);
      throw error;
    }
  };

  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment => {
      const query = searchQuery.toLowerCase();
      const policy = assignment.ammcId as any; // Type assertion since it's populated
      return (
        (policy?.propertyDetails?.propertyType?.toLowerCase().includes(query) ||
          policy?.propertyDetails?.address?.toLowerCase().includes(query) ||
          assignment.location?.address?.toLowerCase().includes(query))
      );
    });
  }, [assignments, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            New Assignment
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Accepted
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
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
            <Clock className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock className="w-3 h-3 mr-1" />
            Cancelled
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

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
          <p className="text-gray-600 mt-1">Manage your property survey assignments</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All' },
              { key: 'pending', label: 'Pending' },
              { key: 'completed', label: 'Completed' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${filter === tab.key
                  ? 'border-[#028835] text-[#028835]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAssignments.map((assignment) => {
          const policy = assignment.ammcId as any; // This should be populated by the backend
          return (
            <div key={assignment._id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {policy?.propertyDetails?.propertyType || 'Assignment'}
                    </h3>
                    <div className="flex items-center text-gray-500 text-sm mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {policy?.propertyDetails?.address || assignment.location?.address || 'Location not specified'}
                    </div>
                  </div>
                  {getStatusBadge(assignment.status)}
                </div>

                <div className="space-y-3">
                  {policy?.propertyDetails?.buildingValue && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Building Value:</span>
                      <span className="font-medium">₦{policy.propertyDetails.buildingValue.toLocaleString()}</span>
                    </div>
                  )}

                  {policy?.requestDetails?.coverageType && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Coverage:</span>
                      <span className="font-medium">{policy.requestDetails.coverageType}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Assigned:</span>
                    <span className="font-medium">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {new Date(assignment.assignedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {assignment.deadline && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Deadline:</span>
                      <span className="font-medium text-red-600">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        {new Date(assignment.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {assignment.priority && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Priority:</span>
                      <span className={`font-medium capitalize ${assignment.priority === 'urgent' ? 'text-red-600' :
                        assignment.priority === 'high' ? 'text-orange-600' :
                          assignment.priority === 'medium' ? 'text-yellow-600' :
                            'text-green-600'
                        }`}>
                        {assignment.priority}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Contact Information</h4>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">
                        {policy?.contactDetails?.fullName || assignment.location?.contactPerson?.name || 'Contact not available'}
                      </span>
                    </div>
                    {(policy?.contactDetails?.phoneNumber || assignment.location?.contactPerson?.phone) && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-3 w-3 mr-2" />
                        <a
                          href={`tel:${policy?.contactDetails?.phoneNumber || assignment.location?.contactPerson?.phone}`}
                          className="hover:text-[#028835]"
                        >
                          {policy?.contactDetails?.phoneNumber || assignment.location?.contactPerson?.phone}
                        </a>
                      </div>
                    )}
                    {(policy?.contactDetails?.email || assignment.location?.contactPerson?.email) && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-3 w-3 mr-2" />
                        <a
                          href={`mailto:${policy?.contactDetails?.email || assignment.location?.contactPerson?.email}`}
                          className="hover:text-[#028835]"
                        >
                          {policy?.contactDetails?.email || assignment.location?.contactPerson?.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {assignment.instructions && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Instructions</h4>
                    <p className="text-sm text-gray-600">{assignment.instructions}</p>
                  </div>
                )}

                <div className="mt-4 flex justify-end space-x-2">
                  <Link
                    href={`/surveyor/dashboard/assignments/${assignment._id}`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#028835]"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Link>
                  {(assignment.status === 'assigned' || assignment.status === 'accepted') && (
                    <button
                      onClick={() => handleStartSurvey(assignment)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[#028835] hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#028835]"
                    >
                      {assignment.status === 'assigned' ? 'Start Survey' : 'Continue Survey'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAssignments.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Eye className="h-full w-full" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all'
              ? "You don't have any assignments yet."
              : `No ${filter} assignments found.`
            }
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 text-xs text-gray-400">
              <p>Debug: Total assignments loaded: {assignments.length}</p>
              <p>Debug: Filter: {filter}</p>
              <p>Debug: Search query: "{searchQuery}"</p>
            </div>
          )}
        </div>
      )}

      {/* Survey Submission Modal */}
      {selectedAssignment && typeof selectedAssignment.ammcId === 'object' && (
        <SurveySubmissionModal
          policy={selectedAssignment.ammcId}
          isOpen={showSurveyModal}
          onSubmit={handleSurveySubmission}
          onClose={() => {
            setShowSurveyModal(false);
            setSelectedAssignment(null);
          }}
        />
      )}
    </div>
  );
};

export default AssignmentsList;