"use client";
import React, { useState } from "react";
import { Upload, FileText, Phone, Mail, Calendar, X, Loader2, AlertCircle } from "lucide-react";
import { PolicyRequest, SurveySubmission, ContactLogEntry } from "@/types/api.types";

interface SurveySubmissionFormProps {
  policy: PolicyRequest;
  onSubmit: (submission: Omit<SurveySubmission, 'surveyorId'> & { surveyDocument: File }) => Promise<void>;
  onCancel: () => void;
}

const ErrorMessage = ({ message }) => (
  <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center">
    <AlertCircle className="h-5 w-5 mr-2" />
    <span>{message}</span>
  </div>
);

const SurveySubmissionForm: React.FC<SurveySubmissionFormProps> = ({
  policy,
  onSubmit,
  onCancel
}) => {
  const [surveyNotes, setSurveyNotes] = useState("");
  const [propertyCondition, setPropertyCondition] = useState("");
  const [structuralAssessment, setStructuralAssessment] = useState("");
  const [riskFactors, setRiskFactors] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [contactLog, setContactLog] = useState<ContactLogEntry[]>([]);
  const [recommendedAction, setRecommendedAction] = useState<'approve' | 'reject' | 'request_more_info'>('approve');
  const [newContact, setNewContact] = useState<ContactLogEntry>({
    date: new Date().toISOString().split('T')[0],
    method: 'phone',
    notes: '',
    successful: true
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file only.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setError('File size cannot exceed 10MB.');
        return;
      }

      setError(null);
      setUploadedDocument(file);
    }
  };

  const addContactEntry = () => {
    if (newContact.notes.trim()) {
      setContactLog([...contactLog, { ...newContact }]);
      setNewContact({
        date: new Date().toISOString().split('T')[0],
        method: 'phone',
        notes: '',
        successful: true
      });
    }
  };

  const removeContactEntry = (index: number) => {
    setContactLog(contactLog.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadedDocument) {
      setError('Please upload a survey document.');
      return;
    }

    if (!surveyNotes.trim()) {
      setError('Please provide survey notes.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const submission = {
        policyId: policy._id,
        surveyDocument: uploadedDocument,
        surveyNotes,
        contactLog,
        recommendedAction,
        surveyDetails: {
          propertyCondition,
          structuralAssessment,
          riskFactors,
          recommendations
        }
      };

      await onSubmit(submission);
    } catch (error) {
      console.error('Failed to submit survey:', error);
      setError('Failed to submit survey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Submit Survey Report</h2>
          <p className="text-sm text-gray-600 mt-1">
            {policy.propertyDetails.propertyType} - {policy.propertyDetails.address}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {error && <ErrorMessage message={error} />}

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Log</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3 items-end">
                <input
                  type="date"
                  value={newContact.date}
                  onChange={(e) => setNewContact({ ...newContact, date: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm col-span-2 md:col-span-1"
                />
                <select
                  value={newContact.method}
                  onChange={(e) => setNewContact({ ...newContact, method: e.target.value as any })}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm col-span-2 md:col-span-1"
                >
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="visit">Site Visit</option>
                </select>
                <textarea
                  value={newContact.notes}
                  onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                  placeholder="Contact notes..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm col-span-5 md:col-span-2"
                  rows={1}
                />
                <div className="flex items-center col-span-5 md:col-span-1 justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newContact.successful}
                      onChange={(e) => setNewContact({ ...newContact, successful: e.target.checked })}
                      className="mr-2 h-4 w-4"
                    />
                    <span className="text-sm">Successful</span>
                  </label>
                  <button
                    type="button"
                    onClick={addContactEntry}
                    className="bg-[#028835] text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {contactLog.length > 0 && (
              <div className="space-y-2 mt-4">
                {contactLog.map((entry, index) => (
                  <div key={index} className="flex items-start justify-between bg-white p-3 border rounded-md">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                        <Calendar className="h-4 w-4" />
                        <span>{entry.date}</span>
                        <span className="capitalize font-medium">{entry.method}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          entry.successful ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {entry.successful ? 'Success' : 'Failed'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800">{entry.notes}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeContactEntry(index)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Survey Document (PDF) *
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-[#028835] transition-colors">
              <div className="space-y-1 text-center">
                {uploading ? (
                  <Loader2 className="mx-auto h-12 w-12 text-[#028835] animate-spin" />
                ) : (
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="survey-document"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-[#028835] hover:text-green-700 focus-within:outline-none"
                  >
                    <span>{uploading ? 'Uploading...' : 'Upload survey report'}</span>
                    <input
                      id="survey-document"
                      name="survey-document"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="sr-only"
                    />
                  </label>
                  {!uploading && <p className="pl-1">or drag and drop</p>}
                </div>
                <p className="text-xs text-gray-500">PDF up to 10MB</p>
              </div>
            </div>
            {uploadedDocument && (
              <div className="mt-2 flex items-center justify-between text-sm bg-green-50 p-2 rounded-md">
                <div className="flex items-center text-green-800">
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="font-medium">{uploadedDocument.name}</span>
                </div>
                <span className="text-green-800 font-semibold">✓ Uploaded</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Condition *
            </label>
            <textarea
              required
              value={propertyCondition}
              onChange={(e) => setPropertyCondition(e.target.value)}
              rows={6}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
              placeholder="Provide a detailed description of the property's condition..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Structural Assessment *
            </label>
            <textarea
              required
              value={structuralAssessment}
              onChange={(e) => setStructuralAssessment(e.target.value)}
              rows={6}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
              placeholder="Provide a detailed structural assessment of the property..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Risk Factors *
            </label>
            <textarea
              required
              value={riskFactors}
              onChange={(e) => setRiskFactors(e.target.value)}
              rows={6}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
              placeholder="Identify and describe any risk factors associated with the property..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recommendations *
            </label>
            <textarea
              required
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              rows={6}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
              placeholder="Provide your recommendations based on the survey findings..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Survey Notes *
            </label>
            <textarea
              required
              value={surveyNotes}
              onChange={(e) => setSurveyNotes(e.target.value)}
              rows={6}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
              placeholder="Provide detailed notes about the property survey, including any findings, recommendations, or concerns..."
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-900 mb-3">
              Recommendation *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'approve', label: 'Approve Policy' },
                { value: 'reject', label: 'Reject Policy' },
                { value: 'request_more_info', label: 'Request More Info' }
              ].map(option => (
                <label key={option.value} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  recommendedAction === option.value ? 'bg-[#028835] border-[#028835] text-white' : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="recommendation"
                    value={option.value}
                    checked={recommendedAction === option.value}
                    onChange={(e) => setRecommendedAction(e.target.value as any)}
                    className="sr-only"
                  />
                  <span className="text-sm font-semibold">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#028835]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading || !uploadedDocument || !surveyNotes.trim()}
              className="px-6 py-2 bg-[#028835] text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#028835] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
              {loading ? 'Submitting...' : 'Submit Survey'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SurveySubmissionForm;