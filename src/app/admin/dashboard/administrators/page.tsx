'use client'

import {
  useState,
  useEffect,
  useMemo
} from 'react'
import {
  PlusCircle,
  MoreVertical,
  Trash2,
  Edit,
  UserPlus,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { adminApi } from '@/services/api'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Administrator {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  employeeRole?: {
    _id: string;
    role: string;
  };
  employeeStatus?: {
    _id: string;
    status: string;
  };
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdministratorsPage() {
  const [showAdminSidebar, setShowAdminSidebar] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<Administrator | null>(null)
  const [administrators, setAdministrators] = useState<Administrator[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phonenumber: "",
    role: "",
    status: "Active",
    roleId: "",
    statusId: "active"
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Map role to roleId if needed
      const submitData = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        phonenumber: formData.phonenumber,
        roleId: formData.roleId || formData.role,
        statusId: formData.statusId || (formData.status === "Active" ? "active" : "inactive")
      };

      await adminApi.createAdministrator(submitData);
      setShowAdminSidebar(false);
      // Reset form
      setFormData({
        firstname: "",
        lastname: "",
        email: "",
        phonenumber: "",
        role: "",
        status: "Active",
        roleId: "",
        statusId: "active"
      });
      // Refresh administrators list
      const response = await adminApi.getAdministrators()
      if (response?.success && response?.data) {
        setAdministrators(response.data)
      }
    } catch (error) {
      console.error("Failed to create administrator:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetchAdministrators = async () => {
      try {
        setLoading(true)
        const response = await adminApi.getAdministrators()
        if (response?.success && response?.data) {
          setAdministrators(response.data)
        } else {
          setAdministrators([])
        }
      } catch (error) {
        console.error("Failed to fetch administrators:", error)
        setAdministrators([])
      } finally {
        setLoading(false)
      }
    }
    fetchAdministrators()
  }, [])

  const handleDeleteAdministrator = async (adminId: string) => {
    try {
      await adminApi.deleteAdministrator(adminId)
      setAdministrators(administrators.filter(admin => admin._id !== adminId))
    } catch (error) {
      console.error("Failed to delete administrator:", error)
    }
  }

  const handleEditAdministrator = (admin: Administrator) => {
    setSelectedAdmin(admin)
    setFormData({
      firstname: admin.firstname,
      lastname: admin.lastname,
      email: admin.email,
      phonenumber: admin.phonenumber,
      role: admin.employeeRole?.role || "",
      status: admin.employeeStatus?.status || "Active",
      roleId: admin.employeeRole?._id || "",
      statusId: admin.employeeStatus?._id || "active"
    })
    setShowEditModal(true)
  }

  const handleUpdateAdministrator = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAdmin) return

    setLoading(true)
    try {
      const updateData = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        phonenumber: formData.phonenumber,
        roleId: formData.roleId || formData.role,
        statusId: formData.statusId || (formData.status === "Active" ? "active" : "inactive")
      }

      await adminApi.updateAdministrator(selectedAdmin._id, updateData)
      setShowEditModal(false)
      setSelectedAdmin(null)

      // Refresh administrators list
      const response = await adminApi.getAdministrators()
      if (response?.success && response?.data) {
        setAdministrators(response.data)
      }
    } catch (error) {
      console.error("Failed to update administrator:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (adminId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const updatedAdmin = await adminApi.updateAdministratorStatus(adminId, newStatus)
      setAdministrators(administrators.map(admin => admin._id === adminId ? updatedAdmin.data : admin))
    } catch (error) {
      console.error("Failed to update administrator status:", error)
    }
  }

  const filteredAdministrators = useMemo(() => {
    return administrators.filter(admin =>
      admin.firstname.toLowerCase().includes(filter.toLowerCase()) ||
      admin.lastname.toLowerCase().includes(filter.toLowerCase()) ||
      admin.email.toLowerCase().includes(filter.toLowerCase())
    )
  }, [administrators, filter])

  const paginatedAdministrators = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAdministrators.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAdministrators, currentPage, itemsPerPage])

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">AMMC Administrators</h1>
          <p className="text-gray-600 mt-1">Manage AMMC administrative users and their permissions</p>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={() => setShowAdminSidebar(true)}
            className="bg-[#028835] text-white hover:bg-[#026a29] rounded-full"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Add AMMC Admin
          </Button>
          <Button variant="outline" className="text-gray-700">
            Export
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4">
          <Input
            placeholder="Filter by name or email..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
        {loading ? (
          <div className="text-center py-12">Loading administrators...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Checkbox /></TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Email Address</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date of Reg.</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAdministrators.map((admin) => (
                <TableRow key={admin._id}>
                  <TableCell><Checkbox /></TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-[#028835] flex items-center justify-center text-white font-bold">
                          {`${admin.firstname[0]}${admin.lastname[0]}`}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{`${admin.firstname} ${admin.lastname}`}</div>
                        <div className="text-sm text-gray-500">{admin.employeeRole?.role || 'N/A'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.phonenumber}</TableCell>
                  <TableCell>
                    <Switch
                      checked={admin.employeeStatus?.status === 'Active'}
                      onCheckedChange={() => handleToggleStatus(admin._id, admin.employeeStatus?.status || 'Inactive')}
                    />
                  </TableCell>
                  <TableCell>{admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditAdministrator(admin)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the administrator.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteAdministrator(admin._id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <div className="p-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {paginatedAdministrators.length} of {filteredAdministrators.length} administrators
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage * itemsPerPage >= filteredAdministrators.length}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
      {/* Add Admin Modal */}
      {showAdminSidebar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
            <div className="bg-[#028835] text-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Add AMMC Administrator</h2>
                <button
                  onClick={() => setShowAdminSidebar(false)}
                  className="text-green-100 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phonenumber"
                  value={formData.phonenumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
                  required
                >
                  <option value="">Select a role</option>
                  <option value="Admin">Admin</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdminSidebar(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#028835] text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Administrator</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
            <div className="bg-blue-600 text-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Edit Administrator</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedAdmin(null)
                  }}
                  className="text-blue-100 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateAdministrator} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phonenumber"
                  value={formData.phonenumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a role</option>
                  <option value="Admin">Admin</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedAdmin(null)
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4" />
                      <span>Update Administrator</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}