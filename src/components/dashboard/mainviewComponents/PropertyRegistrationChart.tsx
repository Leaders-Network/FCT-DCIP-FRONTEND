"use client";
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PropertyRegistrationChart: React.FC = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "June", "Jul", "Aug"],
    datasets: [
      {
        label: "Property Registrations",
        data: [92, 68, 58, 110, 98, 50, 78, 72],
        backgroundColor: "#4CAF50",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allow the chart to adjust its size
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Property Registration Report",
        font: {
          size: 16, // Smaller font size for mobile
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 120,
        ticks: {
          font: {
            size: 12, // Smaller font size for axis labels
          },
        },
      },
      x: {
        ticks: {
          font: {
            size: 12, // Smaller font size for axis labels
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow w-full h-[300px] sm:h-[400px]">
      <Bar data={data} options={options} />
    </div>
  );
};

export default PropertyRegistrationChart;
