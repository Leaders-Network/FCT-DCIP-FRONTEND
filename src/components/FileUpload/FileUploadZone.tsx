'use client';

import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, Image, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { uploadSurveyDocument, uploadMultipleSurveyDocuments } from '@/services/api';
import { DocumentFile } from '@/types/api.types';

interface FileUploadZoneProps {
  onFilesUploaded: (files: DocumentFile[]) => void;
  onError: (error: string) => void;
  category: 'survey_report' | 'photos' | 'receipts' | 'legal_documents' | 'inspection_forms' | 'general' | 'application_documents' | 'identification' | 'property_documents' | 'supporting_documents' | 'survey_reports';
  documentType: 'survey_document' | 'photo' | 'receipt' | 'report' | 'form' | 'other' | 'application_form' | 'id_document' | 'property_deed' | 'main_report' | 'supporting_doc';
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
  allowedTypes?: string[];
  className?: string;
  description?: string;
  isRequired?: boolean;
}

interface UploadProgress {
  [key: string]: {
    progress: number;
    status: 'uploading' | 'success' | 'error';
    error?: string;
  };
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesUploaded,
  onError,
  category,
  documentType,
  multiple = true,
  maxFiles = 10,
  maxSize = 50, // 50MB default
  allowedTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
  className = '',
  description,
  isRequired = false
}) => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [uploadedFiles, setUploadedFiles] = useState<DocumentFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileIdCounter = useRef(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    const uploadPromises: Promise<void>[] = [];
    const newProgressState: UploadProgress = { ...uploadProgress };

    // Initialize progress for all files
    acceptedFiles.forEach((file) => {
      const fileId = `${file.name}-${Date.now()}-${fileIdCounter.current++}`;
      newProgressState[fileId] = {
        progress: 0,
        status: 'uploading'
      };
    });
    setUploadProgress(newProgressState);

    // Upload files
    acceptedFiles.forEach((file) => {
      const fileId = `${file.name}-${Date.now()}-${fileIdCounter.current++}`;

      const uploadPromise = uploadSingleFile(file, fileId);
      uploadPromises.push(uploadPromise);
    });

    try {
      await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Upload error:', error);
      onError('Some files failed to upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [uploadProgress, category, documentType, onFilesUploaded, onError]);

  const uploadSingleFile = async (file: File, fileId: string): Promise<void> => {
    try {
      // Prepare upload data
      const uploadData = {
        category,
        documentType,
        ...(description && { description })
      };

      // Simulate progress updates (since we don't have real progress from the API)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: {
            ...prev[fileId],
            progress: Math.min(prev[fileId]?.progress + 10, 90)
          }
        }));
      }, 200);

      // Upload file
      const response = await uploadSurveyDocument(file, uploadData);

      clearInterval(progressInterval);

      if (response.success && response.document) {
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: {
            progress: 100,
            status: 'success'
          }
        }));

        // Add to uploaded files
        setUploadedFiles(prev => {
          const newFiles = [...prev, response.document];
          onFilesUploaded(newFiles);
          return newFiles;
        });

        // Remove from progress after 2 seconds
        setTimeout(() => {
          setUploadProgress(prev => {
            const newState = { ...prev };
            delete newState[fileId];
            return newState;
          });
        }, 2000);
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error: unknown) {
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: {
          progress: 0,
          status: 'error',
          error: error.message || 'Upload failed'
        }
      }));

      setTimeout(() => {
        setUploadProgress(prev => {
          const newState = { ...prev };
          delete newState[fileId];
          return newState;
        });
      }, 5000);
    }
  };

  const removeUploadedFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const newFiles = prev.filter(f => f._id !== fileId);
      onFilesUploaded(newFiles);
      return newFiles;
    });
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    multiple,
    maxFiles,
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    accept: allowedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    disabled: isUploading
  });

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension || '')) {
      return <Image className="w-4 h-4" />;
    } else if (['pdf'].includes(extension || '')) {
      return <FileText className="w-4 h-4 text-red-500" />;
    } else if (['doc', 'docx'].includes(extension || '')) {
      return <FileText className="w-4 h-4 text-blue-500" />;
    }
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isDragReject ? 'border-red-400 bg-red-50' : ''}
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />

        <div className="space-y-2">
          <Upload className="w-8 h-8 mx-auto text-gray-400" />

          {isDragActive ? (
            <p className="text-blue-600 font-medium">Drop files here...</p>
          ) : (
            <>
              <p className="text-gray-600">
                <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-gray-500">
                {allowedTypes.join(', ')} up to {maxSize}MB each
                {multiple && ` (max ${maxFiles} files)`}
              </p>
              {description && (
                <p className="text-sm text-gray-600 italic">{description}</p>
              )}
              {isRequired && (
                <p className="text-xs text-red-500">* Required</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploading...</h4>
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {getFileIcon(fileId)}
                  <span className="text-sm text-gray-700 truncate">
                    {fileId.split('-')[0]} {/* Extract filename part */}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {progress.status === 'uploading' && (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  )}
                  {progress.status === 'success' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {progress.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-xs text-gray-500 min-w-0">
                    {progress.progress}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${progress.status === 'error'
                      ? 'bg-red-500'
                      : progress.status === 'success'
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                    }`}
                  style={{ width: `${progress.progress}%` }}
                />
              </div>

              {progress.error && (
                <p className="text-xs text-red-500 mt-1">{progress.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Uploaded Files ({uploadedFiles.length})
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {uploadedFiles.map((file) => (
              <div
                key={file._id}
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {getFileIcon(file.fileName)}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.fileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.fileSize)} • {file.category}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <button
                    onClick={() => removeUploadedFile(file._id!)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;