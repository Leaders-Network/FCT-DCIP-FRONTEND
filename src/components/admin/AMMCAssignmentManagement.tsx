"use client";
import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Search,
  AlertTriangle,
  CheckCircle,
  User,
  Phone,
  Mail,
  X,
  MapPin,
  Calendar,
  Flag,
  Star,
  Briefcase,
  Activity,
} from "lucide-react";
import { getAuthToken } from "@/utils/auth";
import { DualAssignment } from "@/types/api.types";
import { AssignmentManagementProps } from "@/types/component.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AMMCSurveyorForAssignment {
  _id: string;
  userId: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  specialization: string[];
  experience: number;
  availability: "available" | "busy" | "unavailable";
  currentAssignments: number;
  maxAssignments: number;
  rating: number;
  completedSurveys: number;
}

interface SurveyorProfile {
  availability?: "available" | "busy" | "unavailable";
  specialization?: string[];
  experience?: number;
}

interface SurveyorStatistics {
  completedSurveys?: number;
  currentWorkload?: number;
}

interface AMMCSurveyorApiResponse {
  _id: string;
  userId?: string | { _id?: string; firstname?: string; lastname?: string; email?: string; phonenumber?: string };
  firstname?: string;
  lastname?: string;
  email?: string;
  phonenumber?: string;
  specializations?: string[];
  experience?: number;
  rating?: number;
  completedSurveys?: number;
  profile?: SurveyorProfile;
  statistics?: SurveyorStatistics;
}

interface AMMCAssignmentManagementProps extends AssignmentManagementProps {
  assignment: DualAssignment;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const PRIORITY_CFG: Record<string, { label: string; bg: string; border: string; text: string }> = {
  urgent: { label: "Urgent", bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700"    },
  high:   { label: "High",   bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
  medium: { label: "Medium", bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700"  },
  low:    { label: "Low",    bg: "bg-emerald-50",border: "border-emerald-200",text: "text-emerald-700" },
};

const AVAIL_CFG: Record<string, { label: string; dot: string; bg: string; border: string; text: string }> = {
  available:   { label: "Available",   dot: "bg-emerald-400", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  busy:        { label: "Busy",        dot: "bg-amber-400",   bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700"   },
  unavailable: { label: "Unavailable", dot: "bg-red-400",     bg: "bg-red-50",     border: "border-red-200",     text: "text-red-700"     },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between gap-2 border-b border-slate-100 py-2 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-semibold text-slate-800 text-right">{value}</span>
    </div>
  );
}

function WorkloadBar({ current, max }: { current: number; max: number }) {
  const pct = Math.min(Math.round((current / max) * 100), 100);
  const color = pct >= 80 ? "bg-red-400" : pct >= 50 ? "bg-amber-400" : "bg-emerald-400";
  return (
    <div>
      <div className="mb-1 flex justify-between">
        <span className="text-[10px] font-medium text-slate-400">Workload</span>
        <span className="text-[10px] font-semibold text-slate-600">{current}/{max} ({pct}%)</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100">
        <div className={`h-1.5 rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`h-3 w-3 ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"}`} />
      ))}
      <span className="ml-1 text-[10px] font-semibold text-slate-500">{rating.toFixed(1)}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const AMMCAssignmentManagement: React.FC<AMMCAssignmentManagementProps> = ({
  assignment,
  onAssignmentComplete,
  onClose,
}) => {
  const [surveyors, setSurveyors] = useState<AMMCSurveyorForAssignment[]>([]);
  const [filteredSurveyors, setFilteredSurveyors] = useState<AMMCSurveyorForAssignment[]>([]);
  const [selectedSurveyor, setSelectedSurveyor] = useState<AMMCSurveyorForAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ availability: "all", specialization: "all", experience: "all" });

  useEffect(() => { fetchAvailableSurveyors(); }, []);
  useEffect(() => { filterSurveyors(); }, [surveyors, searchQuery, filters]);

  const fetchAvailableSurveyors = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found");

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
      const response = await fetch(`${baseUrl}/admin/surveyor?status=active&organization=AMMC`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to fetch available surveyors");

      const data = await response.json();

      if (data.success) {
        const ammcSurveyors = (data.data || []).map((surveyor: AMMCSurveyorApiResponse): AMMCSurveyorForAssignment => {
          const userData = typeof surveyor.userId === "object" ? surveyor.userId : surveyor;
          const employeeId =
            typeof surveyor.userId === "string"
              ? surveyor.userId
              : (typeof surveyor.userId === "object" && surveyor.userId?._id) || "";

          return {
            _id: surveyor._id,
            userId: employeeId,
            firstname: userData.firstname || surveyor.firstname || "",
            lastname: userData.lastname || surveyor.lastname || "",
            email: userData.email || surveyor.email || "",
            phoneNumber: userData.phonenumber || surveyor.phonenumber || "",
            specialization: surveyor.profile?.specialization || surveyor.specializations || ["residential"],
            experience: surveyor.profile?.experience || surveyor.experience || 0,
            availability: surveyor.profile?.availability || "available",
            currentAssignments: surveyor.statistics?.currentWorkload || 0,
            maxAssignments: 3,
            rating: surveyor.rating || 4.0,
            completedSurveys: surveyor.statistics?.completedSurveys || surveyor.completedSurveys || 0,
          };
        });
        setSurveyors(ammcSurveyors);
      } else {
        throw new Error(data.message || "Failed to load surveyors");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load surveyors");
    } finally {
      setLoading(false);
    }
  };

  const filterSurveyors = () => {
    let filtered = [...surveyors];

    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          `${s.firstname} ${s.lastname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.specialization.some((sp) => sp.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (filters.availability !== "all") filtered = filtered.filter((s) => s.availability === filters.availability);
    if (filters.specialization !== "all") filtered = filtered.filter((s) => s.specialization.includes(filters.specialization));
    if (filters.experience !== "all") {
      const lvl = parseInt(filters.experience);
      filtered = filtered.filter((s) => s.experience >= lvl);
    }

    filtered.sort((a, b) => {
      if (a.availability === "available" && b.availability !== "available") return -1;
      if (b.availability === "available" && a.availability !== "available") return 1;
      return b.rating - a.rating;
    });

    setFilteredSurveyors(filtered);
  };

  const handleAssignSurveyor = async () => {
    if (!selectedSurveyor) return;
    try {
      setAssigning(true);
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found");

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
      const response = await fetch(`${baseUrl}/dual-assignment/${assignment._id}/assign-ammc`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          surveyorId: selectedSurveyor.userId,
          priority: assignment.priority,
          deadline: assignment.estimatedCompletion.overallDeadline,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `HTTP ${response.status}: Failed to assign surveyor`);
      if (data.success) {
        onAssignmentComplete?.();
        onClose?.();
      } else {
        throw new Error(data.message || "Failed to assign surveyor");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign surveyor");
    } finally {
      setAssigning(false);
    }
  };

  const priCfg = PRIORITY_CFG[assignment.priority?.toLowerCase()] ?? PRIORITY_CFG.medium;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15,23,42,0.6)" }}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="relative flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 shadow-[0_32px_120px_rgba(15,23,42,0.25)] backdrop-blur-xl">

        {/* Gradient accent bar */}
        <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-[#028835] via-emerald-500 to-teal-400" />

        {/* Header */}
        <div className="flex shrink-0 items-start justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600">AMMC Surveyor Assignment</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Assign a Surveyor</h2>
            <p className="mt-0.5 text-sm text-slate-500 truncate max-w-lg">
              {assignment.policyId.propertyDetails.propertyType} — {assignment.policyId.propertyDetails.address}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:border-slate-300 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body — two columns */}
        <div className="flex min-h-0 flex-1 overflow-hidden">

          {/* ── Left panel: Assignment details ── */}
          <div className="hidden w-72 shrink-0 flex-col gap-4 overflow-y-auto border-r border-slate-100 p-5 lg:flex">

            {/* Priority + deadline */}
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Assignment Info</p>
              <div className={`flex items-center gap-2 rounded-2xl border px-3 py-2 ${priCfg.bg} ${priCfg.border}`}>
                <Flag className={`h-3.5 w-3.5 ${priCfg.text}`} />
                <span className={`text-xs font-semibold ${priCfg.text}`}>{priCfg.label} Priority</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs font-semibold text-slate-700">
                  Due {new Date(assignment.estimatedCompletion.overallDeadline).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            </div>

            {/* Property */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Property</p>
              <InfoRow label="Type" value={assignment.policyId.propertyDetails.propertyType} />
              <InfoRow label="Value" value={`₦${assignment.policyId.propertyDetails.buildingValue.toLocaleString()}`} />
              <div className="flex items-start gap-2 border-b border-slate-100 py-2 last:border-0">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
                <span className="text-xs text-slate-600 leading-relaxed">{assignment.policyId.propertyDetails.address}</span>
              </div>
            </div>

            {/* Client */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Client Contact</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 shrink-0 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-800">{assignment.policyId.contactDetails.fullName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 shrink-0 text-slate-400" />
                  <span className="text-xs text-slate-600 truncate">{assignment.policyId.contactDetails.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 shrink-0 text-slate-400" />
                  <span className="text-xs text-slate-600">{assignment.policyId.contactDetails.phoneNumber}</span>
                </div>
              </div>
            </div>

            {/* Current AMMC surveyor */}
            {assignment.ammcSurveyorContact && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600">Current AMMC Surveyor</p>
                <p className="text-xs font-semibold text-slate-800">{assignment.ammcSurveyorContact.name}</p>
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-500 truncate">{assignment.ammcSurveyorContact.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-500">{assignment.ammcSurveyorContact.phone}</span>
                  </div>
                </div>
                {(assignment.ammcSurveyorContact.specialization?.length ?? 0) > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {assignment.ammcSurveyorContact.specialization?.map((sp: string, i: number) => (
                      <span key={i} className="rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        {sp}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* NIA surveyor */}
            {assignment.niaSurveyorContact && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">NIA Surveyor</p>
                <p className="text-xs font-semibold text-slate-800">{assignment.niaSurveyorContact.name}</p>
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-500 truncate">{assignment.niaSurveyorContact.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-500">{assignment.niaSurveyorContact.phone}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right panel: Surveyor selection ── */}
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

            {/* Filters */}
            <div className="shrink-0 border-b border-slate-100 p-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search surveyors…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-9 pr-4 text-sm text-slate-700 placeholder-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/60"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={filters.availability}
                    onChange={(e) => setFilters((p) => ({ ...p, availability: e.target.value }))}
                    className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs text-slate-700 focus:border-emerald-300 focus:outline-none"
                  >
                    <option value="all">All availability</option>
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="unavailable">Unavailable</option>
                  </select>

                  <select
                    value={filters.specialization}
                    onChange={(e) => setFilters((p) => ({ ...p, specialization: e.target.value }))}
                    className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs text-slate-700 focus:border-emerald-300 focus:outline-none"
                  >
                    <option value="all">All specializations</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="mixed-use">Mixed Use</option>
                  </select>

                  <select
                    value={filters.experience}
                    onChange={(e) => setFilters((p) => ({ ...p, experience: e.target.value }))}
                    className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs text-slate-700 focus:border-emerald-300 focus:outline-none"
                  >
                    <option value="all">Any experience</option>
                    <option value="1">1+ years</option>
                    <option value="3">3+ years</option>
                    <option value="5">5+ years</option>
                    <option value="10">10+ years</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Surveyor list */}
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {error && (
                <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
                  ))}
                </div>
              ) : filteredSurveyors.length > 0 ? (
                <div className="space-y-3">
                  {filteredSurveyors.map((surveyor) => {
                    const isSelected = selectedSurveyor?._id === surveyor._id;
                    const availCfg = AVAIL_CFG[surveyor.availability] ?? AVAIL_CFG.available;

                    return (
                      <div
                        key={surveyor._id}
                        onClick={() => setSelectedSurveyor(isSelected ? null : surveyor)}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                          isSelected
                            ? "border-emerald-300 bg-emerald-50/80 shadow-[0_0_0_2px_rgba(5,150,105,0.15)]"
                            : "border-slate-100 bg-white hover:border-emerald-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm ${
                            surveyor.availability === "available"
                              ? "bg-gradient-to-br from-[#028835] to-emerald-600"
                              : surveyor.availability === "busy"
                              ? "bg-gradient-to-br from-amber-500 to-orange-500"
                              : "bg-gradient-to-br from-slate-400 to-slate-500"
                          }`}>
                            {surveyor.firstname[0]}{surveyor.lastname[0]}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900">
                                  {surveyor.firstname} {surveyor.lastname}
                                </p>
                                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${availCfg.bg} ${availCfg.border} ${availCfg.text}`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${availCfg.dot}`} />
                                    {availCfg.label}
                                  </span>
                                  <StarRating rating={surveyor.rating} />
                                </div>
                              </div>
                              {isSelected && (
                                <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
                              )}
                            </div>

                            {/* Contact row */}
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Mail className="h-3 w-3" />
                                <span className="truncate max-w-[160px]">{surveyor.email}</span>
                              </div>
                              {surveyor.phoneNumber && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                  <Phone className="h-3 w-3" />
                                  {surveyor.phoneNumber}
                                </div>
                              )}
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Briefcase className="h-3 w-3" />
                                {surveyor.experience}y exp
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Activity className="h-3 w-3" />
                                {surveyor.completedSurveys} surveys done
                              </div>
                            </div>

                            {/* Workload bar */}
                            <div className="mt-2.5">
                              <WorkloadBar current={surveyor.currentAssignments} max={surveyor.maxAssignments} />
                            </div>

                            {/* Specialisations */}
                            {surveyor.specialization.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {surveyor.specialization.map((sp, i) => (
                                  <span key={i} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                    {sp}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-14 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                    <User className="h-6 w-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">No surveyors found</p>
                    <p className="mt-0.5 text-xs text-slate-400">Try adjusting your filters to see more surveyors.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-slate-100 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                {/* Selected preview */}
                {selectedSurveyor ? (
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xs font-bold text-emerald-700">
                      {selectedSurveyor.firstname[0]}{selectedSurveyor.lastname[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {selectedSurveyor.firstname} {selectedSurveyor.lastname}
                      </p>
                      <p className="text-[10px] text-slate-400">Selected for assignment</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Select a surveyor above to proceed</p>
                )}

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={onClose}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignSurveyor}
                    disabled={!selectedSurveyor || assigning}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#028835] to-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-200/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {assigning ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Assigning…
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Assign Surveyor
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AMMCAssignmentManagement;