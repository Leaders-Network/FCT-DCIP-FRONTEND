"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { CreatePolicyRequestData } from "@/types/api.types";

interface PolicyRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePolicyRequestData) => Promise<void>;
  property?: any;
}

const PolicyRequestForm: React.FC<PolicyRequestFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  property,
}) => {
  const [formData, setFormData] = useState<CreatePolicyRequestData>({
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
      email: "",
      phoneNumber: "",
      alternatePhone: "",
    },
    requestDetails: {
      coverageType: "",
      policyDuration: "",
      additionalCoverage: [],
      specialRequests: "",
    },
  });

  useEffect(() => {
    if (property) {
      setFormData(prev => ({
        ...prev,
        propertyId: property._id,
        propertyDetails: {
          ...prev.propertyDetails,
          address: property.address,
          propertyType: property.category?.category,
        },
        contactDetails: {
          ...prev.contactDetails,
          phoneNumber: property.phonenumber,
          fullName: localStorage.getItem("fullname") || "",
          email: localStorage.getItem("email") || "",
        }
      }));
    }
  }, [property]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
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
          email: "",
          phoneNumber: "",
          alternatePhone: "",
        },
        requestDetails: {
          coverageType: "",
          policyDuration: "",
          additionalCoverage: [],
          specialRequests: "",
        },
      });
      setCurrentStep(1);
    }
  }, [isOpen]);

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    section: keyof CreatePolicyRequestData,
    field: string,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
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
      // Reset form
      setFormData({
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
          email: "",
          phoneNumber: "",
          alternatePhone: "",
        },
        requestDetails: {
          coverageType: "",
          policyDuration: "",
          additionalCoverage: [],
          specialRequests: "",
        },
      });
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

  const propertyTypes = [
    "Residential House",
    "Apartment/Condo",
    "Commercial Building",
    "Industrial Facility",
    "Mixed Use",
  ];

  const constructionMaterials = [
    "Concrete Block",
    "Steel Frame",
    "Wood Frame",
    "Brick",
    "Stone",
    "Mixed Materials",
  ];

  const coverageTypes = [
    "Basic Coverage",
    "Comprehensive Coverage",
    "Fire and Allied Perils",
    "All Risk Coverage",
  ];

  const policyDurations = ["1 Year", "2 Years", "3 Years", "5 Years"];

  const additionalCoverageOptions = [
    "Flood Coverage",
    "Theft Protection",
    "Business Interruption",
    "Equipment Coverage",
    "Liability Coverage",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{property ? "Insure Property" : "Request Policy Survey"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center p-4 border-b">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step === currentStep
                      ? "bg-[#028835] text-white"
                      : step < currentStep
                      ? "bg-green-200 text-green-800"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step}
                </div>
                <span className="ml-2 text-sm">
                  {step === 1
                    ? "Property Details"
                    : step === 2
                    ? "Contact Info"
                    : "Coverage Details"}
                </span>
                {step < 3 && (
                  <div
                    className={`w-8 h-0.5 ml-4 ${
                      step < currentStep ? "bg-green-300" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Step 1: Property Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Property Details</h3>
              
              {property && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property ID
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835]"
                  rows={3}
                  value={formData.propertyDetails.address}
                  onChange={(e) =>
                    handleInputChange("propertyDetails", "address", e.target.value)
                  }
                  placeholder="Enter complete property address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type *
                  </label>
                  <select
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835]"
                    value={formData.propertyDetails.propertyType}
                    onChange={(e) =>
                      handleInputChange("propertyDetails", "propertyType", e.target.value)
                    }
                  >
                    <option value="">Select property type</option>
                    {propertyTypes.map((type) => (
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835]"
                    value={formData.propertyDetails.constructionMaterial}
                    onChange={(e) =>
                      handleInputChange("propertyDetails", "constructionMaterial", e.target.value)
                    }
                  >
                    <option value="">Select material</option>
                    {constructionMaterials.map((material) => (
                      <option key={material} value={material}>
                        {material}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Building Value (₦) *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835]"
                    value={formData.propertyDetails.buildingValue}
                    onChange={(e) =>
                      handleInputChange("propertyDetails", "buildingValue", Number(e.target.value))
                    }
                    placeholder="0"
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835]"
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835]"
                    value={formData.propertyDetails.squareFootage}
                    onChange={(e) =>
                      handleInputChange("propertyDetails", "squareFootage", Number(e.target.value))
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  required
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835]"
                  value={formData.contactDetails.fullName}
                  onChange={(e) =>
                    handleInputChange("contactDetails", "fullName", e.target.value)
                  }
                  placeholder="Enter your full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835]"
                    value={formData.contactDetails.email}
                    onChange={(e) =>
                      handleInputChange("contactDetails", "email", e.target.value)
                    }
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835]"
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835]"
                  value={formData.contactDetails.alternatePhone}
                  onChange={(e) =>
                    handleInputChange("contactDetails", "alternatePhone", e.target.value)
                  }
                  placeholder="+234 XXX XXX XXXX"
                />
              </div>
            </div>
          )}

          {/* Step 3: Coverage Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Coverage Requirements</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coverage Type *
                  </label>
                  <select
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835]"
                    value={formData.requestDetails.coverageType}
                    onChange={(e) =>
                      handleInputChange("requestDetails", "coverageType", e.target.value)
                    }
                  >
                    <option value="">Select coverage type</option>
                    {coverageTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Policy Duration *
                  </label>
                  <select
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835]"
                    value={formData.requestDetails.policyDuration}
                    onChange={(e) =>
                      handleInputChange("requestDetails", "policyDuration", e.target.value)
                    }
                  >
                    <option value="">Select duration</option>
                    {policyDurations.map((duration) => (
                      <option key={duration} value={duration}>
                        {duration}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Coverage (Optional)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {additionalCoverageOptions.map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={formData.requestDetails.additionalCoverage?.includes(option)}
                        onChange={() => handleArrayChange("additionalCoverage", option)}
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests or Notes
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#028835]"
                  rows={4}
                  value={formData.requestDetails.specialRequests}
                  onChange={(e) =>
                    handleInputChange("requestDetails", "specialRequests", e.target.value)
                  }
                  placeholder="Any special requirements or additional information..."
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex space-x-2">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-[#028835] text-white rounded-md hover:bg-green-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-[#028835] text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Submitting..." : "Submit Request"}
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