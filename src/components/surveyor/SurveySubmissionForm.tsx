"use client";
import React, { useState } from "react";
import { Upload, FileText, Phone, Mail, Calendar, X, Loader2 } from "lucide-react";
import { PolicyRequest, SurveySubmission, ContactLogEntry } from "@/types/api.types";
import { uploadFile } from "@/services/fileService";

interface SurveySubmissionFormProps {
  policy: PolicyRequest;
  onSubmit: (submission: SurveySubmission) => Promise<void>;
  onCancel: () => void;
}

const SurveySubmissionForm: React.FC<SurveySubmissionFormProps> = ({
  policy,
  onSubmit,
  onCancel
}) => {
  const [surveyNotes, setSurveyNotes] = useState("");
  const [surveyDocument, setSurveyDocument] = useState<File | null>(null);
  const [uploadedDocument, setUploadedDocument] = useState<{
    name: string;
    url: string;
    publicId: string;
  } | null>(null);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setSurveyDocument(file);
        
        // Upload to backend (which handles Cloudinary upload)
        setUploading(true);
        try {
          const result = await uploadFile(file, 'survey-documents');
          
          if (result.success) {
            setUploadedDocument({
              name: result.data.originalName,
              url: result.data.url,
              publicId: result.data.publicId
            });
          } else {
            throw new Error('Upload failed');
          }
        } catch (error) {
          console.error('Upload error:', error);
          alert('Failed to upload document. Please try again.');
          setSurveyDocument(null);
        } finally {
          setUploading(false);
        }
      } else {
        alert('Please upload a PDF file only.');
      }
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
      alert('Please upload a survey document.');
      return;
    }

    if (!surveyNotes.trim()) {
      alert('Please provide survey notes.');
      return;
    }

    setLoading(true);
    try {
      const submission: SurveySubmission = {
        policyId: policy._id,
        surveyorId: 'current_surveyor_id', // Get from auth context
        surveyDocument: uploadedDocument,
        surveyNotes,
        contactLog,
        recommendedAction
      };

      await onSubmit(submission);
    } catch (error) {
      console.error('Failed to submit survey:', error);
      alert('Failed to submit survey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Submit Survey Report</h2>
          <p className="text-sm text-gray-600 mt-1">
            {policy.propertyDetails.propertyType} - {policy.propertyDetails.address}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Contact Log Section */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-4">Contact Log</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Add Contact Entry</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <input
                  type="date"
                  value={newContact.date}
                  onChange={(e) => setNewContact({ ...newContact, date: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <select
                  value={newContact.method}
                  onChange={(e) => setNewContact({ ...newContact, method: e.target.value as any })}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="visit">Site Visit</option>
                </select>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newContact.successful}
                    onChange={(e) => setNewContact({ ...newContact, successful: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Successful</span>
                </label>
                <button
                  type="button"
                  onClick={addContactEntry}
                  className="bg-[#028835] text-white px-3 py-2 rounded-md text-sm hover:bg-green-700"
                >
                  Add Entry
                </button>
              </div>
              <textarea
                value={newContact.notes}
                onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                placeholder="Contact notes..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                rows={2}
              />
            </div>

            {/* Contact Log Entries */}
            {contactLog.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Contact History</h4>
                {contactLog.map((entry, index) => (
                  <div key={index} className="flex items-start justify-between bg-white p-3 border rounded-md">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                        <Calendar className="h-4 w-4" />
                        <span>{entry.date}</span>
                        <span className="capitalize">{entry.method}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          entry.successful ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {entry.successful ? 'Successful' : 'Unsuccessful'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900">{entry.notes}</p>
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

          {/* Survey Document Upload */}
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
              <div className="mt-2 flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <FileText className="h-4 w-4 mr-1" />
                  {uploadedDocument.name}
                </div>
                <span className="text-green-600 text-xs">✓ Uploaded</span>
              </div>
            )}
          </div>

          {/* Survey Notes */}
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

          {/* Recommendation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recommendation *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'approve', label: 'Approve Policy', color: 'green' },
                { value: 'reject', label: 'Reject Policy', color: 'red' },
                { value: 'request_more_info', label: 'Request More Info', color: 'yellow' }
              ].map(option => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="recommendation"
                    value={option.value}
                    checked={recommendedAction === option.value}
                    onChange={(e) => setRecommendedAction(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className={`text-sm font-medium text-${option.color}-700`}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#028835]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading || !uploadedDocument || !surveyNotes.trim()}
              className="px-6 py-2 bg-[#028835] text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#028835] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : uploading ? 'Uploading...' : 'Submit Survey'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SurveySubmissionForm;