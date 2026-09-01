import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import InteractiveDemo from "@/components/landing/InteractiveDemo";
import HowItWorks from "@/components/landing/HowItWorks";
import DataSources from "@/components/landing/DataSources";
import UseCases from "@/components/landing/UseCases";
import Comparison from "@/components/landing/Comparison";
import QueryPipeline from "@/components/landing/QueryPipeline";
import Architecture from "@/components/landing/Architecture";
import TechStack from "@/components/landing/TechStack";
import Capabilities from "@/components/landing/Capabilities";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-violet-500/30 selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <InteractiveDemo />
        <HowItWorks />
        <DataSources />
        <UseCases />
        <Comparison />
        <QueryPipeline />
        <Architecture />
        <TechStack />
        <Capabilities />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}