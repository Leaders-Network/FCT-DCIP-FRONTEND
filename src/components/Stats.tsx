"use client";

import React from "react";
import { Users, Award, FileText, UserPlus } from "lucide-react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1224 },
    items: 3,
    slidesToSlide: 1,
  },
  tablet: {
    breakpoint: { max: 1224, min: 764 },
    items: 2,
    slidesToSlide: 1,
  },
  mobile: {
    breakpoint: { max: 764, min: 0 },
    items: 1,
    slidesToSlide: 1,
  },
};

const stats = [
  {
    icon: <Users className="w-6 h-6" />,
    value: "30k+",
    label: "Complete Projects",
  },
  {
    icon: <Award className="w-6 h-6" />,
    value: "24k+",
    label: "Awards Received",
  },
  {
    icon: <FileText className="w-6 h-6" />,
    value: "12k+",
    label: "Contracts Signed",
  },
  {
    icon: <UserPlus className="w-6 h-6" />,
    value: "5k+",
    label: "Team Expansions",
  },
];

const Stats = () => {
  return (
    <section className="bg-[#004C3F] py-12 relative">
      <div className="container mx-auto px-4">
        <Carousel
          responsive={responsive}
          infinite={true}
          autoPlay={true}
          autoPlaySpeed={0}
          customTransition="all 8s linear"
          transitionDuration={8000}
          pauseOnHover={false}
          arrows={false}
          showDots={false}
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row items-center justify-center text-center md:text-left mx-3"
            >
              <div className="bg-green-500 rounded-full p-3 mb-3 md:mb-0 md:mr-4">
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-100">{stat.label}</div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
};

export default Stats;
