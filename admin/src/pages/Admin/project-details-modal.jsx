"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, FileText, Edit, UserPlus, Building, Calendar, Tag, User, Code, Layers, Mail, GraduationCap } from "lucide-react"
import { getStatusBadge } from "./utils"

const ProjectDetailsModal = ({ isOpen, onClose, project, onAssign }) => {
  if (!isOpen || !project) return null

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Safely get student information
  const getStudentInfo = () => {
    if (!project.proposedBy) return null;
    
    return {
      name: project.proposedBy.name || "Unknown Student",
      email: project.proposedBy.email || "No email provided",
      avatar: project.proposedBy.avatar || "/placeholder-user.png",
      program: project.proposedBy.program || "Not specified",
      year: project.proposedBy.year || "Not specified"
    };
  };

  const student = getStudentInfo();

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Project Details
            </h3>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[70vh]">
            <div className="flex justify-between items-start mb-6">
              <h4 className="text-xl font-medium text-blue-800">{project.title || "Untitled Project"}</h4>
              {getStatusBadge(project.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h5 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  Project Description
                </h5>
                <p className="text-blue-600 bg-blue-50 p-4 rounded-xl border border-blue-100">
                  {project.description || "No description provided"}
                </p>
              </div>

              <div>
                <h5 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                  <Layers className="h-4 w-4 mr-1" />
                  Project Details
                </h5>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-3">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm text-blue-600 font-medium w-24">Student:</span>
                    <span className="text-sm text-blue-800">{student?.name || "N/A"}</span>
                  </div>

                  <div className="flex items-center">
                    <User className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm text-blue-600 font-medium w-24">Supervisor:</span>
                    <span className="text-sm text-blue-800">
                      {project.supervisor?.name || "Not Assigned"}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <Building className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm text-blue-600 font-medium w-24">Company:</span>
                    <span className="text-sm text-blue-800">{project.company || "Not specified"}</span>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm text-blue-600 font-medium w-24">Submitted:</span>
                    <span className="text-sm text-blue-800">{formatDate(project.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.technologies?.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                    <Code className="h-4 w-4 mr-1" />
                    Technologies
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {project.speciality?.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    Specialities
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {project.speciality.map((spec, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {student && (
              <div className="mt-6">
                <h5 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Student Information
                </h5>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center">
                   
                    <div className="ml-4">
                      <h6 className="text-blue-800 font-medium">{student.name}</h6>
                      <p className="text-blue-600 text-sm flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {student.email}
                      </p>
                      <p className="text-blue-600 text-sm flex items-center mt-1">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        {student.program} • {student.year}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors">
                          View Profile
                        </button>
                        <a 
                          href={`mailto:${student.email}`}
                          className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                        >
                          Contact Student
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between">
            <div>
              {project.status === "pending" && (
                <button
                  onClick={() => {
                    onClose();
                    onAssign(project);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-colors flex items-center shadow-md"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Project
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-colors shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ProjectDetailsModal