'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/useAuth';
import { Employee } from '@/types/api.types';
import Link from 'next/link';

export default function DashboardSelectorPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Ensure user is authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Verify user is super-admin
    const employee = user as Employee;
    if (employee?.employeeRole?.role !== 'Super-admin') {
      router.push('/admin/dashboard');
      return;
    }
  }, [isAuthenticated, user, router]);

  const dashboards = [
    {
      id: 'admin',
      title: 'Admin Dashboard',
      description: 'Manage administrators, staff, and system configurations',
      icon: '👨‍💼',
      path: '/admin/dashboard',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'nia',
      title: 'NIA Admin Dashboard',
      description: 'Manage NIA admin functions and oversight',
      icon: '🏛️',
      path: '/nia-admin/dashboard',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'broker',
      title: 'Broker Admin Dashboard',
      description: 'Manage broker admins and their activities',
      icon: '💼',
      path: '/broker-admin/dashboard',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'surveyor',
      title: 'Surveyor Dashboard',
      description: 'Access surveyor management and assignments',
      icon: '📋',
      path: '/surveyor/dashboard',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome, Super Admin
          </h1>
          <p className="text-lg text-gray-600">
            Select a dashboard to manage different aspects of the Builders-Liability system
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboards.map((dashboard) => (
            <Link
              key={dashboard.id}
              href={dashboard.path}
              className="group transform transition-all duration-300 hover:scale-105"
            >
              <div className={`bg-gradient-to-br ${dashboard.color} rounded-lg shadow-lg p-8 h-full text-white cursor-pointer hover:shadow-2xl transition-shadow duration-300`}>
                {/* Icon */}
                <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {dashboard.icon}
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold mb-2">
                  {dashboard.title}
                </h2>

                {/* Description */}
                <p className="text-sm opacity-90 leading-relaxed">
                  {dashboard.description}
                </p>

                {/* Arrow Indicator */}
                <div className="mt-6 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-sm font-semibold">Access Dashboard</span>
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-center">
            As a Super Admin, you have access to all dashboard modules. You can manage administrators,
            NIA operations, broker activities, and surveyor assignments from a centralized location.
          </p>
        </div>
      </div>
    </div>
  );
}
