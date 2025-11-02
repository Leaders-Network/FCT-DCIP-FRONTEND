"use client";
import React from "react";
import { ShieldCheck, HardHat, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const InsuranceOption = () => {
  const insuranceOptions = [
    {
      title: "Occupier Liability Insurance",
      icon: <ShieldCheck className="w-10 h-10 text-green-700" />,
      subtitle:
        "Safety for occupiers of public buildings under Section 65 of the Insurance Act 2003.",
      description:
        "Safety for occupiers is our priority. Our coverage ensures protection for your home, business, and property against unforeseen incidents.",
      details: [
        "Covers injury or damage to visitors within your premises.",
        "Ensures compliance with the Insurance Act 2003.",
        "Provides peace of mind for both owners and tenants.",
      ],
    },
    {
      title: "Builders Liability Insurance",
      icon: <HardHat className="w-10 h-10 text-green-700" />,
      subtitle:
        "Coverage for builders and contractors under Section 64 of the Insurance Act 2003.",
      description:
        "Safeguards builders and contractors against on-site risks and third-party liabilities during construction projects.",
      details: [
        "Covers accidental damage during construction.",
        "Protects against third-party claims and injuries.",
        "Ensures compliance with building safety laws.",
      ],
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
        <div className="absolute inset-0 bg-black/70"></div>
        <div data-aos="zoom-in" className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Our Insurance Options
          </h1>
          <p className="max-w-3xl mx-auto text-lg leading-relaxed">
            Our insurance options provide comprehensive coverage tailored to your
            specific needs — offering peace of mind, financial security, and a
            safety net for your investments and well-being.
          </p>
        </div>
      </section>

      {/* Options Section */}
      <section className="py-20 px-6 md:px-16">
        <h2 className="text-3xl font-semibold text-center text-gray-900 mb-12">
          Explore Our Insurance Options
        </h2>

        <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {insuranceOptions.map((option, index) => (
            <div
              data-aos="zoom-in"
              data-aos-delay={index * 300}
              key={index}
              className="group relative h-80 [perspective:1000px]"
            >
              {/* Card Inner */}
              <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                {/* Front Side */}
                <div className="absolute inset-0 bg-white rounded-2xl shadow-md p-8 [backface-visibility:hidden] flex flex-col justify-center transition">
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

                {/* Back Side */}
                <div className="absolute inset-0 bg-green-700 text-white rounded-2xl shadow-md p-8 [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col justify-center">
                  <h3 className="text-2xl font-semibold mb-4">
                    {option.title}
                  </h3>
                  <ul className="space-y-2 text-base">
                    {option.details.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default InsuranceOption;
