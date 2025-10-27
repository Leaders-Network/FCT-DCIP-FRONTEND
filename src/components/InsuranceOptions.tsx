import React from "react";
import Image from "next/image";
import { CheckCircle } from "lucide-react";

const InsuranceOptions = () => {
  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between">
          <div data-aos="fade-right" data-aos-anchor-placement="top-center" className="w-full md:w-1/2 mb-8 md:mb-0">
            <Image
              src="/about.png"
              alt="Happy family"
              width={500}
              height={300}
              className="rounded-lg mx-auto object-cover"
            />
          </div>
          <div data-aos="fade-left" data-aos-anchor-placement="top-center" data-aos-delay="200" className="w-full md:w-1/2">
            <h2 className="text-3xl font-bold text-center mb-12">
              Insurance that fits your lifestyle
            </h2>
            <div className="border-2 p-4 rounded-lg">
              <div className="flex items-center mb-4 ">
                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                <span className="text-lg">Fast Response Insurance</span>
                <div className="flex-grow border-t border-gray-300 ml-4"></div>
                <span className="text-lg font-semibold">95%</span>
              </div>
              <div className="flex items-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                <span className="text-lg">Awesome Auto Coverage</span>
                <div className="flex-grow border-t border-gray-300 ml-4"></div>
                <span className="text-lg font-semibold">90%</span>
              </div>
            </div>

            <p className="text-gray-600 mt-6">
              The FCT-DCIP is a partnership program that enables insurance
              cooperation among homeowners, builders, surveyors, and the
              Development Control Department. This program aims to protect home
              owners from losses that may arise from building collapse, safety,
              security and financial well-being of Abuja residents.
            </p>
            <button className="mt-6 bg-green-600 font-semibold  rounded-md p-2 text-white transition-colors">
              Read More
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-between mt-10">
          <div data-aos="fade-right" data-aos-anchor-placement="top-center" data-aos-delay="300">
            <h2 className="text-3xl font-bold text-green-600 mb-4">
              Our Insurance Option
            </h2>
            <p className="text-gray-600 mb-8 max-w-lg">
              Our insurance options provide comprehensive coverage tailored to your specific needs, offering peace of mind, financial security, expert support, and a range of benefits designed to protect your future and well-being.
            </p>
            <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors mb-12">
              Explore
            </button>
          </div>

          <div data-aos="fade-left" data-aos-anchor-placement="top-center" data-aos-delay="500" className="grid grid-cols-1  gap-8">
            <div className="bg-gray-100 p-6 rounded-md">
              <Image
                width={100}
                height={100}
                src="/occup.jpg"
                alt="Occupier Liability Insurance Icon"
                className="w-12 h-auto mb-4"
              />
              <h3 className="text-xl font-bold text-green-600 mb-2">
                Occupier Liability Insurance
              </h3>
              <p className="text-gray-600 mb-2">
                Safety for occupiers of public building under section 65 of the
                insurance Act 2003
              </p>
              <p className="text-gray-600">
                Safety for Occupiers is our priority. Our comprehensive coverage
                ensures your home and personal property are protected.
              </p>
            </div>
            <div  className="bg-gray-100 p-6 rounded-md">
              <Image
                width={100}
                height={100}
                src="/occup.jpg"
                alt="Builders Liability Insurance Icon"
                className="w-12 h-auto mb-4"
              />
              <h3 className="text-xl font-bold text-green-600 mb-2">
                Builders Liability Insurance
              </h3>
              <p className="text-gray-600 mb-2">
                Coverage for builders and contractors
              </p>
              <p className="text-gray-600">
                Cover for builders under The Builders Liability insurance under
                Section 64 of the insurance Act 2003
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InsuranceOptions;
