"use client";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import Image from "next/image";

import { addProperty } from "@/services/api";

interface AddNewPropertyProps {
  isOpen: boolean;
  onClose: () => void;
  onPropertyAdded?: () => void;
}

interface Category {
  _id: string;
  category: string;
}

const staticCategories: Category[] = [
  { _id: "60d5f1b3e6b3a0b3e8b3e8b3", category: "Building" },
  { _id: "60d5f1b3e6b3a0b3e8b3e8b4", category: "Infrastructure" },
  { _id: "60d5f1b3e6b3a0b3e8b3e8b5", category: "Commercial" },
  { _id: "60d5f1b3e6b3a0b3e8b3e8b6", category: "Residential" },
];

interface FormData {
  category: string;
  address: string;
  contactOnProperty: string;
}

const AddNewProperty: React.FC<AddNewPropertyProps> = ({ isOpen, onClose, onPropertyAdded }) => {
  const [categories, setCategories] = useState<Category[]>(staticCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    category: "",
    address: "",
    contactOnProperty: "",
  });

  const [images, setImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const resetForm = () => {
    // Clean up object URLs
    images.forEach((url) => URL.revokeObjectURL(url));

    // Reset form state
    setFormData({
      category: "",
      address: "",
      contactOnProperty: "",
    });
    setImages([]);
    setSelectedFiles([]);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          // Include the full base64 string with prefix
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert image to base64"));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = document.createElement("img");
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error("Canvas to Blob conversion failed"));
              }
            },
            "image/jpeg",
            0.7 // compression quality
          );
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      try {
        const files = Array.from(event.target.files);

        // Validate file types and sizes
        const validFiles = files.filter(file => {
          const isValidType = file.type.startsWith('image/');
          const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
          return isValidType && isValidSize;
        });

        if (validFiles.length !== files.length) {
          setError("Some files were skipped. Only image files under 10MB are allowed.");
        }

        // Compress images before creating object URLs
        const compressedFiles = await Promise.all(
          validFiles.map((file) => compressImage(file))
        );

        const newObjectUrls = compressedFiles.map((file) =>
          URL.createObjectURL(file)
        );

        setSelectedFiles((prevFiles) => [...prevFiles, ...compressedFiles]);
        setImages((prevImages) => [...prevImages, ...newObjectUrls]);

        // Clear the input to allow re-selecting the same files
        event.target.value = '';
      } catch (error) {
        setError("Failed to process images. Please try again.");
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let base64Images: string[] = [];

      // Only process images if they exist (images are now optional)
      if (selectedFiles.length > 0) {
        base64Images = await Promise.all(
          selectedFiles.map((file) => convertToBase64(file))
        );
      }

      await addProperty({
        categoryId: formData.category,
        address: formData.address,
        phonenumber: formData.contactOnProperty,
        images: base64Images,
      });

      // Clean up and reset form
      resetForm();

      // Call the callback to refresh the properties list
      if (onPropertyAdded) {
        onPropertyAdded();
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add property");
    } finally {
      setLoading(false);
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      images.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  const removeImage = (indexToRemove: number) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(images[indexToRemove]);

    // Remove the image from both arrays
    setImages((prevImages) =>
      prevImages.filter((_, index) => index !== indexToRemove)
    );
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={handleClose}
        ></div>
      )}
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-[40%] z-20 bg-white shadow-lg transform ${isOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out overflow-y-auto`}
      >
        <div className="flex flex-col h-full">
          <div className="bg-[#028835] flex justify-between items-center p-4">
            <h2 className="text-white text-lg font-bold flex items-center gap-2">
              <Image
                src="/dashboard/plus.png"
                alt="plus"
                width={20}
                height={20}
              />
              ADD NEW PROPERTY
            </h2>
            <button onClick={handleClose} className="bg-[#DF342E] hover:bg-[#c12e29] p-2 rounded transition-colors">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="p-4 flex-grow flex flex-col">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
              <svg
                className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Add New Property
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Fill in the property details below. Images are optional but recommended for better identification.
                </p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
              <div className="space-y-6 flex-grow">
                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Property Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative bg-white border border-gray-300 rounded-lg shadow-sm">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full p-4 bg-transparent appearance-none focus:outline-none focus:ring-2 focus:ring-[#028835] focus:border-transparent rounded-lg"
                      required
                      disabled={categories.length === 0}
                    >
                      <option value="">Select a category</option>
                      {(categories || []).map((category) => (
                        <option key={category?._id} value={category?._id}>
                          {category?.category}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <svg
                        className="fill-current h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Address Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Property Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter the complete property address..."
                    className="w-full p-4 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#028835] focus:border-transparent resize-none"
                    rows={3}
                    required
                    disabled={categories.length === 0}
                  />
                </div>

                {/* Phone Number Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Contact Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contactOnProperty"
                    value={formData.contactOnProperty}
                    onChange={handleChange}
                    placeholder="e.g., +234 XXX XXX XXXX"
                    className="w-full p-4 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#028835] focus:border-transparent"
                    required
                    disabled={categories.length === 0}
                  />
                </div>
              </div>
              {/* Image Upload Section */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-700">
                    Property Images
                  </label>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    Optional
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  Upload images to help identify the property (optional)
                </p>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
                  {images.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {images.map((image, index) => (
                          <div
                            key={index}
                            className="relative group aspect-square bg-white rounded-lg overflow-hidden shadow-sm border"
                          >
                            <Image
                              src={image}
                              alt={`Property image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>

                      <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-[#028835] rounded-lg cursor-pointer hover:bg-green-50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={categories.length === 0}
                        />
                        <div className="flex items-center space-x-2 text-[#028835]">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          <span className="text-sm font-medium">Add more images</span>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={categories.length === 0}
                      />
                      <div className="flex flex-col items-center space-y-3 text-gray-500">
                        <div className="p-3 bg-gray-200 rounded-full">
                          <svg
                            className="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700">
                            Click to upload property images
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG up to 10MB each
                          </p>
                        </div>
                      </div>
                    </label>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || categories.length === 0}
                className={`mt-6 w-full bg-[#028835] hover:bg-[#026a29] text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-all duration-200 shadow-lg ${loading || categories.length === 0
                  ? "opacity-50 cursor-not-allowed hover:bg-[#028835]"
                  : "hover:shadow-xl transform hover:-translate-y-0.5"
                  }`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Adding Property...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <span>Add Property</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddNewProperty;