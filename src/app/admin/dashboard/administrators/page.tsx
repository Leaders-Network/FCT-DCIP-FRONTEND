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

export default function AdministratorsPage() {
  const [showAdminSidebar, setShowAdminSidebar] = useState(false)
  const [administrators, setAdministrators] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

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

  const handleDeleteAdministrator = async (adminId) => {
    try {
      await adminApi.deleteAdministrator(adminId)
      setAdministrators(administrators.filter(admin => admin._id !== adminId))
    } catch (error) {
      console.error("Failed to delete administrator:", error)
    }
  }

  const handleToggleStatus = async (adminId, currentStatus) => {
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
                        <div className="text-sm text-gray-500">{admin.employeeRole.role}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.phonenumber}</TableCell>
                  <TableCell>
                    <Switch
                      checked={admin.employeeStatus.status === 'Active'}
                      onCheckedChange={() => handleToggleStatus(admin._id, admin.employeeStatus.status)}
                    />
                  </TableCell>
                  <TableCell>{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
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
      <AdminSidebar isOpen={showAdminSidebar} onClose={() => setShowAdminSidebar(false)} />
    </>
  )
}