"use client"

import { useState, useEffect, useContext } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { StudentContext } from "../context/StudentContext"
import { motion, AnimatePresence } from "framer-motion"
import {
  Trash2,
  Plus,
  BookOpen,
  Building,
  Code,
  Send,
  Loader2,
  GraduationCap,
  BookMarked,
  Award,
  School,
  Lightbulb,
  Beaker,
  Microscope,
  Check,
  X,
  ChevronDown,
} from "lucide-react"

const PfeSubmissionPage = () => {
  const { apiClient } = useContext(StudentContext)
  const [subject, setSubject] = useState(null)
  const [formData, setFormData] = useState({
    speciality: [],
    title: "",
    description: "",
    technologies: "",
    company: "",
  })
  const [loading, setLoading] = useState(false)
  const [techInput, setTechInput] = useState("")
  const [showSpecialityDropdown, setShowSpecialityDropdown] = useState(false)

  // Specialities array
  const SPECIALITIES = [
    'AI',
    'Machine Learning', 
    'Web Development',
    'Cybersecurity',
    'Data Science',
    'Cloud Computing',
    'IoT',
    'Blockchain',
    'Mobile Development',
    'DevOps',
    'Big Data',
    'Computer Vision',
    'NLP'
  ];

  // Status colors
  const statusColors = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
    rejected: "bg-rose-100 text-rose-800 border-rose-200",
    suggested: "bg-blue-100 text-blue-800 border-blue-200",
  }

  useEffect(() => {
    fetchMySubject()
  }, [])

  // Handle clicking outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSpecialityDropdown && !event.target.closest('.speciality-dropdown')) {
        setShowSpecialityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSpecialityDropdown]);

  const fetchMySubject = async () => {
    try {
      const res = await apiClient.get("/subjects/my-subject") // Use apiClient instead of axios
      if (res.data.data) {
        setSubject(res.data.data)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error loading data")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const technologiesArray = formData.technologies.split(",").map((t) => t.trim())
      const payload = {
        ...formData,
        technologies: technologiesArray,
      }

      await apiClient.post("/subjects/submit", payload) // Use apiClient instead of axios
      toast.success("Project submitted successfully!")
      fetchMySubject()
      setFormData({
        title: "",
        description: "",
        technologies: "",
        company: "",
        speciality: [] // Reset speciality array
      })
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission error")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await apiClient.delete(`/subjects/${subject._id}`) // Use apiClient instead of axios
        toast.success("Project deleted successfully")
        setSubject(null)
      } catch (err) {
        toast.error(err.response?.data?.message || "Deletion error")
      }
    }
  }

  const addTechnology = () => {
    if (techInput.trim()) {
      setFormData({
        ...formData,
        technologies: formData.technologies ? `${formData.technologies}, ${techInput}` : techInput,
      })
      setTechInput("")
    }
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  // Flying icons animation variants
  const flyingIconVariants = {
    initial: (i) => ({
      x: i % 2 === 0 ? -100 : 100,
      y: -100,
      opacity: 0,
      rotate: i % 2 === 0 ? -45 : 45,
    }),
    animate: (i) => ({
      x: 0,
      y: 0,
      opacity: 0.8,
      rotate: 0,
      transition: {
        duration: 1.2,
        delay: 0.2 + i * 0.2,
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    }),
    hover: {
      y: -10,
      scale: 1.1,
      opacity: 1,
      transition: { duration: 0.3 },
    },
  }

  // University-themed icons
  const universityIcons = [
    { icon: GraduationCap, color: "text-blue-500" },
    { icon: BookMarked, color: "text-blue-600" },
    { icon: Award, color: "text-blue-700" },
    { icon: School, color: "text-blue-800" },
    { icon: Lightbulb, color: "text-blue-500" },
    { icon: Beaker, color: "text-blue-600" },
    { icon: Microscope, color: "text-blue-700" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 px-6 sm:px-10 lg:px-16 relative overflow-hidden w-full">
      {/* Flying university-themed icons */}
      {universityIcons.map((Icon, i) => (
        <motion.div
          key={i}
          className={`absolute ${Icon.color} opacity-0`}
          custom={i}
          variants={flyingIconVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          style={{
            top: `${10 + i * 10}%`,
            left: i % 2 === 0 ? `${5 + i * 5}%` : `${85 - i * 5}%`,
            zIndex: 0,
          }}
        >
          <Icon.icon className="h-10 w-10 md:h-14 md:w-14" />
        </motion.div>
      ))}

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div className="text-center mb-12" initial="hidden" animate="visible" variants={fadeInUp}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="inline-block mb-4"
          >
            <GraduationCap className="h-16 w-16 text-blue-600 mx-auto" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-3">
            Final Year Project
            <span className="text-blue-500"> Submission Portal</span>
          </h1>
          <motion.div
            className="w-32 h-1.5 bg-blue-500 mx-auto my-5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "8rem" }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
          <motion.p
            className="mt-4 text-lg md:text-xl text-blue-700 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Submit and track your graduation project proposal with our interactive platform
          </motion.p>
        </motion.div>

        <AnimatePresence mode="wait">
          {subject ? (
            <motion.div
              key="subject-view"
              className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-blue-100"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="bg-gradient-to-r from-blue-700 to-blue-500 px-8 py-6"
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h3 className="text-2xl font-semibold text-white flex items-center">
                    <BookOpen className="mr-3 h-6 w-6" />
                    My Final Year Project Proposal
                  </h3>
                  <motion.span
                    className={`px-4 py-1.5 rounded-full text-sm font-medium ${statusColors[subject.status]} border shadow-sm`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, delay: 0.4 }}
                  >
                    {subject.status.charAt(0).toUpperCase() + subject.status.slice(1)}
                  </motion.span>
                </div>
              </motion.div>

              <div className="px-8 py-8">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <motion.div
                    className="bg-blue-50 p-5 rounded-xl shadow-sm border border-blue-100"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)" }}
                  >
                    <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                      <BookOpen className="mr-2 h-5 w-5" /> Project Title
                    </h4>
                    <p className="text-gray-800 font-medium text-lg">{subject.title}</p>
                  </motion.div>

                  <motion.div
                    className="bg-blue-50 p-5 rounded-xl shadow-sm border border-blue-100"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)" }}
                  >
                    <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                      <Building className="mr-2 h-5 w-5" /> Host Company
                    </h4>
                    <p className="text-gray-800 font-medium text-lg">{subject.company}</p>
                  </motion.div>

                  <motion.div
                    className="sm:col-span-2 bg-blue-50 p-5 rounded-xl shadow-sm border border-blue-100"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)" }}
                  >
                    <h4 className="text-sm font-medium text-blue-700 mb-3 flex items-center">
                      <Lightbulb className="mr-2 h-5 w-5" /> Project Description
                    </h4>
                    <p className="text-gray-800 whitespace-pre-line">{subject.description}</p>
                  </motion.div>

                  <motion.div
                    className="sm:col-span-2 bg-blue-50 p-5 rounded-xl shadow-sm border border-blue-100"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)" }}
                  >
                    <h4 className="text-sm font-medium text-blue-700 mb-3 flex items-center">
                      <Code className="mr-2 h-5 w-5" /> Technologies
                    </h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {subject.technologies.map((tech, index) => (
                        <motion.span
                          key={index}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200 shadow-sm"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.7 + index * 0.05 }}
                          whileHover={{
                            scale: 1.05,
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            transition: { duration: 0.2 },
                          }}
                        >
                          {tech}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>

                  {/* Display specialities in subject view */}
                  <motion.div
                    className="sm:col-span-2 bg-blue-50 p-5 rounded-xl shadow-sm border border-blue-100"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)" }}
                  >
                    <h4 className="text-sm font-medium text-blue-700 mb-3 flex items-center">
                      <School className="mr-2 h-5 w-5" /> Specialities
                    </h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {subject.speciality.map((spec, index) => (
                        <motion.span
                          key={index}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200 shadow-sm"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.7 + index * 0.05 }}
                          whileHover={{
                            scale: 1.05,
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            transition: { duration: 0.2 },
                          }}
                        >
                          {spec}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>

                  {subject.feedback && (
                    <motion.div
                      className="sm:col-span-2 bg-amber-50 p-5 rounded-xl shadow-sm border border-amber-100"
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(251, 191, 36, 0.1)" }}
                    >
                      <h4 className="text-sm font-medium text-amber-700 mb-3 flex items-center">
                        <Award className="mr-2 h-5 w-5" /> Supervisor Feedback
                      </h4>
                      <p className="text-gray-800 italic border-l-4 border-amber-200 pl-4 py-2">{subject.feedback}</p>
                    </motion.div>
                  )}
                </div>

                {(subject.status === "suggested" || subject.status === "rejected") && (
                  <motion.div
                    className="mt-10 flex justify-end"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(239, 68, 68, 0.2)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDelete}
                      className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-lg text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                    >
                      <Trash2 className="mr-2 h-5 w-5" />
                      Delete Project
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form-view"
              className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-blue-100"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="bg-gradient-to-r from-blue-700 to-blue-500 px-8 py-6"
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-2xl font-semibold text-white flex items-center">
                  <GraduationCap className="mr-3 h-6 w-6" />
                  Submit New Project Proposal
                </h3>
                <p className="mt-2 text-blue-100">Fill out the form below to submit your final year project proposal</p>
              </motion.div>

              <form onSubmit={handleSubmit} className="px-8 py-8">
                <div className="space-y-6">
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label htmlFor="title" className="block text-sm font-medium text-blue-700 mb-2 flex items-center">
                      <BookMarked className="mr-2 h-4 w-4" />
                      Project Title <span className="text-red-500 ml-1">*</span>
                    </label>
                    <motion.input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="block w-full border border-blue-200 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter a descriptive title for your project"
                      required
                      whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)" }}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label htmlFor="company" className="block text-sm font-medium text-blue-700 mb-2 flex items-center">
                      <Building className="mr-2 h-4 w-4" />
                      Host Company <span className="text-red-500 ml-1">*</span>
                    </label>
                    <motion.input
                      type="text"
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="block w-full border border-blue-200 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Where will you complete your project?"
                      required
                      whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)" }}
                    />
                  </motion.div>

                  {/* Multi-select Speciality Field */}
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label htmlFor="speciality" className="block text-sm font-medium text-blue-700 mb-2 flex items-center">
                      <School className="mr-2 h-4 w-4" />
                      Speciality <span className="text-red-500 ml-1">*</span>
                    </label>
                    
                    {/* Selected specialities display */}
                    {formData.speciality.length > 0 && (
                      <motion.div 
                        className="mb-2 flex flex-wrap gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {formData.speciality.map((speciality) => (
                          <motion.span
                            key={speciality}
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200 shadow-sm"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                          >
                            {speciality}
                            <button
                              type="button"
                              onClick={() => {
                                const newSelection = formData.speciality.filter(s => s !== speciality);
                                setFormData({ ...formData, speciality: newSelection });
                              }}
                              className="ml-1.5 inline-flex text-blue-500 hover:text-blue-700"
                              aria-label={`Remove ${speciality}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </motion.span>
                        ))}
                      </motion.div>
                    )}

                    {/* Dropdown */}
                    <div className="relative speciality-dropdown">
                      <motion.button
                        type="button"
                        onClick={() => setShowSpecialityDropdown(!showSpecialityDropdown)}
                        className="w-full flex items-center justify-between border border-blue-200 rounded-lg shadow-sm py-3 px-4 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)" }}
                      >
                        <span className="text-gray-700">
                          {formData.speciality.length === 0 
                            ? 'Select specialities...' 
                            : `${formData.speciality.length} specialit${formData.speciality.length === 1 ? 'y' : 'ies'} selected`}
                        </span>
                        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${showSpecialityDropdown ? 'rotate-180' : ''}`} />
                      </motion.button>

                      <AnimatePresence>
                        {showSpecialityDropdown && (
                          <motion.div 
                            className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            {SPECIALITIES.map((speciality) => (
                              <button
                                key={speciality}
                                type="button"
                                onClick={() => {
                                  const newSelection = formData.speciality.includes(speciality)
                                    ? formData.speciality.filter(s => s !== speciality)
                                    : [...formData.speciality, speciality];
                                  setFormData({ ...formData, speciality: newSelection });
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-center justify-between transition-colors"
                              >
                                <span className="text-gray-900">{speciality}</span>
                                {formData.speciality.includes(speciality) && (
                                  <Check className="h-4 w-4 text-blue-600" />
                                )}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-blue-700 mb-2 flex items-center"
                    >
                      <Lightbulb className="mr-2 h-4 w-4" />
                      Detailed Description <span className="text-red-500 ml-1">*</span>
                    </label>
                    <motion.textarea
                      id="description"
                      rows={5}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="block w-full border border-blue-200 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Describe your project in detail, including objectives and expected outcomes"
                      required
                      whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)" }}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label
                      htmlFor="technologies"
                      className="block text-sm font-medium text-blue-700 mb-2 flex items-center"
                    >
                      <Code className="mr-2 h-4 w-4" />
                      Technologies
                    </label>
                    <div className="flex rounded-lg shadow-sm">
                      <motion.input
                        type="text"
                        id="technologies"
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTechnology())}
                        className="flex-1 block w-full rounded-l-lg border border-blue-200 focus:ring-blue-500 focus:border-blue-500 py-3 px-4"
                        placeholder="Add technologies (e.g., React, Node.js)"
                        whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)" }}
                      />
                      <motion.button
                        type="button"
                        onClick={addTechnology}
                        whileHover={{ backgroundColor: "#dbeafe" }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center px-4 rounded-r-lg border border-l-0 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                      >
                        <Plus className="h-5 w-5" />
                      </motion.button>
                    </div>

                    <AnimatePresence>
                      {formData.technologies && (
                        <motion.div
                          className="mt-3 flex flex-wrap gap-2"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {formData.technologies.split(",").map(
                            (tech, index) =>
                              tech.trim() && (
                                <motion.span
                                  key={index}
                                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200 shadow-sm"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                  whileHover={{
                                    scale: 1.05,
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                    transition: { duration: 0.2 },
                                  }}
                                >
                                  {tech.trim()}
                                  <motion.button
                                    type="button"
                                    onClick={() => {
                                      const techs = formData.technologies
                                        .split(",")
                                        .filter((t) => t.trim() !== tech.trim())
                                        .join(",")
                                      setFormData({ ...formData, technologies: techs })
                                    }}
                                    className="ml-1.5 inline-flex text-blue-500 hover:text-blue-700"
                                    aria-label="Remove technology"
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.8 }}
                                  >
                                    ×
                                  </motion.button>
                                </motion.span>
                              ),
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div
                    className="flex justify-end pt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.2)" }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex justify-center items-center py-3 px-6 border border-transparent shadow-lg text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin mr-2 h-5 w-5" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Submit Project
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default PfeSubmissionPage