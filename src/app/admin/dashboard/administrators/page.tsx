"use client"

import { useState } from "react"
import { PlusCircle, MoreVertical } from "lucide-react"
import AdminLayout from "@/components/dashboard/usersComponent/AdminLayout"
import AdminSidebar from "@/components/dashboard/usersComponent/AdminSideBar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkout"

export default function AdministratorsPage() {
  const [showAdminSidebar, setShowAdminSidebar] = useState(false)

  // Mock user data
  const user = {
    firstname: "Paul",
    lastname: "Blessing",
    email: "paul.blessing@example.com",
    role: "Super Admin",
  }

  const administrators = [
    {
      id: "ID 001",
      name: "Mike Afolabi",
      email: "mikeafo@gmail.com",
      phone: "08123456789",
      status: "Active",
      date: "April 02, 2024",
    },
    {
      id: "ID 002",
      name: "Paul Blessing",
      email: "pblessing73@gmail.com",
      phone: "08037820378",
      status: "Active",
      date: "May 05, 2024",
    },
    {
      id: "ID 003",
      name: "Emmanuel Sam",
      email: "samuelemmanuek@gmail.com",
      phone: "08066723108",
      status: "Suspended",
      date: "July 20, 2024",
    },
    {
      id: "ID 004",
      name: "Charles Clement",
      email: "charlescle@gmail.com",
      phone: "09097278910",
      status: "Active",
      date: "Aug 23, 2024",
    },
    {
      id: "ID 005",
      name: "Benjamin Joseph",
      email: "benjoseph@gmail.com",
      phone: "09011456789",
      status: "Inactive",
      date: "Nov 24, 2024",
    },
  ]


  return (
    <>
      <AdminLayout user={user}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Administrators</h1>
          <div className="flex gap-4">
            <Button
              onClick={() => setShowAdminSidebar(true)}
              className="bg-[#028835] text-white hover:bg-[#026a29] rounded-full"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Add New Admin
            </Button>
            <Button variant="outline" className="text-gray-700">
              Export
            </Button>
          </div>
        </div>

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
  {administrators.map((admin, index) => (
    <tr key={index} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <Checkbox />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-[#028835] flex items-center justify-center text-white font-bold">
              {admin.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{admin.name}</div>
            <div className="text-sm text-gray-500">{admin.id}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.email}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.phone}</td>

      {/* Dynamic Status Cell */}
      <td className="px-6 py-4 whitespace-nowrap">
  <span
    className={`inline-flex items-center justify-center text-sm font-semibold rounded-md
      ${
        admin.status === "Active"
          ? "bg-green-500 text-white"
          : admin.status === "Pending"
          ? "bg-yellow-500 text-white"
          : admin.status === "Inactive"
          ? "bg-red-500 text-white"
          : "bg-gray-300 text-gray-800"
      }
    `}
    style={{
      width: "120px", // Same fixed width
      height: "40px", // Same fixed height
    }}
  >
    {admin.status}
  </span>
</td>


      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.date}</td>

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
      </AdminLayout>
      <AdminSidebar isOpen={showAdminSidebar} onClose={() => setShowAdminSidebar(false)} />
    </>
  )
}
