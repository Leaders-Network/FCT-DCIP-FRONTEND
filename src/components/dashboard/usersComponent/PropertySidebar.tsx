"use client"
import type React from "react"
import { useState } from "react"

interface PropertySidebarProps {
  isOpen: boolean
  onClose: () => void
}

const PropertySidebar: React.FC<PropertySidebarProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    category: "",
    buildingNumber: "",
    address: "",
    contact: "",
    insuranceClass: "",
    insuranceCompany: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      onClose()
      // Reset form
      setFormData({
        category: "",
        buildingNumber: "",
        address: "",
        contact: "",
        insuranceClass: "",
        insuranceCompany: "",
      })
    }, 1000)
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-10" onClick={onClose}></div>}
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-[40%] z-20 bg-white shadow-lg transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out overflow-y-auto`}
      >
        <div className="flex flex-col h-full">
          <div className="bg-[#028835] flex justify-between items-center p-4">
            <h2 className="text-white text-lg font-bold flex items-center gap-2">POLICY</h2>
            <button onClick={onClose} className="bg-[#DF342E] p-2 rounded">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4 flex-grow flex flex-col">
            <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
              <div className="space-y-4 flex-grow">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Category:</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  >
                    <option value="">--Select Category--</option>
                    <option value="residential">Residential Building</option>
                    <option value="commercial">Commercial Building</option>
                    <option value="industrial">Industrial Building</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Building Number:</label>
                  <input
                    type="text"
                    name="buildingNumber"
                    value={formData.buildingNumber}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Address:</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Contact:</label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Insurance Class:</label>
                  <select
                    name="insuranceClass"
                    value={formData.insuranceClass}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  >
                    <option value="">--Select Insurance Class--</option>
                    <option value="class1">Class 1</option>
                    <option value="class2">Class 2</option>
                    <option value="class3">Class 3</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Insurance Company:</label>
                  <select
                    name="insuranceCompany"
                    value={formData.insuranceCompany}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  >
                    <option value="">--Select Insurance Company--</option>
                    <option value="company1">Company 1</option>
                    <option value="company2">Company 2</option>
                    <option value="company3">Company 3</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`mt-auto bg-[#028835] text-white font-semibold p-4 rounded flex items-center justify-center gap-2 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  "SUBMITTING..."
                ) : (
                  <>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-white"
                    >
                      <path
                        d="M20 6L9 17L4 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    SUBMIT
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default PropertySidebar
