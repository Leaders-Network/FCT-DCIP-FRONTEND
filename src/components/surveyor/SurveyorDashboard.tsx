"use client";
import React, { useState, useEffect } from "react";
import { FileText, Clock, CheckCircle, Users, Calendar, MapPin } from "lucide-react";
import { PolicyRequest } from "@/types/api.types";
import Link from "next/link";

const SurveyorDashboard = () => {
  const [assignments, setAssignments] = useState<PolicyRequest[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0
  });

  // Fetch real assignments from API
  useEffect(() => {
    const fetchSurveyorData = async () => {
      try {
        // Import API functions
        const { getSurveyorDashboard, getSurveyorAssignments } = await import("@/services/api");
        
        // Fetch dashboard data and assignments
        const [dashboardResponse, assignmentsResponse] = await Promise.allSettled([
          getSurveyorDashboard(),
          getSurveyorAssignments()
        ]);

        let fetchedAssignments: PolicyRequest[] = [];

        // Handle dashboard response
        if (dashboardResponse.status === 'fulfilled' && dashboardResponse.value?.data) {
          const dashboardData = dashboardResponse.value.data;
          
          // Use assignments from dashboard if available
          if (dashboardData.assignments) {
            fetchedAssignments = dashboardData.assignments;
          }
          
          // Use stats from dashboard if available
          if (dashboardData.stats) {
            setStats({
              total: dashboardData.stats.total || 0,
              pending: dashboardData.stats.pending || 0,
              inProgress: dashboardData.stats.inProgress || 0,
              completed: dashboardData.stats.completed || 0
            });
          }
        }

        // Handle assignments response as fallback
        if (fetchedAssignments.length === 0 && assignmentsResponse.status === 'fulfilled' && assignmentsResponse.value?.data) {
          fetchedAssignments = assignmentsResponse.value.data;
        }

        // If we have assignments, calculate stats if not provided by API
        if (fetchedAssignments.length > 0) {
          setAssignments(fetchedAssignments);
          
          // Calculate stats if not provided by dashboard
          if (dashboardResponse.status === 'rejected' || !dashboardResponse.value?.data?.stats) {
            setStats({
              total: (fetchedAssignments || []).length,
              pending: (fetchedAssignments || []).filter(a => a?.status === 'assigned' || a?.status === 'pending').length,
              inProgress: (fetchedAssignments || []).filter(a => a?.status === 'in-progress').length,
              completed: (fetchedAssignments || []).filter(a => a?.status === 'completed' || a?.status === 'surveyed').length
            });
          }
        } else {
          // No assignments found
          setAssignments([]);
          setStats({
            total: 0,
            pending: 0,
            inProgress: 0,
            completed: 0
          });
        }

      } catch (error) {
        console.error("Failed to fetch surveyor data:", error);
        
        // Set empty state on error
        setAssignments([]);
        setStats({
          total: 0,
          pending: 0,
          inProgress: 0,
          completed: 0
        });
      }
    };

    fetchSurveyorData();
  }, []);

  const surveyorName = localStorage.getItem("surveyorName") || "Surveyor";
  const firstName = surveyorName.split(" ")[0];

  const recentAssignments = (assignments || []).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}!</h1>
        <p className="text-gray-600">Here's an overview of your survey assignments.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Assignments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Assignments</h2>
          <Link
            href="/surveyor/dashboard/assignments"
            className="text-[#028835] hover:text-green-700 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        
        <div className="divide-y divide-gray-200">
          {recentAssignments.length > 0 ? (
            recentAssignments.map((assignment) => (
              <div key={assignment._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded">
                        <MapPin className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {assignment.propertyDetails.propertyType}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {assignment.propertyDetails.address}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {assignment.contactDetails.fullName}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(assignment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </span>
                    <Link
                      href={`/surveyor/dashboard/assignments/${assignment._id}`}
                      className="text-[#028835] hover:text-green-700 text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                New survey assignments will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/surveyor/dashboard/assignments"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">View All Assignments</p>
              <p className="text-sm text-gray-500">See your complete assignment list</p>
            </div>
          </Link>
          
          <Link
            href="/surveyor/dashboard/submissions"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">My Submissions</p>
              <p className="text-sm text-gray-500">Track submitted surveys</p>
            </div>
          </Link>
          
          <Link
            href="/surveyor/dashboard/settings"
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Profile Settings</p>
              <p className="text-sm text-gray-500">Update your information</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SurveyorDashboard;