'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Save, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import api from '@/services/api';
import { setCookie } from '@/utils/cookies';

export default function SurveyorSettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile form
  const [profileData, setProfileData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phonenumber: ''
  });

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const extractProfileFields = (data: {
    firstname?: string;
    lastname?: string;
    email?: string;
    phonenumber?: string;
    userId?: {
      firstname?: string;
      lastname?: string;
      email?: string;
      phonenumber?: string;
    };
  }) => {
    return {
      firstname: data?.firstname || data?.userId?.firstname || '',
      lastname: data?.lastname || data?.userId?.lastname || '',
      email: data?.email || data?.userId?.email || '',
      phonenumber: data?.phonenumber || data?.userId?.phonenumber || ''
    };
  };

  const syncSurveyorName = (firstname: string, lastname: string) => {
    const fullName = `${firstname} ${lastname}`.trim().replace(/\s+/g, ' ');
    if (!fullName) return;

    localStorage.setItem('surveyorName', fullName);
    setCookie('surveyorName', fullName, {
      expires: 7,
      path: '/',
      secure: window.location.protocol === 'https:',
      sameSite: 'lax',
    });
    window.dispatchEvent(new Event('surveyor-name-updated'));
  };

  const fetchProfile = async () => {
    try {
      const response = await api.get('/settings/profile');
      if (response.data.success) {
        const extractedProfile = extractProfileFields(response.data.data || {});
        setProfileData(extractedProfile);
        syncSurveyorName(extractedProfile.firstname, extractedProfile.lastname);
        return;
      }
    } catch (error) {
    }

    try {
      const response = await api.get('/surveyor/profile');
      if (response.data.success) {
        const extractedProfile = extractProfileFields(response.data.data || {});
        setProfileData(extractedProfile);
        syncSurveyorName(extractedProfile.firstname, extractedProfile.lastname);
      }
    } catch (error) {
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await api.patch('/settings/profile', profileData);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        syncSurveyorName(profileData.firstname, profileData.lastname);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update profile';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/settings/change-password', passwordData);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to change password';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur-xl">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-600">Manage your surveyor account settings</p>
      </div>

      {/* Tabs */}
      <div className="rounded-[2rem] border border-white/70 bg-white/85 p-2 shadow-sm backdrop-blur-xl">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 rounded-[1.25rem] px-4 py-3 text-sm font-medium transition-all duration-300 sm:px-6 sm:py-4 sm:text-base ${activeTab === 'profile'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200/60'
              : 'text-gray-600 hover:-translate-y-0.5 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5 inline-block mr-2" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 rounded-[1.25rem] px-4 py-3 text-sm font-medium transition-all duration-300 sm:px-6 sm:py-4 sm:text-base ${activeTab === 'password'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200/60'
              : 'text-gray-600 hover:-translate-y-0.5 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            <Lock className="w-4 h-4 sm:w-5 sm:h-5 inline-block mr-2" />
            Password
          </button>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`rounded-2xl p-4 flex items-start shadow-sm ${message.type === 'success' ? 'border border-green-200 bg-green-50 text-green-800' : 'border border-red-200 bg-red-50 text-red-800'
          }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur-xl sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:mb-6 sm:text-xl">Profile Information</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={profileData.firstname}
                    onChange={(e) => setProfileData({ ...profileData, firstname: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 pl-10 shadow-sm transition-all duration-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={profileData.lastname}
                    onChange={(e) => setProfileData({ ...profileData, lastname: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 pl-10 shadow-sm transition-all duration-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 pl-10 shadow-sm transition-all duration-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={profileData.phonenumber}
                  onChange={(e) => setProfileData({ ...profileData, phonenumber: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 pl-10 shadow-sm transition-all duration-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-white shadow-md shadow-purple-200/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur-xl sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:mb-6 sm:text-xl">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 pl-10 pr-10 shadow-sm transition-all duration-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full p-1 text-gray-400 transition-all duration-300 hover:bg-gray-100 hover:text-gray-600"
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 pl-10 pr-10 shadow-sm transition-all duration-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full p-1 text-gray-400 transition-all duration-300 hover:bg-gray-100 hover:text-gray-600"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 pl-10 pr-10 shadow-sm transition-all duration-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full p-1 text-gray-400 transition-all duration-300 hover:bg-gray-100 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 shadow-sm">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Password Requirements:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>At least 6 characters long</li>
                    <li>Different from your current password</li>
                    <li>Both new passwords must match</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-white shadow-md shadow-purple-200/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Changing...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
