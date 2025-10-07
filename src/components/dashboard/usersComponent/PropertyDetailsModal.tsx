import React from "react";
import { X } from "lucide-react";

interface PropertyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
}

const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({
  isOpen,
  onClose,
  property,
}) => {
  if (!isOpen || !property) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Property Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-2">
          <div><strong>Property ID:</strong> {property._id}</div>
          <div><strong>Address:</strong> {property.address}</div>
          <div><strong>Category:</strong> {property.category?.category}</div>
          <div><strong>Phone Number:</strong> {property.phonenumber}</div>
          <div><strong>Status:</strong> {property.status}</div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsModal;
