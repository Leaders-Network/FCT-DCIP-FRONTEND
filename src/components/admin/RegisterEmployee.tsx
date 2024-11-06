"use client";
import React from "react";
import { useRegisterEmployee } from "@/hooks/useRegisterEmployee";
import { Role } from "@/types/api.types";

const RegisterEmployee = () => {
  const {
    formData,
    error,
    isLoading,
    availableRoles,
    userRole,
    handleChange,
    handleSubmit,
  } = useRegisterEmployee();

  // Prevent unauthorized access
  if (!userRole) {
    return <div>Unauthorized access</div>;
  }

  console.log(availableRoles, 'available')

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Register New Employee</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="firstname"
          value={formData.firstname}
          onChange={handleChange}
          placeholder="First Name"
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="lastname"
          value={formData.lastname}
          onChange={handleChange}
          placeholder="Last Name"
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="tel"
          name="phonenumber"
          value={formData.phonenumber}
          onChange={handleChange}
          placeholder="Phone Number"
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
          className="w-full p-2 border rounded"
        />
        <select
          name="roleId"
          value={formData.roleId}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        >
          <option value="">Select Role</option>
          {availableRoles.map((role: Role) => (
            <option key={role._id} value={role._id}>
              {role.name}
            </option>
          ))}
        </select>
        <select
          name="statusId"
          value={formData.statusId}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        >
          <option value="">Select Status</option>
          <option value="67097fb3f07f5547278be69e">Active</option>
          <option value="67097fb3f07f5547278be69f">Inactive</option>
        </select>
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded"
        >
          Register Employee
        </button>
      </form>
    </div>
  );
};

export default RegisterEmployee;
