"use client";
import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip);

const PropertyStatusChart: React.FC = () => {
  const data = {
    labels: ["Active", "Inactive", "Pending"],
    datasets: [
      {
        data: [39432, 39432, 39432],
        backgroundColor: ["#4CAF50", "#9E9E9E", "#FFC107"],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Property Status Report",
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center">
        <div className="w-2/3">
          <Pie data={data}
          //@ts-ignore
           options={options} />
        </div>
        <div className="w-1/3">
          {data.labels.map((label, index) => (
            <div key={label} className="flex items-center mb-2">
              <div 
                className="w-4 h-4 mr-2 rounded-full" 
                style={{ backgroundColor: data.datasets[0].backgroundColor[index] }}
              ></div>
              <span className="mr-2 font-semibold">{label}</span>
              <span>{data.datasets[0].data[index]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyStatusChart;
