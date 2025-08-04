"use client"

import { motion } from "framer-motion";
import { LogOut, Menu, Search, Settings, User } from "lucide-react";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import NotificationBell from "../components/notifications/NotificationBell";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const { token, setToken } = useContext(AppContext)
  const [showDropdown, setShowDropdown] = useState(false)
  const navigate = useNavigate()

  const logout = () => {
    if (token) {
      navigate("/login")
      setToken("")
      localStorage.removeItem("token")
      toast.success("Logged out successfully")
    }
  }

  const handleProfileClick = () => {
    navigate("/student-profile")
    setShowDropdown(false) // Close dropdown after navigation
  }

  if (!token) {
    return null 
  }

  return (
    <div className="relative z-[100]"> {/* Increased z-index from z-10 to z-[100] */}
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="shape-blob shape-blob-1 absolute -top-24 -right-24 w-64 h-64 rounded-full bg-blue-200/30 blur-xl"></div>
        <div className="shape-blob shape-blob-2 absolute -top-12 -left-12 w-48 h-48 rounded-full bg-blue-300/20 blur-lg"></div>
      </div>

      <div className="flex justify-between items-center px-4 sm:px-10 py-4 border-b bg-white/80 backdrop-blur-sm shadow-sm">
        {/* Left side - Logo and user type */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <img
              className=" w-25 h-16 object-cover cursor-pointer transition-all hover:shadow-md hover:scale-105"
              src="/logo.png"
              alt="Logo"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
              S
            </div>
          </div>
          <div>
            <h1 className="font-bold text-blue-800 text-lg">Student Portal</h1>
            <p className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Student
            </p>
          </div>
        </motion.div>

        {/* Center - Search bar (only on larger screens) */}
        <div className="hidden md:flex relative max-w-md w-full mx-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-blue-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="w-full py-2 pl-10 pr-4 rounded-full border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50/50"
          />
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <NotificationBell />

          {/* Settings */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Settings className="h-5 w-5" />
          </motion.button>

          {/* User menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <User className="h-5 w-5" />
            </motion.button>

            {/* Dropdown menu */}
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[1100]" // Increased z-index for user dropdown
              >
                <div className="py-1">
                  <button
                    onClick={handleProfileClick}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  >
                    Your Profile
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Mobile menu button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="md:hidden p-2 rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </motion.button>

          {/* Logout button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white text-sm px-6 py-2 rounded-full shadow-md transition-all duration-300"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default Navbar