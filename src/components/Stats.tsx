import React from "react";
import { Users, Award, FileText, UserPlus } from "lucide-react";

const stats = [
  {
    icon: <Users className="w-6 h-6" />,
    value: "30k+",
    label: "Complete Projects",
  },
  {
    icon: <Award className="w-6 h-6" />,
    value: "24k+",
    label: "Awards Received", // Updated label
  },
  {
    icon: <FileText className="w-6 h-6" />, // Changed icon
    value: "12k+",
    label: "Contracts Signed", // Updated label
  },
  {
    icon: <UserPlus className="w-6 h-6" />, // Changed icon
    value: "5k+",
    label: "Team Expansions", // Updated label
  },
];

const Stats = () => {
  return (
    <section className="bg-[#004C3F] py-8"> {/* Adjusted padding */}
      <div className="container mx-auto px-4">
        <div className="flex justify-between"> {/* Changed to flex layout */}
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center"> {/* Changed to horizontal layout */}
              <div className="bg-green-500 rounded-full p-3 mr-3"> {/* Added circular green background */}
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl text-white font-bold"> {/* Adjusted text size */}
                  {stat.value}
                </div>
                <div className="text-white text-sm"> {/* Adjusted text size */}
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
