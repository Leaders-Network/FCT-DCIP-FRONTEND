"use client"
import React, { useState } from 'react'
import AddAdminForm from './usersComponent/AddAdminForm'

const Users = () => {
  const users = [
    { id: '001', name: 'Mike Afolabi', email: 'mikeafoo1@gmail.com', phone: '08132748906', status: 'Active', dateOfReg: 'April 02, 2024' },
    { id: '002', name: 'Paul Blessing', email: 'pblessing731@gmail.com', phone: '08037820378', status: 'Active', dateOfReg: 'May 05, 2024' },
    { id: '003', name: 'Emmanuel Sam', email: 'samuelsemako2@gmail.com', phone: '08109273326', status: 'Suspended', dateOfReg: 'July 20, 2024' },
    { id: '004', name: 'Charles Clement', email: 'charlesclet@gmail.com', phone: '09093278906', status: 'Active', dateOfReg: 'Aug 23, 2024' },
    { id: '005', name: 'Benjamin Joseph', email: 'benjaminboy@gmail.com', phone: '09001145666', status: 'Inactive', dateOfReg: 'Nov 24, 2024' },
    
  ]

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-[#028835]'
      case 'Suspended': return 'bg-gray-500'
      case 'Inactive': return 'bg-red-500'
      default: return 'bg-gray-200'
    }
  }

  const [selectAll, setSelectAll] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setSelectAll(isChecked);
    setSelectedUsers(isChecked ? users.map(user => user.id) : []);
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const [isFormOpen, setIsFormOpen] = useState(false);

  const openForm = () => setIsFormOpen(true);
  const closeForm = () => setIsFormOpen(false);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 relative">
      <div className="flex flex-col mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h1 className="text-2xl font-bold">Administrator</h1>
          <button
            onClick={openForm}
            className="bg-[#028835] text-white px-4 py-2 rounded-full flex items-center text-sm sm:text-base"
          >
            <span className="bg-black rounded-full w-6 h-6 pt-[2px] items-center justify-center mr-2 leading-none">
              +
            </span>
            Add New Admin
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg bg-white">
        <table className="min-w-full bg-white">
          <thead className="border-b">
            <tr>
              <th className="w-12 pt-6 pb-2">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-600"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              {['Profile', 'Email Address', 'Phone Number', 'Status', 'Date of Reg.', ''].map((header, index) => (
                <th key={index} className="px-4 sm:px-6 py-3 pt-6 pb-4 text-left text-xs sm:text-sm font-bold text-black">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-600"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                  />
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                      <div
                        className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm ${
                          getInitials(user.name) === "MA"
                            ? "bg-[#488274]"
                            : getInitials(user.name) === "PB"
                            ? "bg-[#8B9FEF]"
                            : getInitials(user.name) === "ES"
                            ? "bg-[#FBD673]"
                            : getInitials(user.name) === "CC"
                            ? "bg-[#F2A4F1]"
                            : "bg-[#028835]"
                        }`}
                      >
                        {getInitials(user.name)}
                      </div>
                    </div>
                    <div className="ml-2 sm:ml-4">
                      <div className="text-xs sm:text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-xs sm:text-sm text-[#1E1E1E]">
                        ID: {user.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-medium text-xs sm:text-sm text-[#302F2F]">
                  {user.email}
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-medium text-xs sm:text-sm text-[#2B2929]">
                  {user.phone}
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <button
                    className={`px-2 sm:px-3 py-1 rounded-md ${getStatusColor(
                      user.status
                    )} text-white text-xs sm:text-sm`}
                  >
                    {user.status}
                  </button>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-medium text-xs sm:text-sm text-[#2B2929]">
                  {user.dateOfReg}
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                  <button className="text-white rounded-md hover:text-green-900 bg-[#028835] px-2 sm:px-3 py-1 sm:py-[6px]">
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddAdminForm isOpen={isFormOpen} onClose={closeForm} />
    </div>
  );
}

export default Users
