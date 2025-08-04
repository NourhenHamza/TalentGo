"use client"

import { motion } from "framer-motion"
import { UserPlus, Search, FileCheck, Trophy, ArrowRight, Sparkles } from "lucide-react"

const HowItWorks = () => {
  const steps = [
    {
      icon: UserPlus,
      title: "Create Your Profile",
      description:
        "Students and institutions register and build comprehensive profiles with skills, preferences, and academic information.",
    },
    {
      icon: Search,
      title: "Discover Opportunities",
      description:
        "Browse curated internships and projects that match your profile, with intelligent recommendations based on skills and interests.",
    },
    {
      icon: FileCheck,
      title: "Apply & Assess",
      description:
        "Submit applications with integrated technical assessments that showcase your capabilities to potential supervisors and companies.",
    },
    {
      icon: Trophy,
      title: "Succeed & Grow",
      description:
        "Track progress, receive feedback, and build your professional network while completing your academic and career goals.",
    },
  ]

  const handleGetStarted = () => {
    // Navigate to signup page
    window.location.href = "/signup"
  }

  const handleStartJourney = () => {
    // Navigate to signup page
    window.location.href = "/signup"
  }

  return (
    <section
      id="how-it-works"
      className="py-20 md:py-32 bg-gradient-to-b from-blue-50/30 to-white relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <motion.div
          className="absolute top-1/4 left-10 w-64 h-64 bg-blue-400 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-10 w-72 h-72 bg-indigo-400 rounded-full blur-3xl"
          animate={{
            x: [0, -25, 0],
            y: [0, 15, 0],
            scale: [1.1, 0.9, 1.1],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            delay: 3,
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-4 h-4" />
            Simple Process
          </motion.div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
            How{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Our Platform
            </span>{" "}
            Works
          </h2>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From enrollment to graduation, our platform guides you through every step of your academic and professional
            journey with intelligent automation.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection lines for desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-200 to-transparent transform -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-4 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <motion.div
                  className="bg-white p-8 rounded-2xl border border-blue-100 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 relative overflow-hidden"
                  whileHover={{ y: -10 }}
                >
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Step number */}
                  <motion.div
                    className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/25"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.3 }}
                  >
                    {index + 1}
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 relative z-10 shadow-lg shadow-blue-500/25"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <step.icon className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900 group-hover:text-blue-600 transition-colors">
                      {step.title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed text-sm">{step.description}</p>
                  </div>

                  {/* Arrow for desktop */}
                  {index < steps.length - 1 && (
                    <motion.div
                      className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-20"
                      initial={{ x: -10, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.2 }}
                    >
                      <motion.div
                        className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shadow-md"
                        whileHover={{ scale: 1.2, backgroundColor: "#dbeafe" }}
                      >
                        <ArrowRight className="w-4 h-4 text-blue-600" />
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Border glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">


            <motion.button
              onClick={handleStartJourney}
              className="border-2 border-blue-500 text-blue-600 px-8 py-4 rounded-full text-lg font-semibold inline-flex items-center gap-2 hover:bg-blue-50"
              whileHover={{
                scale: 1.05,
                backgroundColor: "#eff6ff",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your Journey
              <Trophy className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default HowItWorks
