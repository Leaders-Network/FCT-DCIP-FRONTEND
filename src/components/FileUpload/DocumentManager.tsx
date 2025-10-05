'use client';

import React, { useState } from 'react';
import { FileUploadZone } from './FileUploadZone';
import { DocumentFile } from '@/types/api.types';
import { Camera, FileText, Receipt, Shield, Clipboard, FolderOpen } from 'lucide-react';

interface DocumentManagerProps {
  onDocumentsChange: (documents: DocumentFile[]) => void;
  initialDocuments?: DocumentFile[];
  className?: string;
  title?: string;
  showCategories?: boolean;
}

interface DocumentCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  category: 'survey_report' | 'photos' | 'receipts' | 'legal_documents' | 'inspection_forms' | 'general' | 'application_documents' | 'identification' | 'property_documents' | 'supporting_documents' | 'survey_reports';
  documentType: 'survey_document' | 'photo' | 'receipt' | 'report' | 'form' | 'other' | 'application_form' | 'id_document' | 'property_deed' | 'main_report' | 'supporting_doc';
  allowedTypes: string[];
  maxSize: number;
  isRequired?: boolean;
}

const documentCategories: DocumentCategory[] = [
  {
    id: 'survey_reports',
    name: 'Survey Reports',
    icon: <FileText className="w-5 h-5" />,
    description: 'Main survey reports and analysis documents',
    category: 'survey_reports',
    documentType: 'main_report',
    allowedTypes: ['application/pdf', '.doc', '.docx'],
    maxSize: 50,
    isRequired: true
  },
  {
    id: 'photos',
    name: 'Property Photos',
    icon: <Camera className="w-5 h-5" />,
    description: 'Property images and visual documentation',
    category: 'photos',
    documentType: 'photo',
    allowedTypes: ['image/*'],
    maxSize: 20
  },
  {
    id: 'inspection_forms',
    name: 'Inspection Forms',
    icon: <Clipboard className="w-5 h-5" />,
    description: 'Completed inspection checklists and forms',
    category: 'inspection_forms',
    documentType: 'form',
    allowedTypes: ['application/pdf', '.doc', '.docx', 'image/*'],
    maxSize: 25
  },
  {
    id: 'receipts',
    name: 'Receipts & Expenses',
    icon: <Receipt className="w-5 h-5" />,
    description: 'Expense receipts and financial documentation',
    category: 'receipts',
    documentType: 'receipt',
    allowedTypes: ['image/*', 'application/pdf'],
    maxSize: 10
  },
  {
    id: 'legal_documents',
    name: 'Legal Documents',
    icon: <Shield className="w-5 h-5" />,
    description: 'Legal documents and compliance certificates',
    category: 'legal_documents',
    documentType: 'other',
    allowedTypes: ['application/pdf', '.doc', '.docx'],
    maxSize: 30
  },
  {
    id: 'supporting_documents',
    name: 'Supporting Documents',
    icon: <FolderOpen className="w-5 h-5" />,
    description: 'Additional supporting documentation',
    category: 'supporting_documents',
    documentType: 'supporting_doc',
    allowedTypes: ['application/pdf', '.doc', '.docx', 'image/*'],
    maxSize: 25
  }
];

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  onDocumentsChange,
  initialDocuments = [],
  className = '',
  title = 'Document Manager',
  showCategories = true
}) => {
  const [documents, setDocuments] = useState<DocumentFile[]>(initialDocuments);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>(documentCategories[0]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFilesUploaded = (categoryId: string, newFiles: DocumentFile[]) => {
    setDocuments(prev => {
      const filtered = prev.filter(doc => doc.category !== selectedCategory.category);
      const updated = [...filtered, ...newFiles];
      onDocumentsChange(updated);
      return updated;
    });
    
    // Clear any previous errors for this category
    setErrors(prev => prev.filter(error => !error.includes(categoryId)));
  };

  const handleUploadError = (categoryId: string, error: string) => {
    const errorMessage = `${selectedCategory.name}: ${error}`;
    setErrors(prev => {
      const filtered = prev.filter(err => !err.includes(categoryId));
      return [...filtered, errorMessage];
    });
    
    // Auto-remove error after 5 seconds
    setTimeout(() => {
      setErrors(prev => prev.filter(err => err !== errorMessage));
    }, 5000);
  };

  const getDocumentsByCategory = (categoryId: string) => {
    const category = documentCategories.find(cat => cat.id === categoryId);
    return documents.filter(doc => doc.category === category?.category);
  };

  const getCategorySummary = () => {
    return documentCategories.map(category => ({
      ...category,
      count: getDocumentsByCategory(category.id).length,
      hasRequired: category.isRequired,
      isFulfilled: category.isRequired ? getDocumentsByCategory(category.id).length > 0 : true
    }));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="text-sm text-gray-500">
          Total Documents: {documents.length}
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          ))}
        </div>
      )}

      {showCategories ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Category Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Document Categories</h4>
            
            {getCategorySummary().map((category) => (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className={`
                  p-3 rounded-lg border cursor-pointer transition-all duration-200
                  ${selectedCategory.id === category.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'}
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`
                      ${selectedCategory.id === category.id ? 'text-blue-600' : 'text-gray-500'}
                    `}>
                      {category.icon}
                    </div>
                    <span className={`
                      text-sm font-medium
                      ${selectedCategory.id === category.id ? 'text-blue-900' : 'text-gray-900'}
                    `}>
                      {category.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {category.hasRequired && !category.isFulfilled && (
                      <span className="w-2 h-2 bg-red-500 rounded-full" title="Required" />
                    )}
                    <span className={`
                      text-xs px-2 py-1 rounded-full
                      ${category.count > 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-500'}
                    `}>
                      {category.count}
                    </span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 leading-relaxed">
                  {category.description}
                </p>
              </div>
            ))}
          </div>

          {/* Upload Area */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="text-blue-600">
                    {selectedCategory.icon}
                  </div>
                  <h4 className="text-lg font-medium text-gray-900">
                    {selectedCategory.name}
                  </h4>
                  {selectedCategory.isRequired && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {selectedCategory.description}
                </p>
              </div>

              <FileUploadZone
                category={selectedCategory.category}
                documentType={selectedCategory.documentType}
                allowedTypes={selectedCategory.allowedTypes}
                maxSize={selectedCategory.maxSize}
                isRequired={selectedCategory.isRequired}
                description={`Upload ${selectedCategory.name.toLowerCase()}`}
                onFilesUploaded={(files) => handleFilesUploaded(selectedCategory.id, files)}
                onError={(error) => handleUploadError(selectedCategory.id, error)}
              />
            </div>
          </div>
        </div>
      ) : (
        // Simple upload without categories
        <FileUploadZone
          category="general"
          documentType="other"
          onFilesUploaded={(files) => handleFilesUploaded('general', files)}
          onError={(error) => handleUploadError('general', error)}
        />
      )}

      {/* Document Summary */}
      {documents.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Upload Summary</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {documentCategories.map(category => {
              const count = getDocumentsByCategory(category.id).length;
              return (
                <div key={category.id} className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <div className="text-gray-500">
                      {category.icon}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">{category.name}</p>
                  <p className={`text-lg font-bold ${count > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    {count}
                  </p>
                </div>
              );
            })}
          </div>
          
          {/* Required Documents Check */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            {documentCategories.filter(cat => cat.isRequired).map(category => {
              const count = getDocumentsByCategory(category.id).length;
              return (
                <div key={category.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{category.name} (Required)</span>
                  <span className={count > 0 ? 'text-green-600' : 'text-red-600'}>
                    {count > 0 ? '✓ Complete' : '✗ Missing'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;