import React from "react";
import { ClipboardList, Shield, UserCheck, Lock } from "lucide-react";

const steps = [
  {
    icon: <ClipboardList className="w-8 h-8" />,
    title: "Planning & Analysis",
    description:
      "We analyze your needs and requirements to create a tailored insurance plan for your projects.",
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Protective Insurance",
    description:
      "Comprehensive coverage to protect your construction assets, workforce, and public interests.",
  },
  {
    icon: <UserCheck className="w-8 h-8" />,
    title: "Trusted Surveyors",
    description:
      "Our assigned surveyors ensure all building codes and safety regulations are strictly followed.",
  },
  {
    icon: <Lock className="w-8 h-8" />,
    title: "Secured Coverage",
    description:
      "Your coverage is secured and backed by our strong financial foundation and the AMMC.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 relative bg-slate-50/50">
      <div className="container mx-auto px-4 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 data-aos="fade-up" className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600 mb-3">
            Process Overview
          </h2>
          <h3 data-aos="fade-up" data-aos-delay="100" className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">
            How FCT-DCIP Works
          </h3>
          <p data-aos="fade-up" data-aos-delay="200" className="text-lg text-slate-600">
            A streamlined and secure process to ensure compliance, safety, and comprehensive insurance coverage for your construction projects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 relative">
          
          {/* Subtle connecting line for desktop */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-100 z-0"></div>

          {steps.map((step, index) => (
            <div
              data-aos="fade-up"
              data-aos-delay={index * 150}
              key={index}
              className="group relative z-10 flex flex-col items-center bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-emerald-100 text-center h-full"
            >
              {/* Step Number indicator */}
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-100 text-slate-400 font-bold text-sm flex items-center justify-center border-4 border-white transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-600">
                {index + 1}
              </div>

              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:bg-emerald-100">
                {step.icon}
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
                {step.title}
              </h3>
              
              <p className="text-slate-600 text-[0.95rem] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
