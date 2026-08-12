import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import AppInfoAndSupport from "@/components/landing/AppInfoAndSupport";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B1020] text-white">

      <Navbar />

      <Hero />

      <Features />

      <HowItWorks />

      <Testimonials />

      <Pricing />

      <FAQ />

      <CTA />

      <AppInfoAndSupport />

      <Footer />

    </main>
  );
}