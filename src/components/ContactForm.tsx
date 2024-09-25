import React from "react";
import { MapPin, Phone, Mail } from "lucide-react";

const ContactForm = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Contact Us</h2>
        <div className="flex flex-wrap -mx-4">
          <div className="w-full md:w-1/2 px-4 mb-8 md:mb-0">
            <div className="h-96 bg-gray-200 rounded-lg overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin size={48} className="text-gray-400" />
              </div>
              {/* <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full text-sm font-semibold">
                Dummy Map
              </div> */}
            </div>
          </div>
          <div className="w-full md:w-1/2 px-4">
            <form>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Subject"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div className="mb-4">
                <textarea
                  placeholder="Message"
                  //@ts-ignore
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                Send Mail
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
