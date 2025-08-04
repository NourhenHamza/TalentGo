"use client"

import { motion } from "framer-motion"
import { Mail, MapPin, Phone } from "lucide-react"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  // Match the actual navigation structure
  const navItems = [
    { label: "Home", href: "#hero" },
    { label: "How It Works", href: "#features" },
    { label: "Features", href: "#platform-features" },
    { label: "Contact", href: "#contact" },
  ]

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900/20 to-indigo-900/20 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute top-20 right-20 w-64 h-64 bg-blue-500 rounded-full blur-3xl"
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
          className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-500 rounded-full blur-3xl"
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
        <div className="py-16">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand section */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-4">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <span className="text-white font-bold text-xl">P</span>
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Talent Go</h3>
                    <p className="text-xs text-blue-300">Academic & Professional Gateway</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Streamlining the final year project process and career development for students and institutions.
                </p>

                {/* Contact info */}
                <div className="space-y-3 text-sm text-gray-300 mt-6">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <span>contact@pfeplatform.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-400" />
                    <span>+216 XX XXX XXX</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span>Tunisia</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Navigation Links - matching your actual navigation */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-bold mb-4 text-white">Navigation</h3>
                <ul className="space-y-2">
                  {navItems.map((item, index) => (
                    <li key={index}>
                      <motion.a
                        href={item.href}
                        className="text-gray-300 hover:text-blue-300 text-sm transition-colors inline-block"
                        whileHover={{ x: 5, color: "#93c5fd" }}
                      >
                        {item.label}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* For Students */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-bold mb-4 text-white">For Students</h3>
                <ul className="space-y-2">
                  {["Find Internships", "PFE Projects", "Skill Assessment", "Career Guidance", "Project Templates"].map(
                    (item, index) => (
                      <li key={index}>
                        <motion.a
                          href="#"
                          className="text-gray-300 hover:text-blue-300 text-sm transition-colors inline-block"
                          whileHover={{ x: 5, color: "#93c5fd" }}
                        >
                          {item}
                        </motion.a>
                      </li>
                    ),
                  )}
                </ul>
              </motion.div>
            </div>

            {/* For Institutions */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-bold mb-4 text-white">For Institutions</h3>
                <ul className="space-y-2">
                  {["Student Management", "Project Tracking", "Analytics", "Industry Partners", "Support"].map(
                    (item, index) => (
                      <li key={index}>
                        <motion.a
                          href="#"
                          className="text-gray-300 hover:text-blue-300 text-sm transition-colors inline-block"
                          whileHover={{ x: 5, color: "#93c5fd" }}
                        >
                          {item}
                        </motion.a>
                      </li>
                    ),
                  )}
                </ul>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <motion.div
          className="border-t border-blue-500/20 pt-8 flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-gray-300 text-sm mb-4 md:mb-0">&copy; {currentYear} Talent Go. All rights reserved.</p>
          <div className="flex space-x-4">
            {["Privacy Policy", "Terms of Service", "Accessibility"].map((item, index) => (
              <motion.a
                key={index}
                href="#"
                className="text-gray-300 hover:text-blue-300 text-sm transition-colors"
                whileHover={{ y: -2, color: "#93c5fd" }}
              >
                {item}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
