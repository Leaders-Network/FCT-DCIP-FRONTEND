<<<<<<< Updated upstream
"use client";
import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What types of property insurance do you offer?",
    answer:
      "We provide comprehensive property insurance coverage for residential homes, commercial buildings, rental properties, and industrial assets. Our policies protect against fire, theft, flood, and other unforeseen damages.",
  },
  {
    question: "How do I get a property insurance quote?",
    answer:
      "You can request a free quote directly from our website by providing details about your property. One of our agents will contact you with a personalized plan that fits your needs and budget.",
  },
  {
    question: "Can I customize my insurance coverage?",
    answer:
      "Yes, we understand that every property is unique. Our team will work with you to customize your plan based on your specific requirements, whether you need basic or all-risk coverage.",
  },
  {
    question: "How do I file a claim after damage occurs?",
    answer:
      "To file a claim, log in to your account or contact our support team immediately. Provide your policy number, details of the incident, and any supporting documents. Our claims team will guide you through the process.",
  },
  {
    question: "How long does it take to process a claim?",
    answer:
      "Claim processing time depends on the nature of the damage and submitted documentation. However, most claims are reviewed and settled within 7–14 business days.",
  },
  {
    question: "Do you offer discounts for multiple properties?",
    answer:
      "Yes. We offer attractive multi-property and loyalty discounts for clients who insure more than one property with us.",
  },
];

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative w-full h-[50vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/bg-hero-1.jpg')" }}>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Frequently Asked Questions</h1>
          <p className="max-w-2xl mx-auto text-lg">
            Find clear answers to the most common questions about our property insurance services.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 md:px-16 bg-white flex-grow">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold mb-8 text-center text-gray-900">Got Questions? We’ve Got Answers.</h2>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center p-5 text-left"
                >
                  <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-green-700 transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openIndex === index && (
                  <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t border-gray-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-400 text-white text-center py-16 px-6">
        <h2 className="text-3xl font-semibold mb-4">Still Have Questions?</h2>
        <p className="max-w-2xl mx-auto mb-6 text-lg">
          Our support team is here to help you with any inquiries about our policies and services.
        </p>
        <a
          href="/contact"
          className="inline-block bg-white text-green-500 font-medium px-8 py-3 rounded-full shadow hover:bg-gray-100 transition"
        >
          Contact Us
        </a>
      </section>

      <Footer />
    </div>
  );
};

export default FAQPage;
=======
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import React from 'react'

const FAQPage = () => {
  return (
    <div>
      <Header />
      This is FAQ page
      <Footer />
    </div>
  )
}

export default FAQPage
>>>>>>> Stashed changes
