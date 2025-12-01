"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { CreatePolicyRequestData } from "@/types/api.types";
import {
  PROPERTY_TYPES,
  CONSTRUCTION_MATERIALS,
  COVERAGE_TYPES,
  POLICY_DURATIONS,
  ADDITIONAL_COVERAGE_OPTIONS
} from "@/constants/policyConstants";
import { useAuth } from "@/context/useAuth";

interface PropertyDetailWithContact {
  _id: string;
  address: string;
  propertyType: string;
  buildingValue: number;
  yearBuilt: number;
  squareFootage: number;
  constructionMaterial: string;
  phonenumber?: string;
  category?: { category: string };
  status?: string;
}

interface PolicyRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePolicyRequestData) => Promise<void>;
  property?: PropertyDetailWithContact | null;
}

const PolicyRequestForm: React.FC<PolicyRequestFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  property,
}) => {
  const { user } = useAuth();

  // Initialize form with user data from localStorage
  const initializeFormData = () => {
    // Prefer authenticated user from context
    let userEmail = user?.email || "";

    // Fallback to browser storage only if auth context is not yet populated
    if (!userEmail && typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          userEmail = userData.email || "";
        }
        if (!userEmail) {
          userEmail = localStorage.getItem("email") || "";
        }
      } catch (error) {
        console.error("Error reading stored user email:", error);
      }
    }

    return {
      propertyId: undefined,
      propertyDetails: {
        address: "",
        propertyType: "",
        buildingValue: 0,
        yearBuilt: new Date().getFullYear(),
        squareFootage: 0,
        constructionMaterial: "",
      },
      contactDetails: {
        fullName: "",
        email: userEmail,
        phoneNumber: "",
        alternatePhone: "",
        rcNumber: "",
      },
      requestDetails: {
        coverageType: "",
        policyDuration: "1 Year", // Always 1 year
        additionalCoverage: [],
        specialRequests: "",
      },
    };
  };

  const [formData, setFormData] = useState<CreatePolicyRequestData>(initializeFormData());

  // Auto-populate user email when form opens
  useEffect(() => {
    if (isOpen) {
      let userEmail = user?.email || "";

      // Fallback to storage if auth context not ready yet
      if (!userEmail && typeof window !== "undefined") {
        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            userEmail = userData.email || "";
          }
          if (!userEmail) {
            userEmail = localStorage.getItem("email") || "";
          }
        } catch (error) {
          console.error("Error reading stored user email:", error);
        }
      }

      setFormData(prev => ({
        ...prev,
        contactDetails: {
          ...prev.contactDetails,
          email: userEmail,
        }
      }));
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (property) {
      setFormData(prev => ({
        ...prev,
        propertyDetails: {
          ...prev.propertyDetails,
          address: property.address,
        },
        contactDetails: {
          ...prev.contactDetails,
          phoneNumber: property.phonenumber || "",
          // Preserve user's email from auth context or stored user data
          email: user?.email || (() => {
            try {
              const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
              if (storedUser) {
                const userData = JSON.parse(storedUser);
                return userData.email || "";
              }
              return typeof window !== "undefined" ? localStorage.getItem("email") || "" : "";
            } catch (error) {
              console.error("Error reading stored user email:", error);
              return "";
            }
          })(),
        }
      }));
    }
  }, [property, user]);

  useEffect(() => {
    if (!isOpen) {
      // Reset form but preserve user's email and name
      setFormData(initializeFormData());
      setCurrentStep(1);
    }
  }, [isOpen]);

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    section: keyof CreatePolicyRequestData,
    field: string,
    value: string | number | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, unknown> || {}),
        [field]: value,
      },
    }));
  };

  const handleArrayChange = (field: string, value: string) => {
    const currentArray = formData.requestDetails.additionalCoverage || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];

    setFormData((prev) => ({
      ...prev,
      requestDetails: {
        ...prev.requestDetails,
        [field]: newArray,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);



    try {
      await onSubmit(formData);
      onClose();
      // Reset form but preserve user's email and name
      setFormData(initializeFormData());
      setCurrentStep(1);
    } catch (error) {
      console.error("Failed to submit policy request:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const coverageTypes = [
    "Contract Works Coverage",
    "Public Liability Coverage",
    "Employers Liability Coverage",
    "Contractors Plant and Equipment Coverage",
    "Professional Indemnity",
  ];

  const policyDurations = [
    "1 Year",
  ];

  const additionalCoverageOptions = [
    "Flood and Storm Damage",
    "Theft or Vandalism at Site",
    "Collapse or Structural Failure",
    "Third-Party Property Damage",
    "Injury to Non-Employees (Public)",
    "Machinery Breakdown",
    "Temporary Structures (Scaffolding, Site Office)",
    "Fire and Explosion",
    "Debris Removal Costs",
    "Cross Liability (Between Contractors/Subcontractors)",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg sm:text-xl font-bold">{property ? "Insure Property" : "Request Policy Survey"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center p-3 sm:p-4 border-b overflow-x-auto">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-max">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 ${step === currentStep
                    ? "bg-[#028835] text-white"
                    : step < currentStep
                      ? "bg-green-200 text-green-800"
                      : "bg-gray-200 text-gray-500"
                    }`}
                >
                  {step}
                </div>
                <span className="ml-1 sm:ml-2 text-xs sm:text-sm whitespace-nowrap">
                  {step === 1
                    ? "Property"
                    : step === 2
                      ? "Builder"
                      : "Coverage"}
                </span>
                {step < 3 && (
                  <div
                    className={`w-4 sm:w-8 h-0.5 ml-2 sm:ml-4 ${step < currentStep ? "bg-green-300" : "bg-gray-300"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          {/* Step 1: Property Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Property Details</h3>

              {property && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property ID
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-sm"
                    value={property._id}
                    disabled
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Address *
                </label>
                <textarea
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835] text-sm"
                  rows={3}
                  value={formData.propertyDetails.address}
                  onChange={(e) =>
                    handleInputChange("propertyDetails", "address", e.target.value)
                  }
                  placeholder="Enter complete property address"
                />
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                  Provide the full address where the property is located.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type *
                  </label>
                  <select
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835] text-sm"
                    value={formData.propertyDetails.propertyType}
                    onChange={(e) =>
                      handleInputChange("propertyDetails", "propertyType", e.target.value)
                    }
                  >
                    <option value="">Select type</option>
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Construction Material *
                  </label>
                  <select
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835] text-sm"
                    value={formData.propertyDetails.constructionMaterial}
                    onChange={(e) =>
                      handleInputChange("propertyDetails", "constructionMaterial", e.target.value)
                    }
                  >
                    <option value="">Select material</option>
                    {CONSTRUCTION_MATERIALS.map((material) => (
                      <option key={material} value={material}>
                        {material}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Building Value (₦) *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835] text-sm"
                    value={formData.propertyDetails.buildingValue}
                    onChange={(e) =>
                      handleInputChange("propertyDetails", "buildingValue", Number(e.target.value))
                    }
                    placeholder="5000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year Built *
                  </label>
                  <input
                    required
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835] text-sm"
                    value={formData.propertyDetails.yearBuilt}
                    onChange={(e) =>
                      handleInputChange("propertyDetails", "yearBuilt", Number(e.target.value))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Square Footage *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835] text-sm"
                    value={formData.propertyDetails.squareFootage}
                    onChange={(e) =>
                      handleInputChange("propertyDetails", "squareFootage", Number(e.target.value))
                    }
                    placeholder="2500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Builder/Contractor Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Builder/Contractor</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name of Builder/Contractor *
                </label>
                <input
                  required
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835] text-sm"
                  value={formData.contactDetails.fullName}
                  onChange={(e) =>
                    handleInputChange("contactDetails", "fullName", e.target.value)
                  }
                  placeholder="Enter name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                    <span className="text-xs text-green-600 ml-1 hidden sm:inline">(Auto-filled)</span>
                  </label>
                  <input
                    required
                    type="email"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-700 cursor-not-allowed text-sm"
                    value={formData.contactDetails.email}
                    readOnly
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    required
                    type="tel"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835] text-sm"
                    value={formData.contactDetails.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("contactDetails", "phoneNumber", e.target.value)
                    }
                    placeholder="+234 XXX XXX XXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alternate Phone (Optional)
                </label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835] text-sm"
                  value={formData.contactDetails.alternatePhone}
                  onChange={(e) =>
                    handleInputChange("contactDetails", "alternatePhone", e.target.value)
                  }
                  placeholder="+234 XXX XXX XXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RC Number *
                </label>
                <input
                  required
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835] text-sm"
                  value={formData.contactDetails.rcNumber}
                  onChange={(e) =>
                    handleInputChange("contactDetails", "rcNumber", e.target.value.toUpperCase())
                  }
                  placeholder="RC123456"
                  style={{ textTransform: 'uppercase' }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  CAC Registration Certificate number (e.g., RC123456)
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Coverage Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Coverage Requirements</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coverage Type *
                  </label>
                  <select
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835] text-sm"
                    value={formData.requestDetails.coverageType}
                    onChange={(e) =>
                      handleInputChange("requestDetails", "coverageType", e.target.value)
                    }
                  >
                    <option value="">Select coverage type</option>
                    {COVERAGE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Policy Duration - always 1 year */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-center">
                  <p className="text-xs sm:text-sm text-blue-800">
                    <strong>Duration:</strong> 1 year
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Coverage (Optional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ADDITIONAL_COVERAGE_OPTIONS.map((option) => (
                    <label key={option} className="flex items-start">
                      <input
                        type="checkbox"
                        className="mr-2 mt-0.5"
                        checked={formData.requestDetails.additionalCoverage?.includes(option)}
                        onChange={() => handleArrayChange("additionalCoverage", option)}
                      />
                      <span className="text-xs sm:text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests or Notes
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835] text-sm"
                  rows={3}
                  value={formData.requestDetails.specialRequests}
                  onChange={(e) =>
                    handleInputChange("requestDetails", "specialRequests", e.target.value)
                  }
                  placeholder="Any special requirements..."
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-4 sm:mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-3 sm:px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex space-x-2">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-4 sm:px-6 py-2 text-sm bg-[#028835] text-white rounded-md hover:bg-green-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 sm:px-6 py-2 text-sm bg-[#028835] text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PolicyRequestForm;