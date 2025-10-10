"use client";
import React, { useState, useEffect } from "react";
import { Phone, Mail, MapPin, Calendar, Eye, Clock, CheckCircle } from "lucide-react";
import { PolicyRequest } from "@/types/api.types";
import Link from "next/link";
import { getSurveyorAssignments } from "@/services/api";

const AssignmentsList = () => {
  const [assignments, setAssignments] = useState<PolicyRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [loading, setLoading] = useState(true);


  const filteredAssignments = assignments.filter(assignment => {
      if (filter === 'all') return true;
      if (filter === 'pending') return assignment?.status === 'assigned';
      if (filter === 'completed') return assignment?.status === 'surveyed';
      return true;
    })

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);

      try {
        const response = await getSurveyorAssignments(filter);
        // if(response.){
        const data = response.data 
          setAssignments(Array.isArray(data) ? data : []);
        // }
      } catch (error) {
        setLoading(false)
        console.log(error)
      }finally{
        setLoading(false)
      }

      // Simulate API call
      // await new Promise(resolve => setTimeout(resolve, 1000));
      
      // const mockAssignments: PolicyRequest[] = [
      //   {
      //     _id: "1",
      //     userId: "user1",
      //     propertyDetails: {
      //       address: "123 Main St, Wuse 2, Abuja, FCT",
      //       propertyType: "Residential House",
      //       buildingValue: 50000000,
      //       yearBuilt: 2020,
      //       squareFootage: 2500,
      //       constructionMaterial: "Concrete Block"
      //     },
      //     contactDetails: {
      //       fullName: "John Doe",
      //       email: "john.doe@email.com",
      //       phoneNumber: "+234 801 234 5678",
      //       alternatePhone: "+234 802 345 6789"
      //     },
      //     requestDetails: {
      //       coverageType: "Comprehensive Coverage",
      //       policyDuration: "2 Years",
      //       additionalCoverage: ["Flood Coverage", "Theft Protection"],
      //       specialRequests: "Property has a swimming pool"
      //     },
      //     status: "assigned",
      //     assignedSurveyors: ["current_surveyor_id"],
      //     createdAt: "2024-10-01T10:00:00Z",
      //     updatedAt: "2024-10-01T10:00:00Z"
      //   },
      //   {
      //     _id: "2",
      //     userId: "user2",
      //     propertyDetails: {
      //       address: "456 Commercial Ave, Garki, Abuja, FCT",
      //       propertyType: "Commercial Building",
      //       buildingValue: 150000000,
      //       yearBuilt: 2018,
      //       squareFootage: 5000,
      //       constructionMaterial: "Steel Frame"
      //     },
      //     contactDetails: {
      //       fullName: "Jane Smith",
      //       email: "jane.smith@business.com",
      //       phoneNumber: "+234 803 456 7890"
      //     },
      //     requestDetails: {
      //       coverageType: "All Risk Coverage",
      //       policyDuration: "3 Years",
      //       additionalCoverage: ["Business Interruption", "Equipment Coverage"],
      //       specialRequests: "24/7 security system installed"
      //     },
      //     status: "assigned",
      //     assignedSurveyors: ["current_surveyor_id"],
      //     createdAt: "2024-09-28T14:30:00Z",
      //     updatedAt: "2024-09-30T09:15:00Z"
      //   },
      //   {
      //     _id: "3",
      //     userId: "user3",
      //     propertyDetails: {
      //       address: "789 Industrial Rd, Jikwoyi, Abuja, FCT",
      //       propertyType: "Industrial Facility",
      //       buildingValue: 300000000,
      //       yearBuilt: 2015,
      //       squareFootage: 10000,
      //       constructionMaterial: "Mixed Materials"
      //     },
      //     contactDetails: {
      //       fullName: "Mike Johnson",
      //       email: "mike.j@factory.com",
      //       phoneNumber: "+234 804 567 8901"
      //     },
      //     requestDetails: {
      //       coverageType: "Fire and Allied Perils",
      //       policyDuration: "5 Years",
      //       additionalCoverage: ["Equipment Coverage", "Liability Coverage"],
      //       specialRequests: "Heavy machinery present"
      //     },
      //     status: "surveyed",
      //     assignedSurveyors: ["current_surveyor_id"],
      //     surveyDocument: "survey_report_3.pdf",
      //     surveyNotes: "Property in excellent condition. No major risks identified.",
      //     createdAt: "2024-09-20T08:00:00Z",
      //     updatedAt: "2024-10-02T16:45:00Z"
      //   }
      // ];

      // setAssignments(mockAssignments);
      // setLoading(false);
    };

    fetchAssignments();
  }, []);

  

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'surveyed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
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
      <div className="space-y-6">
        <div className="animate-pulse">
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
          <p className="text-gray-600">Manage your property survey assignments</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All Assignments', count: assignments.length },
            { key: 'pending', label: 'Pending', count: assignments?.filter(a => a.status === 'assigned').length },
            { key: 'completed', label: 'Completed', count: assignments.filter(a => a.status === 'surveyed').length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === tab.key
                  ? 'border-[#028835] text-[#028835]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAssignments.map((assignment) => (
          <div key={assignment._id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {assignment.propertyDetails.propertyType}
                  </h3>
                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {assignment.propertyDetails.address}
                  </div>
                </div>
                {getStatusBadge(assignment.status)}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Building Value:</span>
                  <span className="font-medium">₦{assignment.propertyDetails.buildingValue.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Coverage:</span>
                  <span className="font-medium">{assignment.requestDetails.coverageType}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Assigned:</span>
                  <span className="font-medium">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    {new Date(assignment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Contact Information</h4>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium mr-2">{assignment.contactDetails.fullName}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-3 w-3 mr-2" />
                    <a href={`tel:${assignment.contactDetails.phoneNumber}`} className="hover:text-[#028835]">
                      {assignment.contactDetails.phoneNumber}
                    </a>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-3 w-3 mr-2" />
                    <a href={`mailto:${assignment.contactDetails.email}`} className="hover:text-[#028835]">
                      {assignment.contactDetails.email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <Link
                  href={`/surveyor/dashboard/assignments/${assignment._id}`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#028835]"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Link>
                {assignment.status === 'assigned' && (
                  <Link
                    href={`/surveyor/dashboard/assignments/${assignment._id}/survey`}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[#028835] hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#028835]"
                  >
                    Start Survey
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
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
        </div>
      )}
    </div>
  );
};

export default AssignmentsList;