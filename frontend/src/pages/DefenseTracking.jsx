import { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CalendarIcon, 
  GraduationCap,
  BookOpenIcon,
  MapPin,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  Shield,
  HourglassIcon,
  Award,
  Medal,
  Star 
} from "lucide-react";

const DefenseTracking = () => {
  const { token, backendUrl } = useContext(AppContext);
  const [defense, setDefense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("details");

useEffect(() => {
  const fetchDefense = async () => {
    try {
      // Get token from localStorage (matching your StudentContext)
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("No authentication token found. Please login again.");
        setLoading(false);
        return;
      }

      const { data } = await axios.get(`${backendUrl}/api/subjects/my-defense`, {
        headers: { 
          Authorization: `Bearer ${token}`, // Use Authorization header instead of custom 'token' header
          'Content-Type': 'application/json'
        },
      });

      if (data.success) {
        setDefense(data.data);
      } else {
        setError(data.message || "No defense information found");
      }
    } catch (err) {
      console.error("Failed to fetch defense:", err);
      setError(err.response?.data?.message || "Failed to load defense information");
    } finally {
      setLoading(false);
    }
  };

  fetchDefense();
}, [backendUrl]);

  // Helper functions for status colors and styles
  const getStatusColor = () => {
    switch (defense?.status) {
      case "scheduled": return "from-emerald-400 via-teal-500 to-green-600";
      case "pending": return "from-amber-300 via-yellow-400 to-orange-500";
      case "rejected": return "from-rose-400 via-red-500 to-pink-600";
      case "completed": return "from-indigo-400 via-blue-500 to-cyan-600";
      default: return "from-gray-400 to-gray-600";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 mt-12">
        <div className="relative">
          <motion.div
            className="h-20 w-20 rounded-full border-t-4 border-b-4 border-indigo-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-0 h-20 w-20 rounded-full border-l-4 border-r-4 border-purple-500"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
          <GraduationCap className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 h-8 w-8" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg shadow-lg mt-8 mb-8"
      >
        <div className="flex items-center">
          <XCircleIcon className="h-8 w-8 text-red-500 mr-4" />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </motion.div>
    );
  }

  // No defense state
  if (!defense) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-blue-600 border-l-4 border-blue-500 p-6 rounded-r-lg shadow-lg mt-8 mb-8"
      >
        <div className="flex items-center">
          <svg className="h-8 w-8 text-blue-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <p className="text-blue-700 font-medium">No defense scheduled yet. Please check back later.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="mt-10 mb-16 w-full max-w-2xl mx-auto  relative"
    >
      {/* Decorative floating elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <Award className="absolute top-20 right-10 h-24 w-24 text-blue-500 opacity-10 animate-pulse" />
        <Medal className="absolute bottom-20 left-10 h-20 w-20 text-purple-500 opacity-10 animate-pulse" style={{ animationDelay: "1s" }} />
        <Star className="absolute top-1/3 left-20 h-16 w-16 text-yellow-500 opacity-10 animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Header with gradient background */}
      <motion.div
        className="relative overflow-hidden rounded-2xl shadow-2xl mb-10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${getStatusColor()} opacity-90 `}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
        />

        {/* Animated particles */}
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full  opacity-20"
            style={{
              width: Math.random() * 30 + 10,
              height: Math.random() * 30 + 10,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}

        <div className="relative z-10 p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center mb-4 md:mb-0 ">
              <motion.div
                className="p-3  rounded-full mr-4"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.8 }}
              >
                <GraduationCap className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Defense Information</h1>
                <p className="text-white text-opacity-90 mt-1">
                  {defense.subject.title} 
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <motion.div
              className="px-4 py-2 rounded-full bg-white bg-opacity-20 backdrop-blur-sm text-white"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
             
            </motion.div>
          </div>

          {/* Date display */}
          <motion.div
            className="mt-6 inline-block px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg"
            whileHover={{ y: -5 }}
          >
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              <p className="font-medium">
                {new Date(defense.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-8">
        <motion.div
          className="flex space-x-2 p-1 bg-gray-100 rounded-xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {["details", "jury", "status"].map((tab) => (
            <motion.button
              key={tab}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === tab ? "bg-white shadow-md text-blue-600" : "text-gray-600"
              }`}
              onClick={() => setActiveTab(tab)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Content based on active tab */}
      <AnimatePresence mode="wait">
        {activeTab === "details" && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Subject Card */}
            <motion.div
              className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-lg border border-gray-100 overflow-hidden relative"
              whileHover={{
                y: -5,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <motion.div
                className="absolute -right-10 -top-10 w-40 h-40 bg-blue-100 rounded-full opacity-50"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />

              <div className="flex items-center mb-4 relative z-10">
                <motion.div
                  className="p-3 bg-blue-100 rounded-full mr-4 shadow-md"
                  whileHover={{ rotate: 15, scale: 1.1 }}
                >
                  <BookOpenIcon className="h-6 w-6 text-blue-600" />
                </motion.div>
                <h2 className="text-xl font-bold text-gray-800">Subject Details</h2>
              </div>

              <div className="ml-16 space-y-3">
                <div className="flex items-center">
                  <span className="text-gray-500 w-24">Title:</span>
                  <span className="font-medium text-gray-800">{defense.subject.title}</span>
                </div>
                <div className="flex items-center">
                </div>
                {defense.subject.department && (
                  <div className="flex items-center">
                    <span className="text-gray-500 w-24">Department:</span>
                    <span className="font-medium text-gray-800">{defense.subject.department}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Additional Info */}
            {defense.notes && (
              <motion.div
                className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-lg border border-gray-100 overflow-hidden relative"
                whileHover={{
                  y: -5,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <motion.div
                  className="absolute -right-10 -top-10 w-40 h-40 bg-yellow-100 rounded-full opacity-50"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, -10, 0],
                  }}
                  transition={{
                    duration: 7,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    delay: 1,
                  }}
                />

                <div className="flex items-center mb-4 relative z-10">
                  <motion.div
                    className="p-3 bg-yellow-100 rounded-full mr-4 shadow-md"
                    whileHover={{ rotate: -15, scale: 1.1 }}
                  >
                    <MapPin className="h-6 w-6 text-yellow-600" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-gray-800">Additional Information</h2>
                </div>

                <div className="ml-16 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                  <p className="text-gray-800 whitespace-pre-line">{defense.notes}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === "jury" && (
          <motion.div
            key="jury"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-lg border border-gray-100 overflow-hidden relative"
              whileHover={{
                y: -5,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <motion.div
                className="absolute -right-10 -top-10 w-40 h-40 bg-purple-100 rounded-full opacity-50"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />

              <div className="flex items-center mb-6 relative z-10">
                <motion.div
                  className="p-3 bg-purple-100 rounded-full mr-4 shadow-md"
                  whileHover={{ rotate: 15, scale: 1.1 }}
                >
                  <UsersIcon className="h-6 w-6 text-purple-600" />
                </motion.div>
                <h2 className="text-xl font-bold text-gray-800">Jury Members</h2>
              </div>

              {defense.jury?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {defense.jury.map((member, index) => (
                    <motion.div
                      key={index}
                      className="bg-white p-4 rounded-xl shadow-md border border-gray-100 relative overflow-hidden"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      whileHover={{
                        y: -5,
                        boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                      }}
                    >
                      <motion.div
                        className="absolute -right-4 -bottom-4 w-16 h-16 bg-purple-100 rounded-full opacity-30"
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "reverse",
                          delay: index * 0.5,
                        }}
                      />

                      <div className="flex items-center">
                        <motion.div
                          className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 text-purple-600 font-bold mr-3 shadow-sm"
                          whileHover={{ scale: 1.2, rotate: 10 }}
                        >
                          {index + 1}
                        </motion.div>
                        <div className="relative z-10">
                          <p className="font-semibold text-gray-800">{member.name}</p>
                          <p className="text-gray-600 text-sm">{member.email}</p>
                          {member.role && (
                            <span className="inline-block mt-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                              {member.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg text-center">
                  <p className="text-gray-600">No jury members assigned yet</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {activeTab === "status" && (
          <motion.div
            key="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Status Timeline */}
            <motion.div
              className={`bg-gradient-to-br from-white to-${defense?.status === "scheduled" ? "green" : 
                                                         defense?.status === "pending" ? "yellow" : 
                                                         defense?.status === "rejected" ? "red" : "blue"}-50 
                          p-6 rounded-xl shadow-lg border border-gray-100 overflow-hidden relative`}
              whileHover={{
                y: -5,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <motion.div
                className="absolute -right-10 -top-10 w-40 h-40 bg-white bg-opacity-50 rounded-full opacity-50"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />

              <div className="flex items-center mb-6 relative z-10">
                <motion.div
                  className={`p-3 rounded-full mr-4 shadow-md ${
                    defense.status === "scheduled" ? "bg-green-100" :
                    defense.status === "pending" ? "bg-yellow-100" :
                    defense.status === "rejected" ? "bg-red-100" : "bg-blue-100"
                  }`}
                  whileHover={{ rotate: 15, scale: 1.1 }}
                >
                  {defense.status === "scheduled" ? <CheckCircleIcon className="h-6 w-6 text-green-500" /> :
                   defense.status === "pending" ? <HourglassIcon className="h-6 w-6 text-yellow-500" /> :
                   defense.status === "rejected" ? <XCircleIcon className="h-6 w-6 text-red-500" /> :
                   <BookOpenIcon className="h-6 w-6 text-blue-500" />}
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Current Status</h2>
                  <p className="text-gray-600">
                    Your defense is currently <span className="font-semibold capitalize">{defense.status}</span>
                  </p>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="ml-16 relative">
                <div className="absolute left-0 top-0 bottom-0 w-1  rounded-full"></div>

                {["created", "pending", "scheduled", "completed"].map((status, index) => {
                  const isActive = (defense.status === "scheduled") || 
                                   (defense.status === "completed" && index < 3) ||
                                   (defense.status === "pending" && index < 2) ||
                                   (defense.status === "created" && index < 1);

                  return (
                    <div key={status} className="relative pl-8 pb-8">
                      <motion.div
                        className={`absolute left-0 transform -translate-x-1/2 w-5 h-5 rounded-full ${
                          isActive ? "bg-green-500" : "bg-gray-300"
                        }`}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: isActive ? [1, 1.2, 1] : 1 }}
                        transition={{
                          duration: 2,
                          repeat: isActive ? Number.POSITIVE_INFINITY : 0,
                          repeatType: "reverse",
                        }}
                      />
                      <div className={`font-medium ${isActive ? "text-gray-800" : "text-gray-500"}`}>
                        <span className="capitalize">{status}</span>
                        {isActive && status === "scheduled" && (
                          <motion.span
                            className="inline-block ml-2"
                            animate={{ rotate: [0, 10, 0, -10, 0] }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                          >
                            ✨
                          </motion.span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {status === "created" && "Defense request created"}
                        {status === "pending" && "Awaiting approval from jury members"}
                        {status === "scheduled" && "Defense has been scheduled"}
                        {status === "completed" && "Defense has been completed"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Acceptance Status */}
            <motion.div
              className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-lg border border-gray-100 overflow-hidden relative"
              whileHover={{
                y: -5,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <motion.div
                className="absolute -right-10 -top-10 w-40 h-40 bg-blue-100 rounded-full opacity-50"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 0],
                }}
                transition={{
                  duration: 7,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />

              <div className="flex items-center mb-6 relative z-10">
                <motion.div
                  className="p-3 bg-blue-500 rounded-full mr-4 shadow-md"
                  whileHover={{ rotate: -15, scale: 1.1 }}
                >
                  <Shield className="h-6 w-6 text-blue-600" />
                </motion.div>
                <h2 className="text-xl font-bold text-gray-800">Acceptance Status</h2>
              </div>

              <div className="space-y-4 ml-16">
                {defense.acceptedBy && defense.acceptedBy.length > 0 && (
                  <motion.div
                    className="flex items-center bg-green-50 px-5 py-3 rounded-lg shadow-sm"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-800">Accepted by:</p>
                      <p className="text-gray-600">{defense.acceptedBy.map(u => u.name).join(", ")}</p>
                    </div>
                  </motion.div>
                )}

                {defense.rejectedBy && (
                  <motion.div
                    className="flex items-center bg-red-50 px-5 py-3 rounded-lg shadow-sm"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <XCircleIcon className="h-5 w-5 text-red-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-800">Rejected by:</p>
                      <p className="text-gray-600">{defense.rejectedBy.name}</p>
                      {defense.rejectedBy.reason && (
                        <p className="text-red-600 text-sm mt-1">Reason: {defense.rejectedBy.reason}</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {(!defense.acceptedBy || defense.acceptedBy.length === 0) && !defense.rejectedBy && (
                  <div className="bg-yellow-50 px-5 py-3 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <HourglassIcon className="h-5 w-5 text-yellow-500 mr-3" />
                      <p className="text-gray-700">Waiting for jury members to respond</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DefenseTracking;
