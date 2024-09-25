import React from "react";
import Image from "next/image";

const Hero = () => {
  return (
    <div className="relative h-[700px]">
      <Image
        src="/abuja-bg.png"
        alt="City at night"
        layout="fill"
        objectFit="cover"
        className="brightness-50"
      />
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-white mb-4">
            Protect Your Property <br /> with Confidence
          </h1>
          <p className="text-xl text-white mb-8">
            Comprehensive insurance solutions tailored to your needs. <br />
            Get started today and secure your peace of mind.
          </p>
          <div className="flex space-x-4">
            <button className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors">
              Get Started
            </button>
            <button className="bg-white text-green-600 px-6 py-3 rounded-md hover:bg-gray-100 transition-colors">
              Request Insurance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
