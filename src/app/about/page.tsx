"use client";
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";

const AboutPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section
        className="relative w-full h-[60vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/bg-hero-11.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            About FCT-DCIP
          </h1>
          <p className="max-w-2xl mx-auto text-lg">
            Building safer communities through partnership, protection, and
            accountability.
          </p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-16 px-6 md:px-16 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-semibold mb-4 text-gray-900">
              Who We Are
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              The <strong>Federal Capital Territory Development Control
              Insurance Program (FCT-DCIP)</strong> is a strategic partnership
              initiative designed to foster collaboration between homeowners,
              builders, surveyors, insurers, and the{" "}
              <strong>Department of Development Control (DDC)</strong>. 
              This innovative program aims to promote compliance, ensure
              construction safety, and enhance insurance coverage within the
              FCT.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Through this partnership, the FCT-DCIP safeguards homeowners
              against potential losses arising from building collapse and other
              related incidents — strengthening public confidence in building
              integrity, promoting safety, and improving the overall security
              and financial well-being of Abuja residents.
            </p>
          </div>
          <div className="relative w-full h-80 md:h-96 rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/bg-hero-1.jpg"
              alt="FCT-DCIP partnership initiative"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-6 md:px-16 bg-gray-100">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-10 text-gray-900">
            Our Mission & Vision
          </h2>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="bg-white p-8 rounded-2xl shadow-md">
              <h3 className="text-2xl font-semibold mb-3 text-green-600">
                Our Mission
              </h3>
              <p className="text-gray-600 leading-relaxed">
                To create a sustainable and secure built environment by ensuring
                every property and construction project in the FCT is properly
                insured — protecting lives, assets, and investments from
                avoidable risks.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md">
              <h3 className="text-2xl font-semibold mb-3 text-green-600">
                Our Vision
              </h3>
              <p className="text-gray-600 leading-relaxed">
                To establish Abuja as a model city for compliance-driven,
                insurance-backed development — where every structure stands as a
                symbol of safety, accountability, and collective progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 px-6 md:px-16 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-10 text-gray-900">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Accountability",
                desc: "We believe in transparency and responsibility in every partnership and process.",
              },
              {
                title: "Safety",
                desc: "Ensuring the safety of lives and properties is at the heart of every initiative we support.",
              },
              {
                title: "Collaboration",
                desc: "We work hand-in-hand with stakeholders across the public and private sectors to drive meaningful impact.",
              },
            ].map((value, i) => (
              <div
                key={i}
                className="p-8 bg-gray-50 rounded-2xl shadow-md hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold mb-2 text-green-600">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
