"use client";

import ContactForm from "@/components/ContactForm";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import InsuranceOptions from "@/components/InsuranceOptions";
import Stats from "@/components/Stats";

import AOS from 'aos';
import 'aos/dist/aos.css'; // You can also use <link> for styles
import { useEffect } from "react";

export default function Home() {

  useEffect(()=>{
    const initAOS = async () =>{
      await import("aos");
      AOS.init({
        duration: 1000,
        easing: "ease",
        once: true,
        anchorPlacement: "top-bottom",
      });
    };
    initAOS();
  },[])
  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <Header />
      <Hero />
      <InsuranceOptions />
      <HowItWorks />
      <Stats />
      <FAQ />
      <ContactForm />
      <Footer/>
    </div>
  );
}
