"use client"

import { useState, useEffect } from "react"
import { PlusCircle, MoreVertical } from "lucide-react"
import AdminSidebar from "@/components/dashboard/usersComponent/AdminSideBar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkout"
import { adminApi } from "@/services/adminApi"

export default function UsersPage() {
  const [showAdminSidebar, setShowAdminSidebar] = useState(false)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true)
        const response = await adminApi.getEmployees()
        if (response?.success && response?.data) {
          setEmployees(response.data)
        } else {
          setEmployees([])
        }
      } catch (error) {
        console.error("Failed to fetch employees:", error)
        setEmployees([])
      } finally {
        setLoading(false)
      }
    }
    fetchEmployees()
  }, []) // Empty dependency array means this runs once on mount


  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
          <div className="flex gap-4">
            <Button
              onClick={() => setShowAdminSidebar(true)}
              className="bg-[#028835] text-white hover:bg-[#026a29] rounded-full"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Add New User
            </Button>
            <Button variant="outline" className="text-gray-700">
              Export
            </Button>
          </div>
        </div>

      {loading ? (
        <div className="text-center py-12">Loading administrators...</div>
      ) : (

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Filter Section */}
          

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                    <Checkbox />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date of Reg.
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
  {(employees || []).map((admin, index) => (
    <tr key={index} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <Checkbox />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-[#028835] flex items-center justify-center text-white font-bold">
              {((admin?.firstname || '') + ' ' + (admin?.lastname || ''))
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{admin?.firstname} {admin?.lastname}</div>
            <div className="text-sm text-gray-500">{admin?._id}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin?.email}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin?.phonenumber}</td>

      {/* Dynamic Status Cell */}
      <td className="px-6 py-4 whitespace-nowrap">
  <span
    className={`inline-flex items-center justify-center text-sm font-semibold rounded-md
      ${
        admin?.employeeStatus?.status === "Active"
          ? "bg-green-500 text-white"
          : admin?.employeeStatus?.status === "Pending"
          ? "bg-yellow-500 text-white"
          : admin?.employeeStatus?.status === "Inactive"
          ? "bg-red-500 text-white"
          : "bg-gray-300 text-gray-800"
      }
    `}
    style={{
      width: "120px", // Same fixed width
      height: "40px", // Same fixed height
    }}
  >
    {admin?.employeeStatus?.status}
  </span>
</td>


      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin?.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}</td>

      {/* View Profile Button */}
      <td className="px-6 py-4 whitespace-nowrap">
        <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded">
          View Profile
        </button>
      </td>
    </tr>
  ))}
</tbody>

            </table>
          </div>
        </div>
      )} {/* Close the conditional rendering block */}
      
      <AdminSidebar isOpen={showAdminSidebar} onClose={() => setShowAdminSidebar(false)} />
    </>
  )
}
