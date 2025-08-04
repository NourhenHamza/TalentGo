"use client"
import { motion, AnimatePresence } from "framer-motion"
import PropTypes from "prop-types"
import { createPortal } from "react-dom"
import { useState, useEffect } from "react"
import { AlertCircle, ArrowLeft, ArrowRight, Eye, FileText, MoreHorizontal, Trash2, Building } from "lucide-react"
import { getStatusBadge, getStatusColor } from "./utils"
import { formatDate } from "./mock-data"

const AllProjectsSection = ({ projects, loading, onViewDetails, onAssign, onDelete, containerVariants }) => {
  // Animation variants for items
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  }

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  // State to track the position of the dropdown
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [portalContainer, setPortalContainer] = useState(null)

  // Initialize portal container
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPortalContainer(document.body)
    }
  }, [])

  // Handle dropdown toggle with position calculation
  const handleToggleDropdown = (projectId, event) => {
    if (activeDropdown === projectId) {
      setActiveDropdown(null)
      return
    }

    // Get the button position
    const rect = event.currentTarget.getBoundingClientRect()

    // Calculate position for the dropdown
    setDropdownPosition({
      top: rect.bottom,
      left: rect.right - 150 + window.scrollX, // 150 is approximate width of dropdown
    })

    setActiveDropdown(projectId)
  }

  return (
    <motion.section initial="hidden" animate="visible" variants={containerVariants}>
      {loading ? (
        <motion.div
          className="flex justify-center items-center h-60 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100"
          variants={fadeInVariants}
        >
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <span className="text-blue-600 font-medium">Loading projects...</span>
            <span className="text-blue-400 text-sm mt-2">Please wait while we fetch the latest data</span>
          </div>
        </motion.div>
      ) : projects.length === 0 ? (
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-xl p-10 text-center shadow-lg border border-blue-100"
          variants={fadeInVariants}
        >
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-yellow-500" />
          </div>
          <h3 className="text-xl font-medium text-blue-800 mb-2">No Projects Found</h3>
          <p className="text-blue-600 max-w-md mx-auto">
            No projects match your current filters. Try adjusting your search criteria or filters.
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-blue-100"
          variants={fadeInVariants}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Project</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Supervisor</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {projects.map((project, index) => (
                  <motion.tr
                    key={project._id}
                    className="hover:bg-blue-50/80 transition-colors duration-150"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: "rgba(239, 246, 255, 0.8)" }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div
                          className={`p-2 rounded-md bg-gradient-to-r ${getStatusColor(project.status)} mr-3 shadow-sm`}
                        >
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-blue-800">{project.title}</div>
                          <div className="text-xs text-blue-500 flex items-center">
                            <Building className="h-3 w-3 mr-1" />
                            {project.company}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full mr-2 border border-blue-200 flex items-center justify-center bg-blue-100 text-blue-700 font-medium">
                          {project.proposedBy?.name
                            ? project.proposedBy.name.split(" ").length > 1
                              ? `${project.proposedBy.name.split(" ")[0][0]}${project.proposedBy.name.split(" ")[1][0]}`
                              : project.proposedBy.name[0]
                            : "?"}
                        </div>
                        <div>
                          <div className="text-sm text-blue-700">{project.proposedBy?.name || "Unknown"}</div>
                          <div className="text-xs text-blue-500">{project.proposedBy?.email || ""}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {project.supervisor ? (
                        <div className="flex items-center">
                          <div className="text-sm text-blue-700">{project.supervisor?.name || "Professor"}</div>
                        </div>
                      ) : (
                        <span className="text-yellow-600 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Not Assigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(project.status)}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-blue-600">{formatDate(project.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative project-dropdown" data-project-id={project._id}>
                        <button
                          onClick={(e) => handleToggleDropdown(project._id, e)}
                          className="p-2 rounded-full hover:bg-blue-100 transition-colors duration-150"
                        >
                          <MoreHorizontal className="h-5 w-5 text-blue-600" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-100 flex justify-between items-center">
            <span className="text-sm text-blue-600">Showing {projects.length} projects</span>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center shadow-sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center shadow-sm">
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Dropdown Portal - Rendered at the document body level */}
      {portalContainer &&
        activeDropdown &&
        createPortal(
          <div className="fixed inset-0 z-[9999] pointer-events-none" onClick={() => setActiveDropdown(null)}>
            <div
              className="pointer-events-auto"
              style={{
                position: "absolute",
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
              }}
            >
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="w-48 rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="py-1">
                    {projects.map(
                      (project) =>
                        project._id === activeDropdown && (
                          <div key={project._id}>
                            <button
                              onClick={() => {
                                onViewDetails(project)
                                setActiveDropdown(null)
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 flex items-center"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </button>
                            {(project.status === "pending" || project.status === "approved") && (

                              <button
                                onClick={() => {
                                  onAssign(project)
                                  setActiveDropdown(null)
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 flex items-center"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Assign Project
                              </button>
                            )}
                            <button
                              onClick={() => {
                                onDelete(project)
                                setActiveDropdown(null)
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Project
                            </button>
                          </div>
                        ),
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>,
          portalContainer,
        )}
    </motion.section>
  )
}
AllProjectsSection.propTypes = {
  projects: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      speciality: PropTypes.string,
      technologies: PropTypes.arrayOf(PropTypes.string),
      // Add other project properties as needed
    }),
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  onViewDetails: PropTypes.func.isRequired,
  onAssign: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  containerVariants: PropTypes.object.isRequired,
}

export default AllProjectsSection
