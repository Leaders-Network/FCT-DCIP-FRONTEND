"use client"

import { useState, useEffect } from "react"
import { PlusCircle, X, ChevronRight, MoreVertical, CheckCircle, List, Calendar, Trash2, Eye, Edit } from "lucide-react"
import AddNewProperty from "@/components/dashboard/usersComponent/AddNewProperty"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { getAdminProperties } from "@/services/api";

export default function PropertiesPage() {
  const [showPropertySidebar, setShowPropertySidebar] = useState(false)
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [searchKeyword, setSearchKeyword] = useState("")
  const [filteredProperties, setFilteredProperties] = useState<any[]>([])
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showActionsDropdown, setShowActionsDropdown] = useState<string | null>(null)

  interface AdminProperty {
    _id: string;
    address: string;
    propertyType: string;
    buildingValue: number;
    status: string;
  }

  const [propertyToDelete, setPropertyToDelete] = useState<AdminProperty | null>(null)

  const statusOptions = ["Active", "Expired", "Blacklisted", "Processing", "Inactive", "Pending", "Cancelled"]

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await getAdminProperties();
        setProperties(response.allProperties.properties);
        setFilteredProperties(response.allProperties.properties);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [])

  useEffect(() => {
    applyFilters()
  }, [activeFilters])

  const applyFilters = () => {
    let result = [...(properties || [])]

    if (activeFilters.length > 0) {
      result = result.filter((property) => activeFilters.includes(property?.status))
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

    const result = (properties || []).filter(
      (property) =>
        (property?.address || '').toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (property?._id || '').toLowerCase().includes(searchKeyword.toLowerCase()),
    )

    setFilteredProperties(result)
    setSelectedFilterCategory(null)
    setIsFilterPanelOpen(false)
  }

  const handleDateSearch = () => {
    if (!dateFrom && !dateTo) return

    const fromDate = dateFrom ? new Date(dateFrom) : new Date(0)
    const toDate = dateTo ? new Date(dateTo) : new Date(8640000000000000)

    const result = (properties || []).filter((property) => {
      if (property?.createdAt === "----------") return false
      const propertyDate = new Date(property?.createdAt || '')
      return propertyDate >= fromDate && propertyDate <= toDate
    })

    setFilteredProperties(result)
    setSelectedFilterCategory(null)
    setIsFilterPanelOpen(false)
  }

  const handleDeleteProperty = async (property: AdminProperty) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/property/${property._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'apiKey': process.env.NEXT_PUBLIC_API_KEY || ''
        }
      });

      if (response.ok) {
        setProperties(prev => prev.filter(p => p._id !== property._id));
        setFilteredProperties(prev => prev.filter(p => p._id !== property._id));
        setShowDeleteModal(false);
        setPropertyToDelete(null);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete property');
      }
    } catch (error) {
      console.error('Delete property error:', error);
      alert('Failed to delete property');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProperties.length === 0) return;

    try {
      const deletePromises = selectedProperties.map(propertyId =>
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/property/${propertyId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
            'apiKey': process.env.NEXT_PUBLIC_API_KEY || ''
          }
        })
      );

      await Promise.all(deletePromises);

      setProperties(prev => prev.filter(p => !selectedProperties.includes(p._id)));
      setFilteredProperties(prev => prev.filter(p => !selectedProperties.includes(p._id)));
      setSelectedProperties([]);
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('Failed to delete selected properties');
    }
  };

  const togglePropertySelection = (propertyId: string) => {
    setSelectedProperties(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProperties.length === filteredProperties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(filteredProperties.map(p => p._id));
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Verified":
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Properties</h1>
        <div className="flex gap-4">
          {selectedProperties.length > 0 && (
            <Button
              onClick={handleBulkDelete}
              className="bg-red-600 text-white hover:bg-red-700 rounded-full"
            >
              <Trash2 className="mr-2 h-5 w-5" />
              Delete Selected ({selectedProperties.length})
            </Button>
          )}
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
                            className={`rounded hover:bg-[#DBDBDB]/80 w-full text-left p-2 flex items-center justify-between ${selectedFilterCategory === category.toLowerCase() ? "bg-gray-100" : ""
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
                  <Checkbox
                    checked={selectedProperties.length === filteredProperties.length && filteredProperties.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owned By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b animate-pulse">
                    <td className="py-4 px-4">
                      <div className="w-5 h-5 bg-gray-200 rounded"></div>
                    </td>
                    <td className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </td>
                    <td className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="py-4">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="py-4">
                      <div className="w-6 h-6 bg-gray-200 rounded"></div>
                    </td>
                  </tr>
                ))
              ) : filteredProperties.map((property, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Checkbox
                      checked={selectedProperties.includes(property._id)}
                      onCheckedChange={() => togglePropertySelection(property._id)}
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs">
                    <div className="truncate">{property?.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{property?.ownedBy?.firstname} {property?.ownedBy?.lastname}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{property?._id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-md ${getStatusBadgeClass(property?.status)}`}
                    >
                      {property?.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={() => setShowActionsDropdown(showActionsDropdown === property._id ? null : property._id)}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {showActionsDropdown === property._id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                // View property logic
                                setShowActionsDropdown(null);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Eye className="mr-3 h-4 w-4" />
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                // Edit property logic
                                setShowActionsDropdown(null);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Edit className="mr-3 h-4 w-4" />
                              Edit Property
                            </button>
                            <button
                              onClick={() => {
                                setPropertyToDelete(property);
                                setShowDeleteModal(true);
                                setShowActionsDropdown(null);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                            >
                              <Trash2 className="mr-3 h-4 w-4" />
                              Delete Property
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddNewProperty isOpen={showPropertySidebar} onClose={() => setShowPropertySidebar(false)} />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && propertyToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Property</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete the property at "{propertyToDelete.address}"? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPropertyToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDeleteProperty(propertyToDelete)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete Property
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}