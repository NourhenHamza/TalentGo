import { motion } from "framer-motion";
import { ChevronRight, Zap, Shield, Target } from "lucide-react";

const Hero = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center ">
      <LightBeam />

      <div className="container mx-auto px-4 py-20 md:py-32 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-12 md:mb-0 z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Your Gateway to <br />
              <motion.span 
                className="text-indigo-600 inline-block"
                animate={{ 
                  color: ["#4F46E5", "#7C3AED", "#6366F1", "#4F46E5"],
                }}
                transition={{ 
                  duration: 8,
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
              >Academic & Professional</motion.span> Success
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl">
              A comprehensive platform for managing final year projects, internships, and career opportunities through skill-based assessments and streamlined application processes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                className="bg-indigo-600 text-white px-8 py-4 rounded-full text-lg font-medium flex items-center justify-center shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200"
                whileHover={{ scale: 1.05, backgroundColor: "#4338CA" }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
                <ChevronRight className="ml-2 w-5 h-5" />
              </motion.button>
              <motion.button
                className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-full text-lg font-medium flex items-center justify-center"
                whileHover={{ 
                  scale: 1.05, 
                  backgroundColor: "rgba(79, 70, 229, 0.05)",
                  borderColor: "#4338CA",
                  color: "#4338CA"
                }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
            </div>

            {/* Platform highlights */}
            <div className="flex items-center gap-8 mt-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-600" />
                <span>Fast Applications</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                <span>Secure Platform</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <span>Skill-Based Assessment</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="md:w-1/2 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-300/20 to-purple-300/20 rounded-lg blur-xl"></div>
            <motion.img
              src="/hero.png"
              alt="PFE Management Platform Interface"
              className="relative z-10 rounded-lg shadow-2xl border border-indigo-100"
              whileHover={{ 
                boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.25)",
                rotate: 1
              }}
            />

            {/* Floating elements */}
            <motion.div
              className="absolute -top-5 -right-5 bg-indigo-600 text-white p-3 rounded-lg shadow-lg z-20 font-medium"
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Zap className="w-6 h-6" />
            </motion.div>

            <motion.div
              className="absolute -bottom-5 -left-5 bg-indigo-400 p-3 rounded-lg shadow-lg z-20 text-white"
              animate={{ 
                y: [0, 10, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Target className="w-6 h-6" />
            </motion.div>

            <motion.div
              className="absolute top-1/2 -left-8 bg-purple-500 p-2 rounded-lg shadow-lg z-20 text-white"
              animate={{ 
                x: [0, -5, 0],
                rotate: [0, -3, 0]
              }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <Shield className="w-5 h-5" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Light beam animation with enhanced effects
const LightBeam = () => {
  return (
    <>
      <motion.div
        className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-indigo-200/30 to-transparent rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          rotate: [0, 15, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      <motion.div
        className="absolute top-40 -left-20 w-80 h-80 bg-gradient-to-tr from-purple-200/20 to-transparent rounded-full blur-3xl"
        animate={{
          scale: [1.1, 0.9, 1.1],
          opacity: [0.2, 0.4, 0.2],
          rotate: [0, -10, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 1,
        }}
      />
    </>
  );
};

export default Hero;
