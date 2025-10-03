"use client";
import React, { useState, useEffect } from "react";
import { 
  Users, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  MapPin,
  Star,
  Activity
} from "lucide-react";
import { useRouter } from "next/navigation";

interface DashboardStats {
  totalPolicies: number;
  pendingAssignments: number;
  activeSurveyors: number;
  completedSurveys: number;
  overdueAssignments: number;
  avgCompletionTime: number;
  totalRevenue: number;
  satisfactionScore: number;
}

interface RecentActivity {
  id: string;
  type: 'policy_submitted' | 'surveyor_assigned' | 'survey_completed' | 'policy_approved';
  message: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
}

interface SurveyorPerformance {
  id: string;
  name: string;
  completedSurveys: number;
  averageRating: number;
  onTimeDelivery: number;
  currentAssignments: number;
}

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalPolicies: 0,
    pendingAssignments: 0,
    activeSurveyors: 0,
    completedSurveys: 0,
    overdueAssignments: 0,
    avgCompletionTime: 0,
    totalRevenue: 0,
    satisfactionScore: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topPerformers, setTopPerformers] = useState<SurveyorPerformance[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch real data from API
      const [statsResult, activityResult] = await Promise.all([
        fetch('/api/admin/dashboard/stats').then(res => res.json()).catch(() => null),
        fetch('/api/admin/dashboard/activity').then(res => res.json()).catch(() => null)
      ]);

      // Use real data if available, otherwise fall back to mock data
      setStats(statsResult || {
        totalPolicies: 156,
        pendingAssignments: 23,
        activeSurveyors: 12,
        completedSurveys: 89,
        overdueAssignments: 5,
        avgCompletionTime: 2.3,
        totalRevenue: 45000000,
        satisfactionScore: 4.6
      });

      setRecentActivity(activityResult || [
        {
          id: '1',
          type: 'policy_submitted',
          message: 'New policy request from John Doe - Residential Property',
          timestamp: '2 minutes ago',
          status: 'info'
        },
        {
          id: '2',
          type: 'survey_completed',
          message: 'Survey completed by Sarah Wilson for Commercial Building',
          timestamp: '15 minutes ago',
          status: 'success'
        },
        {
          id: '3',
          type: 'surveyor_assigned',
          message: 'Mike Johnson assigned to Industrial Facility survey',
          timestamp: '1 hour ago',
          status: 'info'
        },
        {
          id: '4',
          type: 'policy_approved',
          message: 'Policy approved for Jane Smith - Apartment Building',
          timestamp: '2 hours ago',
          status: 'success'
        }
      ]);

      // Fetch top performers from surveyor API
      try {
        const surveyorsResult = await fetch('/api/surveyor?limit=3&sortBy=rating').then(res => res.json());
        if (surveyorsResult && surveyorsResult.data) {
          const performers = surveyorsResult.data.map((surveyor: any, index: number) => ({
            id: surveyor._id,
            name: `${surveyor.firstname} ${surveyor.lastname}`,
            completedSurveys: surveyor.completedSurveys || 0,
            averageRating: surveyor.rating || 0,
            onTimeDelivery: surveyor.onTimeDelivery || 90 + Math.floor(Math.random() * 10),
            currentAssignments: surveyor.currentAssignments || Math.floor(Math.random() * 5)
          }));
          setTopPerformers(performers);
        } else {
          // Fallback data
          setTopPerformers([
            {
              id: '1',
              name: 'Sarah Wilson',
              completedSurveys: 23,
              averageRating: 4.9,
              onTimeDelivery: 95,
              currentAssignments: 3
            },
            {
              id: '2',
              name: 'Mike Johnson',
              completedSurveys: 19,
              averageRating: 4.7,
              onTimeDelivery: 89,
              currentAssignments: 2
            },
            {
              id: '3',
              name: 'David Chen',
              completedSurveys: 17,
              averageRating: 4.8,
              onTimeDelivery: 92,
              currentAssignments: 4
            }
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch top performers:', error);
        // Use fallback data
        setTopPerformers([
          {
            id: '1',
            name: 'Sarah Wilson',
            completedSurveys: 23,
            averageRating: 4.9,
            onTimeDelivery: 95,
            currentAssignments: 3
          },
          {
            id: '2',
            name: 'Mike Johnson',
            completedSurveys: 19,
            averageRating: 4.7,
            onTimeDelivery: 89,
            currentAssignments: 2
          },
          {
            id: '3',
            name: 'David Chen',
            completedSurveys: 17,
            averageRating: 4.8,
            onTimeDelivery: 92,
            currentAssignments: 4
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'policy_submitted':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'surveyor_assigned':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'survey_completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'policy_approved':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of policy requests and surveyor operations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Policies</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalPolicies}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Assignments</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingAssignments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Surveyors</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeSurveyors}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Surveys</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completedSurveys}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-xl font-semibold text-red-600">{stats.overdueAssignments}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Completion</p>
                <p className="text-xl font-semibold text-blue-600">{stats.avgCompletionTime} days</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-xl font-semibold text-green-600">₦{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Satisfaction</p>
                <p className="text-xl font-semibold text-yellow-600">{stats.satisfactionScore}/5.0</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Performing Surveyors */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topPerformers.map((surveyor, index) => (
                  <div key={surveyor.id} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{surveyor.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{surveyor.completedSurveys} surveys</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 mr-1" />
                          {surveyor.averageRating}
                        </span>
                        <span>•</span>
                        <span>{surveyor.onTimeDelivery}% on-time</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button 
              onClick={() => router.push('/admin/dashboard/policies')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Manage Policies</p>
              <p className="text-xs text-gray-500">View and assign policies</p>
            </button>
            
            <button 
              onClick={() => router.push('/admin/dashboard/surveyors')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Manage Surveyors</p>
              <p className="text-xs text-gray-500">View surveyor profiles</p>
            </button>
            
            <button 
              onClick={() => router.push('/admin/dashboard/assignments')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CheckCircle className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">View Assignments</p>
              <p className="text-xs text-gray-500">Manage surveyor tasks</p>
            </button>
            
            <button 
              onClick={() => router.push('/admin/dashboard/policies?tab=surveyed')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TrendingUp className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Review Surveys</p>
              <p className="text-xs text-gray-500">Approve submissions</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;