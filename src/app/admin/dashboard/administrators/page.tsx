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
import { toast } from "sonner"

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

interface User {
  _id: string;
  fullname: string;
  email: string;
  phonenumber: string;
  role?: string;
  isEmailVerified?: boolean;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Employee {
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
  createdAt?: string;
  updatedAt?: string;
}

type UserManagementItem = Administrator | User | Employee;

export default function AdministratorsPage() {
  const [showAdminSidebar, setShowAdminSidebar] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<UserManagementItem | null>(null)
  const [administrators, setAdministrators] = useState<Administrator[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [activeTab, setActiveTab] = useState<'administrators' | 'employees' | 'users'>('administrators')
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phonenumber: "",
    role: "",
    status: "Active",
    roleId: "",
    statusId: "active",
    userType: "administrator" // New field to track what type of user we're creating
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

      if (formData.userType === 'administrator') {
        await adminApi.createAdministrator(submitData);
      } else if (formData.userType === 'employee') {
        // Employees are always Surveyors
        const surveyorPayload = {
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          phonenumber: formData.phonenumber,
        };
        await adminApi.createSurveyor(surveyorPayload);
      } else if (formData.userType === 'user') {
        // Platform users are simple users
        const userSubmitData = {
          fullname: `${formData.firstname} ${formData.lastname}`.trim(),
          email: formData.email,
          phonenumber: formData.phonenumber,
          password: 'TempPassword123!',
          confirmPassword: 'TempPassword123!'
        };
        await adminApi.registerUser(userSubmitData);
      }

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
        statusId: "active",
        userType: "administrator"
      });
      // Refresh data
      await fetchAllData();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  const fetchAllData = async () => {
    try {
      setLoading(true)

      // Fetch administrators
      const adminResponse = await adminApi.getAdministrators()
      if (adminResponse?.success && adminResponse?.data) {
        setAdministrators(adminResponse.data)
      } else {
        setAdministrators([])
      }

      // Fetch employees
      try {
        const employeeResponse = await adminApi.getEmployees()
        if (employeeResponse?.success && employeeResponse?.data) {
          setEmployees(employeeResponse.data)
        } else {
          setEmployees([])
        }
      } catch (error) {
        setEmployees([])
      }

      // Fetch users
      try {
        const userResponse = await adminApi.get<{ success: boolean; users: User[] }>('/auth/users')
        if (userResponse?.success && userResponse?.users) {
          setUsers(userResponse.users)
        } else {
          setUsers([])
        }
      } catch (error) {
        setUsers([])
      }

    } catch (error) {
      setAdministrators([])
      setEmployees([])
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  const handleDeleteAdministrator = async (adminId: string) => {
    try {
      if (activeTab === 'administrators') {
        await adminApi.deleteAdministrator(adminId)
        setAdministrators(administrators.filter(admin => admin._id !== adminId))
      } else if (activeTab === 'employees') {
        await adminApi.deleteEmployee(adminId)
        setEmployees(employees.filter(emp => emp._id !== adminId))
      } else if (activeTab === 'users') {
        // Admin-driven soft-delete of a platform user
        await adminApi.deletePlatformUser(adminId)
        setUsers(users.filter(user => user._id !== adminId))
      }
    } catch (error) {
      toast.error('Failed to delete user. Please try again.')
    }
  }

  const handleEditAdministrator = (admin: UserManagementItem) => {
    setSelectedAdmin(admin)

    // Handle different user types and their field structures
    let firstName = '';
    let lastName = '';

    if ('fullname' in admin) {
      // For users with fullname field
      const names = admin.fullname.split(' ');
      firstName = names[0] || '';
      lastName = names.slice(1).join(' ') || '';
    } else {
      // For administrators and employees with separate firstname/lastname
      firstName = admin.firstname || '';
      lastName = admin.lastname || '';
    }

    setFormData({
      firstname: firstName,
      lastname: lastName,
      email: admin.email,
      phonenumber: admin.phonenumber,
      role: 'employeeRole' in admin ? admin.employeeRole?.role || "" : 'role' in admin ? admin.role || "" : "",
      status: 'employeeStatus' in admin ? admin.employeeStatus?.status || "Active" : 'isEmailVerified' in admin ? (admin.isEmailVerified ? "Active" : "Inactive") : "Active",
      roleId: 'employeeRole' in admin ? admin.employeeRole?._id || "" : "",
      statusId: 'employeeStatus' in admin ? admin.employeeStatus?._id || "active" : "active",
      userType: activeTab === 'administrators' ? 'administrator' : activeTab === 'employees' ? 'employee' : 'user'
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

      if (formData.userType === 'administrator') {
        await adminApi.updateAdministrator(selectedAdmin._id, updateData)
      } else if (formData.userType === 'employee') {
        await adminApi.patch(`/admin/employees/${selectedAdmin._id}`, updateData)
      } else if (formData.userType === 'user') {
        toast.warning('User editing by admin is not yet implemented.')
        return
      }

      setShowEditModal(false)
      setSelectedAdmin(null)

      // Refresh data
      await fetchAllData()
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (adminId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      if (activeTab === 'administrators') {
        const updatedAdmin = await adminApi.updateAdministratorStatus(adminId, newStatus)
        setAdministrators(administrators.map(admin => admin._id === adminId ? updatedAdmin.data : admin))
      } else if (activeTab === 'employees') {
        const updatedEmployee = await adminApi.updateEmployeeStatus(adminId, newStatus)
        setEmployees(employees.map(emp => emp._id === adminId ? updatedEmployee.data : emp))
      } else if (activeTab === 'users') {
        toast.warning('User status management is not yet implemented.')
        return
      }
    } catch (error) {
    }
  }

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'administrators':
        return administrators
      case 'employees':
        return employees
      case 'users':
        return users
      default:
        return administrators
    }
  }

  const filteredData = useMemo(() => {
    const currentData = getCurrentData()
    return currentData.filter(item => {
      // Handle different field structures for different user types
      const firstName = 'firstname' in item ? item.firstname : '';
      const lastName = 'lastname' in item ? item.lastname : '';
      const fullName = 'fullname' in item ? item.fullname : `${firstName} ${lastName}`.trim();

      return fullName.toLowerCase().includes(filter.toLowerCase()) ||
        item.email.toLowerCase().includes(filter.toLowerCase()) ||
        item.phonenumber.includes(filter)
    })
  }, [administrators, employees, users, filter, activeTab])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredData.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredData, currentPage, itemsPerPage])

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold truncate">User Management</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Manage administrators, employees, and users across the platform
          </p>
        </div>
        <div className="flex gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
          <Button
            onClick={() => setShowAdminSidebar(true)}
            className="flex-1 sm:flex-none bg-[#028835] text-white hover:bg-[#026a29] rounded-full whitespace-nowrap"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Add User
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none text-gray-700 whitespace-nowrap">
            Export
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6 overflow-x-auto">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max">
          {[
            { key: 'administrators', label: 'AMMC Administrators', count: administrators.length },
            { key: 'employees', label: 'Employees', count: employees.length },
            { key: 'users', label: 'Platform Users', count: users.length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as typeof activeTab)
                setCurrentPage(1) // Reset pagination when switching tabs
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.key
                ? 'border-[#028835] text-[#028835]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <Input
            placeholder="Filter by name or email..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:max-w-sm"
          />
        </div>
        {loading ? (
          <div className="text-center py-12">Loading {activeTab}...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox /></TableHead>
                <TableHead>Profile</TableHead>
                <TableHead className="hidden md:table-cell">Email Address</TableHead>
                <TableHead className="hidden lg:table-cell">Phone Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Date of Reg.</TableHead>
                <TableHead className="w-16 sm:w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item) => (
                <TableRow key={item._id}>
                  <TableCell><Checkbox /></TableCell>
                  <TableCell>
                    <div className="flex items-center min-w-0">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-[#028835] flex items-center justify-center text-white font-bold">
                          {(() => {
                            if ('fullname' in item) {
                              const names = item.fullname.split(' ');
                              return names.length >= 2 ? `${names[0][0]}${names[names.length - 1][0]}` : `${names[0][0]}${names[0][1] || ''}`;
                            } else {
                              return `${item.firstname[0]}${item.lastname[0]}`;
                            }
                          })()}
                        </div>
                      </div>
                      <div className="ml-4 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[180px] sm:max-w-xs">
                          {'fullname' in item ? item.fullname : `${item.firstname} ${item.lastname}`}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[180px] sm:max-w-xs">
                          {'employeeRole' in item ? item.employeeRole?.role || 'N/A' :
                            'role' in item ? item.role || 'User' : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-[220px] truncate">{item.email}</TableCell>
                  <TableCell className="hidden lg:table-cell whitespace-nowrap">{item.phonenumber}</TableCell>
                  <TableCell>
                    {activeTab === 'users' ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${'isEmailVerified' in item && item.isEmailVerified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {'isEmailVerified' in item && item.isEmailVerified ? 'Verified' : 'Unverified'}
                      </span>
                    ) : (
                      <Switch
                        checked={
                          'employeeStatus' in item ? item.employeeStatus?.status === 'Active' :
                            'isActive' in item ? item.isActive === true : false
                        }
                        onCheckedChange={() => handleToggleStatus(
                          item._id,
                          'employeeStatus' in item ? item.employeeStatus?.status || 'Inactive' :
                            'isActive' in item ? (item.isActive ? 'Active' : 'Inactive') : 'Inactive'
                        )}
                      />
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell whitespace-nowrap">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {/* Quick delete icon button so it's clearly visible */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                            title="Delete from platform"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this account?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently remove this{' '}
                              {activeTab === 'administrators'
                                ? 'administrator'
                                : activeTab === 'employees'
                                ? 'employee'
                                : 'platform user'}{' '}
                              from the platform.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteAdministrator(item._id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      {/* Overflow menu for other actions (edit, delete) */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditAdministrator(item)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete from Platform
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently remove this{' '}
                                  {activeTab === 'administrators'
                                    ? 'administrator'
                                    : activeTab === 'employees'
                                    ? 'employee'
                                    : 'platform user'}{' '}
                                  from the platform.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteAdministrator(item._id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <div className="p-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {paginatedData.length} of {filteredData.length} {activeTab}
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
              disabled={currentPage * itemsPerPage >= filteredData.length}
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
                <h2 className="text-xl font-bold">Add {
                  formData.userType === 'administrator' ? 'AMMC Administrator' :
                    formData.userType === 'employee' ? 'Employee' : 'Platform User'
                }</h2>
                <button
                  onClick={() => setShowAdminSidebar(false)}
                  className="text-green-100 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Type *
                </label>
                <select
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
                  required
                >
                  <option value="administrator">AMMC Administrator</option>
                  <option value="employee">Employee</option>
                  <option value="user">Platform User</option>
                </select>
              </div>
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
                {/* Show role select only for administrators and employees (employees are only Surveyors) */}
                {(formData.userType === 'administrator' || formData.userType === 'employee') && (
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
                    required
                  >
                    <option value="">Select a role</option>
                    {formData.userType === 'administrator' && (
                      <>
                        <option value="Admin">Admin</option>
                      </>
                    )}
                    {formData.userType === 'employee' && (
                      <>
                        <option value="Surveyor">Surveyor</option>
                      </>
                    )}
                  </select>
                )}
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
                      <span>Create {
                        formData.userType === 'administrator' ? 'Administrator' :
                          formData.userType === 'employee' ? 'Employee' : 'User'
                      }</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
            <div className="bg-blue-600 text-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Edit {
                  formData.userType === 'administrator' ? 'Administrator' :
                    formData.userType === 'employee' ? 'Employee' : 'User'
                }</h2>
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
                  {formData.userType === 'administrator' && (
                    <>
                      <option value="Admin">Admin</option>
                    </>
                  )}
                  {formData.userType === 'employee' && (
                    <>
                      <option value="Surveyor">Surveyor</option>
                      <option value="Manager">Manager</option>
                      <option value="Clerk">Clerk</option>
                      <option value="Analyst">Analyst</option>
                    </>
                  )}
                  {formData.userType === 'user' && (
                    <>
                      <option value="Standard User">Standard User</option>
                      <option value="Premium User">Premium User</option>
                    </>
                  )}
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
                      <span>Update {
                        formData.userType === 'administrator' ? 'Administrator' :
                          formData.userType === 'employee' ? 'Employee' : 'User'
                      }</span>
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
