"use client";

import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Use named import
import { useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiClipboard,
  FiClock,
  FiEdit,
  FiInfo,
  FiMail,
  FiRefreshCw,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";
import DefenseCalendarModal from "../../components/DefenseCalendarModal";

const DefenseRequestsList = () => {
  const [defenses, setDefenses] = useState([]);
  const [availableProfessors, setAvailableProfessors] = useState({});
  const [selectedProfessors, setSelectedProfessors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDefense, setSelectedDefense] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [expandedDefenses, setExpandedDefenses] = useState({});

  // Function to get universityId from aToken in localStorage
  const getUniversityId = () => {
    try {
      const token = localStorage.getItem("aToken");
      if (!token) {
        throw new Error("Authentication token not found in local storage");
      }
      const decoded = jwtDecode(token);
      if (!decoded.id) {
        throw new Error("University ID not found in token");
      }
      return decoded.id; // Use 'id' field from token as universityId
    } catch (err) {
      console.error("Error retrieving university ID:", err);
      setError("Error: Please ensure you are logged in with a valid university account");
      return null;
    }
  };

  // Function to get authentication headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('aToken') || localStorage.getItem('uToken') || localStorage.getItem('token')
    
    if (!token) {
      console.error('No authentication token found')
      return {}
    }

    return {
      'utoken': token,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  useEffect(() => {
    const fetchDefenses = async () => {
      const universityId = getUniversityId();
      if (!universityId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true)
        const headers = getAuthHeaders()
        
        if (Object.keys(headers).length === 0) {
          setError('Authentication required. Please login again.')
          setLoading(false)
          return
        }

        const response = await axios.get("http://localhost:4000/api/defense/list", {
          headers
        })
        console.log("API Response:", response.data)

        if (response.data.success) {
          // Process defenses with proper fallbacks
          const pendingDefenses = response.data.defenses
            .filter((def) => def.status === "pending")
            .map((def) => {
              // Handle student data
              let studentData;
              if (!def.student) {
                studentData = { _id: "unknown", name: "Unknown Student", email: "" };
              } else if (typeof def.student === "string") {
                studentData = { _id: def.student, name: "Unknown Student", email: "" };
              } else {
                studentData = def.student;
              }

              // Handle subject data
              let subjectData;
              if (!def.subject) {
                subjectData = { _id: "unknown", title: "Unknown Subject", description: "" };
              } else if (typeof def.subject === "string") {
                subjectData = { _id: def.subject, title: "Unknown Subject", description: "" };
              } else {
                subjectData = def.subject;
              }

              return {
                ...def,
                student: studentData,
                subject: subjectData,
              };
            });

          setDefenses(pendingDefenses);

          // Initialize expanded state
          const expandedState = {};
          pendingDefenses.forEach((def) => {
            expandedState[def._id] = false;
          });
          setExpandedDefenses(expandedState);

          // Fetch available professors for each defense
          for (const defense of pendingDefenses) {
            try {
              // Safely parse the date - handle potential invalid dates
              const defenseDate = new Date(defense.date);

              // Check if the date is valid before proceeding
              if (isNaN(defenseDate.getTime())) {
                console.error(`Invalid date for defense ${defense._id}: ${defense.date}`);
                continue; // Skip this defense for professor availability check
              }

              const date = defenseDate.toISOString().split("T")[0];
              const hours = defenseDate.getUTCHours().toString().padStart(2, "0");
              const minutes = defenseDate.getUTCMinutes().toString().padStart(2, "0");
              const time = `${hours}:${minutes}`;
              fetchAvailableProfessors(defense._id, date, time);
            } catch (dateError) {
              console.error(`Error processing date for defense ${defense._id}:`, dateError, defense.date);
              // Continue with next defense instead of breaking the entire process
            }
          }
        } else {
          setError("Error fetching defenses");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error:", err)
        if (err.response?.status === 401) {
          setError("Authentication failed. Please login again.")
        } else {
          setError("Server connection error")
        }
        setLoading(false)
      }
    };

    fetchDefenses();
  }, []);

  const toggleExpand = (defenseId) => {
    setExpandedDefenses((prev) => ({
      ...prev,
      [defenseId]: !prev[defenseId],
    }));
  };

  const fetchAvailableProfessors = async (defenseId, date, time) => {
    try {
      const headers = getAuthHeaders()
      
      if (Object.keys(headers).length === 0) {
        console.error('No authentication token for fetching professors')
        return
      }

      const response = await axios.get(
        `http://localhost:4000/api/defense/professoravailable?defenseId=${defenseId}&date=${date}&time=${time}`,
        { headers }
      )
      if (response.data.success) {
        setAvailableProfessors((prev) => ({
          ...prev,
          [defenseId]: response.data.data,
        }));
      }
    } catch (err) {
      console.error(`Error fetching professors for defense ${defenseId}:`, err)
      if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.")
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not set";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      const options = { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" };
      return date.toLocaleDateString("en-US", options);
    } catch {
      return "Invalid date";
    }
  };

  const toggleProfessorSelection = (defenseId, professorId) => {
    setSelectedProfessors((prev) => {
      const newSelection = { ...prev };
      if (!newSelection[defenseId]) {
        newSelection[defenseId] = [];
      }

      if (newSelection[defenseId].includes(professorId)) {
        newSelection[defenseId] = newSelection[defenseId].filter((id) => id !== professorId);
      } else {
        newSelection[defenseId] = [...newSelection[defenseId], professorId];
      }
      return newSelection;
    });
  };

  const isProfessorSelected = (defenseId, professorId) => {
    return selectedProfessors[defenseId]?.includes(professorId) || false;
  };

  const submitProfessors = async (defenseId) => {
    try {
      setSubmitting(true)
      const headers = getAuthHeaders()
      
      if (Object.keys(headers).length === 0) {
        setError('Authentication required. Please login again.')
        return
      }

      const response = await axios.post("http://localhost:4000/api/defense/assignProfessors", {
        defenseId,
        professorIds: selectedProfessors[defenseId] || [],
      }, { headers })

      if (response.data.success) {
        setSuccessMessage("Professors assigned successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.")
      } else {
        setError(err.response?.data?.message || "Failed to assign professors")
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptDefense = async (defenseId) => {
    try {
      setSubmitting(true)
      const headers = getAuthHeaders()
      
      if (Object.keys(headers).length === 0) {
        setError('Authentication required. Please login again.')
        return
      }

      const response = await axios.put(`http://localhost:4000/api/defense/${defenseId}/accept`, {}, {
        headers
      })

      if (response.data.success) {
        setSuccessMessage("Defense accepted successfully!");
        setDefenses((prev) => prev.filter((def) => def._id !== defenseId));
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.")
      } else {
        const errorMessage = err.response?.data?.message || "Failed to accept defense"
        setError(errorMessage)
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefuseDefense = async (defenseId) => {
    try {
      setSubmitting(true)
      const headers = getAuthHeaders()
      
      if (Object.keys(headers).length === 0) {
        setError('Authentication required. Please login again.')
        return
      }

      const response = await axios.put(`http://localhost:4000/api/defense/${defenseId}/reject`, {
        reason: "Rejected by admin",
      }, { headers })

      if (response.data.success) {
        setSuccessMessage("Defense refused successfully!");
        setDefenses((prev) => prev.filter((def) => def._id !== defenseId));
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.")
      } else {
        const errorMessage = err.response?.data?.message || "Failed to refuse defense"
        setError(errorMessage)
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (defense) => {
    setSelectedDefense(defense);
    setModalOpen(true);
  };

  const handleDateChange = (defenseId, date, time) => {
    try {
      // Validate the date and time format before creating a new Date
      if (!date || !time) {
        console.error("Invalid date or time format");
        return;
      }

      const newDate = new Date(`${date}T${time}:00`);
      if (isNaN(newDate.getTime())) {
        console.error("Invalid date created from", date, time);
        return;
      }

      setDefenses((prev) =>
        prev.map((def) => {
          if (def._id === defenseId) {
            return { ...def, date: newDate.toISOString() };
          }
          return def;
        })
      );

      setTimeout(() => {
        fetchAvailableProfessors(defenseId, date, time);
      }, 1000);
    } catch (err) {
      console.error("Error updating date:", err);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex justify-center items-center p-4">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-blue-800 font-medium">Loading defense requests...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex justify-center items-center p-4">
        <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-xl border-l-4 border-red-500">
          <div className="flex items-start">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <FiAlertCircle className="text-red-600 text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-700">Error Loading Data</h3>
              <p className="text-red-600 mt-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <FiRefreshCw className="mr-2" /> Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden border border-blue-100">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20"></div>
            <div className="relative z-10 flex items-center">
              <div className="bg-white/20 p-3 rounded-xl mr-4">
                <FiClipboard className="text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Defense Requests</h1>
                <p className="opacity-90 mt-1">
                  {defenses.length} pending request{defenses.length !== 1 ? "s" : ""} awaiting review
                </p>
              </div>
            </div>
          </div>

          {successMessage && (
            <div className="mx-8 my-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <FiCheckCircle className="text-green-600 text-xl" />
              </div>
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          )}

          {defenses.length === 0 ? (
            <div className="p-16 text-center">
              <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCalendar className="text-4xl text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-2">No Pending Requests</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                There are currently no defense requests awaiting review. New requests will appear here when submitted.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-blue-100">
              {defenses.map((defense) => (
                <div
                  key={defense._id}
                  className="p-6 hover:bg-blue-50/30 transition-colors duration-200 border-l-4 border-transparent hover:border-blue-400"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl text-white shadow-md">
                          <FiCalendar className="text-xl" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-blue-900">
                            {defense.subject?.title || "No Subject Title"}
                          </h2>
                          <p className="text-slate-600 mt-1">
                            {defense.subject?.description || "No description available"}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-4">
                            <div className="flex items-center text-sm bg-blue-50 px-3 py-1.5 rounded-full">
                              <FiUser className="mr-2 text-blue-500" />
                              <span className="font-medium text-blue-800">
                                {defense.student?.name || "Unknown Student"}
                              </span>
                            </div>
                            <div className="flex items-center text-sm bg-blue-50 px-3 py-1.5 rounded-full">
                              <FiMail className="mr-2 text-blue-500" />
                              <span className="font-medium text-blue-800">{defense.student?.email || "No email"}</span>
                            </div>
                            <div className="flex items-center text-sm bg-blue-50 px-3 py-1.5 rounded-full">
                              <FiClock className="mr-2 text-blue-500" />
                              <span className="font-medium text-blue-800">{formatDate(defense.date)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-3">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium uppercase tracking-wider">
                        {defense.status}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptDefense(defense._id)}
                          disabled={submitting}
                          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center transition-all duration-200 disabled:opacity-70"
                        >
                          {submitting ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <FiCheck className="mr-2" /> Accept
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleRefuseDefense(defense._id)}
                          disabled={submitting}
                          className="bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center transition-all duration-200 disabled:opacity-70"
                        >
                          {submitting ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <FiX className="mr-2" /> Refuse
                            </>
                          )}
                        </button>
                      </div>
                      <button
                        onClick={() => toggleExpand(defense._id)}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {expandedDefenses[defense._id] ? (
                          <>
                            <FiChevronUp className="mr-2" />
                            Hide available professors
                          </>
                        ) : (
                          <>
                            <FiChevronDown className="mr-2" />
                            Show available professors ({availableProfessors[defense._id]?.length || 0})
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {expandedDefenses[defense._id] && (
                    <div className="mt-6 ml-16 border-l-2 border-blue-200 pl-6">
                      <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                        <div className="flex items-center mb-4">
                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <FiUsers className="text-blue-600" />
                          </div>
                          <h3 className="font-semibold text-blue-900 text-lg">Available Professors</h3>
                        </div>

                        {availableProfessors[defense._id] ? (
                          availableProfessors[defense._id].length > 0 ? (
                            <div className="space-y-3">
                              {availableProfessors[defense._id].map((prof) => (
                                <div
                                  key={prof._id}
                                  className={`flex justify-between items-center p-4 rounded-xl border ${
                                    isProfessorSelected(defense._id, prof._id)
                                      ? "border-blue-500 bg-blue-50"
                                      : "border-blue-100 bg-white"
                                  } transition-all duration-200 hover:shadow-md`}
                                >
                                  <div className="flex items-center">
                                    <div
                                      className={`p-3 rounded-full mr-4 ${
                                        isProfessorSelected(defense._id, prof._id)
                                          ? "bg-blue-100 text-blue-600"
                                          : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      <FiUser className="text-lg" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-slate-800">{prof.name}</p>
                                      <p className="text-sm text-blue-600">{prof.email}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <span className="text-xs bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full font-medium">
                                      {prof.currentDefenses}/{prof.maxDefenses} defenses
                                    </span>
                                    <button
                                      onClick={() => toggleProfessorSelection(defense._id, prof._id)}
                                      className={`p-2 rounded-full transition-colors ${
                                        isProfessorSelected(defense._id, prof._id)
                                          ? "bg-green-100 text-green-600 hover:bg-green-200"
                                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                      }`}
                                    >
                                      {isProfessorSelected(defense._id, prof._id) ? <FiCheck /> : <FiUser />}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center">
                              <div className="bg-red-100 p-2 rounded-full mr-3">
                                <FiAlertCircle className="text-red-600" />
                              </div>
                              <p className="text-red-800">No professors available for this date and time.</p>
                            </div>
                          )
                        ) : (
                          <div className="flex justify-center py-6">
                            <div className="relative w-10 h-10">
                              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
                              <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
                            </div>
                          </div>
                        )}

                        {selectedProfessors[defense._id]?.length > 0 && (
                          <div className="mt-6 flex justify-end space-x-3">
                            <button
                              onClick={() =>
                                setSelectedProfessors((prev) => ({
                                  ...prev,
                                  [defense._id]: [],
                                }))
                              }
                              className="flex items-center text-sm text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <FiX className="mr-2" /> Clear Selection
                            </button>
                            <button
                              onClick={() => submitProfessors(defense._id)}
                              disabled={submitting}
                              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center transition-all duration-200 disabled:opacity-70"
                            >
                              {submitting ? (
                                <>
                                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                  Assigning...
                                </>
                              ) : (
                                <>
                                  <FiCheck className="mr-2" /> Assign ({selectedProfessors[defense._id].length})
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        <div className="mt-6 pt-4 border-t border-blue-100">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center text-sm text-blue-600">
                              <FiInfo className="mr-2" />
                              <span>Current date: {formatDate(defense.date)}</span>
                            </div>
                            <button
                              onClick={() => openModal(defense)}
                              className="bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center transition-all duration-200"
                            >
                              <FiEdit className="mr-2" />
                              Change date
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <DefenseCalendarModal
          defense={selectedDefense}
          onClose={() => setModalOpen(false)}
          onDateChange={handleDateChange}
        />
      )}
    </div>
  );
};

export default DefenseRequestsList;
