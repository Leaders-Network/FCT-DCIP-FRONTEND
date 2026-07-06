import React from "react";
import Image from "next/image";
import { CheckCircle, ShieldCheck, FileCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

const InsuranceOptions = () => {
  return (
    <section className="py-24 bg-white overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-emerald-50/50 rounded-bl-[100px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/3 bg-slate-50 rounded-tr-[100px] -z-10"></div>

      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          
          {/* Left Column: Image & Stats */}
          <div data-aos="fade-right" data-aos-duration="1000" className="w-full lg:w-1/2 relative">
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
              <Image
                src="/about.png"
                alt="FCT-DCIP Team"
                width={700}
                height={500}
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent mix-blend-multiply"></div>
            </div>

            {/* Floating Stat Card 1 */}
            <div className="absolute -bottom-6 -right-6 md:bottom-10 md:-right-10 bg-white p-5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-slate-100 max-w-[200px] animate-in slide-in-from-bottom-8 duration-1000 delay-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-900 tracking-tight">95%</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Fast Response</p>
                </div>
              </div>
            </div>

            {/* Floating Stat Card 2 */}
            <div className="hidden md:block absolute top-10 -left-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-white/20 animate-in slide-in-from-left-8 duration-1000 delay-500">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900 tracking-tight">100%</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Compliance</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Text Content */}
          <div data-aos="fade-left" data-aos-duration="1000" data-aos-delay="200" className="w-full lg:w-1/2">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600 mb-3">
              About FCT-DCIP
            </h2>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
              Securing Abuja's <br className="hidden lg:block"/> Construction Future
            </h3>
            
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              The Builders-Liability is a regulatory and insurance-driven initiative designed to enforce Builders Liability Insurance compliance within the FCT construction sector. 
            </p>

            <div className="space-y-4 mb-10">
              {[
                "Connects developers, homeowners, and insurers",
                "Mitigates risks associated with building collapse",
                "Prevents construction defects and property damage",
                "Promotes accountable building practices"
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle className="h-3 w-3" />
                  </div>
                  <p className="text-slate-700 font-medium">{text}</p>
                </div>
              ))}
            </div>

            <Link href="/about" className="inline-block">
              <button className="group flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 font-bold rounded-xl shadow-md hover:bg-slate-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                Learn More About Us
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default InsuranceOptions;
