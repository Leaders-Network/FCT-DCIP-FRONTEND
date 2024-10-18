"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const RegisterEmployee = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    phonenumber: "",
    email: "",
    roleId: "",
    statusId: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/admin/login");
        return;
      }

      try {
        const response = await axios.get(
          "https://fct-dcip-backend-1.onrender.com/api/v1/auth/user-role",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              apiKey: "4a8612b0162373aff93c2088780b42e77d06b22b9906a58f5940054b192695134262a4c481b9713426922f29b7bd44ea64dcc6e13a3d22d0f7d05044e9ca626c",
            },
          }
        );

        if (response.data.role !== "superAdmin") {
          router.push("/admin/dashboard");
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch user role", error);
        router.push("/admin/login");
      }
    };

    checkAuth();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("You must be logged in to register an employee.");
        return;
      }

      const response = await axios.post(
        "https://fct-dcip-backend-1.onrender.com/api/v1/auth/registerEmployee",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            apiKey:
              "4a8612b0162373aff93c2088780b42e77d06b22b9906a58f5940054b192695134262a4c481b9713426922f29b7bd44ea64dcc6e13a3d22d0f7d05044e9ca626c",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle successful registration
      router.push("/admin/registration-success");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(`Registration failed: ${error.response.data.message}`);
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  };

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
          <option value="67097fb4f07f5547278be6a3">Super Admin</option>
          <option value="67097fb4f07f5547278be6a4">Admin</option>
          <option value="67097fb4f07f5547278be6a5">Staff</option>
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
