import Image from "next/image";
import React from "react";

interface StatCardProps {
  icon: any;
  value: string;
  label: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color }) => {
  return (
    <div className={`${color} p-4 rounded-lg flex flex-col items-center`}>
      <Image src={icon} alt="icon" width={24} height={24} />
      <span className="text-xl font-bold">{value}</span>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );
};

export default StatCard;
