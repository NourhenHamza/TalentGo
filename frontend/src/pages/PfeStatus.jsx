import { useState, useEffect, useContext } from "react"
import { StudentContext } from "../context/StudentContext" // Import the context
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  MessageSquare,
  GraduationCap,
  Award,
  School,
  Lightbulb,
  Beaker,
  Microscope,
  BookMarked,
  Plus,
  User,
  Mail,
  Phone,
  Linkedin,
  UserCheck,
} from "lucide-react"

// Fonction pour obtenir les initiales
const getInitials = (name) => {
  if (!name) return "?";
  const names = name.split(" ");
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

const PfeStatus = () => {
  const [subject, setSubject] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Use the context to get the configured apiClient
  const { apiClient } = useContext(StudentContext)

  useEffect(() => {
    fetchMySubject()
  }, [])

  const fetchMySubject = async () => {
    try {
      // Use apiClient instead of axios - this will automatically include the token
      const res = await apiClient.get("/subjects/my-subject")
      if (res.data.data) {
        setSubject(res.data.data)
        console.log("Subject data with supervisor:", res.data.data); // Pour débogage
      }
    } catch (err) {
      console.error("Error loading data", err)
      
      // More detailed error logging
      if (err.response) {
        console.error("Response status:", err.response.status)
        console.error("Response data:", err.response.data)
      }
    } finally {
      setLoading(false)
    }
  }

  // Updated status steps to include supervisor assignment
  const statusSteps = ["Suggested", "Pending", "Approved", "Assigned", "Rejected"]

const getStatusIndex = (status, hasSupervisor) => {
  if (status === "rejected") return 4; // Rejected is always last
  if (status === "assigned" || (status === "approved" && hasSupervisor)) return 3; // Assigned step
  if (status === "approved" && !hasSupervisor) return 2; // Just approved
  if (status === "pending") return 1;
  if (status === "suggested") return 0;
  return 0;
}

  const statusIcons = {
    suggested: <FileText className="h-6 w-6" />,
    pending: <Clock className="h-6 w-6" />,
    approved: <CheckCircle className="h-6 w-6" />,
    assigned: <UserCheck className="h-6 w-6" />,
    rejected: <XCircle className="h-6 w-6" />,
  }

  const statusColors = {
    suggested: "bg-blue-500 text-white",
    pending: "bg-amber-500 text-white",
    approved: "bg-emerald-500 text-white",
    assigned: "bg-green-600 text-white",
    rejected: "bg-rose-500 text-white",
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
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

  // Helper function to get current status display
const getCurrentStatusDisplay = (subject) => {
  if (subject.status === "rejected") return "rejected";
  if (subject.status === "assigned" || (subject.status === "approved" && subject.supervisor)) return "assigned";
  if (subject.status === "approved" && !subject.supervisor) return "approved";
  return subject.status;
}

  return (
    <div className="content-area">
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

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="inline-block mb-4"
          >
            <GraduationCap className="h-16 w-16 text-blue-600 mx-auto" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-3">
            Project <span className="text-blue-500">Status Tracker</span>
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
            Track the progress of your final year project submission with our interactive platform
          </motion.p>
        </motion.div>

        <div className="max-w-5xl mx-auto relative z-10">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                className="w-full max-w-3xl mx-auto p-10 bg-white rounded-3xl shadow-2xl border border-blue-100 flex justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex flex-col items-center justify-center h-40">
                  <motion.div
                    className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full mb-6"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  />
                  <p className="text-blue-800 font-medium text-lg">Loading your project status...</p>
                </div>
              </motion.div>
            ) : subject ? (
              <motion.div
                key="subject"
                className="w-full max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-2xl border border-blue-100"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  className="text-center mb-10"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                    className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-white ${statusColors[getCurrentStatusDisplay(subject)]} shadow-lg mb-4`}
                  >
                    {statusIcons[getCurrentStatusDisplay(subject)]}
                    <span className="ml-2 font-semibold">
                      {getCurrentStatusDisplay(subject) === "assigned" 
                        ? "Assigned to Supervisor" 
                        : getCurrentStatusDisplay(subject).charAt(0).toUpperCase() + getCurrentStatusDisplay(subject).slice(1)}
                    </span>
                  </motion.div>
                  <h3 className="text-2xl font-bold text-blue-900 mb-2">{subject.title}</h3>
                  <motion.p
                    className="text-blue-700 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Submission date:{" "}
                    {new Date(subject.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </motion.p>
                </motion.div>

                <motion.div
                  className="relative py-10 px-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Timeline connector */}
                  <motion.div
                    className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-blue-100"
                    initial={{ height: 0 }}
                    animate={{ height: "100%" }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  />

                  {statusSteps.map((step, index) => {
                    // Skip "Rejected" step if project is not rejected
                    if (step === "Rejected" && subject.status !== "rejected") {
                      return null;
                    }
                    
                    const currentStatusIndex = getStatusIndex(subject.status, subject.supervisor);
                    const isActive = currentStatusIndex >= index;
                    const isCurrent = currentStatusIndex === index;
                    
                    // Map step to status key
                    const statusKey = step.toLowerCase() === "assigned" ? "assigned" : step.toLowerCase();
                    
                    const bgColor = isActive
                      ? statusColors[statusKey] || statusColors.approved
                      : "bg-gray-200 text-gray-500";

                    // Determine icon content
                    let iconContent;
                    if (step === "Assigned" && subject.supervisor) {
                      iconContent = (
                        <span className="font-bold text-lg" title={subject.supervisor.name}>
                          {getInitials(subject.supervisor.name)}
                        </span>
                      );
                    } else if (step === "Approved" && isCurrent && subject.status === 'approved' && !subject.supervisor) {
                      iconContent = statusIcons.approved;
                    } else if (isCurrent) {
                      iconContent = statusIcons[statusKey] || statusIcons.approved;
                    } else if (isActive) {
                      iconContent = <CheckCircle className="h-6 w-6" />;
                    } else {
                      iconContent = <span className="font-semibold">{index + 1}</span>;
                    }

                    return (
                      <motion.div
                        key={index}
                        className="relative flex items-center mb-12 last:mb-0"
                        variants={itemVariants}
                      >
                        <motion.div
                          className="flex flex-col items-end w-1/2 pr-10"
                          initial={{ x: -30, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          whileHover={{ x: -5, transition: { duration: 0.2 } }}
                        >
                          <div className="text-right">
                            <h4 className={`text-lg font-semibold ${isActive ? "text-blue-800" : "text-gray-400"}`}>
                              {step}
                            </h4>
                            <p className={`text-sm ${isActive ? "text-gray-600" : "text-gray-400"}`}>
                              {step === "Suggested" && "Project created and submitted"}
                              {step === "Pending" && "Awaiting supervisor review"}
                              {step === "Approved" && "Project approved by committee"}
                              {step === "Assigned" && "Supervisor assigned to project"}
                              {step === "Rejected" && "Project requires revision"}
                            </p>
                          </div>
                        </motion.div>

                        <motion.div
                          className={`absolute left-1/2 transform -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center ${bgColor} border-4 ${isCurrent ? "border-blue-100" : "border-white"} shadow-lg z-10`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 15,
                            delay: 0.5 + index * 0.2,
                          }}
                          whileHover={{
                            scale: 1.1,
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                            transition: { duration: 0.2 },
                          }}
                        >
                          {iconContent}
                        </motion.div>

                        <motion.div
                          className="w-1/2 pl-10"
                          initial={{ x: 30, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          whileHover={{ x: 5, transition: { duration: 0.2 } }}
                        >
                          {/* Show details for current step */}
                          {isCurrent && (
                            <motion.div
                              className={`p-5 rounded-xl ${
                                step === "Assigned"
                                  ? "bg-green-50 border border-green-100"
                                  : step === "Approved"
                                    ? "bg-emerald-50 border border-emerald-100"
                                    : step === "Rejected"
                                      ? "bg-rose-50 border border-rose-100"
                                      : step === "Pending"
                                        ? "bg-amber-50 border border-amber-100"
                                        : "bg-blue-50 border border-blue-100"
                              } shadow-md`}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.7 }}
                              whileHover={{
                                y: -5,
                                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                                transition: { duration: 0.2 },
                              }}
                            >
                              <div className="flex items-start">
                                <div
                                  className={`mt-0.5 mr-3 rounded-full p-2 ${
                                    step === "Assigned"
                                      ? "bg-green-100 text-green-600"
                                      : step === "Approved"
                                        ? "bg-emerald-100 text-emerald-600"
                                        : step === "Rejected"
                                          ? "bg-rose-100 text-rose-600"
                                          : step === "Pending"
                                            ? "bg-amber-100 text-amber-600"
                                            : "bg-blue-100 text-blue-600"
                                  }`}
                                >
                                  {statusIcons[statusKey] || statusIcons.approved}
                                </div>
                                <div>
                                  <h5
                                    className={`font-semibold text-lg ${
                                      step === "Assigned"
                                        ? "text-green-700"
                                        : step === "Approved"
                                          ? "text-emerald-700"
                                          : step === "Rejected"
                                            ? "text-rose-700"
                                            : step === "Pending"
                                              ? "text-amber-700"
                                              : "text-blue-700"
                                    }`}
                                  >
                                    {step === "Assigned"
                                      ? "Supervisor Assigned"
                                      : step === "Approved"
                                        ? "Project Approved"
                                        : step === "Rejected"
                                          ? "Project Rejected"
                                          : step === "Pending"
                                            ? "Under Review"
                                            : "Project Submitted"}
                                  </h5>
                                  <p className="text-gray-600 text-sm mt-1">
                                    {step === "Assigned"
                                      ? `Your project has been assigned to ${subject.supervisor?.name || 'a supervisor'}`
                                      : step === "Approved"
                                        ? "Your project has been approved by the committee"
                                        : step === "Rejected"
                                          ? "Your project was not approved. Please check the feedback."
                                          : step === "Pending"
                                            ? "Your project is being reviewed by the committee."
                                            : "Your project has been submitted and is awaiting review."}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      </motion.div>
                    )
                  })}
                </motion.div>

                {/* Section pour afficher les informations du superviseur si assigné */}
                {subject.supervisor && (
                  <motion.div
                    className="mt-10 p-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    whileHover={{
                      y: -5,
                      boxShadow: "0 10px 25px -5px rgba(34, 197, 94, 0.15)",
                      transition: { duration: 0.2 },
                    }}
                  >
                    <div className="flex items-center mb-4">
                      <UserCheck className="h-8 w-8 text-green-600 mr-3" />
                      <h4 className="text-xl font-semibold text-green-800">Assigned Supervisor Details</h4>
                    </div>
                    <div className="space-y-3 pl-11">
                      <div className="flex items-center text-gray-700">
                        <User className="h-5 w-5 mr-3 text-green-500" />
                        <span className="font-medium">Name:</span>
                        <span className="ml-2">{subject.supervisor.name}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Mail className="h-5 w-5 mr-3 text-green-500" />
                        <span className="font-medium">Email:</span>
                        <a href={`mailto:${subject.supervisor.email}`} className="ml-2 text-green-600 hover:underline">{subject.supervisor.email}</a>
                      </div>
                      {subject.supervisor.profile?.phone && (
                        <div className="flex items-center text-gray-700">
                          <Phone className="h-5 w-5 mr-3 text-green-500" />
                          <span className="font-medium">Phone:</span>
                          <span className="ml-2">{subject.supervisor.profile.phone}</span>
                        </div>
                      )}
                      {subject.supervisor.profile?.linkedin && (
                        <div className="flex items-center text-gray-700">
                          <Linkedin className="h-5 w-5 mr-3 text-green-500" />
                          <span className="font-medium">LinkedIn:</span>
                          <a href={subject.supervisor.profile.linkedin} target="_blank" rel="noopener noreferrer" className="ml-2 text-green-600 hover:underline">View Profile</a>
                        </div>
                      )}
                      {subject.supervisor.profile?.bio && (
                         <div className="flex items-start text-gray-700 mt-3 pt-3 border-t border-green-100">
                           <User className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-1" />
                           <div>
                            <span className="font-medium">Bio:</span>
                            <p className="ml-2 text-sm italic text-gray-600">{subject.supervisor.profile.bio}</p>
                           </div>
                         </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {subject.feedback && (
                  <motion.div
                    className="mt-10 p-6 rounded-xl bg-yellow-50 border border-yellow-100 shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: subject.supervisor ? 1.0 : 0.8 }}
                    whileHover={{
                      y: -5,
                      boxShadow: "0 10px 25px -5px rgba(234, 179, 8, 0.1)",
                      transition: { duration: 0.2 },
                    }}
                  >
                    <div className="flex items-start">
                      <MessageSquare className="mt-1 mr-4 h-6 w-6 text-yellow-500" />
                      <div>
                        <h4 className="text-lg font-semibold text-yellow-800 mb-3">Supervisor Feedback:</h4>
                        <p className="text-gray-700 border-l-4 border-yellow-200 pl-4 py-2 italic">{subject.feedback}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {subject.status === "rejected" && (
                  <motion.div
                    className="mt-8 bg-rose-50 border border-rose-200 rounded-xl p-5 text-center shadow-md"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, type: "spring", stiffness: 200 }}
                    whileHover={{
                      y: -5,
                      boxShadow: "0 10px 25px -5px rgba(244, 63, 94, 0.1)",
                      transition: { duration: 0.2 },
                    }}
                  >
                    <div className="flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-rose-500 mr-3" />
                      <p className="text-rose-700 font-medium text-lg">
                        Your project has been rejected. Please review the feedback and submit a revised proposal.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Success message for assigned projects */}
                {subject.supervisor && (
                  <motion.div
                    className="mt-8 bg-green-50 border border-green-200 rounded-xl p-5 text-center shadow-md"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
                    whileHover={{
                      y: -5,
                      boxShadow: "0 10px 25px -5px rgba(34, 197, 94, 0.1)",
                      transition: { duration: 0.2 },
                    }}
                  >
                    <div className="flex items-center justify-center">
                      <Award className="h-6 w-6 text-green-500 mr-3" />
                      <p className="text-green-700 font-medium text-lg">
                        Great news! Your project has been assigned to a supervisor. You can now begin your work.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Success message for approved but not yet assigned projects */}
                {subject.status === "approved" && !subject.supervisor && (
                  <motion.div
                    className="mt-8 bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center shadow-md"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
                    whileHover={{
                      y: -5,
                      boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.1)",
                      transition: { duration: 0.2 },
                    }}
                  >
                    <div className="flex items-center justify-center">
                      <Award className="h-6 w-6 text-emerald-500 mr-3" />
                      <p className="text-emerald-700 font-medium text-lg">
                        Congratulations! Your project has been approved. A supervisor will be assigned soon.
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="no-subject"
                className="w-full max-w-3xl mx-auto p-10 bg-white rounded-3xl shadow-2xl border border-blue-100 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="py-10"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                    className="mx-auto mb-6 w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center"
                  >
                    <FileText className="h-10 w-10 text-blue-500" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-blue-900 mb-4">No Project Found</h3>
                  <p className="text-blue-700 text-lg mb-8 max-w-md mx-auto">
                    You have not submitted a final year project proposal yet. Start your academic journey by submitting a
                    project.
                  </p>
                  <motion.a
                    href="/submit"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200"
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.2)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Submit a Project
                  </motion.a>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default PfeStatus