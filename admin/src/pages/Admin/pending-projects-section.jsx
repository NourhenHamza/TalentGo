"use client"
import { motion } from "framer-motion"
import { AlertCircle, Building, Calendar, UserPlus, CheckCircle, Clock } from "lucide-react"
import { Card3D, Shimmer, getSpecialityIcon, getTechIcon } from "./utils"
import { formatDate } from "./mock-data"

const PendingProjectsSection = ({ projects, loading, onAssign, containerVariants }) => {
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

  // Helper function to get student info safely
  const getStudentInfo = (student) => {
    if (!student) return {
      initials: "??",
      name: "Unknown Student",
      program: "Unknown Program"
    }
    
    // Get initials from name
    let initials = "??"
    if (student.name) {
      const nameParts = student.name.split(' ')
      initials = nameParts
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() || '')
        .join('')
    }

    return {
      initials,
      name: student.name || "Unknown Student",
      program: student.program || "Unknown Program"
    }
  }

  return (
    <motion.section className="mb-10" initial="hidden" animate="visible" variants={containerVariants}>
      <motion.div className="flex justify-between items-center mb-6" variants={itemVariants}>
        <div className="flex items-center">
          <div className="p-2 bg-yellow-100 rounded-lg mr-3">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          </div>
          <h2 className="text-xl font-semibold text-blue-800">Projects Awaiting Approval</h2>
        </div>
        <Shimmer className="rounded-full">
          <span className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-sm font-medium rounded-full shadow-md">
            {projects.length} Pending
          </span>
        </Shimmer>
      </motion.div>

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
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h3 className="text-xl font-medium text-blue-800 mb-2">All Caught Up!</h3>
          <p className="text-blue-600 max-w-md mx-auto">
            There are no pending projects awaiting approval. You're all up to date!
          </p>
        </motion.div>
      ) : (
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants}>
          {projects.map((project) => {
            const studentInfo = getStudentInfo(project.proposedBy)
            
            return (
              <Card3D key={project._id} className="overflow-hidden rounded-xl shadow-lg">
                <motion.div
                  className="bg-white border border-blue-100 rounded-xl overflow-hidden"
                  variants={itemVariants}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90"></div>
                    <div className="relative p-6">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-white line-clamp-1">{project.title}</h3>
                        <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full flex items-center shadow-sm">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </span>
                      </div>
                      <div className="mt-4 flex items-center">
                        <div className="w-10 h-10 rounded-full border-2 border-white/50 bg-green-500 flex items-center justify-center text-white font-medium">
                          {studentInfo.initials}
                        </div>
                        <div className="ml-3">
                          <p className="text-white font-medium">{studentInfo.name}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">

                    {project.company && (
                      <div className="flex items-center text-sm text-blue-500 mb-3">
                        <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{project.company}</span>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-blue-500 mb-4">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Submitted: {formatDate(project.createdAt)}</span>
                    </div>

                    {project.technologies?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-blue-600 text-sm">
                          <span className="font-medium">Technologies: </span>
                          {project.technologies.join(' || ')}
                        </p>
                      </div>
                    )}

                    {project.speciality?.length > 0 && (
                      <div className="mb-6">
                        <p className="text-blue-600 text-sm">
                          <span className="font-medium">Specialities: </span>
                          {project.speciality.join(' || ')}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => onAssign(project)}
                      className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg transition-all duration-300 flex items-center justify-center shadow-md"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign Project
                    </button>
                  </div>
                </motion.div>
              </Card3D>
            )
          })}
        </motion.div>
      )}
    </motion.section>
  )
}

export default PendingProjectsSection