import React from "react";
import { ShieldCheck, HardHat } from "lucide-react"; // icons from lucide-react
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";

const InsuranceOption = () => {
  const insuranceOptions = [
    {
      title: "Occupier Liability Insurance",
      icon: <ShieldCheck className="w-10 h-10 text-green-800" />,
      subtitle:
        "Safety for occupiers of public buildings under Section 65 of the Insurance Act 2003.",
      description:
        "Safety for occupiers is our priority. Our comprehensive coverage ensures your home, business, and personal property are protected at all times.",
    },
    {
      title: "Builders Liability Insurance",
      icon: <HardHat className="w-10 h-10 text-green-800" />,
      subtitle:
        "Coverage for builders and contractors under Section 64 of the Insurance Act 2003.",
      description:
        "This insurance safeguards builders and contractors against potential risks and liabilities during construction, giving you confidence as you build safely and legally.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section
        className="relative w-full h-[60vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/bg-hero-11.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/75"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl font-bold mb-4">Our Insurance Options</h1>
          <p className="max-w-2xl mx-auto text-lg">
            Our insurance options provide comprehensive coverage tailored to your
            specific needs — offering peace of mind, financial security, expert
            support, and a range of benefits designed to protect your future and
            well-being.
          </p>
        </div>
      </section>

      {/* Options Section */}
      <section className="py-16 px-6 md:px-16">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-10">
          Explore Our Insurance Options
        </h2>
        <div className="grid md:grid-cols-2 gap-10">
          {insuranceOptions.map((option, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-8"
            >
              <div className="flex items-center gap-4 mb-4">
                {option.icon}
                <h3 className="text-xl font-bold text-gray-900">
                  {option.title}
                </h3>
              </div>
              <p className="text-gray-600 mb-2 font-medium">
                {option.subtitle}
              </p>
              <p className="text-gray-500">{option.description}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default InsuranceOption;
