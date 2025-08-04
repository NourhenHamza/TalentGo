// components/PublicApplicationDetailsModal.jsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Award, Briefcase, Building2, Calendar, CheckCircle, FileText, Loader2, Mail, MapPin, Phone, Shield, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const PublicApplicationDetailsModal = ({ isOpen, onClose, application, onUpdateStatus, onDownloadCV }) => {
  const [loading, setLoading] = useState(false);
  const [newStatus, setNewStatus] = useState('pending');
  const [notes, setNotes] = useState('');

  // Log for debug
  console.log("Modal - Application received:", application);
  console.log("Modal - isOpen:", isOpen);

  useEffect(() => {
    if (application) {
      setNewStatus(application.status || 'pending');
      setNotes(application.companyNotes || '');
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

  // Function to format duration
  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Function to get auth provider icon
  const getAuthProviderIcon = (provider) => {
    switch (provider) {
      case 'google':
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        );
      case 'apple':
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
        );
      default:
        return <User className="h-5 w-5" />;
    }
  };

  // Function to get test result badge color
  const getTestResultBadgeColor = (passed, score) => {
    if (passed === true) return "bg-green-100 text-green-800 border-green-200";
    if (passed === false) return "bg-red-100 text-red-800 border-red-200";
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  };

  // Function to format test score
  const formatTestScore = (score) => {
    if (score === null || score === undefined) return "N/A";
    return `${score}%`;
  };

  const handleStatusUpdate = async () => {
    if (!application?._id) {
      toast.error("Missing application ID");
      return;
    }

    setLoading(true);
    try {
      await onUpdateStatus(application._id, newStatus, notes);
      toast.success("Status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.message || "Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle CV download
  const handleCVDownload = (filename) => {
    if (!filename) {
      toast.error("Missing CV filename");
      return;
    }

    console.log("Attempting to download CV:", filename);
    onDownloadCV(application._id, `CV_${application.personalInfo.firstName}_${application.personalInfo.lastName}.pdf`);
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
              For the offer: <span className="font-semibold">{application.offre_id?.titre || "Title not available"}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <User className="h-5 w-5" /> Personal Information
              </h3>
              <div className="space-y-3 text-slate-700">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" /> 
                  <span className="font-medium">Name:</span> 
                  <span>{application.personalInfo?.firstName || "Not provided"} {application.personalInfo?.lastName || ""}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" /> 
                  <span className="font-medium">Email:</span> 
                  <span>{application.personalInfo?.email || "Not provided"}</span>
                </div>
                
                {application.personalInfo?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" /> 
                    <span className="font-medium">Phone:</span> 
                    <span>{application.personalInfo.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-600" /> 
                  <span className="font-medium">Application Type:</span> 
                  <span>{application.applicationType || "Not provided"}</span>
                </div>
                
                {application.authentication && (
                  <div className="flex items-center gap-2">
                    {getAuthProviderIcon(application.authentication.provider)}
                    <span className="font-medium">Authentication:</span> 
                    <span className="capitalize">{application.authentication.provider}</span>
                    <Shield className="h-4 w-4 text-green-500" title="Email verified" />
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
                  <span>{formatDate(application.submittedAt)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium">Current Status:</span> 
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                    application.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                    application.status === 'reviewed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    application.status === 'accepted' ? 'bg-green-100 text-green-800 border-green-200' :
                    application.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                    'bg-gray-100 text-gray-800 border-gray-200'
                  }`}>
                    {application.status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
                
                {application.reviewedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600" /> 
                    <span className="font-medium">Reviewed on:</span> 
                    <span>{formatDate(application.reviewedAt)}</span>
                  </div>
                )}
                
                {/* CV link with proper error handling */}
                {application.documents?.cv && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-600" /> 
                    <span className="font-medium">CV:</span> 
                    <button
                      onClick={() => handleCVDownload(application.documents.cv.filename)}
                      className="text-blue-600 hover:underline hover:text-blue-800 transition-colors duration-200 cursor-pointer bg-none border-none p-0 font-inherit"
                      title={`Download CV: ${application.documents.cv.originalName}`}
                    >
                      {application.documents.cv.originalName || application.documents.cv.filename}
                    </button>
                  </div>
                )}
                
                {application.documents?.coverLetter && (
                  <div className="mt-3">
                    <p className="font-medium text-purple-800 mb-1">Cover Letter:</p>
                    <div className="text-sm bg-white p-3 rounded-md border border-purple-200 max-h-32 overflow-y-auto">
                      {application.documents.coverLetter}
                    </div>
                  </div>
                )}
                
                {application.companyNotes && (
                  <div className="mt-3">
                    <p className="font-medium text-purple-800 mb-1">Company Notes:</p>
                    <div className="text-sm bg-white p-3 rounded-md border border-purple-200">
                      {application.companyNotes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Offer Information */}
          <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
              <Building2 className="h-5 w-5" /> Offer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 text-slate-700">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-green-600" /> 
                  <span className="font-medium">Title:</span> 
                  <span className="font-semibold">{application.offre_id?.titre || "Not available"}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-green-600" /> 
                  <span className="font-medium">Type:</span> 
                  <span>{application.offre_id?.type_offre || "Not available"}</span>
                </div>
              </div>
              
              <div className="space-y-3 text-slate-700">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" /> 
                  <span className="font-medium">Location:</span> 
                  <span>{application.offre_id?.localisation || "Not available"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Test Results Section */}
          {application.testResult && (
            <div className="mt-6 bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center gap-2">
                <Award className="h-5 w-5" /> Test Results
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className={`text-3xl font-bold mb-1 ${
                    application.testResult.passed ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatTestScore(application.testResult.score)}
                  </div>
                  <p className="text-sm text-gray-600">Score</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {application.testResult.answers?.filter(a => a.isCorrect).length || 0}
                  </div>
                  <p className="text-sm text-gray-600">
                    Correct / {application.testResult.answers?.length || 0}
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {formatDuration(application.testResult.timeSpent)}
                  </div>
                  <p className="text-sm text-gray-600">Time Spent</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTestResultBadgeColor(application.testResult.passed, application.testResult.score)}`}>
                    {application.testResult.passed ? 'PASSED' : 'FAILED'}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">Result</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 text-slate-700">
                  {application.testResult.startedAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-600" /> 
                      <span className="font-medium">Started:</span> 
                      <span>{formatDate(application.testResult.startedAt)}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 text-slate-700">
                  {application.testResult.completedAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-600" /> 
                      <span className="font-medium">Completed:</span> 
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
                      Candidate successfully passed the test with a score of {formatTestScore(application.testResult.score)}.
                    </span>
                  )}
                  {application.testResult.passed === false && (
                    <span className="text-red-600 ml-1">
                      Candidate did not pass the test. Score: {formatTestScore(application.testResult.score)}.
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

export default PublicApplicationDetailsModal;

