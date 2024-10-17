"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import Image from "next/image";

interface AddNewPropertyProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  category: string;
  address: string;
  contactOnProperty: string;
}

const AddNewProperty: React.FC<AddNewPropertyProps> = ({ isOpen, onClose }) => {
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    onClose();
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const newImages = files.map((file) => URL.createObjectURL(file));
      setImages((prevImages) => [...prevImages, ...newImages]);
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
                  >
                    <option value="">--Select Category--</option>
                    <option value="option1">-Select here</option>
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
                />
                <input
                  type="text"
                  name="contactOnProperty"
                  value={formData.contactOnProperty}
                  onChange={handleChange}
                  placeholder="Contact on property:"
                  className="w-full p-4 bg-[#F5F5F5] rounded"
                  required
                />
              </div>
              <div className="mb-16">
                <p className="font-semibold mb-2">UPLOAD PROPERTY PICTURES:</p>
                <div className="border-2 border-dashed border-gray-300 p-4 rounded-md">
                  <div className="grid grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className="w-24 h-24 bg-gray-100 flex items-center justify-center overflow-hidden"
                      >
                        <img
                          src={image}
                          alt={`Uploaded ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                    <label className="w-24 h-24 bg-gray-100 flex items-center justify-center cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
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
                className="mt-auto bg-[#028835] text-white font-semibold p-4 rounded flex items-center justify-center gap-2"
              >
                <Image
                  src="/dashboard/mark.png"
                  alt="check"
                  width={15}
                  height={15}
                />
                SUBMIT
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddNewProperty;