"use client";
import React, { useState, useEffect } from "react";
import { FileText, Clock, CheckCircle, Users, Calendar, MapPin, ClipboardList, AlertCircle } from "lucide-react";
import { Assignment, DualAssignment } from "@/types/api.types";
import Link from "next/link";
import { getSurveyorDashboard, getSurveyorAssignments, getSurveyorDualAssignments } from "@/services/api";

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: string;
}

const StatCard = ({ icon, label, value, color }: StatCardProps) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 min-w-0 overflow-hidden">
    <div className="flex items-center min-w-0">
      <div className={`p-2 bg-${color}-100 rounded-lg flex-shrink-0`}>
        {React.createElement(icon, { className: `h-6 w-6 text-${color}-600` })}
      </div>
      <div className="ml-4 flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-600 truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const SurveyorDashboard = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurveyorData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [dashboardResponse, assignmentsResponse, dualAssignmentsResponse] = await Promise.allSettled([
          getSurveyorDashboard(),
          getSurveyorAssignments("all", 1, 10),
          getSurveyorDualAssignments({ status: "all", page: 1, limit: 10 })
        ]);

        let fetchedAssignments: Assignment[] = [];

        if (dashboardResponse.status === 'fulfilled' && dashboardResponse.value?.data) {
          console.log("Dashboard Response:", dashboardResponse.value.data);
          const dashboardData = dashboardResponse.value.data;
          if (dashboardData.recentAssignments) {
            fetchedAssignments = dashboardData.recentAssignments;
          }
          if (dashboardData.statistics) {
            setStats({
              total: dashboardData.statistics.total || 0,
              pending: dashboardData.statistics.pending || 0,
              inProgress: dashboardData.statistics.inProgress || 0,
              completed: dashboardData.statistics.completed || 0
            });
          }
        }

        // Process dual assignments response (prioritize these)
        if (dualAssignmentsResponse.status === 'fulfilled' && dualAssignmentsResponse.value?.data?.dualAssignments) {
          const dualAssignments = dualAssignmentsResponse.value.data.dualAssignments;
          console.log('Dual assignments fetched:', dualAssignments.length);

          // Convert dual assignments to assignment format
          fetchedAssignments = dualAssignments.map((dualAssignment: DualAssignment) => {
            const currentAssignment = (dualAssignment.currentSurveyorInfo?.assignmentId as Assignment | undefined) || ({} as Partial<Assignment>);

            return {
              _id: currentAssignment._id || dualAssignment._id,
              status: currentAssignment.status || 'assigned',
              assignedAt: dualAssignment.createdAt,
              deadline: currentAssignment.deadline || '',
              priority: dualAssignment.priority,
              ammcId: dualAssignment.policyId,
              location: {
                address: dualAssignment.policyDetails?.address || 'Address not available',
                contactPerson: {
                  name: dualAssignment.policyId?.contactDetails?.fullName || 'Contact not available',
                  phone: dualAssignment.policyId?.contactDetails?.phoneNumber || '',
                  email: dualAssignment.policyId?.contactDetails?.email || ''
                }
              },
              organization: dualAssignment.currentSurveyorOrganization,
              isDualSurveyor: true,
              dualAssignmentId: dualAssignment._id
            };
          });
        }

        // Fallback to regular assignments if no dual assignments
        if (fetchedAssignments.length === 0 && assignmentsResponse.status === 'fulfilled' && assignmentsResponse.value?.data?.assignments) {
          console.log("Assignments Response:", assignmentsResponse.value.data);
          fetchedAssignments = assignmentsResponse.value.data.assignments;
        }

        if (fetchedAssignments.length > 0) {
          setAssignments(fetchedAssignments);
          if (dashboardResponse.status === 'rejected' || !dashboardResponse.value?.data?.statistics) {
            setStats({
              total: fetchedAssignments.length,
              pending: fetchedAssignments.filter(a => a.status === 'assigned' || a.status === 'accepted').length,
              inProgress: fetchedAssignments.filter(a => a.status === 'in_progress').length,
              completed: fetchedAssignments.filter(a => a.status === 'completed').length
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch surveyor data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyorData();
  }, []);

  const surveyorName = typeof window !== 'undefined' ? localStorage.getItem("surveyorName") || "Surveyor" : "Surveyor";
  const firstName = surveyorName.split(" ")[0];

  const recentAssignments = assignments.slice(0, 3);

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
            <ClipboardList className="w-3 h-3 mr-1" />
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
            <AlertCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <AlertCircle className="w-3 h-3 mr-1" />
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
        <div className="h-8 bg-gray-300 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 p-6 rounded-lg h-24"></div>
          ))}
        </div>
        <div className="bg-gray-200 rounded-lg h-64"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-lg font-medium text-red-800">An error occurred</h3>
        <p className="mt-1 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {firstName}!</h1>
        <p className="text-gray-600 mt-1">Here's an overview of your AMMC survey assignments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={FileText} label="Total Assignments" value={stats.total} color="blue" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} color="yellow" />
        <StatCard icon={ClipboardList} label="In Progress" value={stats.inProgress} color="purple" />
        <StatCard icon={CheckCircle} label="Completed" value={stats.completed} color="green" />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Assignments</h2>
          <Link href="/surveyor/dashboard/assignments" className="text-[#028835] hover:text-green-700 text-sm font-medium">
            View All
          </Link>
        </div>

        <div className="divide-y divide-gray-200">
          {recentAssignments.length > 0 ? (
            recentAssignments.map((assignment) => (
              <div key={assignment._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <MapPin className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-md font-semibold text-gray-900">
                          {typeof assignment.ammcId === 'object' && assignment.ammcId?.propertyDetails?.propertyType || 'Assignment'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {typeof assignment.ammcId === 'object' && assignment.ammcId?.propertyDetails?.address || assignment.location?.address || 'Location not specified'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1.5" />
                        {typeof assignment.ammcId === 'object' && assignment.ammcId?.contactDetails?.fullName || assignment.location?.contactPerson?.name || 'Contact not available'}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1.5" />
                        {new Date(assignment.assignedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {getStatusBadge(assignment.status)}
                    <Link href={`/surveyor/dashboard/assignments/${assignment._id}`} className="text-[#028835] hover:text-green-700 text-sm font-medium">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No assignments yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                New AMMC survey assignments will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/surveyor/dashboard/assignments" className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <FileText className="h-7 w-7 text-blue-600" />
            <div className="ml-4">
              <p className="text-md font-medium text-gray-900">View All Assignments</p>
              <p className="text-sm text-gray-500">See your complete assignment list</p>
            </div>
          </Link>



          <Link href="/surveyor/dashboard/settings" className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Users className="h-7 w-7 text-purple-600" />
            <div className="ml-4">
              <p className="text-md font-medium text-gray-900">Profile Settings</p>
              <p className="text-sm text-gray-500">Update your information</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SurveyorDashboard;