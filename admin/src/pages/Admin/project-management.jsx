"use client"
import { useState, useEffect, useRef, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, FileText, Filter, Search, ChevronDown } from "lucide-react"
import PendingProjectsSection from "./pending-projects-section"
import AllProjectsSection from "./all-projects-section"
import AssignProjectModal from "./assign-project-modal"
import ProjectDetailsModal from "./project-details-modal"
import DeleteProjectModal from "./delete-project-modal"
import { AdminContext } from "../../context/adminContext"
import { toast } from 'react-toastify'

const ProjectManagement = () => {
  const { 
    projects, 
    pendingProjects, 
    getAllProjects, 
    assignProject, 
    deleteProject,
    Professors,
    getAllProfessors
  } = useContext(AdminContext)

  const [loading, setLoading] = useState(true)
  const [professorsLoading, setProfessorsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterSpeciality, setFilterSpeciality] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  // State for modals
  const [selectedProject, setSelectedProject] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const dropdownRef = useRef({})

  // Fetch projects data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        await Promise.all([
          getAllProjects(),
          getAllProfessors()
        ])
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [getAllProjects, getAllProfessors])

  // Handle dropdown toggle
  const toggleDropdown = (id) => {
    dropdownRef.current[id] = !dropdownRef.current[id]
    setSelectedProject(prev => prev ? {...prev} : null)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdowns = document.querySelectorAll(".project-dropdown")
      dropdowns.forEach((dropdown) => {
        if (!dropdown.contains(event.target)) {
          const projectId = dropdown.getAttribute("data-project-id")
          if (dropdownRef.current[projectId]) {
            dropdownRef.current[projectId] = false
            setSelectedProject(prev => prev ? {...prev} : null)
          }
        }
      })
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleAssignProject = async (project) => {
    setSelectedProject(project);
    setShowAssignModal(true);
    
    // Pre-load professors if not already loaded
    if (!Professors || Professors.length === 0) {
      setProfessorsLoading(true);
      try {
        await getAllProfessors();
      } catch (error) {
        toast.error("Failed to load professors");
      } finally {
        setProfessorsLoading(false);
      }
    }
  };

  // Handle project details view
  const handleViewDetails = (project) => {
    setSelectedProject(project)
    setShowDetailsModal(true)
  }

  // Handle project deletion confirmation
  const handleDeleteConfirmation = (project) => {
    setSelectedProject(project)
    setShowDeleteModal(true)
  }

  // Handle actual project deletion
  const handleDeleteProject = async () => {
    const success = await deleteProject(selectedProject._id)
    if (success) {
      setShowDeleteModal(false)
      setSelectedProject(null)
      toast.success("Project deleted successfully")
    } else {
      toast.error("Failed to delete project")
    }
  }

  const handleAssignSubmit = async (professorId) => {
    try {
        setProfessorsLoading(true);
        const success = await assignProject(selectedProject._id, professorId);
        if (success) {
            setShowAssignModal(false);
            setSelectedProject(null);
            await getAllProjects(); // This will refresh the projects list with updated status
        }
    } catch (error) {
        console.error("Assignment error:", error);
        toast.error("Failed to complete assignment");
    } finally {
        setProfessorsLoading(false);
    }
};
  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  // Filter projects based on search term and filters
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.technologies && project.technologies.some(tech => 
        tech.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    
    const matchesStatus = filterStatus === "all" || project.status === filterStatus;
    const matchesSpeciality = filterSpeciality === "all" || 
      (project.speciality && project.speciality.includes(filterSpeciality));

    return matchesSearch && matchesStatus && matchesSpeciality;
  });

  // Filter pending projects based on search term
  const filteredPendingProjects = pendingProjects.filter((project) => {
    return (
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.technologies && project.technologies.some(tech => 
        tech.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="p-6 relative bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="shape-blob shape-blob-1 absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-100/30 blur-xl"></div>
        <div className="shape-blob shape-blob-2 absolute bottom-0 left-0 w-96 h-96 rounded-full bg-blue-200/20 blur-xl"></div>
        <div className="shape-blob shape-blob-3 absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-indigo-100/20 blur-xl"></div>
      </div>

      <div className="relative z-10">
        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 text-transparent bg-clip-text">
              Project Management
            </h1>
          </div>
          <p className="text-blue-600 ml-12">Manage and assign student projects with ease</p>
        </motion.header>

        {/* Tabs */}
        <motion.div
          className="mb-8 flex"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-lg flex gap-2 border border-blue-100">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === "all"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                  : "text-blue-700 hover:bg-blue-50"
              }`}
            >
              <FileText className={`h-4 w-4 ${activeTab === "all" ? "text-white" : "text-blue-500"}`} />
              All Projects
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${activeTab === "all" ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"}`}
              >
                {projects.length}
              </span>
            </button>
           
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === "pending"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                  : "text-blue-700 hover:bg-blue-50"
              }`}
            >
              <AlertCircle className={`h-4 w-4 ${activeTab === "pending" ? "text-white" : "text-yellow-500"}`} />
              Pending Approval
              {pendingProjects.length > 0 && (
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${activeTab === "pending" ? "bg-white/20 text-white" : "bg-yellow-100 text-yellow-700"}`}
                >
                  {pendingProjects.length}
                </span>
              )}
            </button>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-blue-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-blue-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search projects by title, description, or technology..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg flex items-center transition-all duration-300 shadow-md"
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
                <ChevronDown
                  className={`h-4 w-4 ml-2 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {/* Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full p-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="assigned">Assigned</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">Speciality</label>
                    <select
                      value={filterSpeciality}
                      onChange={(e) => setFilterSpeciality(e.target.value)}
                      className="w-full p-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                    >
                      <option value="all">All Specialities</option>
                      <option value="AI">AI</option>
                      <option value="Machine Learning">Machine Learning</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Cloud Computing">Cloud Computing</option>
                      <option value="IoT">IoT</option>
                      <option value="Blockchain">Blockchain</option>
                      <option value="Mobile Development">Mobile Development</option>
                      <option value="Big Data">Big Data</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Content based on active tab */}
        <AnimatePresence mode="wait">
          {activeTab === "pending" ? (
            <motion.div
              key="pending-tab"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <PendingProjectsSection
                projects={filteredPendingProjects}
                loading={loading}
                onAssign={handleAssignProject}
                containerVariants={containerVariants}
              />
            </motion.div>
          ) : (
            <motion.div
              key="all-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AllProjectsSection
                projects={filteredProjects}
                loading={loading}
                dropdownRef={dropdownRef}
                toggleDropdown={toggleDropdown}
                onViewDetails={handleViewDetails}
                onAssign={handleAssignProject}
                onDelete={handleDeleteConfirmation}
                containerVariants={containerVariants}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      {selectedProject && (
        <>
          <AssignProjectModal
            isOpen={showAssignModal}
            onClose={() => setShowAssignModal(false)}
            project={selectedProject}
            onAssign={handleAssignSubmit}
            isLoading={professorsLoading}
          />
          <ProjectDetailsModal
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            project={selectedProject}
            onAssign={() => {
              setShowDetailsModal(false)
              handleAssignProject(selectedProject)
            }}
          />
          <DeleteProjectModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            project={selectedProject}
            onDelete={handleDeleteProject}
          />
        </>
      )}
    </div>
  )
}

export default ProjectManagement