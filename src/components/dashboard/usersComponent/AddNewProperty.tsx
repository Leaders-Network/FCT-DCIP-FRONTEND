"use client";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import Image from "next/image";

import { addProperty } from "@/services/api";

interface AddNewPropertyProps {
  isOpen: boolean;
  onClose: () => void;
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

const AddNewProperty: React.FC<AddNewPropertyProps> = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState<Category[]>(staticCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    category: "",
    address: "",
    contactOnProperty: "",
  });

  const [images, setImages] = useState<string[]>([]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

        // Compress images before creating object URLs
        const compressedFiles = await Promise.all(
          files.map((file) => compressImage(file))
        );
        const newObjectUrls = compressedFiles.map((file) =>
          URL.createObjectURL(file)
        );
        setImages((prevImages) => [...prevImages, ...newObjectUrls]);
      } catch (error) {
        console.error("Error handling image upload:", error);
        setError("Failed to process images");
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (!fileInput?.files?.length) {
        throw new Error("No images selected");
      }

      const files = Array.from(fileInput.files);
      // Compress images before converting to base64
      const compressedFiles = await Promise.all(
        files.map((file) => compressImage(file))
      );
      const base64Images = await Promise.all(
        compressedFiles.map((file) => convertToBase64(file))
      );

      await addProperty({
        categoryId: formData.category,
        address: formData.address,
        phonenumber: formData.contactOnProperty,
        images: base64Images,
      });

      // Clean up object URLs
      images.forEach((url) => URL.revokeObjectURL(url));

      setFormData({
        category: "",
        address: "",
        contactOnProperty: "",
      });
      setImages([]);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add property");
      console.error(err);
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

    // Remove the image from the images array
    setImages((prevImages) =>
      prevImages.filter((_, index) => index !== indexToRemove)
    );

    // Also clear the file from the input
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ""; // Reset the file input
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={onClose}
        ></div>
      )}
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-[40%] z-20 bg-white shadow-lg transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
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
            <button onClick={onClose} className="bg-[#DF342E] p-2 rounded">
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
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded p-3 mb-4">
              <p className="text-sm">
                Kindly fill the form below to ADD NEW PROPERTY
              </p>
            </div>
            <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
              <div className="space-y-4 flex-grow">
                <div className="relative bg-[#F5F5F5] rounded">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full p-4 bg-transparent appearance-none"
                    required
                    disabled={categories.length === 0}
                  >
                    <option value="">--Select Category--</option>
                    {(categories || []).map((category) => (
                      <option key={category?._id} value={category?._id}>
                        {category?.category}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address:"
                  className="w-full p-4 bg-[#F5F5F5] rounded"
                  required
                  disabled={categories.length === 0}
                />
                <input
                  type="text"
                  name="contactOnProperty"
                  value={formData.contactOnProperty}
                  onChange={handleChange}
                  placeholder="Phone number on property:"
                  className="w-full p-4 bg-[#F5F5F5] rounded"
                  required
                  disabled={categories.length === 0}
                />
              </div>
              <div className="mb-16">
                <p className="font-semibold mb-2">UPLOAD PROPERTY PICTURES:</p>
                <div className="border-2 border-dashed border-gray-300 p-4 rounded-md">
                  <div className="grid grid-cols-3 gap-4">
                    {(images || []).map((image, index) => (
                      <div
                        key={index}
                        className="w-24 h-24 bg-gray-100 flex items-center justify-center overflow-hidden relative"
                      >
                        <Image
                          src={image}
                          alt={`Uploaded ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button" // Important to prevent form submission
                          onClick={() => removeImage(index)}
                          className="absolute top-0 right-0 bg-red-500 rounded-full p-1 m-1 hover:bg-red-600 transition-colors"
                        >
                          <svg
                            className="w-3 h-3 text-white"
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
                    ))}
                    <label className="w-24 h-24 bg-gray-100 flex items-center justify-center cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={categories.length === 0}
                      />
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </label>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || categories.length === 0}
                className={`mt-auto bg-[#028835] text-white font-semibold p-4 rounded flex items-center justify-center gap-2 ${
                  loading || categories.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {loading ? (
                  "SUBMITTING..."
                ) : (
                  <>
                    <Image
                      src="/dashboard/mark.png"
                      alt="check"
                      width={15}
                      height={15}
                      style={{ height: "auto" }}
                    />
                    SUBMIT
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