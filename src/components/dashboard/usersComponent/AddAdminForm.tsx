import Input from "@/components/Input";
import Image from "next/image";
import React, { useState } from "react";

interface AddAdminFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddAdminForm: React.FC<AddAdminFormProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    role: "",
    status: "",
  });

  const handleChange = (field: string) => (value: string) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted:", formData);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={onClose}
        ></div>
      )}
      {/* Modal */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-[40%] z-20 bg-white shadow-lg transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out overflow-y-auto`}
      >
        <div className="">
          <div className="flex justify-between items-center p-3 mb-6 bg-[#028835]">
            <h2 className="text-lg font-semibold text-white flex items-center gap-3">
              <Image
                src="/dashboard/plus.png"
                alt="plus"
                width={20}
                height={20}
              />
              ADD NEW ADMIN
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-700 bg-[#DF342E]"
            >
              <svg
                className="w-6 h-6"
                fill="#fff"
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
          <div className="p-6">
            <p className="mb-6 p-3 text-sm rounded text-black bg-[#02883527] border-[#E1E1E1] border">
              Kindly fill the form below to ADD A NEW STAFF
            </p>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <Input
                  label="First Name:"
                  type="text"
                  value={formData.firstName}
                  handleChange={handleChange("firstName")}
                  required
                />
                <Input
                  label="Last Name:"
                  type="text"
                  value={formData.lastName}
                  handleChange={handleChange("lastName")}
                  required
                />
                <Input
                  label="Email Address:"
                  type="email"
                  value={formData.email}
                  handleChange={handleChange("email")}
                  required
                />
                <Input
                  label="Phone Number:"
                  type="tel"
                  value={formData.phoneNumber}
                  handleChange={handleChange("phoneNumber")}
                  required
                />
                <div className="relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleSelectChange}
                    className="peer w-full p-3 md:p-4 border border-gray-300 outline-none bg-gray-100 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    {/* <option value="">--Select Role--</option> */}
                    <option value="SuperAdmin">SuperAdmin</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                  </select>
                  <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 left-4 z-10 origin-[0] peer-focus:text-green-500">
                    --Select Role--
                  </label>
                </div>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleSelectChange}
                    className="peer w-full p-3 md:p-4 border border-gray-300 outline-none bg-gray-100 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    {/* <option value="">--Select Status--</option> */}
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 left-4 z-10 origin-[0] peer-focus:text-green-500">
                    --Select Status--
                  </label>
                </div>
              </div>
              <button
                type="submit"
                className=" mt-6 flex items-center gap-1 bg-[#028835] font-semibold text-white p-4 px-10 rounded hover:bg-[#026d2a] transition duration-300"
              >
                <Image
                  src="/dashboard/mark.png"
                  alt="plus"
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

export default AddAdminForm;
