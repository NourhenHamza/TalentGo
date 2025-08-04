"use client";

import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import {
    FiAlertCircle,
    FiCalendar,
    FiCheckCircle,
    FiChevronDown,
    FiChevronUp,
    FiClipboard,
    FiMail,
    FiRefreshCw,
    FiUser,
    FiUsers,
} from "react-icons/fi";

const CompanyStudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [expandedStudents, setExpandedStudents] = useState({});
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [partnershipLoading, setPartnershipLoading] = useState(false);
  const [partnershipStatus, setPartnershipStatus] = useState(null); // "pending", "accepted", or null
  const [partnershipId, setPartnershipId] = useState(null); // Partnership ID
  const [partnershipRole, setPartnershipRole] = useState(null); // "initiator", "target", or null
  const [partnershipMessage, setPartnershipMessage] = useState(null); // Partnership request message
  const [partnershipInitiatorType, setPartnershipInitiatorType] = useState(null); // initiator_type
  const [partnershipTargetType, setPartnershipTargetType] = useState(null); // target_type
  const [partnershipInitiatorId, setPartnershipInitiatorId] = useState(null); // initiator_id
  const [partnershipTargetId, setPartnershipTargetId] = useState(null); // target_id

  // Function to get companyId from cToken in localStorage
  const getCompanyId = () => {
    try {
      const token = localStorage.getItem("cToken");
      if (!token) {
        throw new Error("Authentication token not found in local storage");
      }
      const decoded = jwtDecode(token);
      if (!decoded.id) {
        throw new Error("Company ID not found in token");
      }
      console.log("Decoded token:", { id: decoded.id, role: decoded.role }); // Debug log
      return decoded.id;
    } catch (err) {
      console.error("Error retrieving company ID:", err);
      setError("Error: Please ensure you are logged in with a valid company account");
      return null;
    }
  };

  // Function to get authentication headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("cToken");
    if (!token) {
      console.error("No authentication token found");
      setError("Authentication required. Please login again.");
      return {};
    }
    return {
      ctoken: token,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // Fetch students and their applications
  useEffect(() => {
    const fetchStudentsAndApplications = async () => {
      const companyId = getCompanyId();
      if (!companyId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const headers = getAuthHeaders();

        if (Object.keys(headers).length === 0) {
          setError("Authentication required. Please login again.");
          setLoading(false);
          return;
        }

        const studentResponse = await axios.get("http://localhost:4000/api/companies/students", {
          headers,
        });

        if (studentResponse.data.success) {
          let fetchedStudents = studentResponse.data.students;

          fetchedStudents = fetchedStudents.map((student) => ({
            ...student,
            name: student.name || "Unknown Student",
            email: student.email || "No email",
            cin: student.cin || "No CIN",
            dateOfBirth: student.dateOfBirth || null,
            studyLevel: student.studyLevel || "Unknown",
            specialization: student.specialization || "Unknown",
            currentClass: student.currentClass || "Unknown",
            academicYear: student.academicYear || "Unknown",
            university: {
              _id: student.university?._id || null,
              name: student.university?.name || "Unknown University",
              city: student.university?.city || "Unknown City",
            },
            profile: {
              phone: student.profile?.phone || "No phone",
              city: student.profile?.city || "Unknown",
              address: student.profile?.address || {},
              linkedin: student.profile?.linkedin || "No LinkedIn",
              avatar: student.profile?.avatar || "default-avatar.jpg",
            },
            studentData: {
              pfeStatus: student.studentData?.pfeStatus || "not_started",
              studentId: student.studentData?.studentId || "Unknown",
              gpa: student.studentData?.gpa || null,
            },
            applications: student.applications.map((app) => ({
              _id: app._id,
              offreTitle: app.offreTitle || "Unknown Offer",
              status: app.status,
              appliedAt: app.appliedAt,
              confirmed: app.confirmed,
              confirmedAt: app.confirmedAt,
              testResult: app.testResult
                ? {
                    score: app.testResult.score || "N/A",
                    passed: app.testResult.passed || false,
                    completedAt: app.testResult.completedAt || null,
                  }
                : null,
              coverLetter: app.coverLetter || "No cover letter",
              notes: app.notes || "No notes",
            })),
          }));

          setStudents(fetchedStudents);

          const expandedState = {};
          fetchedStudents.forEach((student) => {
            expandedState[student._id] = false;
          });
          setExpandedStudents(expandedState);
        } else {
          setError("Error fetching students: " + studentResponse.data.message);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching students:", err);
        if (err.response?.status === 401) {
          setError("Authentication failed: " + (err.response.data.message || "Please login again."));
        } else {
          setError("Server connection error: " + (err.response?.data.message || err.message || "Unknown error"));
        }
        setLoading(false);
      }
    };

    fetchStudentsAndApplications();
  }, []);

  // Fetch university details and check partnership status
  const fetchUniversityDetails = async (universityId) => {
    try {
      const headers = getAuthHeaders();
      const companyId = getCompanyId();
      if (!companyId) {
        setError("Authentication required.");
        return;
      }

      // Fetch university details
      const response = await axios.get(`http://localhost:4000/api/universities/${universityId}`, {
        headers,
      });
      if (response.data.success) {
        setSelectedUniversity(response.data.university);
        setIsModalOpen(true);

        // Check for existing partnership
        const partnershipResponse = await axios.post(
          "http://localhost:4000/api/partnerships/request",
          {
            initiator_type: "Company",
            initiator_id: companyId,
            target_type: "University",
            target_id: universityId,
          },
          { headers }
        );

        console.log("Partnership response:", partnershipResponse.data); // Debug log

        if (partnershipResponse.data.success && partnershipResponse.data.partnership) {
          setPartnershipStatus(partnershipResponse.data.partnership.status);
          setPartnershipId(partnershipResponse.data.partnership._id);
          setPartnershipRole(partnershipResponse.data.role);
          setPartnershipMessage(partnershipResponse.data.partnership.request_message || null);
          setPartnershipInitiatorType(partnershipResponse.data.partnership.initiator_type);
          setPartnershipTargetType(partnershipResponse.data.partnership.target_type);
          setPartnershipInitiatorId(partnershipResponse.data.partnership.initiator_id);
          setPartnershipTargetId(partnershipResponse.data.partnership.target_id);
        } else {
          setPartnershipStatus(null);
          setPartnershipId(null);
          setPartnershipRole(null);
          setPartnershipMessage(null);
          setPartnershipInitiatorType(null);
          setPartnershipTargetType(null);
          setPartnershipInitiatorId(null);
          setPartnershipTargetId(null);
        }

        console.log("Partnership state set:", {
          status: partnershipResponse.data.partnership?.status,
          id: partnershipResponse.data.partnership?._id,
          role: partnershipResponse.data.role,
          message: partnershipResponse.data.partnership?.request_message,
          initiator_type: partnershipResponse.data.partnership?.initiator_type,
          target_type: partnershipResponse.data.partnership?.target_type,
          initiator_id: partnershipResponse.data.partnership?.initiator_id,
          target_id: partnershipResponse.data.partnership?.target_id,
        }); // Debug log
      } else {
        setError("Error fetching university details: " + response.data.message);
      }
    } catch (err) {
      console.error("Error fetching university:", err);
      setError("Error fetching university details: " + (err.response?.data.message || err.message));
    }
  };

  // Send partnership request
  const sendPartnershipRequest = async () => {
    if (!selectedUniversity?._id) return;

    setPartnershipLoading(true);
    try {
      const companyId = getCompanyId();
      if (!companyId) {
        setError("Authentication required.");
        setPartnershipLoading(false);
        return;
      }

      const headers = getAuthHeaders();
      const response = await axios.post(
        "http://localhost:4000/api/partnerships/request",
        {
          initiator_type: "Company",
          initiator_id: companyId,
          target_type: "University",
          target_id: selectedUniversity._id,
          request_message: `Partnership request from company to ${selectedUniversity.name}`,
        },
        { headers }
      );

      if (response.data.success) {
        setSuccessMessage("Partnership request sent successfully!");
        setTimeout(() => setSuccessMessage(""), 5000);
        setPartnershipStatus(response.data.partnership?.status || "pending");
        setPartnershipId(response.data.partnership?._id || null);
        setPartnershipRole(response.data.role || "initiator");
        setPartnershipMessage(response.data.partnership?.request_message || null);
        setPartnershipInitiatorType(response.data.partnership?.initiator_type || "Company");
        setPartnershipTargetType(response.data.partnership?.target_type || "University");
        setPartnershipInitiatorId(response.data.partnership?.initiator_id || companyId);
        setPartnershipTargetId(response.data.partnership?.target_id || selectedUniversity._id);
        setIsModalOpen(true); // Keep modal open to reflect button change
      } else {
        setError("Error sending partnership request: " + response.data.message);
      }
    } catch (err) {
      console.error("Error sending partnership request:", err);
      setError("Error sending partnership request: " + (err.response?.data.message || err.message));
    } finally {
      setPartnershipLoading(false);
    }
  };

  // Remove partnership or request
  const removePartnershipRequest = async () => {
    if (!partnershipId) return;

    if (!confirm("Are you sure you want to remove this partnership request or partnership?")) return;

    setPartnershipLoading(true);
    try {
      const headers = getAuthHeaders();
      const response = await axios.delete(`http://localhost:4000/api/partnerships/${partnershipId}`, {
        headers,
      });

      if (response.data.success) {
        setSuccessMessage(response.data.message);
        setTimeout(() => setSuccessMessage(""), 5000);
        setPartnershipStatus(null);
        setPartnershipId(null);
        setPartnershipRole(null);
        setPartnershipMessage(null);
        setPartnershipInitiatorType(null);
        setPartnershipTargetType(null);
        setPartnershipInitiatorId(null);
        setPartnershipTargetId(null);
      } else {
        setError("Error removing partnership: " + (response.data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error removing partnership:", err);
      setError("Error removing partnership: " + (err.response?.data.message || err.message));
    } finally {
      setPartnershipLoading(false);
    }
  };

  // Accept or reject partnership request
  const handlePartnershipRequest = async (action) => {
    if (!partnershipId || partnershipTargetType !== "Company" || partnershipTargetId !== getCompanyId()) return;

    if (!confirm(`Are you sure you want to ${action} this partnership request?`)) return;

    setPartnershipLoading(true);
    try {
      const headers = getAuthHeaders();
      const response = await axios.patch(
        `http://localhost:4000/api/partnerships/${partnershipId}`,
        { action }, // 'accept' or 'reject'
        { headers }
      );

      if (response.data.success) {
        setSuccessMessage(response.data.message);
        setTimeout(() => setSuccessMessage(""), 5000);
        if (action === "accept") {
          setPartnershipStatus("accepted");
        } else {
          setPartnershipStatus(null);
          setPartnershipId(null);
          setPartnershipRole(null);
          setPartnershipMessage(null);
          setPartnershipInitiatorType(null);
          setPartnershipTargetType(null);
          setPartnershipInitiatorId(null);
          setPartnershipTargetId(null);
        }
      } else {
        setError(`Error ${action}ing partnership request: ` + (response.data.message || "Unknown error"));
      }
    } catch (err) {
      console.error(`Error ${action}ing partnership request:`, err);
      setError(`Error ${action}ing partnership request: ` + (err.response?.data.message || err.message));
    } finally {
      setPartnershipLoading(false);
    }
  };

  const toggleExpand = (studentId) => {
    setExpandedStudents((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not set";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      const options = { day: "2-digit", month: "2-digit", year: "numeric" };
      return date.toLocaleDateString("en-US", options);
    } catch {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex justify-center items-center p-4">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-blue-800 font-medium">Loading students...</p>
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden border border-blue-100">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20"></div>
            <div className="relative z-10 flex items-center">
              <div className="bg-white/20 p-3 rounded-xl mr-4">
                <FiUsers className="text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Confirmed Students</h1>
                <p className="opacity-90 mt-1">
                  {students.length} student{students.length !== 1 ? "s" : ""} with confirmed applications
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

          {students.length === 0 ? (
            <div className="p-16 text-center">
              <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiUsers className="text-4xl text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-2">No Students Found</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                There are currently no students with confirmed applications for your company.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-blue-100">
              {students.map((student) => (
                <div
                  key={student._id}
                  className="p-6 hover:bg-blue-50/30 transition-colors duration-200 border-l-4 border-transparent hover:border-blue-400"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl text-white shadow-md">
                          <FiUser className="text-xl" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-blue-900">{student.name}</h2>
                          <div className="mt-4 flex flex-wrap gap-4">
                            <div className="flex items-center text-sm bg-blue-50 px-3 py-1.5 rounded-full">
                              <FiMail className="mr-2 text-blue-500" />
                              <span className="font-medium text-blue-800">{student.email}</span>
                            </div>
                            <div className="flex items-center text-sm bg-blue-50 px-3 py-1.5 rounded-full">
                              <FiUser className="mr-2 text-blue-500" />
                              <span className="font-medium text-blue-800">CIN: {student.cin}</span>
                            </div>
                            <div className="flex items-center text-sm bg-blue-50 px-3 py-1.5 rounded-full">
                              <FiCalendar className="mr-2 text-blue-500" />
                              <span className="font-medium text-blue-800">
                                Date of Birth: {formatDate(student.dateOfBirth)}
                              </span>
                            </div>
                            <div className="flex items-center text-sm bg-blue-50 px-3 py-1.5 rounded-full">
                              <FiClipboard className="mr-2 text-blue-500" />
                              <span
                                className="font-medium text-blue-800 hover:text-blue-600 cursor-pointer underline"
                                onClick={() => student.university._id && fetchUniversityDetails(student.university._id)}
                              >
                                University: {student.university.name}, {student.university.city}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-3">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium uppercase tracking-wider">
                        {student.studentData.pfeStatus}
                      </span>
                      <button
                        onClick={() => toggleExpand(student._id)}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {expandedStudents[student._id] ? (
                          <>
                            <FiChevronUp className="mr-2" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <FiChevronDown className="mr-2" />
                            Show Details
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {expandedStudents[student._id] && (
                    <div className="mt-6 ml-16 border-l-2 border-blue-200 pl-6">
                      <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                        <h3 className="font-semibold text-blue-900 text-lg mb-4">Student Details</h3>
                        <div className="space-y-3">
                          <p>
                            <strong>Student ID:</strong> {student.studentData.studentId}
                          </p>
                          <p>
                            <strong>Study Level:</strong> {student.studyLevel}
                          </p>
                          <p>
                            <strong>Specialization:</strong> {student.specialization}
                          </p>
                          <p>
                            <strong>Current Class:</strong> {student.currentClass}
                          </p>
                          <p>
                            <strong>Academic Year:</strong> {student.academicYear}
                          </p>
                          <p>
                            <strong>Phone:</strong> {student.profile.phone}
                          </p>
                          <p>
                            <strong>City:</strong> {student.profile.city}
                          </p>
                          {student.studentData.gpa && (
                            <p>
                              <strong>GPA:</strong> {student.studentData.gpa}
                            </p>
                          )}
                          <p>
                            <strong>Account Status:</strong> {student.accountStatus}
                          </p>
                        </div>

                        {student.applications.length > 0 && (
                          <div className="mt-6">
                            <h3 className="font-semibold text-blue-900 text-lg mb-4">Applications</h3>
                            {student.applications.map((app) => (
                              <div
                                key={app._id}
                                className="p-4 mb-4 rounded-xl border border-blue-100 bg-white hover:shadow-md transition-all duration-200"
                              >
                                <p>
                                  <strong>Offer Title:</strong> {app.offreTitle}
                                </p>
                                <p>
                                  <strong>Status:</strong> {app.status}
                                </p>
                                <p>
                                  <strong>Applied At:</strong> {formatDate(app.appliedAt)}
                                </p>
                                {app.confirmed && (
                                  <p>
                                    <strong>Confirmed At:</strong> {formatDate(app.confirmedAt)}
                                  </p>
                                )}
                                {app.testResult && (
                                  <div>
                                    <p>
                                      <strong>Test Score:</strong> {app.testResult.score}
                                    </p>
                                    <p>
                                      <strong>Test Passed:</strong> {app.testResult.passed ? "Yes" : "No"}
                                    </p>
                                    {app.testResult.completedAt && (
                                      <p>
                                        <strong>Test Completed At:</strong>{" "}
                                        {formatDate(app.testResult.completedAt)}
                                      </p>
                                    )}
                                  </div>
                                )}
                                {app.coverLetter && (
                                  <p>
                                    <strong>Cover Letter:</strong> {app.coverLetter}
                                  </p>
                                )}
                                {app.notes && (
                                  <p>
                                    <strong>Notes:</strong> {app.notes}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* University Details Modal */}
        {isModalOpen && selectedUniversity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 relative">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setPartnershipStatus(null);
                  setPartnershipId(null);
                  setPartnershipRole(null);
                  setPartnershipMessage(null);
                  setPartnershipInitiatorType(null);
                  setPartnershipTargetType(null);
                  setPartnershipInitiatorId(null);
                  setPartnershipTargetId(null);
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">{selectedUniversity.name}</h2>
              <div className="space-y-3">
                <p><strong>City:</strong> {selectedUniversity.address?.city || "Unknown"}</p>
                <p><strong>Address:</strong> {selectedUniversity.address?.street || "No address provided"}</p>
                <p><strong>Zip Code:</strong> {selectedUniversity.address?.zipCode || "N/A"}</p>
                <p><strong>Country:</strong> {selectedUniversity.address?.country || "N/A"}</p>
                <p><strong>Contact Person:</strong> {selectedUniversity.contactPerson?.name || "N/A"}</p>
                <p><strong>Contact Email:</strong> {selectedUniversity.contactPerson?.email || "N/A"}</p>
                <p><strong>Contact Phone:</strong> {selectedUniversity.contactPerson?.phone || "N/A"}</p>
                <p><strong>Description:</strong> {selectedUniversity.description || "No description available"}</p>
                {partnershipStatus && (
                  <p><strong>Partnership Status:</strong> {partnershipStatus} ({partnershipRole})</p>
                )}
                {partnershipStatus === "pending" && partnershipTargetType === "Company" && partnershipTargetId === getCompanyId() && partnershipMessage && (
                  <p><strong>Request Message:</strong> {partnershipMessage}</p>
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                {partnershipStatus === "pending" && partnershipTargetType === "Company" && partnershipTargetId === getCompanyId() ? (
                  <>
                    <button
                      onClick={() => handlePartnershipRequest("accept")}
                      disabled={partnershipLoading}
                      className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center ${
                        partnershipLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {partnershipLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                          Processing...
                        </>
                      ) : (
                        "Accept Partnership Request"
                      )}
                    </button>
                    <button
                      onClick={() => handlePartnershipRequest("reject")}
                      disabled={partnershipLoading}
                      className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center ${
                        partnershipLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {partnershipLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                          Processing...
                        </>
                      ) : (
                        "Reject Partnership Request"
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={partnershipStatus === "accepted" || (partnershipStatus === "pending" && partnershipInitiatorType === "Company" && partnershipInitiatorId === getCompanyId()) ? removePartnershipRequest : sendPartnershipRequest}
                    disabled={partnershipLoading}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center ${
                      partnershipLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {partnershipLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Processing...
                      </>
                    ) : partnershipStatus === "pending" && partnershipInitiatorType === "Company" && partnershipInitiatorId === getCompanyId() ? (
                      "Remove Request"
                    ) : partnershipStatus === "accepted" ? (
                      "Remove Partnership"
                    ) : (
                      "Send Partnership Request"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyStudentList;