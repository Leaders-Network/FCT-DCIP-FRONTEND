"use client";
import React from "react";

const NotificationPanel: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <button className="text-blue-500">View All</button>
      </div>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Insurance Renewal</h3>
          <p className="text-sm text-gray-600">
            A building with ID: A012D30 just made a payment on 23rd of sept
            2024.
          </p>
        </div>
        <div>
          <h3 className="font-semibold">Expired Insurance</h3>
          <p className="text-sm text-gray-600">
            A building with ID: A015D30 just expired 27th of sept 2024
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
