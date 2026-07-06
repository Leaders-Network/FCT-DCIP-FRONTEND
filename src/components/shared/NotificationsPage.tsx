"use client";

import React, { useState } from "react";
import { Bell, Check, CheckCheck, Trash2, Filter, Sparkles } from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import { usePathname, useRouter } from "next/navigation";
import { Notification } from "@/types/notification.types";

const NotificationsPage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const notificationsPath = pathname?.startsWith("/admin/dashboard")
    ? "/admin/dashboard/notifications"
    : pathname?.startsWith("/broker-admin")
      ? "/broker-admin/notifications"
      : pathname?.startsWith("/nia-admin")
        ? "/nia-admin/notifications"
        : pathname?.startsWith("/surveyor/dashboard")
          ? "/surveyor/dashboard/notifications"
          : "/dashboard/notifications";

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread" && n.read) return false;
    if (typeFilter !== "all" && n.type !== typeFilter) return false;
    return true;
  });

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    router.push(`${notificationsPath}/${notification._id}`);
  };

  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      policy_created: "📋",
      policy_assigned: "👤",
      assignment_created: "📝",
      survey_submitted: "✅",
      report_ready: "📄",
      payment_required: "💳",
      assignment_deadline_approaching: "⏰",
      conflict_detected: "⚠️",
      system_alert: "🔔",
    };
    return iconMap[type] || "📬";
  };

  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      low: "bg-slate-100 text-slate-700 border-slate-200",
      medium: "bg-sky-100 text-sky-700 border-sky-200",
      high: "bg-amber-100 text-amber-700 border-amber-200",
      urgent: "bg-red-100 text-red-700 border-red-200",
    };
    return colorMap[priority] || "bg-slate-100 text-slate-700 border-slate-200";
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return notificationDate.toLocaleDateString();
  };

  const notificationTypes = [
    { value: "all", label: "All Types" },
    { value: "policy_created", label: "Policy Created" },
    { value: "assignment_created", label: "Assignments" },
    { value: "survey_submitted", label: "Surveys" },
    { value: "report_ready", label: "Reports" },
    { value: "payment_required", label: "Payments" },
  ];

  return (
    <div className="space-y-6 px-4 py-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-[#015a23] via-[#028835] to-emerald-500 p-6 text-white shadow-[0_24px_80px_rgba(5,150,105,0.22)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_36%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-50">
              <Sparkles className="h-3.5 w-3.5" />
              Notifications
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Notifications</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/90 sm:text-base">
              Stay on top of alerts, policy updates, and workflow changes from one clean, modern feed.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/15 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#028835] shadow-sm">
                <CheckCheck className="h-5 w-5" />
              </span>
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                  : "All caught up"}
              </p>
              <p className="text-sm text-slate-500">
                {notifications.length} total notification{notifications.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Filter</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  filter === "all"
                    ? "bg-slate-900 text-white shadow-md"
                    : "border border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  filter === "unread"
                    ? "bg-slate-900 text-white shadow-md"
                    : "border border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm transition-all duration-300 focus:border-[#028835] focus:outline-none focus:ring-4 focus:ring-[#028835]/10"
            >
              {notificationTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-12 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#028835]" />
            <p className="mt-4 text-sm text-slate-500">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-12 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <Bell className="mx-auto mb-4 h-16 w-16 text-slate-300" />
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              {notifications.length === 0 ? "No notifications yet" : "No matching notifications"}
            </h3>
            <p className="text-sm leading-6 text-slate-500">
              {filter === "unread"
                ? "You're all caught up."
                : notifications.length === 0
                  ? "Notifications will appear here when something changes on your account."
                  : "Try adjusting your filters to see more notifications."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={`group cursor-pointer rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                !notification.read ? "ring-2 ring-emerald-100" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-3xl transition-transform duration-300 group-hover:scale-105">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className={`text-base font-semibold text-slate-900 ${!notification.read ? "font-bold" : ""}`}>
                        {notification.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-500" />
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{formatTimeAgo(notification.createdAt)}</span>
                      <span className={`rounded-full border px-3 py-1 ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification._id);
                          }}
                          className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-100"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification._id);
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
