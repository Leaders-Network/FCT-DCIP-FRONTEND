'use client'

import {
  useState,
  useEffect,
  useMemo
} from 'react'
import {
  PlusCircle,
  MoreVertical,
  Trash,
  Edit,
  UserPlus,
  X,
  Search,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  XCircle,
  Building2
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
import { CADASTRAL_ZONES } from '@/constants/policyConstants'
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
  cadastralZone?: string;
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
  cadastralZone?: string;
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
  cadastralZone?: string;
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
    userType: "administrator", // New field to track what type of user we're creating
    cadastralZone: ""
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
          cadastralZone: formData.cadastralZone,
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
        userType: "administrator",
        cadastralZone: ""
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
        toast.success('Administrator deleted successfully')
      } else if (activeTab === 'employees') {
        await adminApi.deleteEmployee(adminId)
        setEmployees(employees.filter(emp => emp._id !== adminId))
        toast.success('Employee deleted successfully')
      } else if (activeTab === 'users') {
        // Admin-driven soft-delete of a platform user
        await adminApi.deletePlatformUser(adminId)
        setUsers(users.filter(user => user._id !== adminId))
        toast.success('User deleted successfully')
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
      userType: activeTab === 'administrators' ? 'administrator' : activeTab === 'employees' ? 'employee' : 'user',
      cadastralZone: ('cadastralZone' in admin && admin.cadastralZone) ? String(admin.cadastralZone) : ""
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
        await adminApi.patch(`/admin/employees/${selectedAdmin._id}`, { ...updateData, cadastralZone: formData.cadastralZone })
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
        if (updatedAdmin?.success && updatedAdmin?.data) {
          setAdministrators(prev => prev.map(admin => admin._id === adminId ? updatedAdmin.data : admin))
          toast.success(`Administrator status updated to ${newStatus}`)
        } else {
          throw new Error('Failed to update status')
        }
      } else if (activeTab === 'employees') {
        const updatedEmployee = await adminApi.updateEmployeeStatus(adminId, newStatus)
        if (updatedEmployee?.success && updatedEmployee?.data) {
          setEmployees(prev => prev.map(emp => emp._id === adminId ? updatedEmployee.data : emp))
          toast.success(`Employee status updated to ${newStatus}`)
        } else {
          throw new Error('Failed to update status')
        }
      } else if (activeTab === 'users') {
        toast.warning('User status management is not yet implemented.')
        return
      }
    } catch (error: any) {
      console.error('Toggle status error:', error)
      toast.error(error?.response?.data?.message || error?.message || 'Failed to update status')
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 p-6 rounded-[2rem] border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage administrators, employees, and users</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm transition-all">
            Export
          </Button>
          <Button 
            onClick={() => setShowAdminSidebar(true)} 
            className="flex-1 sm:flex-none rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-0.5 transition-all"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      {/* Floating Segmented Control */}
      <div className="flex justify-center w-full">
        <div className="inline-flex p-1.5 bg-slate-100/80 backdrop-blur-md rounded-2xl shadow-inner border border-slate-200/60 overflow-x-auto no-scrollbar w-full sm:w-auto max-w-full">
          {[
            { key: 'administrators', label: 'Administrators', count: administrators.length },
            { key: 'employees', label: 'Employees', count: employees.length },
            { key: 'users', label: 'Platform Users', count: users.length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as typeof activeTab)
                setCurrentPage(1)
              }}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap min-w-fit ${
                activeTab === tab.key
                  ? 'text-emerald-700 bg-white shadow-sm border border-emerald-100/50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <span className="relative z-10">{tab.label}</span>
              <span className={`relative z-10 px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${
                activeTab === tab.key ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 p-4 bg-white/80 rounded-[1.5rem] border border-slate-100 shadow-sm backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder={`Search ${activeTab}...`}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9 bg-slate-50/50 border-slate-200 rounded-xl focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all shadow-none"
          />
        </div>
      </div>

      {/* Data List (Card-Row Layout) */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center p-12 bg-white/50 rounded-[2rem] border border-white/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
              <p className="text-sm font-medium text-slate-500 animate-pulse">Loading {activeTab}...</p>
            </div>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="flex items-center justify-center p-12 bg-white/50 rounded-[2rem] border border-white/50 border-dashed backdrop-blur-sm text-slate-500 font-medium">
            No {activeTab} found.
          </div>
        ) : (
          <div className="grid gap-3">
            {paginatedData.map((item) => {
              const firstName = 'firstname' in item ? item.firstname : '';
              const lastName = 'lastname' in item ? item.lastname : '';
              const fullName = 'fullname' in item ? item.fullname : `${firstName} ${lastName}`.trim();
              const initials = 'fullname' in item 
                ? (item.fullname.split(' ').length >= 2 ? `${item.fullname.split(' ')[0][0]}${item.fullname.split(' ')[item.fullname.split(' ').length - 1][0]}` : `${item.fullname.split(' ')[0][0]}${item.fullname.split(' ')[0][1] || ''}`)
                : `${firstName[0] || ''}${lastName[0] || ''}`;
                
              const role = 'employeeRole' in item ? item.employeeRole?.role || 'N/A' : 'role' in item ? item.role || 'User' : 'N/A';
              
              const isVerified = activeTab === 'users' ? ('isEmailVerified' in item && item.isEmailVerified) : false;
              const isActive = 'employeeStatus' in item ? item.employeeStatus?.status === 'Active' : 'isActive' in item ? item.isActive === true : false;
              
              const statusText = activeTab === 'users' ? (isVerified ? 'Verified' : 'Unverified') : (isActive ? 'Active' : 'Inactive');

              return (
                <div key={item._id} className="group relative flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-5 bg-white/90 backdrop-blur-xl rounded-[1.5rem] border border-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-50">
                  
                  {/* Avatar & Main Info */}
                  <div className="flex items-center gap-4 min-w-[250px] flex-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-700 font-bold shadow-sm ring-1 ring-emerald-200/50 uppercase">
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {fullName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          <Shield className="h-3 w-3" />
                          {role}
                        </span>
                        {item.cadastralZone && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                            <Building2 className="h-3 w-3" />
                            {item.cadastralZone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="hidden md:flex flex-col gap-1.5 flex-1 min-w-[200px] px-4 border-l border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{item.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{item.phonenumber}</span>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-6 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end border-t border-slate-100 md:border-t-0 pt-4 md:pt-0">
                    
                    {/* Status Badge */}
                    <div className="flex items-center">
                      {activeTab === 'users' ? (
                        <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${isVerified ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/50'}`}>
                          {isVerified ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                          {statusText}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${isActive ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50' : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                            {statusText}
                          </div>
                          <Switch
                            checked={isActive}
                            onCheckedChange={() => handleToggleStatus(
                              item._id,
                              'employeeStatus' in item ? item.employeeStatus?.status || 'Inactive' : 'isActive' in item ? (item.isActive ? 'Active' : 'Inactive') : 'Inactive'
                            )}
                            className="scale-75 data-[state=checked]:bg-emerald-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* Actions Menu */}
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon" onClick={() => handleEditAdministrator(item)} className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 rounded-lg shadow-sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" className="text-red-600 border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-700 rounded-lg shadow-sm">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-[2rem] border-white/20 bg-white/95 backdrop-blur-xl shadow-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-bold">Delete Account?</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-500">
                              This action cannot be undone. This will permanently remove this {activeTab.slice(0, -1)} from the platform.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl border-slate-200 hover:bg-slate-50">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteAdministrator(item._id)} className="rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && paginatedData.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-500 font-medium">
            <span>Showing {paginatedData.length} of {filteredData.length} {activeTab}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="rounded-lg h-8 px-3">
                Prev
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage * itemsPerPage >= filteredData.length} className="rounded-lg h-8 px-3">
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      {showAdminSidebar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/20 bg-white/95 shadow-[0_32px_120px_rgba(15,23,42,0.3)] backdrop-blur-xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-emerald-500 to-teal-400" />
            
            <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                Add {formData.userType === 'administrator' ? 'AMMC Admin' : formData.userType === 'employee' ? 'Employee' : 'Platform User'}
              </h2>
              <button onClick={() => setShowAdminSidebar(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto px-8 py-6 custom-scrollbar">
              <form id="add-user-form" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">User Type <span className="text-red-500">*</span></label>
                  <select name="userType" value={formData.userType} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all" required>
                    <option value="administrator">AMMC Administrator</option>
                    <option value="employee">Employee</option>
                    <option value="user">Platform User</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">First Name <span className="text-red-500">*</span></label>
                    <input type="text" name="firstname" value={formData.firstname} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Last Name <span className="text-red-500">*</span></label>
                    <input type="text" name="lastname" value={formData.lastname} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all" required />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email Address <span className="text-red-500">*</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all" required />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Phone Number <span className="text-red-500">*</span></label>
                  <input type="tel" name="phonenumber" value={formData.phonenumber} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all" required />
                </div>

                {(formData.userType === 'administrator' || formData.userType === 'employee') && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Role <span className="text-red-500">*</span></label>
                    <select name="role" value={formData.role} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all" required>
                      <option value="">Select a role</option>
                      {formData.userType === 'administrator' && <option value="Admin">Admin</option>}
                      {formData.userType === 'employee' && <option value="Surveyor">Surveyor</option>}
                    </select>
                  </div>
                )}

                {formData.userType === 'employee' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Cadastral Zone <span className="text-red-500">*</span></label>
                    <select name="cadastralZone" value={formData.cadastralZone || ""} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all" required>
                      <option value="">Select a cadastral zone</option>
                      {CADASTRAL_ZONES.map((zone) => (
                        <option key={zone} value={zone}>{zone}</option>
                      ))}
                    </select>
                  </div>
                )}
              </form>
            </div>
            
            <div className="flex justify-end gap-3 px-8 py-5 border-t border-slate-100 bg-slate-50/50">
              <Button type="button" variant="outline" onClick={() => setShowAdminSidebar(false)} className="rounded-xl border-slate-200">Cancel</Button>
              <Button type="submit" form="add-user-form" disabled={loading} className="rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                Create User
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/20 bg-white/95 shadow-[0_32px_120px_rgba(15,23,42,0.3)] backdrop-blur-xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-blue-500 to-indigo-400" />
            
            <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                Edit {formData.userType === 'administrator' ? 'Administrator' : formData.userType === 'employee' ? 'Employee' : 'User'}
              </h2>
              <button onClick={() => { setShowEditModal(false); setSelectedAdmin(null); }} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto px-8 py-6 custom-scrollbar">
              <form id="edit-user-form" onSubmit={handleUpdateAdministrator} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">First Name <span className="text-red-500">*</span></label>
                    <input type="text" name="firstname" value={formData.firstname} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Last Name <span className="text-red-500">*</span></label>
                    <input type="text" name="lastname" value={formData.lastname} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all" required />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email Address <span className="text-red-500">*</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all" required />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Phone Number <span className="text-red-500">*</span></label>
                  <input type="tel" name="phonenumber" value={formData.phonenumber} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all" required />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Role <span className="text-red-500">*</span></label>
                  <select name="role" value={formData.role} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all" required>
                    <option value="">Select a role</option>
                    {formData.userType === 'administrator' && <option value="Admin">Admin</option>}
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

                {formData.userType === 'employee' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Cadastral Zone <span className="text-red-500">*</span></label>
                    <select name="cadastralZone" value={formData.cadastralZone || ""} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all" required>
                      <option value="">Select a cadastral zone</option>
                      {CADASTRAL_ZONES.map((zone) => (
                        <option key={zone} value={zone}>{zone}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Status <span className="text-red-500">*</span></label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all" required>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </form>
            </div>
            
            <div className="flex justify-end gap-3 px-8 py-5 border-t border-slate-100 bg-slate-50/50">
              <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); setSelectedAdmin(null); }} className="rounded-xl border-slate-200">Cancel</Button>
              <Button type="submit" form="edit-user-form" disabled={loading} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                Update User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
