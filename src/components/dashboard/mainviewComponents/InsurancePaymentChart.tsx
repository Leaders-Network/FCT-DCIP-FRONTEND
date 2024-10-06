"use client";
import React, { useEffect, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const InsurancePaymentChart: React.FC = () => {
  const [chartLoaded, setChartLoaded] = useState(false);

  useEffect(() => {
    setChartLoaded(true);
  }, []);

  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept"],
    datasets: [
      {
        label: "Insurance Payments",
        data: [38, 85, 22, 50, 55, 73, 52, 90, 75],
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        tension: 0.4,
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
        text: "Insurance Payment Report",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          font: {
            size: 10, // Smaller font size for y-axis labels
          },
        },
      },
      x: {
        ticks: {
          font: {
            size: 10, // Smaller font size for x-axis labels
          },
        },
      },
    },
  };

  if (!chartLoaded) {
    return <div>Loading chart...</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="h-[300px] sm:h-[400px]"> {/* Set a fixed height for the chart container */}
        {typeof window !== 'undefined' && <Line data={data} options={options} />}
      </div>
    </div>
  );
};

export default InsurancePaymentChart;
