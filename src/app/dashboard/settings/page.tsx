"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import api from "@/services/api";
import { extractErrorMessage } from "@/types/error.types";
import { setCookie, getCookie } from "@/utils/cookies";

export default function UserSettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [profileData, setProfileData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phonenumber: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/settings/profile");
      if (response.data.success) {
        const { firstname, lastname, email, phonenumber } = response.data.data;
        setProfileData({ firstname, lastname, email, phonenumber });
      }
    } catch {
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await api.patch("/settings/profile", profileData);

      if (response.data.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        const storedUser = getCookie("user");
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            userData.fullname = `${profileData.firstname} ${profileData.lastname}`;
            userData.firstname = profileData.firstname;
            userData.lastname = profileData.lastname;
            setCookie("user", JSON.stringify(userData), { expires: 7 });
          } catch {
          }
        }
      } else {
        setMessage({ type: "error", text: response.data.message || "Failed to update profile" });
      }
    } catch (error) {
      setMessage({ type: "error", text: extractErrorMessage(error) || "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/settings/change-password", passwordData);

      if (response.data.success) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setMessage({ type: "error", text: response.data.message || "Failed to change password" });
      }
    } catch (error) {
      setMessage({ type: "error", text: extractErrorMessage(error) || "Failed to change password" });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 pl-11 text-sm shadow-sm transition-all duration-300 placeholder:text-slate-400 focus:border-[#028835] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#028835]/10";

  return (
    <div className="space-y-6 px-4 py-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-[#015a23] via-[#028835] to-emerald-500 p-6 text-white shadow-[0_24px_80px_rgba(5,150,105,0.22)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_36%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-50">
              <Sparkles className="h-3.5 w-3.5" />
              Account settings
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/90 sm:text-base">
              Update your profile details and password in a clean, distraction-free workspace.
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`flex items-start gap-3 rounded-[1.5rem] border p-4 shadow-sm ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50/90 text-emerald-800"
              : "border-red-200 bg-red-50/90 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <div className="rounded-[2rem] border border-white/70 bg-white/85 p-2 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="grid grid-cols-2 rounded-[1.5rem] bg-slate-100/90 p-1">
          <button
            onClick={() => setActiveTab("profile")}
            className={`rounded-[1.25rem] px-4 py-3 text-sm font-medium transition-all duration-300 ${
              activeTab === "profile"
                ? "bg-white text-[#028835] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <User className="mr-2 inline-block h-4 w-4" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`rounded-[1.25rem] px-4 py-3 text-sm font-medium transition-all duration-300 ${
              activeTab === "password"
                ? "bg-white text-[#028835] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Lock className="mr-2 inline-block h-4 w-4" />
            Password
          </button>
        </div>
      </div>

      {activeTab === "profile" && (
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Profile Information</h2>
              <p className="text-sm text-slate-500">Keep your account details current and accurate.</p>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">First Name</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={profileData.firstname}
                    onChange={(e) => setProfileData({ ...profileData, firstname: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Last Name</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={profileData.lastname}
                    onChange={(e) => setProfileData({ ...profileData, lastname: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Phone Number</label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={profileData.phonenumber}
                    onChange={(e) => setProfileData({ ...profileData, phonenumber: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#028835] to-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "password" && (
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Change Password</h2>
              <p className="text-sm text-slate-500">Use a strong password to keep your account secure.</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-5">
            {[
              {
                label: "Current Password",
                key: "current" as const,
                value: passwordData.currentPassword,
                setter: (value: string) =>
                  setPasswordData({ ...passwordData, currentPassword: value }),
                visible: showPasswords.current,
                toggle: () => setShowPasswords({ ...showPasswords, current: !showPasswords.current }),
              },
              {
                label: "New Password",
                key: "new" as const,
                value: passwordData.newPassword,
                setter: (value: string) =>
                  setPasswordData({ ...passwordData, newPassword: value }),
                visible: showPasswords.new,
                toggle: () => setShowPasswords({ ...showPasswords, new: !showPasswords.new }),
              },
              {
                label: "Confirm New Password",
                key: "confirm" as const,
                value: passwordData.confirmPassword,
                setter: (value: string) =>
                  setPasswordData({ ...passwordData, confirmPassword: value }),
                visible: showPasswords.confirm,
                toggle: () => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm }),
              },
            ].map((field) => (
              <div key={field.label}>
                <label className="mb-2 block text-sm font-medium text-slate-700">{field.label}</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type={field.visible ? "text" : "password"}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 pl-11 pr-11 text-sm shadow-sm transition-all duration-300 placeholder:text-slate-400 focus:border-[#028835] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#028835]/10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={field.toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                  >
                    {field.visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {field.key === "new" && (
                  <p className="mt-1 text-xs text-slate-500">Must be at least 6 characters</p>
                )}
              </div>
            ))}

            <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50/90 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                <div className="text-sm text-amber-900">
                  <p className="mb-2 font-semibold">Password Requirements</p>
                  <ul className="space-y-1 text-sm">
                    <li>At least 6 characters long</li>
                    <li>Different from your current password</li>
                    <li>Both new passwords must match</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#028835] to-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                    Changing...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
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
