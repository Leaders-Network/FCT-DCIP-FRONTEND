
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
      <section className="relative w-full h-[60vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/bg-hero-11.jpg')" }}>
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">About Our Company</h1>
          <p className="max-w-2xl mx-auto text-lg">
            Protecting your property, securing your peace of mind.
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-16 px-6 md:px-16 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-semibold mb-4 text-gray-900">Who We Are</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              We are a leading property insurance company committed to helping individuals and
              businesses protect their valuable assets from unexpected risks. With years of
              experience in the insurance sector, we provide flexible and affordable solutions
              tailored to your unique needs.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our mission is to make insurance simple, transparent, and reliable — ensuring that
              every client feels confident and secure about their future.
            </p>
          </div>
          <div className="relative w-full h-80 md:h-96 rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/bg-hero-1.jpg"
              alt="Property insurance team"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-6 md:px-16 bg-gray-100">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-10 text-gray-900">Our Mission & Vision</h2>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="bg-white p-8 rounded-2xl shadow-md">
              <h3 className="text-2xl font-semibold mb-3 text-green-500">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To deliver reliable and affordable property insurance services that empower
                individuals and organizations to safeguard their investments and recover swiftly
                from losses.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md">
              <h3 className="text-2xl font-semibold mb-3 text-green-500">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To be the most trusted and innovative property insurance brand across Africa,
                redefining how people experience financial protection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 px-6 md:px-16 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-10 text-gray-900">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Integrity", desc: "We uphold transparency and honesty in every service we provide." },
              { title: "Reliability", desc: "Our clients trust us to be there when they need us the most." },
              { title: "Innovation", desc: "We continuously improve and adapt to better serve you." },
            ].map((value, i) => (
              <div key={i} className="p-8 bg-gray-50 rounded-2xl shadow-md hover:shadow-lg transition">
                <h3 className="text-xl font-semibold mb-2 text-green-500">{value.title}</h3>
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
