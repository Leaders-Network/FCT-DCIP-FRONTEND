import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

import { Surveyor } from '@/types/api.types';

export default function AdminSurveyorAvailability() {
  const [surveyors, setSurveyors] = useState<Surveyor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSurveyor, setSelectedSurveyor] = useState<{
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    availability: string;
    specializations?: string[];
  } | null>(null);
  const [newAvailability, setNewAvailability] = useState('available');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchSurveyors() {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/admin/surveyor`, { withCredentials: true });
        setSurveyors(res.data.data || []);
      } catch (err) {
        setError('Failed to fetch surveyors');
      }
      setLoading(false);
    }
    fetchSurveyors();
  }, []);

  const handleUpdateAvailability = async () => {
    if (!selectedSurveyor) return;
    setUpdating(true);
    setError('');
    try {
      await axios.patch(
        `${API_BASE_URL}/admin/surveyor/${selectedSurveyor._id}/availability`,
        { availability: newAvailability },
        { withCredentials: true }
      );
      // Refresh surveyor list
      const res = await axios.get(`${API_BASE_URL}/admin/surveyor`, { withCredentials: true });
      setSurveyors(res.data.data || []);
      setSelectedSurveyor(null);
    } catch (err) {
      setError('Failed to update availability');
    }
    setUpdating(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Update Surveyor Availability</h2>
      {loading ? (
        <div>Loading surveyors...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <select
            className="border p-2 mb-2 w-full"
            value={selectedSurveyor?._id || ''}
            onChange={e => {
              const found = surveyors.find(s => s._id === e.target.value);
              setSelectedSurveyor(found || null);
            }}
          >
            <option value="">Select Surveyor</option>
            {surveyors.map(s => (
              <option key={s._id} value={s._id}>
                {s.userId?.firstname} {s.userId?.lastname} ({s.profile?.availability})
              </option>
            ))}
          </select>
          {selectedSurveyor && (
            <div className="mb-2">
              <label className="block mb-1">Set Availability:</label>
              <select
                className="border p-2"
                value={newAvailability}
                onChange={e => setNewAvailability(e.target.value)}
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>
          )}
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={!selectedSurveyor || updating}
            onClick={handleUpdateAvailability}
          >
            {updating ? 'Updating...' : 'Update Availability'}
          </button>
        </>
      )}
    </div>
  );
}
