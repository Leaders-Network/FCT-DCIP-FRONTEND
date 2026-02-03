"use client";
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import ChatWidget from "@/components/ChatWidget";

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
        <div data-aos="zoom-in" className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            About FCT-DCIP
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-[1.21rem]">
            Building safer communities through partnership, protection, and
            accountability.
          </p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-16 px-6 md:px-16 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div data-aos="zoom-in">
            <h2 className="text-3xl font-semibold mb-4 text-gray-900">
              Who We Are
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6 text-[1.2rem]">
              The <strong>Federal Capital Territory Development Control
              Insurance Program (FCT-DCIP)</strong> is a strategic partnership
              initiative designed to foster collaboration between homeowners,
              builders, surveyors, insurers, and the{" "}
              <strong>Department of Development Control (DDC)</strong>. 
              This innovative program aims to promote compliance, ensure
              construction safety, and enhance insurance coverage within the
              FCT.
            </p>
            <p className="text-gray-600 leading-relaxed text-[1.2rem]">
              Through this partnership, the FCT-DCIP safeguards homeowners
              against potential losses arising from building collapse and other
              related incidents — strengthening public confidence in building
              integrity, promoting safety, and improving the overall security
              and financial well-being of Abuja residents.
            </p>
          </div>
            {/* Who We Are Image (Flip Animation) */}
            <div
              data-aos="zoom-in"
              data-aos-anchor-placement="top-center"
              className="relative w-full h-80 md:h-96 rounded-2xl overflow-hidden shadow-lg group [perspective:1000px]"
            >
              <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                {/* Front Image */}
                <div className="absolute inset-0 [backface-visibility:hidden]">
                  <Image
                    src="/bg-hero-1.jpg"
                    alt="FCT-DCIP partnership initiative"
                    fill
                    className="object-cover rounded-2xl"
                  />
                </div>

                {/* Back Image */}
                <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                  <Image
                    src="/bg-hero-11.jpg"
                    alt="Construction compliance and safety initiative"
                    fill
                    className="object-cover rounded-2xl"
                  />
                </div>
              </div>
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
            <div data-aos="fade-right" data-aos-delay="200" className="bg-white p-8 rounded-2xl shadow-md">
              <h3 className="text-2xl font-semibold mb-3 text-green-600">
                Our Mission
              </h3>
              <p className="text-gray-600 leading-relaxed text-[1.13rem]">
                To create a sustainable and secure built environment by ensuring
                every property and construction project in the FCT is properly
                insured, protecting lives, assets, and investments from
                avoidable risks.
              </p>
            </div>
            <div data-aos="fade-left" data-aos-delay="200" className="bg-white p-8 rounded-2xl shadow-md">
              <h3 className="text-2xl font-semibold mb-3 text-green-600">
                Our Vision
              </h3>
              <p className="text-gray-600 leading-relaxed text-[1.13rem]">
                To establish Abuja as a model city for compliance-driven,
                insurance-backed development, where every structure stands as a
                symbol of safety, accountability, and collective progress.
              </p>
            </div>
          </div>
        </div>
      </section>

     {/* Core Values (Flip Animation) */}
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
                back: "Our operations are guided by integrity — ensuring that every stakeholder’s trust is earned and maintained.",
              },
              {
                title: "Safety",
                desc: "Ensuring the safety of lives and properties is at the heart of every initiative we support.",
                back: "We promote compliance and insurance coverage that keep communities safe and prevent avoidable losses.",
              },
              {
                title: "Collaboration",
                desc: "We work hand-in-hand with stakeholders across the public and private sectors to drive meaningful impact.",
                back: "Our partnerships foster growth and unity, aligning efforts for sustainable development across Abuja.",
              },
            ].map((value, i) => (
              <div
              data-aos="flip-right"
              data-aos-delay={i * 500}
                key={i}
                className="group [perspective:1000px]"
              >
                <div className="relative w-full h-64 transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                  {/* Front Side */}
                  <div className="absolute inset-0 bg-gray-50 rounded-2xl shadow-md flex flex-col justify-center items-center p-8 [backface-visibility:hidden]">
                    <h3 className="text-xl font-semibold mb-3 text-green-600">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 text-[1.12rem]">{value.desc}</p>
                  </div>

                  {/* Back Side */}
                  <div className="absolute inset-0 bg-green-600 text-white rounded-2xl shadow-md flex flex-col justify-center items-center p-8 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                    <h3 className="text-xl font-semibold mb-3">
                      {value.title}
                    </h3>
                    <p className="text-center">{value.back}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      <Footer />
      <ChatWidget />
    </div>
  );
};

export default AboutPage;
