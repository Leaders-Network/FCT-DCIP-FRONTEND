import Input from "@/components/Input";
import Image from "next/image";
import React, { useState } from "react";
import axios from "axios";

interface AddAdminFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminAdded: () => void;
}

const AddAdminForm: React.FC<AddAdminFormProps> = ({ isOpen, onClose, onAdminAdded }) => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phonenumber: "",
    employeeRole: "",
    employeeStatus: "",
  });
  const [error, setError] = useState("");

  const handleChange = (field: string) => (value: string) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   setError("");

   // Validate phone number
   const phoneRegex = /^\+?[0-9]{10,14}$/;
   if (!phoneRegex.test(formData.phonenumber)) {
     setError("Please provide a valid phone number (10-14 digits)");
     return;
   }

   // Ensure role and status are selected
   if (!formData.employeeRole || !formData.employeeStatus) {
     setError("Please select both role and status");
     return;
   }

   try {
     const token = localStorage.getItem("authToken");

     if (!token) {
       setError("Authentication token not found. Please log in again.");
       return;
     }

     // Create a modified payload with the correct structure
     const payload = {
       ...formData,
       // Ensure these fields are sent as proper MongoDB ObjectIds
       roleId: formData.employeeRole.trim(),
       statusId: formData.employeeStatus.trim(),
     };

     const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://Builders-Liability-AMMC-backend.vercel.app/api/v1";
     const response = await axios.post(
       `${apiBaseUrl}/auth/registerEmployee`,
       payload,
       {
         headers: {
           "Content-Type": "application/json",
           apiKey:
             "4a8612b0162373aff93c2088780b42e77d06b22b9906a58f5940054b192695134262a4c481b9713426922f29b7bd44ea64dcc6e13a3d22d0f7d05044e9ca626c",
           Authorization: `Bearer ${token}`,
         },
       }
     );

     if (response.data && response.data.success) {
       onAdminAdded();
       onClose();
     } else {
       setError("Failed to register new admin. Please try again.");
     }
   } catch (error) {
     if (axios.isAxiosError(error) && error.response) {
       const errorMessage =
         error.response.data.error?.message ||
         error.response.data.message ||
         "Registration failed";
       setError(errorMessage);
     } else {
       setError("An unexpected error occurred. Please try again.");
     }
   }
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
                  value={formData.firstname}
                  handleChange={handleChange("firstname")}
                  required
                />
                <Input
                  label="Last Name:"
                  type="text"
                  value={formData.lastname}
                  handleChange={handleChange("lastname")}
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
                  value={formData.phonenumber}
                  handleChange={handleChange("phonenumber")}
                  required
                  placeholder="Enter 10-14 digit number"
                />
                <div className="relative">
                  <select
                    name="employeeRole"
                    value={formData.employeeRole}
                    onChange={handleSelectChange}
                    className="peer w-full p-3 md:p-4 border border-gray-300 outline-none bg-gray-100 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">--Select Role--</option>
                    <option value="67097fb4f07f5547278be6a3">
                      Super Admin
                    </option>
                    <option value="67097fb4f07f5547278be6a4">Admin</option>
                    <option value="67097fb4f07f5547278be6a5">Staff</option>
                  </select>
                  <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 left-4 z-10 origin-[0] peer-focus:text-green-500">
                    Role
                  </label>
                </div>
                <div className="relative">
                  <select
                    name="employeeStatus"
                    value={formData.employeeStatus}
                    onChange={handleSelectChange}
                    className="peer w-full p-3 md:p-4 border border-gray-300 outline-none bg-gray-100 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">--Select Status--</option>
                    <option value="67097fb3f07f5547278be69e">Active</option>
                    <option value="67097fb3f07f5547278be69f">Inactive</option>
                  </select>
                  <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 left-4 z-10 origin-[0] peer-focus:text-green-500">
                    Status
                  </label>
                </div>
              </div>
              {error && <p className="text-red-500 mt-2">{error}</p>}
              <button
                type="submit"
                className="mt-6 flex items-center gap-1 bg-[#028835] font-semibold text-white p-4 px-10 rounded hover:bg-[#026d2a] transition duration-300"
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
