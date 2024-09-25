import ContactForm from "@/components/ContactForm";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import InsuranceOptions from "@/components/InsuranceOptions";
import Stats from "@/components/Stats";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
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
