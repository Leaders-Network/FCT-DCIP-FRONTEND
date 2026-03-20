"use client";

import React, { useState } from "react";
import { Download, Loader2, Calendar } from "lucide-react";

interface ExportCsvPanelProps {
  /** Called with optional ISO date strings when the user clicks Export */
  onExport: (startDate?: string, endDate?: string) => Promise<void>;
  /** Label shown on the button — defaults to "Export CSV" */
  buttonLabel?: string;
  /** Custom class names for the wrapper card */
  className?: string;
}

/**
 * Reusable date-range CSV export panel.
 * Accepts an `onExport` callback and triggers a file download.
 */
const ExportCsvPanel: React.FC<ExportCsvPanelProps> = ({
  onExport,
  buttonLabel = "Export CSV",
  className = "",
}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleExport = async () => {
    // Basic date validation
    if (startDate && endDate && startDate > endDate) {
      setError("Start date cannot be after end date.");
      return;
    }
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await onExport(startDate || undefined, endDate || undefined);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to generate CSV export.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-5 shadow-sm ${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Download className="h-5 w-5 text-indigo-600" />
        <h3 className="text-sm font-semibold text-gray-800">Export Data</h3>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-end">
        {/* Start Date */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Start Date
            </span>
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
          />
        </div>

        {/* End Date */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> End Date
            </span>
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
          />
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {loading ? "Exporting…" : buttonLabel}
        </button>
      </div>

      {/* Status messages */}
      {error && (
        <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-3 text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
          ✓ CSV downloaded successfully.
        </p>
      )}

      <p className="mt-3 text-xs text-gray-400">
        Leave dates empty to export all records.
      </p>
    </div>
  );
};

export default ExportCsvPanel;
