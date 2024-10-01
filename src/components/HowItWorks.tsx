import React from "react";
import { ClipboardList, Shield, UserCheck, Lock } from "lucide-react";

const steps = [
  {
    icon: <ClipboardList className="w-12 h-12 text-green-600" />,
    title: "Planning & Analysis",
    description:
      "We analyze your needs and requirements to create a tailored insurance plan.",
  },
  {
    icon: <Shield className="w-12 h-12 text-green-600" />,
    title: "Protective Insurance",
    description:
      "We provide comprehensive coverage to protect your assets and interests.",
  },
  {
    icon: <UserCheck className="w-12 h-12 text-green-600" />,
    title: "Trust Insured",
    description:
      "Our reliable service ensures your peace of mind and financial security.",
  },
  {
    icon: <Lock className="w-12 h-12 text-green-600" />,
    title: "Secured coverage",
    description:
      "Your coverage is secured and backed by our strong financial foundation.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 relative ">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md text-center"
            >
              <div className="flex justify-center mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
