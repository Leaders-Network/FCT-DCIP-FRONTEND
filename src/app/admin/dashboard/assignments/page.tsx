"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  Eye,
  UserCheck,
  Calendar,
  Building2,
  Download,
  X,
  Activity,
  Flag,
  Mail,
  Phone,
  User,
  Camera,
} from "lucide-react";
import { adminApi } from "@/services/api";
import { downloadSubmissionZipByAssignment } from "@/services/api";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Assignment {
  _id: string;
  policyId: {
    _id: string;
    policyNumber: string;
    builder: {
      nameOfBuilder: string;
      customerEmail: string;
      address: string;
      telNo?: string;
    };
    status: string;
    priority: string;
  };
  surveyorId: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
  } | null;
  status: string;
  priority: string;
  deadline: string;
  assignedAt: string;
  location: { address: string };
}

interface AssignmentStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  overdueCount: number;
}

// ─── Config maps ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; dot: string; bg: string; border: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  assigned:    { label: "Assigned",    dot: "bg-amber-400",  bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700",  icon: UserCheck  },
  accepted:    { label: "Accepted",    dot: "bg-blue-400",   bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   icon: CheckCircle },
  in_progress: { label: "In Progress", dot: "bg-indigo-400", bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", icon: Activity   },
  completed:   { label: "Completed",   dot: "bg-emerald-400",bg: "bg-emerald-50",border: "border-emerald-200",text: "text-emerald-700",icon: CheckCircle },
  rejected:    { label: "Rejected",    dot: "bg-orange-400", bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", icon: AlertTriangle},
  cancelled:   { label: "Cancelled",   dot: "bg-slate-400",  bg: "bg-slate-50",  border: "border-slate-200",  text: "text-slate-500",  icon: AlertTriangle},
};

const PRIORITY_CFG: Record<string, { label: string; bg: string; border: string; text: string }> = {
  urgent: { label: "Urgent", bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700"    },
  high:   { label: "High",   bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
  medium: { label: "Medium", bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700"  },
  low:    { label: "Low",    bg: "bg-emerald-50",border: "border-emerald-200",text: "text-emerald-700" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.assigned;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.border} ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const cfg = PRIORITY_CFG[priority?.toLowerCase()] ?? PRIORITY_CFG.medium;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.border} ${cfg.text}`}>
      <Flag className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function isOverdue(deadline: string, status: string) {
  if (status === "completed" || status === "cancelled") return false;
  return new Date(deadline) < new Date();
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, icon: Icon, iconBg, iconColor, valueColor,
}: {
  label: string; value: number | string; icon: React.ComponentType<{ className?: string }>;
  iconBg: string; iconColor: string; valueColor?: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-[1.5rem] border border-white/70 bg-white/90 p-5 shadow-[0_8px_32px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(15,23,42,0.09)]">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
        <p className={`text-2xl font-bold ${valueColor ?? "text-slate-900"}`}>{value}</p>
      </div>
    </div>
  );
}

// ─── Details Modal ────────────────────────────────────────────────────────────

function DetailsModal({
  assignment,
  onClose,
  onDownload,
  downloading,
}: {
  assignment: Assignment;
  onClose: () => void;
  onDownload: (id: string) => void;
  downloading: boolean;
}) {
  const overdue = isOverdue(assignment.deadline, assignment.status);
  const statusCfg = STATUS_CFG[assignment.status] ?? STATUS_CFG.assigned;
  const priCfg = PRIORITY_CFG[assignment.priority?.toLowerCase()] ?? PRIORITY_CFG.medium;
  const StatusIcon = statusCfg.icon;
  const surveyorName = assignment.surveyorId
    ? `${assignment.surveyorId.firstname} ${assignment.surveyorId.lastname}`
    : "Unassigned";

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent hideCloseButton className="max-h-[94vh] w-[min(92vw,42rem)] max-w-xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 p-0 shadow-[0_32px_120px_rgba(15,23,42,0.22)] backdrop-blur-xl">
        <div className="max-h-[94vh] overflow-y-auto">
          {/* Gradient accent bar */}
          <div className="h-1.5 w-full rounded-t-[2rem] bg-gradient-to-r from-[#028835] via-emerald-500 to-teal-400" />

          {/* Header */}
          <div className="relative px-6 pt-5 pb-4">
            <button
              onClick={onClose}
              aria-label="Close assignment details"
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:border-slate-300 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600">Assignment Details</p>
            <h3 className="mt-1 text-xl font-bold text-slate-900">
              Policy #{assignment.policyId?.policyNumber || "N/A"}
            </h3>
            <p className="mt-0.5 break-all text-xs text-slate-400">ID: {assignment._id}</p>

            {/* Status / Priority / Overdue */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusBadge status={assignment.status} />
              <PriorityBadge priority={assignment.priority} />
              {overdue && (
                <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                  <AlertTriangle className="h-3 w-3" />
                  Overdue
                </span>
              )}
            </div>
          </div>

          {/* Timeline strip */}
          <div className="mx-6 mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Assigned On</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{fmtDate(assignment.assignedAt)}</p>
            </div>
            <div className={`rounded-2xl border px-4 py-3 ${overdue ? "border-red-100 bg-red-50/70" : "border-slate-100 bg-slate-50/70"}`}>
              <p className={`text-[10px] font-semibold uppercase tracking-widest ${overdue ? "text-red-400" : "text-slate-400"}`}>Deadline</p>
              <p className={`mt-1 text-sm font-semibold ${overdue ? "text-red-700" : "text-slate-800"}`}>{fmtDate(assignment.deadline)}</p>
            </div>
          </div>

          <div className="mx-6 mb-6 space-y-4">
            {/* Builder */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-[#028835] to-emerald-600 text-white shadow-sm">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Builder / Contractor</p>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <User className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <p className="text-sm font-semibold text-slate-800">{assignment.policyId?.builder?.nameOfBuilder || "N/A"}</p>
                </div>
                {assignment.policyId?.builder?.customerEmail && (
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <a href={`mailto:${assignment.policyId.builder.customerEmail}`} className="text-sm text-slate-600 hover:text-emerald-700 hover:underline">
                      {assignment.policyId.builder.customerEmail}
                    </a>
                  </div>
                )}
                {assignment.policyId?.builder?.telNo && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <a href={`tel:${assignment.policyId.builder.telNo}`} className="text-sm text-slate-600 hover:text-emerald-700 hover:underline">
                      {assignment.policyId.builder.telNo}
                    </a>
                  </div>
                )}
                {assignment.policyId?.builder?.address && (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <p className="text-sm leading-relaxed text-slate-600">{assignment.policyId.builder.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Surveyor */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
                  <UserCheck className="h-3.5 w-3.5" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Assigned Surveyor</p>
              </div>
              {assignment.surveyorId ? (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#028835] to-emerald-600 text-xs font-bold text-white shadow-sm">
                      {assignment.surveyorId.firstname[0]}{assignment.surveyorId.lastname[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{surveyorName}</p>
                      <p className="text-xs text-slate-500">Surveyor</p>
                    </div>
                  </div>
                  {assignment.surveyorId.email && (
                    <div className="flex items-center gap-2.5">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <a href={`mailto:${assignment.surveyorId.email}`} className="text-sm text-slate-600 hover:text-emerald-700 hover:underline">
                        {assignment.surveyorId.email}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white">
                    <User className="h-4 w-4 text-slate-300" />
                  </div>
                  <p className="text-sm italic text-slate-400">No surveyor assigned yet</p>
                </div>
              )}
            </div>

            {/* Location */}
            {(assignment.location?.address || assignment.policyId?.builder?.address) && (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600">Survey Location</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-700">
                    {assignment.location?.address || assignment.policyId?.builder?.address}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
            {assignment.status === "completed" ? (
              <button
                onClick={() => onDownload(assignment._id)}
                disabled={downloading}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#028835] to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-200/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {downloading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                {downloading ? "Downloading…" : "Download Survey Docs"}
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const AutomatedAssignmentsPage = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<AssignmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ status: "all", priority: "all", search: "" });
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isDownloadingDocs, setIsDownloadingDocs] = useState(false);

  const handleDownloadDocs = async (assignmentId: string) => {
    setIsDownloadingDocs(true);
    try {
      await downloadSubmissionZipByAssignment(assignmentId);
    } finally {
      setIsDownloadingDocs(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [filters]);

  const buildStatsFromAssignments = (items: Assignment[]): AssignmentStats => {
    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    let overdueCount = 0;
    for (const item of items) {
      byStatus[item.status] = (byStatus[item.status] || 0) + 1;
      byPriority[item.priority] = (byPriority[item.priority] || 0) + 1;
      if (isOverdue(item.deadline, item.status)) overdueCount += 1;
    }
    return { total: items.length, byStatus, byPriority, overdueCount };
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);

      interface AssignmentParams {
        page: number; limit: number; sortBy: string; sortOrder: string;
        status?: string; priority?: string; search?: string;
      }

      const params: AssignmentParams = { page: 1, limit: 200, sortBy: "assignedAt", sortOrder: "desc" };
      if (filters.priority !== "all") params.priority = filters.priority;
      if (filters.search) params.search = filters.search;

      if (filters.status === "all") {
        const statuses: Array<Assignment["status"]> = ["assigned", "accepted", "in_progress", "completed", "rejected", "cancelled"];
        const responses = await Promise.all(statuses.map((status) => adminApi.getAssignments({ ...params, status })));

        const firstError = responses.find((r) => !r?.success);
        if (firstError && !firstError.success) throw new Error(firstError.message || "Failed to load assignments");

        const merged = new Map<string, Assignment>();
        for (const r of responses) {
          for (const item of (r?.data?.assignments || []) as Assignment[]) {
            merged.set(item._id, item);
          }
        }
        const list = Array.from(merged.values()).sort(
          (a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
        );
        setAssignments(list);
        setStats(buildStatsFromAssignments(list));
      } else {
        const response = await adminApi.getAssignments({ ...params, status: filters.status });
        if (!response.success) throw new Error(response.message || "Failed to load assignments");

        const list = (response.data.assignments || []) as Assignment[];
        setAssignments(list);

        const statusBreakdown = response.data.statistics?.statusBreakdown || [];
        const priorityBreakdown = response.data.statistics?.priorityBreakdown || [];

        if (statusBreakdown.length || priorityBreakdown.length) {
          const byStatus: Record<string, number> = {};
          statusBreakdown.forEach((item: { _id: string; count: number }) => { byStatus[item._id] = item.count; });
          const byPriority: Record<string, number> = {};
          priorityBreakdown.forEach((item: { _id: string; count: number }) => { byPriority[item._id] = item.count; });
          setStats({ total: response.data.pagination?.totalRecords || list.length, byStatus, byPriority, overdueCount: response.data.statistics?.overdueAssignments || 0 });
        } else {
          setStats(buildStatsFromAssignments(list));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total"       value={stats.total}                                                      icon={Users}       iconBg="bg-slate-100"   iconColor="text-slate-600" />
          <StatCard label="In Progress" value={(stats.byStatus?.in_progress || 0) + (stats.byStatus?.accepted || 0)} icon={Activity}    iconBg="bg-indigo-100"  iconColor="text-indigo-600" valueColor="text-indigo-700" />
          <StatCard label="Completed"   value={stats.byStatus?.completed || 0}                                   icon={CheckCircle} iconBg="bg-emerald-100" iconColor="text-emerald-600" valueColor="text-emerald-700" />
          <StatCard label="Overdue"     value={stats.overdueCount || 0}                                          icon={AlertTriangle}iconBg="bg-red-100"     iconColor="text-red-600"    valueColor="text-red-700" />
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-[1.5rem] border border-white/70 bg-white/90 p-4 shadow-[0_8px_32px_rgba(15,23,42,0.05)] backdrop-blur-xl sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by builder name, email or address…"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-9 pr-4 text-sm text-slate-700 placeholder-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/60"
          />
        </div>

        <div className="flex gap-2">
          <select
            aria-label="Filter assignments by status"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-700 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/60"
          >
            <option value="all">All Statuses</option>
            <option value="assigned">Assigned</option>
            <option value="accepted">Accepted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            aria-label="Filter assignments by priority"
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-700 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/60"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <button
            onClick={fetchAssignments}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-700 hover:shadow-md"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Assignment list */}
      <div className="rounded-[1.5rem] border border-white/70 bg-white/90 shadow-[0_8px_32px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        {loading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Failed to load assignments</p>
              <p className="mt-0.5 text-xs text-slate-500">{error}</p>
            </div>
            <button
              onClick={fetchAssignments}
              className="mt-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              Try Again
            </button>
          </div>
        ) : assignments.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Building2 className="h-6 w-6 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">No assignments found</p>
              <p className="mt-0.5 text-xs text-slate-400">
                {filters.search || filters.status !== "all" || filters.priority !== "all"
                  ? "Try adjusting your filters"
                  : "Assignments will appear here once policies are submitted"}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-3">
              <p className="col-span-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Policy / Builder</p>
              <p className="col-span-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Surveyor</p>
              <p className="col-span-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Status</p>
              <p className="col-span-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Priority</p>
              <p className="col-span-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Deadline</p>
              <p className="col-span-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 text-right">Action</p>
            </div>

            {assignments.map((asgn) => {
              const overdue = isOverdue(asgn.deadline, asgn.status);
              return (
                <div
                  key={asgn._id}
                  className="grid grid-cols-12 items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50/70"
                >
                  {/* Policy / Builder */}
                  <div className="col-span-4 min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {asgn.policyId?.policyNumber || "N/A"}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {asgn.policyId?.builder?.nameOfBuilder || "Unknown Builder"}
                    </p>
                  </div>

                  {/* Surveyor */}
                  <div className="col-span-2 min-w-0">
                    {asgn.surveyorId ? (
                      <>
                        <p className="truncate text-sm font-medium text-slate-800">
                          {asgn.surveyorId.firstname} {asgn.surveyorId.lastname}
                        </p>
                        <p className="truncate text-xs text-slate-400">{asgn.surveyorId.email}</p>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Unassigned</span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <StatusBadge status={asgn.status} />
                  </div>

                  {/* Priority */}
                  <div className="col-span-2">
                    <PriorityBadge priority={asgn.priority} />
                  </div>

                  {/* Deadline */}
                  <div className="col-span-1 min-w-0">
                    <p className={`text-xs font-medium ${overdue ? "text-red-600" : "text-slate-600"}`}>
                      {fmtDate(asgn.deadline)}
                    </p>
                    {overdue && (
                      <span className="text-[10px] font-semibold text-red-500">Overdue</span>
                    )}
                  </div>

                  {/* Action */}
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => setSelectedAssignment(asgn)}
                      className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-700 hover:shadow-md"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating count */}
      {!loading && assignments.length > 0 && (
        <p className="text-right text-xs text-slate-400">
          Showing {assignments.length} assignment{assignments.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Details modal */}
      {selectedAssignment && (
        <DetailsModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          onDownload={handleDownloadDocs}
          downloading={isDownloadingDocs}
        />
      )}
    </div>
  );
};

export default AutomatedAssignmentsPage;
