import { AnimatedBackground } from "../components/AnimatedBackground";
import Benefits from "../components/Benefits";
import CallToAction from "../components/CallToAction";
import Features from "../components/Features";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import Navigation from "../components/Navigation.jsx";
import Offers from "../components/Offers";

const Home = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-indigo-50 text-gray-800 overflow-hidden mx-auto max-w-[1440px]">
      <AnimatedBackground />

      <Navigation />

      <div className="mx-4 md:mx-8 lg:mx-12">
        <Hero />
        <Offers />
        <Features />
        <HowItWorks />
        <Benefits />
        <CallToAction />
    
      </div>

      <Footer />
    </div>
  );
};

export default Home;
