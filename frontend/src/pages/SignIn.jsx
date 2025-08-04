"use client"

import { motion } from "framer-motion"
import { useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AppContext } from "../context/AppContext"

const SignIn = () => {
  const { token } = useContext(AppContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      navigate("/")
    }
  }, [token, navigate])

  const loginOptions = [
    {
      id: "student",
      title: "Student Sign In",
      description: "Access your student dashboard to manage PFE projects and collaborate with professors",
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
      route: "http://localhost:5173/login",
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
      id: "professor",
      title: "Professor Sign In",
      description: "Access your professor dashboard to supervise students and manage academic projects",
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      route: "http://localhost:5174/Professor-login",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
      features: [
        "Supervise student projects",
        "Review deliverables",
        "Schedule meetings",
        "Evaluate progress",
      ],
    },
    {
      id: "company",
      title: "Company Sign In",
      description: "Access your company dashboard to manage internship opportunities and PFE projects",
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
      route: "http://localhost:5174/company-login",
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
      title: "University Sign In",
      description: "Access your university dashboard to manage students, professors, and academic programs",
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
      route: "http://localhost:5174/login",
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
    // Redirect to the appropriate frontend URL
    window.location.href = route
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-4xl md:text-5xl font-bold text-slate-800 mb-4"
            >
              Welcome Back
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-xl text-slate-600 max-w-2xl mx-auto"
            >
              Choose your role to access your personalized dashboard and continue managing your projects
            </motion.p>
          </div>

          {/* Login Options */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {loginOptions.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.2 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group cursor-pointer"
                onClick={() => handleOptionSelect(option.route)}
              >
                <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-slate-100 relative overflow-hidden h-full">
                  {/* Gradient overlay on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-3xl`}
                  ></div>

                  {/* Icon */}
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${option.bgColor} ${option.textColor} mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {option.icon}
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-slate-900">
                      {option.title}
                    </h3>
                    <p className="text-slate-600 mb-4 leading-relaxed text-sm">{option.description}</p>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {option.features.map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 1.2 + index * 0.2 + featureIndex * 0.1 }}
                          className="flex items-center text-xs text-slate-600"
                        >
                          <div
                            className={`flex-shrink-0 w-4 h-4 rounded-full ${option.bgColor} ${option.textColor} flex items-center justify-center mr-2`}
                          >
                            <svg
                              className="w-2.5 h-2.5"
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
                      className={`inline-flex items-center justify-center w-full py-3 px-4 bg-gradient-to-r ${option.color} text-white rounded-xl font-semibold group-hover:shadow-lg transition-all duration-300 text-sm`}
                    >
                      Sign In
                      <svg
                        className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
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

          {/* Don't have an account section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            className="text-center"
          >
            <p className="text-slate-600 mb-4">
              Don't have an account yet?
            </p>
            <button
              onClick={() => navigate("/signup")}
              className="inline-flex items-center px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all duration-300"
            >
              Create Account
              <svg
                className="ml-2 w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default SignIn
