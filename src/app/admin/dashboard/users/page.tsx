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
  Edit
} from 'lucide-react'
import AdminSidebar from '@/components/dashboard/usersComponent/AdminSideBar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkout'
import { adminApi } from '@/services/api'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function UsersPage() {
  const [showAdminSidebar, setShowAdminSidebar] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

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
  }, [])

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      await adminApi.deleteEmployee(employeeId)
      setEmployees(employees.filter(emp => emp._id !== employeeId))
    } catch (error) {
      console.error("Failed to delete employee:", error)
    }
  }

  const handleToggleStatus = async (employeeId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const updatedEmployee = await adminApi.updateEmployeeStatus(employeeId, newStatus)
      setEmployees(employees.map(emp => emp._id === employeeId ? updatedEmployee.data : emp))
    } catch (error) {
      console.error("Failed to update employee status:", error)
    }
  }

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee =>
      employee.firstname.toLowerCase().includes(filter.toLowerCase()) ||
      employee.lastname.toLowerCase().includes(filter.toLowerCase()) ||
      employee.email.toLowerCase().includes(filter.toLowerCase())
    )
  }, [employees, filter])

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredEmployees.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredEmployees, currentPage, itemsPerPage])

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
          <div className="text-center py-12">Loading employees...</div>
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
              {paginatedEmployees.map((employee) => (
                <TableRow key={employee._id}>
                  <TableCell><Checkbox /></TableCell>
                  <TableCell>
                    <div className="flex items-.center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-[#028835] flex items-center justify-center text-white font-bold">
                          {`${employee.firstname[0]}${employee.lastname[0]}`}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{`${employee.firstname} ${employee.lastname}`}</div>
                        <div className="text-sm text-gray-500">{employee.employeeRole.role}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.phonenumber}</TableCell>
                  <TableCell>
                    <Switch
                      checked={employee.employeeStatus.status === 'Active'}
                      onCheckedChange={() => handleToggleStatus(employee._id, employee.employeeStatus.status)}
                    />
                  </TableCell>
                  <TableCell>{new Date(employee.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
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
                                This action cannot be undone. This will permanently delete the employee.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteEmployee(employee._id)}>Delete</AlertDialogAction>
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
            Showing {paginatedEmployees.length} of {filteredEmployees.length} employees
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
              disabled={currentPage * itemsPerPage >= filteredEmployees.length}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
      <AdminSidebar isOpen={showAdminSidebar} onClose={() => setShowAdminSidebar(false)} />
    </>
  )
}