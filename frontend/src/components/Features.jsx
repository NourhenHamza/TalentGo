"use client"

import { motion } from "framer-motion"
import { BookOpen, Users, Brain, Calendar, Target, Shield, CheckCircle, TrendingUp, FileText } from "lucide-react"

const Features = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Complete Academic Management",
      description:
        "Streamline final year projects and internship processes from application to completion with comprehensive tracking tools.",
    },
    {
      icon: Users,
      title: "Collaborative Ecosystem",
      description:
        "Connect students, supervisors, and industry partners in one unified platform for seamless communication and guidance.",
    },
    {
      icon: Brain,
      title: "Skill-Based Assessments",
      description:
        "Advanced technical testing system that evaluates student competencies and matches them with suitable opportunities.",
    },
    {
      icon: Calendar,
      title: "Smart Scheduling & Reminders",
      description: "Automated deadline tracking and intelligent notification system to keep everyone on schedule.",
    },
    {
      icon: Target,
      title: "Career Path Tracking",
      description: "Monitor student academic and professional journey with detailed analytics and progress insights.",
    },
    {
      icon: Shield,
      title: "Secure Data Management",
      description: "Enterprise-grade security ensuring all academic records and personal information remain protected.",
    },
    {
      icon: CheckCircle,
      title: "Digital Workflow Automation",
      description:
        "Eliminate paperwork with automated approvals, and streamlined administrative processes.",
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description:
        "Comprehensive reporting and analytics to track success rates, performance metrics, and improvement areas.",
    },
    {
      icon: FileText,
      title: "Document Management",
      description:
        "Organize and manage all project proposals, reports and evaluations in one secure location.",
    },
  ]

  return (
    <section
      id="features"
      className="py-20 md:py-32 bg-gradient-to-b from-white to-blue-50/30 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <motion.div
          className="absolute top-20 right-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-80 h-80 bg-indigo-500 rounded-full blur-3xl"
          animate={{
            scale: [1.1, 0.9, 1.1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            delay: 2,
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
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Powerful Features
          </motion.div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
            Everything You Need for
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {" "}
              Academic Excellence
            </span>
          </h2>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our comprehensive platform brings together all the tools needed to manage internships, final year projects,
            and career development in one intelligent system.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100 h-full relative overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  <motion.div
                    className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/25"
                    whileHover={{ rotate: 5 }}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </motion.div>

                  <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Border glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
