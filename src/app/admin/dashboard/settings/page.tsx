"use client";

import {
  UserCog,
  Lock,
  BellRing,
  Eye,
  EyeOff,
  ServerCog,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Define interfaces for each data type
interface AccountData {
  fullName: string;
  email: string;
  role: string;
  department: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface Notifications {
  systemAlerts: boolean;
  newUserRequests: boolean;
  policyChanges: boolean;
  adminReports: boolean;
}

interface SystemPreferences {
  darkMode: boolean;
  autoBackup: boolean;
  activityLogs: boolean;
}

const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState("account");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Safe access to localStorage
  const adminName =
    typeof window !== "undefined"
      ? localStorage.getItem("adminName") || "Admin"
      : "Admin";

  const nameParts = adminName.split(" ");
  const lastName = nameParts[nameParts.length - 1];
  const initials = nameParts.map((n) => n[0]).join("").toUpperCase();

  const [accountData, setAccountData] = useState<AccountData>({
    fullName: adminName,
    email: "",
    role: "System Administrator",
    department: "",
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState<Notifications>({
    systemAlerts: true,
    newUserRequests: true,
    policyChanges: true,
    adminReports: false,
  });

  const [systemPreferences, setSystemPreferences] = useState<SystemPreferences>({
    darkMode: false,
    autoBackup: true,
    activityLogs: true,
  });

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccountData({ ...accountData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleNotificationToggle = (key: keyof Notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSystemPrefToggle = (key: keyof SystemPreferences) => {
    setSystemPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveAccount = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Admin profile updated successfully!");
  };

  const handleChangePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    toast.success("Password changed successfully!");
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleSaveNotifications = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Admin notification preferences saved!");
  };

  const handleSaveSystem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("System preferences updated!");
  };

  return (
    <div className="w-full min-h-screen bg-[#f8f8f8] font-sans flex flex-col">
      <div className="flex flex-1">
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 sm:px-8 py-6 overflow-y-auto">
            <h1 className="text-[23px] font-extrabold pb-2 pt-2">
              Hello {lastName}
            </h1>
            <p className="text-gray-700 text-[1.2rem] mb-6">
              Manage your{" "}
              <span className="font-extrabold">Admin Account</span> and system
              preferences
            </p>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="flex justify-around border-b border-gray-200">
                {[
                  { key: "account", icon: UserCog, label: "Account" },
                  { key: "security", icon: Lock, label: "Security" },
                  { key: "notifications", icon: BellRing, label: "Notifications" },
                  { key: "system", icon: ServerCog, label: "System" },
                ].map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex items-center gap-2 py-3 px-4 sm:px-6 font-medium text-[1.1rem] transition-all ${
                      activeTab === key
                        ? "text-[#028835] border-b-2 border-[#028835]"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-4 md:p-8">
                {/* Account Tab */}
                {activeTab === "account" && (
                  <form onSubmit={handleSaveAccount}>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      Admin Account Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[1.1rem] font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={accountData.fullName}
                          onChange={handleAccountChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#028835]"
                        />
                      </div>
                      <div>
                        <label className="block text-[1.1rem] font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={accountData.email}
                          onChange={handleAccountChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#028835]"
                        />
                      </div>
                      <div>
                        <label className="block text-[1.1rem] font-medium text-gray-700 mb-2">
                          Role
                        </label>
                        <input
                          type="text"
                          disabled
                          value={accountData.role}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[1.1rem] font-medium text-gray-700 mb-2">
                          Department
                        </label>
                        <input
                          type="text"
                          name="department"
                          value={accountData.department}
                          onChange={handleAccountChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#028835]"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="mt-6 px-6 py-3 bg-[#028835] text-white rounded-md hover:bg-[#026d2a] transition-colors text-[1.1rem] font-medium"
                    >
                      Save Changes
                    </button>
                  </form>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                  <form onSubmit={handleChangePassword}>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      Change Password
                    </h2>
                    <div className="max-w-md space-y-6">
                      {[
                        {
                          label: "Current Password",
                          key: "currentPassword",
                          show: showCurrentPassword,
                          set: setShowCurrentPassword,
                        },
                        {
                          label: "New Password",
                          key: "newPassword",
                          show: showNewPassword,
                          set: setShowNewPassword,
                        },
                        {
                          label: "Confirm Password",
                          key: "confirmPassword",
                          show: showConfirmPassword,
                          set: setShowConfirmPassword,
                        },
                      ].map(({ label, key, show, set }) => (
                        <div key={key}>
                          <label className="block text-[1.1rem] font-medium text-gray-700 mb-2">
                            {label}
                          </label>
                          <div className="relative">
                            <input
                              type={show ? "text" : "password"}
                              name={key}
                              value={passwordData[key as keyof PasswordData]}
                              onChange={handlePasswordChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#028835] pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => set(!show)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                              {show ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="submit"
                      className="mt-6 px-6 py-3 bg-[#028835] text-white rounded-md hover:bg-[#026d2a] transition-colors text-[1.1rem] font-medium"
                    >
                      Update Password
                    </button>
                  </form>
                )}

                {/* Notifications */}
                {activeTab === "notifications" && (
                  <form onSubmit={handleSaveNotifications}>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      Notification Preferences
                    </h2>
                    {Object.entries({
                      systemAlerts: "System Alerts",
                      newUserRequests: "New User Requests",
                      policyChanges: "Policy Updates",
                      adminReports: "Weekly Admin Reports",
                    }).map(([key, label]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between py-3 border-b border-gray-200"
                      >
                        <p className="font-medium text-gray-800 text-[1.1rem]">
                          {label}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            handleNotificationToggle(key as keyof Notifications)
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notifications[key as keyof Notifications]
                              ? "bg-[#028835]"
                              : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notifications[key as keyof Notifications]
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                    <button
                      type="submit"
                      className="mt-6 px-6 py-3 bg-[#028835] text-white rounded-md hover:bg-[#026d2a] transition-colors text-[1.1rem] font-medium"
                    >
                      Save Preferences
                    </button>
                  </form>
                )}

                {/* System Preferences */}
                {activeTab === "system" && (
                  <form onSubmit={handleSaveSystem}>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      System Preferences
                    </h2>
                    {Object.entries({
                      darkMode: "Enable Dark Mode",
                      autoBackup: "Automatic Data Backup",
                      activityLogs: "Enable Activity Logs",
                    }).map(([key, label]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between py-3 border-b border-gray-200"
                      >
                        <p className="font-medium text-gray-800 text-[1.1rem]">
                          {label}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            handleSystemPrefToggle(key as keyof SystemPreferences)
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            systemPreferences[key as keyof SystemPreferences]
                              ? "bg-[#028835]"
                              : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              systemPreferences[key as keyof SystemPreferences]
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                    <button
                      type="submit"
                      className="mt-6 px-6 py-3 bg-[#028835] text-white rounded-md hover:bg-[#026d2a] transition-colors text-[1.1rem] font-medium"
                    >
                      Save Preferences
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
