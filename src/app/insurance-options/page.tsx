"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  HardHat,
  CheckCircle,
  UserPlus,
  Building2,
  Flame,
  Stethoscope,
  Plane,
  Ship,
  Car,
  Wallet,
  Package,
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Insurance = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  image: string;
  subtitle: string;
  description: string;
  details: string[];
};

const insuranceOptions: Insurance[] = [
  {
    title: "Occupiers' Liability Insurance",
    icon: ShieldCheck,
    image: "/bg-hero-1.jpg",
    subtitle: "For public buildings under Section 65 of the Insurance Act 2003.",
    description:
      "Covers liability for injury, death or property damage for visitors in public buildings such as churches, malls, offices, hotels, etc.",
    details: [
      "Covers injury or death of visitors.",
      "Covers collapse, fire, flood, earthquake, storm damage.",
      "Mandatory for all publicly accessible buildings.",
    ],
  },
  {
    title: "Builders' Liability Insurance",
    icon: HardHat,
    image: "/bg-hero-9.jpg",
    subtitle: "For buildings under construction (2 floors and above).",
    description: "Provides protection against legal liabilities arising from construction risks.",
    details: ["Covers accidental site damage.",
      "Covers death or injury to workers.",
      "Covers third-party property damage.",
    ],
  },
  {
    title: "Group Life Insurance",
    icon: UserPlus,
    image: "/life-insure.png",
    subtitle: "Mandatory life cover for employees.",
    description: "Provides financial compensation to dependents when an employee dies, disappears, or becomes permanently disabled.",
    details: ["Covers death and permanent disability.",
      "Employers must provide this for all staff.",
      "Protects employees’ families.",
    ],
  },
  {
    title: "Government Assets & Employees Insurance",
    icon: Building2,
    image: "/employees-insurance.jpg",
    subtitle: "A NIIRA 2025 compulsory class for government properties.",
    description: "Covers government buildings, facilities, vehicles, and employees against risks.",
    details: [
      "Covers government infrastructure.",
      "Protects government staff.",
      "Mandatory for all MDAs.",],
  },
  {
    title: "Petroleum & Gas Stations Insurance",
    icon: Flame,
    image: "/petroleum-insurance.jpg",
    subtitle: "Mandatory for all filling stations and gas plants.",
    description: "Covers fire, explosion, operational hazards and liability arising from petroleum and gas operations.",
    details: [
      "Covers fire and explosion risks.",
      "Covers damage to nearby properties.",
      "Covers injuries to third parties.",
    ],
  },
  {
    title: "Healthcare Professional Indemnity",
    icon: Stethoscope,
    image: "/healthcare-indemnity.jpg",
    subtitle: "Mandatory for doctors, nurses, pharmacists, etc.",
    description: "Covers patients against negligence, malpractice or medical errors by healthcare professionals.",
    details: [
      "Covers malpractice claims.",
      "Mandatory for all practicing health workers.",
      "Protects both patients and professionals.",
    ],
  },

  {
    title: "Aviation Insurance",
    icon: Plane,
    image: "/aviation-insurance.jpg",
    subtitle: "Mandatory insurance for aviation risks.",
    description: "Covers aircraft, passengers, crew and third-party liability for aviation operations.", details: [
      "Covers passenger liability.",
      "Covers third-party injuries.",
      "Covers aircraft damage.",
    ],
  },
  {
    title: "Marine Cargo Insurance",
    icon: Ship,
    image: "/marine.jpg",
    subtitle: "Mandatory for cargo transported by sea.",
    description: "Protects imported cargo against loss, damage, theft, and transit risks.",
    details: [
      "Covers damage to goods in transit.",
      "Required for international trade.",
      "Protects businesses against loss.",
    ],
  },
  {
    title: "Motor Third-Party Insurance",
    icon: Car, image: "/motor.jpg",
    subtitle: "Mandatory for all vehicle owners in Nigeria.",
    description: "Covers liability for death, injuries and property damage to third parties.",
    details: [
      "Covers bodily injury.",
      "Covers property damage.",
      "Required before renewing vehicle papers.",
    ],
  },
  {
    title: "Credit Life Insurance",
    icon: Wallet, image: "/credit.jpg",
    subtitle: "Protects lenders and financial institutions.",
    description: "Pays off borrower’s outstanding loan if they die or become permanently disabled.",
    details: [
      "Covers loan repayment upon death.",
      "Required in new NIIRA regulations.",
      "Protects lenders from loss.",
    ],
  },
  {
    title: "Container Insurance",
    icon: Package,
    image: "/container.jpg",
    subtitle: "Mandatory for shipping container owners.",
    description: "Covers container loss, damage, fire, theft and handling accidents.",
    details: [
      "Covers damage during loading/unloading.",
      "Covers sea and port risks.",
      "Required for all importers.",
    ],
  },
];

const InsuranceOption = () => {
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section
        className="relative w-full h-[55vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url('/bg-hero-11.jpg')` }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Our Insurance Options
          </h1>
          <p className="max-w-3xl mx-auto text-lg leading-relaxed">
            Explore compulsory insurance products required by law and protect
            your investments, assets and people.
          </p>
        </div>
      </section>

      {/* Options Section */}
      <section className="py-20 px-6 md:px-16">
        <h2 className="text-3xl font-semibold text-center text-gray-900 mb-12">
          Explore Our Insurance Products
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {insuranceOptions.map((option, index) => {
            const Icon = option.icon;
            const isFlipped = flippedIndex === index;

            return (
              <div
                key={index}
                data-aos="zoom-in"
                data-aos-delay={index * 200}
                className="relative h-96 [perspective:1000px] cursor-pointer"
                onClick={() => setFlippedIndex(isFlipped ? null : index)}
              >
                <div
                  className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : "group-hover:[transform:rotateY(180deg)]"
                    }`}
                >
                  {/* Front */}
                  <div className="absolute inset-0 bg-white rounded-2xl shadow-md p-6 [backface-visibility:hidden] flex flex-col">
                    <Image
                      src={option.image}
                      alt={option.title}
                      width={500}
                      height={200}
                      className="w-full h-32 object-cover rounded-xl mb-4"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="/blur-placeholder.png"
                    />
                    <div className="flex items-center gap-4 mb-2">
                      <Icon className="w-10 h-10 text-green-700" />
                      <h3 className="text-xl font-bold text-gray-900">
                        {option.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm font-medium mb-2">
                      {option.subtitle}
                    </p>
                    <p className="text-gray-500 text-sm">{option.description}</p>
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 bg-green-700 text-white rounded-2xl shadow-md p-8 [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col justify-center">
                    <h3 className="text-xl font-semibold mb-4">{option.title}</h3>
                    <ul className="space-y-2 text-base">
                      {option.details.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default InsuranceOption;
