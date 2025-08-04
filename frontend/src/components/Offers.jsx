import { motion } from "framer-motion";
import { Briefcase, Building, ChevronRight, TrendingUp, Users } from "lucide-react";

const Offers = () => {
  return (
    <section id="offers" className="relative py-20 md:py-32">
      <OffersBackground />

      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-12 md:mb-0 z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Discover <br />
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
              >Exceptional Opportunities</motion.span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl">
              Explore thousands of job offers, internships, and final year projects published by renowned companies. Find the opportunity that perfectly matches your skills and ambitions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.a
                href="http://localhost:5173/PublicOffersPage"
                className="bg-indigo-600 text-white px-8 py-4 rounded-full text-lg font-medium flex items-center justify-center shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200 no-underline"
                whileHover={{ scale: 1.05, backgroundColor: "#4338CA" }}
                whileTap={{ scale: 0.95 }}
              >
                View All Offers
                <ChevronRight className="ml-2 w-5 h-5" />
              </motion.a>
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

            {/* Offers highlights */}
            <div className="flex items-center gap-8 mt-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>  Offers</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600" />
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>  Companies</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Daily New Offers</span>
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
            
            {/* Offers showcase cards */}
            <div className="relative z-10 space-y-4">
              <motion.div
                className="bg-white p-6 rounded-lg shadow-lg border border-indigo-100"
                whileHover={{ 
                  boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.25)",
                  y: -5
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Full Stack Developer</h3>
                    <p className="text-gray-600 text-sm">TechCorp • Paris</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white p-6 rounded-lg shadow-lg border border-indigo-100 ml-8"
                whileHover={{ 
                  boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.25)",
                  y: -5
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Digital Marketing Internship</h3>
                    <p className="text-gray-600 text-sm">InnovateLab • Lyon</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white p-6 rounded-lg shadow-lg border border-indigo-100"
                whileHover={{ 
                  boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.25)",
                  y: -5
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">AI & Data Science Project</h3>
                    <p className="text-gray-600 text-sm">DataFlow • Toulouse</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Floating elements */}
            <motion.div
              className="absolute -top-5 -right-5 bg-indigo-600 text-white p-3 rounded-lg shadow-lg z-20 font-medium"
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Briefcase className="w-6 h-6" />
            </motion.div>

            <motion.div
              className="absolute -bottom-5 -left-5 bg-indigo-400 p-3 rounded-lg shadow-lg z-20 text-white"
              animate={{ 
                y: [0, 10, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Building className="w-6 h-6" />
            </motion.div>

            <motion.div
              className="absolute top-1/2 -left-8 bg-purple-500 p-2 rounded-lg shadow-lg z-20 text-white"
              animate={{ 
                x: [0, -5, 0],
                rotate: [0, -3, 0]
              }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <Users className="w-5 h-5" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Background animation similar to Hero's LightBeam
const OffersBackground = () => {
  return (
    <>
      <motion.div
        className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-transparent rounded-full blur-3xl"
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
        className="absolute top-40 -left-20 w-80 h-80 bg-gradient-to-tr from-indigo-200/20 to-transparent rounded-full blur-3xl"
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

export default Offers;

