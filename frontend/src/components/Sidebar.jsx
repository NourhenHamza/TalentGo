"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Home,
  MessageSquare,
  Upload,
  Clock,
  FilePlus2,
  BarChart3,
  ShieldCheck, // New icon for defense tracking
  BriefcaseIcon // Fixed applications icon
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Sidebar = () => {
  const { token } = useContext(AppContext);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const iconMap = {
    home_icon: <Home className="h-5 w-5" />,
    projects_icon: <BookOpen className="h-5 w-5" />,
    reports_icon: <FileText className="h-5 w-5" />,
    schedule_icon: <Calendar className="h-5 w-5" />,
    messages_icon: <MessageSquare className="h-5 w-5" />,
    defense_icon: <ClipboardList className="h-5 w-5" />,
    submit_icon: <Upload className="h-5 w-5" />,
    status_icon: <Clock className="h-5 w-5" />,
    report_submission_icon: <FilePlus2 className="h-5 w-5" />,
    weekly_progress_icon: <BarChart3 className="h-5 w-5" />,
    defense_tracking_icon: <ShieldCheck className="h-5 w-5" />, // New icon mapping
    applications_icon: <BriefcaseIcon className="h-5 w-5" /> // Fixed applications icon
  };

  if (!token) return null;

  const navItems = [
    { to: "/student-dashboard", label: "Dashboard", icon: iconMap.home_icon },
    { to: "/offers", label: "Offers and Applications", icon: iconMap.applications_icon }, // Fixed typo
    { to: "/defense-request", label: "Defense Request", icon: iconMap.defense_icon },
    { to: "/defense-tracking", label: "Defense Tracking", icon: iconMap.defense_tracking_icon }, // New item
    { to: "/pfe-submission", label: "Submit Project", icon: iconMap.submit_icon },
    { to: "/status", label: "Project Status", icon: iconMap.status_icon },
    { to: "/report-submission", label: "Report Submission", icon: iconMap.report_submission_icon },
    { to: "/weekly-progress", label: "Weekly Progress", icon: iconMap.weekly_progress_icon }
  ];

  return (
    <div
      className={`relative min-h-screen bg-gradient-to-b from-white to-blue-50 border-r shadow-sm transition-all duration-300 ${
        isCollapsed && !isMobile ? "w-20" : "w-64"
      }`}
    >
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

      <div className="absolute bottom-0 left-0 w-full h-64 overflow-hidden pointer-events-none">
        <div className="shape-blob shape-blob-3 absolute bottom-0 left-0 w-64 h-64 rounded-full bg-blue-100/50 blur-xl"></div>
      </div>

      <motion.ul
        className="text-slate-600 mt-5 space-y-1 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `
              flex items-center gap-4 py-3.5 rounded-lg transition-all duration-300
              ${isCollapsed && !isMobile ? "justify-center px-3" : "px-4"}
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
            `}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {icon}
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
                {(!isCollapsed || isMobile) && <span className="text-sm">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </motion.ul>
    </div>
  );
};

export default Sidebar;