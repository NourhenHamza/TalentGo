"use client"

import { AnimatePresence, motion } from "framer-motion"
import {
  Bookmark,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ClipboardList,
  Clock,
  Gavel, // Utilisé pour les universités
  Home,
  Plus,
  Shield,
  Users,
} from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { NavLink } from "react-router-dom"
import { AdminContext } from "../context/AdminContext"
import { CompanyContext } from "../context/CompanyContext"
import { GlobalAdminContext } from "../context/GlobalAdminContext"
import { ProfessorContext } from "../context/ProfessorContext"

import {
  CheckSquare,
  List, // Utilisé pour les entreprises
  Settings
} from "lucide-react"




const Sidebar = () => {
  const { aToken } = useContext(AdminContext)
  const { bToken } = useContext(GlobalAdminContext)
  const { dToken } = useContext(ProfessorContext)
  const { cToken } = useContext(CompanyContext)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsCollapsed(true)
      }
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      removeEventListener("resize", checkIfMobile)
    }
  }, [])

  const iconMap = {
    home_icon: <Home className="h-5 w-5" />,
    add_icon: <Plus className="h-5 w-5" />,
    people_icon: <Users className="h-5 w-5" />,

    calendar_icon: <Calendar className="h-5 w-5" />,
    clipboard_icon: <ClipboardList className="h-5 w-5" />,
    shield_icon: <Shield className="h-5 w-5" />,
    clock_icon: <Clock className="h-5 w-5" />,
    bookmark_icon: <Bookmark className="h-5 w-5" />,
    gavel_icon: <Gavel className="h-5 w-5" />, // Icône pour les universités
    


    validate_icon: <CheckSquare className="h-5 w-5" />,
    assignments_icon: <List className="h-5 w-5" />, // Icône pour les entreprises
    preferences_icon: <Settings className="h-5 w-5" />,
    confirmed_icon: <ShieldCheck className="h-5 w-5" />



  }

  return (
    <div className={`relative min-h-screen bg-gradient-to-b from-white to-blue-50 border-r shadow-sm transition-all duration-300 ${
      isCollapsed && !isMobile ? "w-20" : "w-64"
    }`}>
      {/* Toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white rounded-full p-1.5 shadow-md z-10 border border-blue-100 hover:bg-blue-50 transition-colors duration-300 md:flex hidden"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-blue-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-blue-600" />
        )}
      </button>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-64 overflow-hidden pointer-events-none">
        <div className="shape-blob shape-blob-3 absolute bottom-0 left-0 w-64 h-64 rounded-full bg-blue-100/50 blur-xl"></div>
      </div>

      {/* Admin Links */}
      {aToken && (
        <motion.ul
          className="text-slate-600 mt-5 space-y-1 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}
            to={"/admin-dashboard"}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {iconMap.home_icon}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {(!isCollapsed || isMobile) && <span className="text-sm">Dashboard</span>}
              </>
            )}
          </NavLink>

          <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}
            to={"/add-Professor"}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {iconMap.add_icon}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {(!isCollapsed || isMobile) && <span className="text-sm">Add Professor</span>}
              </>
            )}
          </NavLink>

          <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}
            to={"/Professors-list"}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {iconMap.people_icon}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {(!isCollapsed || isMobile) && <span className="text-sm">Professors List</span>}
              </>
            )}
          </NavLink>

          <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}

            to={"/validate-subjects"}

          >
            {({ isActive }) => (
              <>
                <div className="relative">


                  {iconMap.validate_icon}

                

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>


                {(!isCollapsed || isMobile) && <span className="text-sm">Validate Subjects</span>}

              </>
            )}
          </NavLink>
          <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}
     

            to={"/projects"}


          >
            {({ isActive }) => (
              <>
                <div className="relative">


                  {iconMap.add_icon}

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>


                {(!isCollapsed || isMobile) && <span className="text-sm">Manage Projects</span>}

              </>
            )}
          </NavLink>

          {/* Defense Management Section */}
          <div className={`pt-4 ${(!isCollapsed || isMobile) ? "px-4" : "px-2"}`}>
            <p className={`text-xs font-medium text-blue-500 uppercase tracking-wider ${isCollapsed && !isMobile ? "text-center" : ""}`}>
              {(!isCollapsed || isMobile) ? "Defense Management" : "..."}
            </p>
          </div>


           

          <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}
            to={"/defense-requests"}


          >
            {({ isActive }) => (
              <>
                <div className="relative">

                  {iconMap.clipboard_icon}

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {(!isCollapsed || isMobile) && <span className="text-sm">Defense Requests</span>}
              </>
            )}
          </NavLink>
          
          
          
          
          
       
          
          
            <NavLink

            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}
            to={"/planned-defenses"}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {iconMap.bookmark_icon}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {(!isCollapsed || isMobile) && <span className="text-sm">Planned Defenses</span>}
              </>
            )}
          </NavLink>
          
              <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}
            to={"/partnerships"}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {iconMap.assignments_icon} {/* Icône changée pour les entreprises */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {(!isCollapsed || isMobile) && <span className="text-sm">Partnerships</span>}
              </>
            )}
          </NavLink>
 <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}
            to={"/university-student-list"}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {iconMap.assignments_icon} {/* Icône changée pour les entreprises */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {(!isCollapsed || isMobile) && <span className="text-sm">Manage Students</span>}
              </>
            )}
          </NavLink>
          
          <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}

            to={"/events"}
          >
            {({ isActive }) => (
              <>
                <div className="relative">

                  {iconMap.assignments_icon}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>

                {(!isCollapsed || isMobile) && <span className="text-sm">Events</span>}
              </>
            )}
          </NavLink>
          
          


          
          
         

        
        </motion.ul>
      )}

       {/* Admin Links */}
      {bToken && (
        <motion.ul
          className="text-slate-600 mt-5 space-y-1 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}
            to={"/globaladmin-dashboard"}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {iconMap.home_icon}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {(!isCollapsed || isMobile) && <span className="text-sm">Dashboard</span>}
              </>
            )}
          </NavLink>

          

          <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}
            to={"/manage-universities"}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {iconMap.gavel_icon} {/* Icône changée pour les universités */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {(!isCollapsed || isMobile) && <span className="text-sm">Manage Universities</span>}
              </>
            )}
          </NavLink>

           <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}
            to={"/manage-companies"}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {iconMap.assignments_icon} {/* Icône changée pour les entreprises */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {(!isCollapsed || isMobile) && <span className="text-sm">Manage Companies</span>}
              </>
            )}
          </NavLink>
           <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}
            to={"/students-list"}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {iconMap.assignments_icon} {/* Icône changée pour les entreprises */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {(!isCollapsed || isMobile) && <span className="text-sm">Students List</span>}
              </>
            )}
          </NavLink>
           
        </motion.ul>
      )}
  
      {/* Professor Links (unchanged) */}
            {/* Professor Links */}
            {dToken && (
        <motion.ul
          className="text-slate-600 mt-5 space-y-1 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}
            to={"/Professor-dashboard"}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {iconMap.home_icon}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {(!isCollapsed || isMobile) && <span className="text-sm">Dashboard</span>}
              </>
            )}
          </NavLink>

          <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}
            to={"/Professor-profile"}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {iconMap.people_icon}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {(!isCollapsed || isMobile) && <span className="text-sm">Profile</span>}
              </>
            )}
          </NavLink>
           

          {/* Professor Defense Management */}
          <div className={`pt-4 ${(!isCollapsed || isMobile) ? "px-4" : "px-2"}`}>
            <p className={`text-xs font-medium text-blue-500 uppercase tracking-wider ${isCollapsed && !isMobile ? "text-center" : ""}`}>
              {(!isCollapsed || isMobile) ? "Defenses" : "..."}
            </p>
          </div>


          <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}
            to={"/professor-availability"}

          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {iconMap.calendar_icon}

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {(!isCollapsed || isMobile) && <span className="text-sm">Set Availability</span>}

              </>
            )}
          </NavLink>
             <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}
     

            to={"/assigned-defenses"}


          >
            {({ isActive }) => (
              <>
                <div className="relative">


                  {iconMap.add_icon}

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>


                {(!isCollapsed || isMobile) && <span className="text-sm">Assigned Defenses</span>}

              </>
            )}
          </NavLink>

 <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}

            to={"/assignments-list"}
          >
            {({ isActive }) => (
              <>
                <div className="relative">

                  {iconMap.assignments_icon}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>

                {(!isCollapsed || isMobile) && <span className="text-sm">Assignments</span>}
              </>
            )}
          </NavLink>
          <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}

            to={"/show-progress"}
          >
            {({ isActive }) => (
              <>
                <div className="relative">

                  {iconMap.preferences_icon}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>

                {(!isCollapsed || isMobile) && <span className="text-sm">Students weekly progress</span>}
              </>
            )}
          </NavLink>

          
          
          
 

         <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}
            to={"/report-managment"}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {iconMap.people_icon}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {(!isCollapsed || isMobile) && <span className="text-sm">Report Managment</span>}
              </>
            )}
          </NavLink>

          <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}

            to={"/professor-preferences"}
          >
            {({ isActive }) => (
              <>
                <div className="relative">

                  {iconMap.preferences_icon}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>

                {(!isCollapsed || isMobile) && <span className="text-sm">Preferences</span>}
              </>
            )}
          </NavLink>





        </motion.ul>
 


      )}

       {/* Admin Links */}
      {cToken && (
        <motion.ul
          className="text-slate-600 mt-5 space-y-1 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}
            to={"/company-dashboard"}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {iconMap.home_icon}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {(!isCollapsed || isMobile) && <span className="text-sm">Dashboard</span>}
              </>
            )}
          </NavLink>
          <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}
            to={"/CompanyOffersManagementPage"}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {iconMap.gavel_icon} {/* Icône changée pour les universités */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {(!isCollapsed || isMobile) && <span className="text-sm">Offers Management</span>}
              </>
            )}
          </NavLink>
              
          <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}
            to={"/CompanyPublicApplicationsPage"}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {iconMap.gavel_icon} {/* Icône changée pour les universités */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {(!isCollapsed || isMobile) && <span className="text-sm">Public Applications</span>}
              </>
            )}
          </NavLink>
                    <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}
            to={"/applications"}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {iconMap.assignments_icon} {/* Icône changée pour les entreprises */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {(!isCollapsed || isMobile) && <span className="text-sm">Student Applications</span>}
              </>
            )}
          </NavLink>

           <NavLink

            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}
            to={"/confirmed-students"}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {iconMap.confirmed_icon}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {(!isCollapsed || isMobile) && <span className="text-sm">Confirmed Students</span>}
              </>
            )}
          </NavLink>
          
              <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}
            to={"/partnerships"}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {iconMap.assignments_icon} {/* Icône changée pour les entreprises */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {(!isCollapsed || isMobile) && <span className="text-sm">Partnerships</span>}
              </>
            )}
          </NavLink>

          

          <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}
            to={"/manage-recruiters"}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {iconMap.gavel_icon} {/* Icône changée pour les universités */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {(!isCollapsed || isMobile) && <span className="text-sm">Manage Recruiters</span>}
              </>
            )}
          </NavLink>


           <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}
            to={"/manage-supervisors"}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {iconMap.assignments_icon} {/* Icône changée pour les entreprises */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {(!isCollapsed || isMobile) && <span className="text-sm">Manage Supervisors</span>}
              </>
            )}
          </NavLink>


            <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}
            to={"/partnerships"}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {iconMap.assignments_icon} {/* Icône changée pour les entreprises */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {(!isCollapsed || isMobile) && <span className="text-sm">Partnerships</span>}
              </>
            )}
          </NavLink>
 <NavLink
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}
            to={"/company-student-list"}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {iconMap.assignments_icon} {/* Icône changée pour les entreprises */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {(!isCollapsed || isMobile) && <span className="text-sm">Manage Students</span>}
              </>
            )}
          </NavLink>


        </motion.ul>
      )}
    </div>
  )
}

export default Sidebar