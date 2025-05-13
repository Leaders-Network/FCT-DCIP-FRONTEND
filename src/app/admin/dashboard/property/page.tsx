"use client"

import { useState, useEffect } from "react"
import { PlusCircle, X, ChevronRight, MoreVertical, CheckCircle, List, Calendar } from "lucide-react"
import AdminLayout from "@/components/dashboard/usersComponent/AdminLayout"
import AddNewProperty from "@/components/dashboard/usersComponent/AddNewProperty"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkout"

export default function PropertiesPage() {
  const [showPropertySidebar, setShowPropertySidebar] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [searchKeyword, setSearchKeyword] = useState("")
  const [filteredProperties, setFilteredProperties] = useState<any[]>([])

  const user = {
    firstname: "Paul",
    lastname: "Blessing",
    email: "paul.blessing@example.com",
    role: "Super Admin",
  }

  const properties = [
    { name: "Insurance Renewal", date: "May 02, 2024", id: "A012D30", status: "Active" },
    { name: "Insurance Renewal", date: "----------", id: "E712D30", status: "Processing" },
    { name: "Insurance Renewal", date: "Jan 20, 2024", id: "C712V43", status: "Expired" },
    { name: "Insurance Renewal", date: "Jan 01, 2024", id: "Y657JB9", status: "Inactive" },
    { name: "Insurance Renewal", date: "May 24, 2024", id: "B657B90", status: "Cancelled" },
    { name: "Insurance Renewal", date: "----------", id: "A012D30", status: "Pending" },
  ]

  const statusOptions = ["Active", "Expired", "Blacklisted", "Processing", "Inactive", "Pending", "Cancelled"]

  useEffect(() => {
    setFilteredProperties(properties)
  }, [])

  useEffect(() => {
    applyFilters()
  }, [activeFilters])

  const applyFilters = () => {
    let result = [...properties]

    if (activeFilters.length > 0) {
      result = result.filter((property) => activeFilters.includes(property.status))
    }

    setFilteredProperties(result)
  }

  const toggleFilter = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter((f) => f !== filter))
    } else {
      setActiveFilters([...activeFilters, filter])
    }
  }

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter))
  }

  const handleKeywordSearch = () => {
    if (!searchKeyword.trim()) return

    const result = properties.filter(
      (property) =>
        property.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        property.id.toLowerCase().includes(searchKeyword.toLowerCase()),
    )

    setFilteredProperties(result)
    setSelectedFilterCategory(null)
    setIsFilterPanelOpen(false)
  }

  const handleDateSearch = () => {
    if (!dateFrom && !dateTo) return

    const fromDate = dateFrom ? new Date(dateFrom) : new Date(0)
    const toDate = dateTo ? new Date(dateTo) : new Date(8640000000000000)

    const result = properties.filter((property) => {
      if (property.date === "----------") return false
      const propertyDate = new Date(property.date)
      return propertyDate >= fromDate && propertyDate <= toDate
    })

    setFilteredProperties(result)
    setSelectedFilterCategory(null)
    setIsFilterPanelOpen(false)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#028835] text-white w-20 h-8 flex items-center justify-center"
      case "Processing":
        return "bg-[#4FB8CB] text-white w-20 h-8 flex items-center justify-center"
      case "Expired":
        return "bg-[#741411] text-white w-20 h-8 flex items-center justify-center"
      case "Inactive":
        return "bg-[#404040] text-white w-20 h-8 flex items-center justify-center"
      case "Cancelled":
        return "bg-[#BD2722] text-white w-20 h-8 flex items-center justify-center"
      case "Pending":
        return "bg-[#FFC835] text-white w-20 h-8 flex items-center justify-center"
      case "Blacklisted":
        return "bg-black text-white w-20 h-8 flex items-center justify-center"
      default:
        return "bg-gray-200 text-gray-800 w-20 h-8 flex items-center justify-center"
    }
  }

  return (
    <>
      <AdminLayout user={user}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Properties</h1>
          <div className="flex gap-4">
            <Button
              onClick={() => setShowPropertySidebar(true)}
              className="bg-[#028835] text-white hover:bg-[#026a29] rounded-full"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              New Property
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Filter Section */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2 flex-wrap items-center">
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsFilterPanelOpen(!isFilterPanelOpen)
                      setSelectedFilterCategory(null)
                    }}
                    className="p-2 rounded hover:bg-[#DBDBDB]/80 flex items-center space-x-1"
                  >
                    <span>Add Filter</span>
                    <span>≡</span>
                  </button>

                  {isFilterPanelOpen && (
                    <div className="absolute top-10 left-0 bg-white border rounded shadow-md z-10 w-96">
                      <div className="flex">
                        {/* Left Column: Categories */}
                        <div className="w-1/3 border-r">
                          {["Status", "Keyword", "Date"].map((category) => (
                            <button
                              key={category}
                              onClick={() => setSelectedFilterCategory(category.toLowerCase())}
                              className={`rounded hover:bg-[#DBDBDB]/80 w-full text-left p-2 flex items-center justify-between ${
                                selectedFilterCategory === category.toLowerCase() ? "bg-gray-100" : ""
                              }`}
                            >
                              <span className="flex items-center space-x-2">
                              <span>{category === "Status" ? (<CheckCircle />) : category === "Keyword" ? (<List />) : (<Calendar />)}</span>
                                <span>{category}</span>
                              </span>
                              <ChevronRight className="w-3 h-3 text-gray-400" />
                            </button>
                          ))}
                        </div>

                        {/* Right Column: Options */}
                        <div className="w-2/3 p-2">
                          {selectedFilterCategory === "status" && (
                            <div>
                              {statusOptions.map((status) => (
                                <label key={status} className="flex items-center space-x-2 p-1">
                                  <Checkbox
                                    checked={activeFilters.includes(status)}
                                    onCheckedChange={() => toggleFilter(status)}
                                  />
                                  <span>{status}</span>
                                </label>
                              ))}
                            </div>
                          )}
                          {selectedFilterCategory === "keyword" && (
                            <div>
                              <Input
                                type="text"
                                placeholder="Search Keyword"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                className="w-full p-2 border rounded"
                              />
                              <Button className="w-full mt-2 bg-[#028835] text-white" onClick={handleKeywordSearch}>
                                Search
                              </Button>
                            </div>
                          )}
                          {selectedFilterCategory === "date" && (
                            <div className="space-y-2">
                              <div>
                                <label className="text-sm text-gray-500 mb-1 block">Date from</label>
                                <Input
                                  type="date"
                                  value={dateFrom}
                                  onChange={(e) => setDateFrom(e.target.value)}
                                  className="w-full p-2 border rounded"
                                />
                              </div>
                              <div>
                                <label className="text-sm text-gray-500 mb-1 block">Date to</label>
                                <Input
                                  type="date"
                                  value={dateTo}
                                  onChange={(e) => setDateTo(e.target.value)}
                                  className="w-full p-2 border rounded"
                                />
                              </div>
                              <Button onClick={handleDateSearch} className="w-full bg-[#028835] text-white">
                                Search
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Applied Filters */}
                {activeFilters.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.map((filter) => (
                      <div key={filter} className="flex items-center space-x-1 p-2 bg-gray-100 rounded">
                        <span>{filter}</span>
                        <button onClick={() => removeFilter(filter)} className="ml-1 text-red-500">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm">No filters applied</span>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                    <Checkbox />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiring Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Building ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                    <MoreVertical className="h-4 w-4" />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProperties.map((property, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Checkbox />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{property.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{property.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{property.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-md ${getStatusBadgeClass(property.status)}`}
                      >
                        {property.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <MoreVertical className="h-4 w-4 cursor-pointer" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>

      <AddNewProperty isOpen={showPropertySidebar} onClose={() => setShowPropertySidebar(false)} />
    </>
  )
}
