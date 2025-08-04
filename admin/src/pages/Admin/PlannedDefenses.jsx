"use client";

import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiBook,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEdit,
  FiInfo,
  FiTrash2,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";

const PlannedDefenses = () => {
  const [defenses, setDefenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDefense, setSelectedDefense] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  useEffect(() => {
    const fetchData = async () => {
      const universityId = getUniversityId();
      if (!universityId) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:4000/api/defense/scheduled?universityId=${universityId}`
        );
        if (!response.data?.success)
          throw new Error(response.data?.error || "Invalid response format");
        setDefenses(response.data.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to load defenses");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  const handleDelete = async (defenseId) => {
    if (window.confirm("Are you sure you want to delete this defense?")) {
      try {
        await axios.delete(`http://localhost:4000/api/defense/${defenseId}`);
        setDefenses(defenses.filter((d) => d._id !== defenseId));
        setIsModalOpen(false);
      } catch (err) {
        console.error("Delete error:", err);
        alert("Failed to delete defense");
      }
    }
  };

  const openModal = (defense) => {
    setSelectedDefense(defense);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDefense(null);
  };

  // Get the month and day for grouping
  const getMonthDay = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "Unknown Date";
    }
  };

  // Group defenses by date
  const groupedDefenses = defenses.reduce((groups, defense) => {
    const date = getMonthDay(defense.date);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(defense);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex justify-center items-center p-4">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-blue-800 font-medium">
            Loading scheduled defenses...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex justify-center items-center p-4">
        <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-xl border-l-4 border-red-500">
          <div className="flex items-start">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <FiAlertCircle className="text-red-600 text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-700">
                Error Loading Data
              </h3>
              <p className="text-red-600 mt-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-xl border border-blue-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-3 rounded-xl text-white shadow-md mr-4">
                <FiCalendar className="text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-900">
                  Planned Defenses
                </h1>
                <p className="text-blue-600 mt-1">
                  {defenses.length} scheduled defense
                  {defenses.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <p className="text-slate-500 max-w-2xl">
              View and manage all upcoming thesis defense presentations. Click
              on any defense to see more details or make changes.
            </p>
          </div>
        </div>

        {/* Defense Cards */}
        {defenses.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-xl border border-blue-100">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCalendar className="text-4xl text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-blue-900 mb-2">
              No Planned Defenses
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              There are currently no defense presentations scheduled. Defense
              sessions will appear here once they are planned.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedDefenses).map(([date, defenseGroup]) => (
              <div key={date} className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-blue-100 px-4 py-2 rounded-lg">
                    <h2 className="text-blue-800 font-semibold">{date}</h2>
                  </div>
                  <div className="ml-4 h-px bg-blue-200 flex-grow"></div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {defenseGroup.map((defense) => (
                    <div
                      key={defense._id}
                      onClick={() => openModal(defense)}
                      className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-100 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
                    >
                      <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-white">
                        <h2 className="text-xl font-semibold line-clamp-1 flex items-center">
                          <FiBook className Monograph="mr-2 flex-shrink-0" />
                          <span>
                            {defense.subject?.title || "Untitled Defense"}
                          </span>
                        </h2>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center mb-4">
                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <FiUser className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-slate-700 font-medium">
                              {defense.student?.name || "Unknown Student"}
                            </p>
                            <p className="text-sm text-blue-600">
                              {defense.student?.email || ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <FiClock className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-slate-700">
                              {formatDate(defense.date)}
                            </p>
                            <p className="text-sm text-blue-600">
                              {defense.jury?.length || 1} jury member
                              {defense.jury?.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Defense Details Modal */}
        {isModalOpen && selectedDefense && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white rounded-t-2xl flex justify-between items-start relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold flex items-center">
                    <FiBook className="mr-3" />
                    {selectedDefense.subject?.title || "Defense Details"}
                  </h2>
                  <p className="mt-1 opacity-90">Scheduled Defense</p>
                </div>
                <button
                  onClick={closeModal}
                  className="relative z-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-5 rounded-xl">
                    <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                      <FiUser className="mr-2" /> Student
                    </h3>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="font-medium text-slate-800">
                        {selectedDefense.student?.name || "Unknown"}
                      </p>
                      <p className="text-blue-600">
                        {selectedDefense.student?.email || ""}
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-5 rounded-xl">
                    <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                      <FiClock className="mr-2" /> Date & Time
3                    </h3>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="font-medium text-slate-800">
                        {formatDate(selectedDefense.date)}
                      </p>
                      <p className="text-blue-600">
                        {new Date(selectedDefense.date).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedDefense.jury?.length > 0 && (
                  <div className="bg-blue-50 p-5 rounded-xl">
                    <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                      <FiUsers className="mr-2" /> Jury Members
                    </h3>
                    <div className="space-y-3">
                      {selectedDefense.jury.map((professor) => (
                        <div
                          key={professor._id}
                          className="flex items-center bg-white p-4 rounded-lg shadow-sm"
                        >
                          <div className="bg-blue-100 p-3 rounded-full mr-4">
                            <FiUser className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {professor.name}
                            </p>
                            <p className="text-blue-600">{professor.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                <div className="bg-blue-50 p-5 rounded-xl">
                  <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                    <FiInfo className="mr-2" /> Additional Information
                  </h3>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center mb-2">
                      <FiCheckCircle className="text-green-500 mr-2" />
                      <p className="text-slate-700">
                        Defense ID:{" "}
                        <span className="text-blue-600 font-mono">
                          {selectedDefense._id}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center">
                      <FiCheckCircle className="text-green-500 mr-2" />
                      <p className="text-slate-700">
                        Status:{" "}
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-sm">
                          Scheduled
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => handleDelete(selectedDefense._id)}
                    className="flex items-center px-5 py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <FiTrash2 className="mr-2" /> Delete
                  </button>
                  <button
                    onClick={() =>
                      alert("Modify functionality to be implemented")
                    }
                    className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-colors shadow-sm"
                  >
                    <FiEdit className="mr-2" /> Modify
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlannedDefenses;