"use client"

import { motion } from "framer-motion"
import { useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AppContext } from "../context/AppContext"

const Signup = () => {
  const { token } = useContext(AppContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      navigate("/")
    }
  }, [token, navigate])

  const registrationOptions = [
    {
      id: "student",
      title: "Student Registration",
      description: "Join as a student to manage your PFE projects and collaborate with professors",
      icon: (
        <svg
          className="w-8 h-8"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
          />
        </svg>
      ),
      route: "/signup-student",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      features: [
        "Track project progress",
        "Submit deliverables",
        "Collaborate with supervisors",
        "Schedule defense sessions",
      ],
    },
    {
      id: "company",
      title: "Company Registration",
      description: "Register your company to offer internship opportunities and PFE projects",
      icon: (
        <svg
          className="w-8 h-8"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      route: "/company-registration-form",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      features: [
        "Post project opportunities",
        "Manage student applications",
        "Collaborate with universities",
        "Access talent pool",
      ],
    },
    {
      id: "university",
      title: "University Registration",
      description: "Register your university to manage students, professors, and academic programs",
      icon: (
        <svg
          className="w-8 h-8"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      route: "/university-registration-form",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      features: [
        "Manage academic programs",
        "Oversee student projects",
        "Faculty administration",
        "Partner with companies",
      ],
    },
  ]

  const handleOptionSelect = (route) => {
    navigate(route)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute top-0 right-0 h-64 w-64 text-blue-200/20" fill="currentColor" viewBox="0 0 100 100">
          <path d="M50 0L0 25L50 50L100 25L50 0Z" />
          <path d="M0 25V75L50 100V50L0 25Z" />
          <path d="M100 25V75L50 100V50L100 25Z" />
        </svg>

        <svg
          className="absolute bottom-0 left-0 h-64 w-64 text-purple-200/20"
          fill="currentColor"
          viewBox="0 0 100 100"
        >
          <circle cx="50" cy="50" r="40" />
          <circle cx="50" cy="50" r="30" />
          <circle cx="50" cy="50" r="20" />
        </svg>

        {/* Floating animated elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            y: [0, -20, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 8,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 right-1/3 w-24 h-24"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full text-green-300/30" fill="currentColor">
            <path d="M50 10L10 90H90L50 10Z" />
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            y: [0, 15, 0],
            rotate: [0, -8, 0],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 10,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-1/3 left-1/3 w-20 h-20"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full text-purple-400/25" fill="currentColor">
            <path d="M10 40H90V60H10V40Z" />
            <path d="M40 10H60V90H40V10Z" />
          </svg>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header Section */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white mb-8 shadow-xl"
            >
              <svg
                className="w-10 h-10"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                />
              </svg>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-4xl md:text-5xl font-bold text-slate-800 mb-4"
            >
              Join Talent Go
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-xl text-slate-600 max-w-2xl mx-auto"
            >
              Choose your registration type to get started with our comprehensive project management platform
            </motion.p>
          </div>

          {/* Registration Options */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {registrationOptions.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.2 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group cursor-pointer"
                onClick={() => handleOptionSelect(option.route)}
              >
                <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-slate-100 relative overflow-hidden h-full">
                  {/* Gradient overlay on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-3xl`}
                  ></div>

                  {/* Icon */}
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${option.bgColor} ${option.textColor} mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {option.icon}
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-slate-900">
                      {option.title}
                    </h3>
                    <p className="text-slate-600 mb-6 leading-relaxed">{option.description}</p>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {option.features.map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 1.2 + index * 0.2 + featureIndex * 0.1 }}
                          className="flex items-center text-sm text-slate-600"
                        >
                          <div
                            className={`flex-shrink-0 w-5 h-5 rounded-full ${option.bgColor} ${option.textColor} flex items-center justify-center mr-3`}
                          >
                            <svg
                              className="w-3 h-3"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          {feature}
                        </motion.li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <div
                      className={`inline-flex items-center justify-center w-full py-4 px-6 bg-gradient-to-r ${option.color} text-white rounded-xl font-semibold group-hover:shadow-lg transition-all duration-300`}
                    >
                      Get Started
                      <svg
                        className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Already have an account section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            className="text-center"
          >
          
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default Signup
