import React from "react";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

const faqItems = [
  {
    question: "What is FCT-DCIP?",
    answer:
      "FCT-DCIP stands for Federal Capital Territory Development Control Insurance Program. It is a comprehensive insurance solution for property builders and contractors in Abuja.",
  },
  {
    question: "What are the benefits of the FCT-DCIP?",
    answer:
      "The FCT-DCIP provides protection against property damage, liability coverage, and ensures compliance with local regulations.",
  },
  {
    question: "Who are the stakeholders in the FCT-DCIP?",
    answer:
      "Stakeholders include property builders/contractors, developers, insurance providers, and the FCT Development Control Department.",
  },
  {
    question: "What is the advantage of the FCT-DCIP?",
    answer:
      "The FCT-DCIP offers tailored insurance solutions, streamlined processes, and enhanced protection for property investments in Abuja.",
  },
];

const FAQ = () => {
  return (
    <section className="py-16 bg-[#004C3F]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row">
          <div data-aos="zoom-in" data-aos-anchor-placement="top-center" className="w-full items-center justify-center md:pr-8">
            <Image
              src="/house.png"
              alt="House protected by hands"
              width={600}
              height={400}
              className="rounded-lg"
            />
          </div>
          <div data-aos="flip-down" data-aos-delay="600" className="w-full">
            <h2 className="text-xl md:text-3xl mt-3 font-bold text-white mb-8">
              Frequently Asked Questions
            </h2>
            <div className="bg-white rounded-lg p-6">
              <Accordion type="single" collapsible className="space-y-4">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg">
                    <AccordionTrigger className="px-4 py-2 text-[#004C3F] hover:text-[#004C3F] hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-2 text-gray-600">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <div className="text-center mt-6">
                <Link href="/faq">
                  <button className="bg-[#00A86B] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#008C5A] transition-colors">
                    View More →
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
