// components/CompanyApplicationDetailsModal.jsx
"use client";

 
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Briefcase, Calendar, CheckCircle, FileText, Linkedin, Loader2, Mail, MapPin, Phone, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../admin/src/utils/api";
import StatusBadge from "./StatusBadge"; // Import the StatusBadge component
 
import { Award, Target } from "lucide-react";
 

const CompanyApplicationDetailsModal = ({ isOpen, onClose, application, onStatusUpdateSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [newStatus, setNewStatus] = useState('pending');
  const [notes, setNotes] = useState('');

  // ✅ Backend URL configuration
  const BACKEND_URL = 'http://localhost:4000';

  // Log for debug
  console.log("Modal - Application received:", application );
  console.log("Modal - isOpen:", isOpen);

  useEffect(() => {
    if (application) {
      setNewStatus(application.status || 'pending');
      setNotes(application.notes || '');
    }
  }, [application]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
      return new Date(dateString).toLocaleDateString("en-US", options);
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid Date";
    }
  };

  // ✅ Function to get CV URL
  const getCVUrl = (filename) => {
    if (!filename) return null;
    // Use the correct backend URL path
    return `${BACKEND_URL}/api/uploads/cvs/${filename}`;
  };

  // ✅ Function to handle CV viewing with error handling
  const handleCVView = (filename) => {
    if (!filename) {
      toast.error("Missing CV filename");
      return;
    }

    const cvUrl = getCVUrl(filename);
    console.log("Attempting to open CV:", cvUrl);
    
    // Open in new tab
    const newWindow = window.open(cvUrl, '_blank');
    
    // Check if popup was blocked
    if (!newWindow) {
      toast.error("Popup was blocked. Please allow popups for this site.");
    }
  };

  const handleStatusUpdate = async () => {
    if (!application?._id) {
      toast.error("Missing application ID");
      return;
    }

    setLoading(true);
    try {
      const response = await api.put(
        `/applications/${application._id}/status-by-company`,
        { status: newStatus, notes },
        true // Indicates it's a company request
      );
      toast.success(response.message || "Status updated successfully");
      if (onStatusUpdateSuccess) {
        onStatusUpdateSuccess(response.application); // Pass the updated application
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.message || "Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Function to get test result badge color
  const getTestResultBadgeColor = (passed, score) => {
    if (passed === true) return "bg-green-100 text-green-800 border-green-200";
    if (passed === false) return "bg-red-100 text-red-800 border-red-200";
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  };

  // ✅ Function to format test score
  const formatTestScore = (score) => {
    if (score === null || score === undefined) return "N/A";
    return `${score}%`;
  };

  // Security checks
  if (!isOpen) return null;
  
  if (!application) {
    console.error("Modal: No application provided");
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Loading Error</h3>
            <p className="text-slate-600 mb-4">Unable to load application details.</p>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 z-10 p-2 rounded-full hover:bg-slate-100"
            disabled={loading}
          >
            <X size={24} />
          </button>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Application Details</h2>
            <p className="text-slate-600">
              For the offer: <span className="font-semibold">{application.offre?.titre || "Title not available"}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Student Information */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <User className="h-5 w-5" /> Student Information
              </h3>
              <div className="space-y-3 text-slate-700">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" /> 
                  <span className="font-medium">Name:</span> 
                  <span>{application.student?.name || "Not provided"}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" /> 
                  <span className="font-medium">Email:</span> 
                  <span>{application.student?.email || "Not provided"}</span>
                </div>
                
                {application.student?.profile?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" /> 
                    <span className="font-medium">Phone:</span> 
                    <span>{application.student.profile.phone}</span>
                  </div>
                )}
                
                {application.student?.profile?.linkedin && (
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-blue-600" /> 
                    <span className="font-medium">LinkedIn:</span> 
                    <a 
                      href={application.student.profile.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline truncate max-w-xs"
                    >
                      {application.student.profile.linkedin}
                    </a>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-600" /> 
                  <span className="font-medium">Specialization:</span> 
                  <span>{application.student?.specialization || "Not provided"}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" /> 
                  <span className="font-medium">Study Level:</span> 
                  <span>{application.student?.studyLevel || "Not provided"}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" /> 
                  <span className="font-medium">Class:</span> 
                  <span>{application.student?.currentClass || "Not provided"}</span>
                </div>
                
                {application.student?.profile?.bio && (
                  <div className="mt-3">
                    <p className="font-medium text-blue-800 mb-1">Bio:</p>
                    <p className="text-sm bg-white p-3 rounded-md border border-blue-200">
                      {application.student.profile.bio}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Application Information */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5" /> Application Details
              </h3>
              <div className="space-y-3 text-slate-700">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" /> 
                  <span className="font-medium">Applied on:</span> 
                  <span>{formatDate(application.appliedAt)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium">Current Status:</span> 
                  <StatusBadge status={application.status} />
                </div>
                
                {application.reviewedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600" /> 
                    <span className="font-medium">Reviewed on:</span> 
                    <span>{formatDate(application.reviewedAt)}</span>
                  </div>
                )}
                
                {/* ✅ Fixed CV link with proper error handling */}
                {application.cv && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-600" /> 
                    <span className="font-medium">CV:</span> 
                    <button
                      onClick={() => handleCVView(application.cv.filename)}
                      className="text-blue-600 hover:underline hover:text-blue-800 transition-colors duration-200 cursor-pointer bg-none border-none p-0 font-inherit"
                      title={`View CV: ${application.cv.filename}`}
                    >
                      {application.cv.filename}
                    </button>
                  </div>
                )}
                
                {application.coverLetter && (
                  <div className="mt-3">
                    <p className="font-medium text-purple-800 mb-1">Cover Letter:</p>
                    <div className="text-sm bg-white p-3 rounded-md border border-purple-200 max-h-32 overflow-y-auto">
                      {application.coverLetter}
                    </div>
                  </div>
                )}
                
                {application.notes && (
                  <div className="mt-3">
                    <p className="font-medium text-purple-800 mb-1">Company Notes:</p>
                    <div className="text-sm bg-white p-3 rounded-md border border-purple-200">
                      {application.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ✅ NEW: Test Results Section */}
          {application.testResult && (
            <div className="mt-6 bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center gap-2">
                <Award className="h-5 w-5" /> Test Results
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 text-slate-700">
                  {application.testResult.score !== null && application.testResult.score !== undefined && (
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-orange-600" /> 
                      <span className="font-medium">Score:</span> 
                      <span className="font-semibold text-lg">{formatTestScore(application.testResult.score)}</span>
                    </div>
                  )}
                  
                  {application.testResult.passed !== null && application.testResult.passed !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Result:</span> 
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTestResultBadgeColor(application.testResult.passed, application.testResult.score)}`}>
                        {application.testResult.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 text-slate-700">
                  {application.testResult.completedAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-600" /> 
                      <span className="font-medium">Completed on:</span> 
                      <span>{formatDate(application.testResult.completedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Test Result Summary */}
              <div className="mt-4 p-3 bg-white rounded-md border border-orange-200">
                <p className="text-sm text-slate-600">
                  <strong>Test Summary:</strong> 
                  {application.testResult.passed === true && (
                    <span className="text-green-600 ml-1">
                      Student successfully passed the test with a score of {formatTestScore(application.testResult.score)}.
                    </span>
                  )}
                  {application.testResult.passed === false && (
                    <span className="text-red-600 ml-1">
                      Student did not pass the test. Score: {formatTestScore(application.testResult.score)}.
                    </span>
                  )}
                  {application.testResult.passed === null && (
                    <span className="text-yellow-600 ml-1">
                      Test results are pending or incomplete.
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* No Test Results Message */}
          {!application.testResult && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-600 mb-2 flex items-center gap-2">
                <Award className="h-5 w-5" /> Test Results
              </h3>
              <p className="text-sm text-gray-500">
                No test results available for this application.
              </p>
            </div>
          )}

          {/* Status Update Section */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" /> Update Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="statusSelect" className="block text-sm font-medium text-slate-700 mb-2">
                  New Status
                </label>
                <select
                  id="statusSelect"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                  disabled={loading}
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label htmlFor="notesTextarea" className="block text-sm font-medium text-slate-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  id="notesTextarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-y"
                  placeholder="Add internal notes about this application..."
                  disabled={loading}
                />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleStatusUpdate}
              disabled={loading}
              className="mt-4 w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="animate-spin h-5 w-5" />}
              {loading ? "Updating..." : "Update Status"}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CompanyApplicationDetailsModal;