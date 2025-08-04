"use client"
import { useState, useEffect, useCallback, useContext } from "react"
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from "framer-motion"
import { X as CloseIcon, Check, Star, Users, AlertTriangle } from "lucide-react"
import { AdminContext } from "../../context/AdminContext"

const AssignProjectModal = ({ 
  isOpen, 
  onClose, 
  project,
  onAssign,
  isLoading = false
}) => {
  const { Professors, getAllProfessors } = useContext(AdminContext)
  const [selectedProfessor, setSelectedProfessor] = useState(null)
  const [filteredProfessors, setFilteredProfessors] = useState([])
  const [isLoadingProfessors, setIsLoadingProfessors] = useState(false)

  // Fetch professors when modal opens
  useEffect(() => {
    if (!isOpen) return
    
    const fetchProfessors = async () => {
      setIsLoadingProfessors(true)
      try {
        await getAllProfessors()
      } catch (error) {
        console.error("Failed to fetch professors:", error)
      } finally {
        setIsLoadingProfessors(false)
      }
    }
    
    fetchProfessors()
  }, [isOpen, getAllProfessors])

  // Function to get capacity status and styling
  const getCapacityStatus = (currentStudents, maxStudents) => {
    const ratio = currentStudents / maxStudents
    
    if (ratio >= 1) {
      return {
        status: 'full',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />
      }
    } else if (ratio >= 0.8) {
      return {
        status: 'nearly-full',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: <Users className="h-4 w-4 text-orange-500" />
      }
    } else {
      return {
        status: 'available',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: <Users className="h-4 w-4 text-green-500" />
      }
    }
  }

  // Memoized professor filtering function
  const filterProfessors = useCallback(() => {
    if (!project || !Professors || Professors.length === 0) {
      return []
    }

    return Professors.map(professor => {
      const projectSpecialities = (project.speciality || []).map(s => 
        s ? s.toString().toLowerCase().trim() : ''
      ).filter(Boolean)

      const professorSpecialities = (professor.preferences || []).map(s => 
        s ? s.toString().toLowerCase().trim() : ''
      ).filter(Boolean)

      const matchedSpecs = projectSpecialities.filter(spec => 
        professorSpecialities.includes(spec)
      )

      // Get capacity information
      const currentStudents = professor.professorData?.currentStudents || 0
      const maxStudents = professor.professorData?.maxStudents || 5
      const capacityStatus = getCapacityStatus(currentStudents, maxStudents)

      return {
        ...professor,
        isMatch: matchedSpecs.length > 0,
        matchedSpecs,
        currentStudents,
        maxStudents,
        capacityStatus
      }
    }).sort((a, b) => {
      // Sort by: 1) Match status, 2) Capacity availability, 3) Name
      if (a.isMatch !== b.isMatch) {
        return b.isMatch - a.isMatch
      }
      
      // If both have same match status, prioritize by capacity
      if (a.capacityStatus.status !== b.capacityStatus.status) {
        const statusOrder = { 'available': 0, 'nearly-full': 1, 'full': 2 }
        return statusOrder[a.capacityStatus.status] - statusOrder[b.capacityStatus.status]
      }
      
      return a.name.localeCompare(b.name)
    })
  }, [project, Professors])

  // Update filtered professors when professors or project changes
  useEffect(() => {
    if (!isOpen) return

    setFilteredProfessors(filterProfessors())
  }, [isOpen, filterProfessors])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-lg"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-blue-800">
                Assign Project: {project?.title}
              </h3>
              <button 
                onClick={onClose} 
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">Green highlighted:</span> speciality match
                </div>

              </div>
              
              {/* Capacity Legend */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Nearly Full</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Full</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Professors ({filteredProfessors.length})
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {isLoadingProfessors ? (
                  <div className="text-center py-4">
                    <p>Loading professors...</p>
                  </div>
                ) : Professors.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-red-500">No professors available</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Please add professors before assigning projects
                    </p>
                  </div>
                ) : filteredProfessors.length > 0 ? (
                  filteredProfessors.map((professor) => (
                    <div
                      key={professor._id}
                      onClick={() => {
                        if (professor.capacityStatus.status !== 'full') {
                          setSelectedProfessor(professor._id)
                        }
                      }}
                      className={`p-3 rounded-lg border transition-colors ${
                        professor.capacityStatus.status === 'full'
                          ? "border-red-200 bg-red-50 cursor-not-allowed opacity-60"
                          : selectedProfessor === professor._id
                            ? "border-blue-500 bg-blue-50 cursor-pointer"
                            : professor.isMatch
                              ? "border-green-200 bg-green-50 cursor-pointer hover:bg-green-100"
                              : "border-gray-200 hover:bg-gray-50 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium mr-3 ${
                          professor.isMatch 
                            ? "bg-green-100 text-green-600" 
                            : "bg-blue-100 text-blue-600"
                        }`}>
                          {professor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <p className="font-medium">{professor.name}</p>
                              {professor.isMatch && (
                                <div className="flex items-center ml-2">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  <span className="text-xs text-green-600 ml-1">
                                    {professor.matchedSpecs.length} match{professor.matchedSpecs.length === 1 ? '' : 'es'}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Capacity indicator */}
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              professor.capacityStatus.bgColor
                            }`}>
                              {professor.capacityStatus.icon}
                              <span className={professor.capacityStatus.color}>
                                {professor.currentStudents}/{professor.maxStudents}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-500">{professor.department}</p>
                          
                          {/* Capacity warning for full professors */}
                          {professor.capacityStatus.status === 'full' && (
                            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Professor at maximum capacity
                            </p>
                          )}
                          
                          {professor.isMatch && (
                            <div className="mt-1">
                              <div className="flex flex-wrap gap-1">
                                {professor.matchedSpecs.map(spec => (
                                  <span 
                                    key={spec} 
                                    className="text-xs px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full"
                                  >
                                    {spec}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        {selectedProfessor === professor._id && (
                          <Check className="ml-2 h-5 w-5 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No professors match this project's specialties
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedProfessor) {
                    onAssign(selectedProfessor)
                  }
                }}
                disabled={!selectedProfessor || isLoading}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${
                  selectedProfessor && !isLoading
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {isLoading ? "Loading..." : "Confirm Assignment"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

AssignProjectModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  project: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    speciality: PropTypes.arrayOf(PropTypes.string),
    proposedBy: PropTypes.object,
  }).isRequired,
  onAssign: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
}

export default AssignProjectModal