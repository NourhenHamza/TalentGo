"use client";

import axios from "axios";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  FileTextIcon,
  GraduationCapIcon,
  InfoIcon,
  LinkIcon,
  TimerIcon,
  XCircleIcon,
  RefreshCwIcon
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";

// Composant Spinner pour le chargement
function LoadingSpinner(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// Fonction de validation d'URL GitHub
const isValidGitHubUrl = (url) => {
  return typeof url === 'string' && url.includes("github.com");
};

export default function ReportSubmission() {
  const { token, backendUrl } = useContext(AppContext);
  const [githubUrl, setGithubUrl] = useState("");
  const [studentName, setStudentName] = useState("");
  const [cinNumber, setCinNumber] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [subjectTitle, setSubjectTitle] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [submissionData, setSubmissionData] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  // États pour les différents statuts
  const [reportStatus, setReportStatus] = useState(null); // 'pending', 'validated', 'rejected'
  const [feedback, setFeedback] = useState("");
  const [isResubmitting, setIsResubmitting] = useState(false);

  useEffect(() => {
    const initializeComponent = async () => {
      console.log("🔍 DEBUG: Token from context:", token);
      
      if (!token) {
        console.log("❌ No token available");
        setInitializing(false);
        return;
      }

      try {
        // 1. Récupérer le sujet assigné
        console.log("📡 Making request to:", `${backendUrl}/api/subjects/my-assignments`);
        const assignmentRes = await axios.get(`${backendUrl}/api/subjects/my-assignments`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (assignmentRes.data && assignmentRes.data.length > 0) {
          const assignedSubject = assignmentRes.data[0].subject;
          setSubjectId(assignedSubject._id);
          setSubjectTitle(assignedSubject.title);

          // 2. Vérifier s'il y a une soumission
          console.log("📡 Making request to:", `${backendUrl}/api/reports/my-submission?subjectId=${assignedSubject._id}`);
          
          try {
            const submissionRes = await axios.get(
              `${backendUrl}/api/reports/my-submission?subjectId=${assignedSubject._id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            
            if (submissionRes.data.success && submissionRes.data.report) {
              const report = submissionRes.data.report;
              setSubmissionData(report);
              setReportStatus(report.status);
              setFeedback(report.feedback || "");
              setStudentName(report.studentName || "");
              setCinNumber(report.cinNumber || "");
              setGithubUrl(report.fileUrl || "");
            }
          } catch (submissionError) {
            console.log("❌ Submission error:", submissionError.response?.data);
            if (submissionError.response?.status !== 404) {
              console.error("Failed to check previous submission:", submissionError);
            }
          }
        }
      } catch (err) {
        console.error("❌ Initialization failed:", err.response?.data || err.message);
      } finally {
        setInitializing(false);
      }
    };

    initializeComponent();
  }, [token, backendUrl]);

// In your ReportSubmission.jsx, change the endpoint:

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  console.log("📤 Submitting form with data:", { studentName, cinNumber, githubUrl, subjectId });

  if (!studentName || !cinNumber || !githubUrl || !subjectId) {
    setError("Please fill all required fields.");
    return;
  }

  if (!isValidGitHubUrl(githubUrl)) {
    setError("Please provide a valid GitHub URL.");
    return;
  }

  setLoading(true);
  try {
    // 🔧 FIX: Use the correct endpoint that matches your server routing
    const endpoint = `${backendUrl}/api/reportSubmit`; // Changed from /api/reports
    
    console.log(`📡 Sending POST request to:`, endpoint);
    
    const response = await axios.post(
      endpoint,
      {
        fileUrl: githubUrl,
        subjectId: subjectId,
        studentName: studentName,
        cinNumber: cinNumber,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("✅ Submission response:", response.data);
    if (response.data.success) {
      setShowSuccess(true);
      setSubmissionData(response.data.report);
      setReportStatus('pending');
      setFeedback("");
      setIsResubmitting(false);
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } else {
      setError(response.data.message || "An unknown error occurred.");
    }
  } catch (err) {
    console.error("❌ Error submitting report:", err.response?.data || err.message);
    setError(err.response?.data?.message || "Failed to submit report. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const handleResubmit = () => {
    setIsResubmitting(true);
    setError("");
    setGithubUrl(""); // Clear previous URL to force user to enter new one
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
            <div className="flex gap-3">
              <TimerIcon className="h-5 w-5 text-yellow-600 mt-1" />
              <div>
                <h3 className="font-bold text-yellow-800">Submission Under Review</h3>
                <p className="text-yellow-700">Your report is being reviewed. Please wait for feedback.</p>
              </div>
            </div>
          </div>
        );
      case 'validated':
        return (
          <div className="bg-green-50 border border-green-200 p-4 rounded-md">
            <div className="flex gap-3">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <h3 className="font-bold text-green-800">Report Approved</h3>
                <p className="text-green-700">Congratulations! Your report has been validated.</p>
              </div>
            </div>
          </div>
        );
      case 'rejected':
        return (
          <div className="bg-red-50 border border-red-200 p-4 rounded-md">
            <div className="flex gap-3">
              <XCircleIcon className="h-5 w-5 text-red-600 mt-1" />
              <div>
                <h3 className="font-bold text-red-800">Report Rejected</h3>
                <p className="text-red-700">Your report needs revision. Please check the feedback below and resubmit.</p>
                {feedback && (
                  <div className="mt-2 p-2 bg-red-100 rounded border-l-4 border-red-500">
                    <p className="text-red-800 font-medium">Feedback:</p>
                    <p className="text-red-700">{feedback}</p>
                  </div>
                )}
                <button
                  onClick={handleResubmit}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <RefreshCwIcon className="h-4 w-4" />
                  Resubmit Report
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (initializing) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner className="h-12 w-12 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-center mb-8">
        <GraduationCapIcon className="h-16 w-16 mx-auto text-blue-500 mb-4" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-blue-400 bg-clip-text text-transparent">
          Final Report Submission
        </h1>
        <div className="h-1 w-32 bg-blue-500 mx-auto my-4 rounded-full"></div>
        <p className="text-blue-700 text-lg">
          Submit your PFE project through our platform.
        </p>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-green-700">Success!</h2>
            <p className="text-gray-700 mt-2">
              Your report has been {isResubmitting ? 'resubmitted' : 'submitted'} successfully.
            </p>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg shadow-lg">
        <div className="p-6 border-b border-blue-200">
          <h2 className="text-2xl font-bold text-blue-800">PFE Report Submission</h2>
          <p className="text-blue-700 text-sm mt-1">Provide a link to your GitHub repository file.</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Badge */}
          {reportStatus && getStatusBadge(reportStatus)}

          {/* Form - Show if no submission, or if rejected and user wants to resubmit */}
          {(!submissionData || reportStatus === 'rejected') && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-md text-red-700">{error}</div>
              )}

              {isResubmitting && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                  <div className="flex gap-3">
                    <RefreshCwIcon className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-bold text-blue-800">Resubmitting Report</h3>
                      <p className="text-blue-700">Please update your GitHub URL and resubmit your report.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="studentName" className="block text-blue-700 font-medium mb-1">Student Name</label>
                  <input 
                    id="studentName" 
                    value={studentName} 
                    onChange={(e) => setStudentName(e.target.value)} 
                    placeholder="Enter your full name" 
                    className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="cinNumber" className="block text-blue-700 font-medium mb-1">CIN Number</label>
                  <input 
                    id="cinNumber" 
                    value={cinNumber} 
                    onChange={(e) => setCinNumber(e.target.value)} 
                    placeholder="Enter your CIN number" 
                    className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-blue-700 font-medium mb-1">Assigned Subject</label>
                <div className="w-full px-4 py-2 border border-blue-300 rounded-md bg-blue-50 text-gray-700">
                  {subjectTitle || "Loading..."}
                </div>
              </div>

              <div>
                <label htmlFor="githubUrl" className="block text-blue-700 font-medium mb-1 flex items-center gap-1.5">
                  <LinkIcon className="h-4 w-4" />
                  GitHub File URL
                </label>
                <div className="relative">
                  <input 
                    id="githubUrl" 
                    value={githubUrl} 
                    onChange={(e) => setGithubUrl(e.target.value)} 
                    placeholder="https://github.com/username/repo/blob/main/report.md" 
                    className="w-full px-4 py-2 pl-10 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    required 
                  />
                  <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                </div>
                <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                  <InfoIcon className="h-3 w-3" />
                  Make sure your repository is public.
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 p-4 rounded-md">
                <div className="flex gap-3">
                  <AlertTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-red-800">Important Warning</h3>
                    <p className="text-red-700">Any modification after submission will result in automatic rejection.</p>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || !subjectId} 
                className="w-full py-2.5 px-4 rounded-md text-white font-semibold bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner className="animate-spin h-5 w-5" />
                    {isResubmitting ? 'Resubmitting...' : 'Submitting...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <FileTextIcon className="h-5 w-5" />
                    {isResubmitting ? 'Resubmit PFE Report' : 'Submit PFE Report'}
                  </span>
                )}
              </button>
            </form>
          )}

          {/* Show submitted report info if status is pending or validated */}
          {submissionData && (reportStatus === 'pending' || reportStatus === 'validated') && (
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-md">
              <h3 className="font-bold text-gray-800 mb-2">Submitted Report Details</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Student:</strong> {submissionData.studentName}</p>
                <p><strong>CIN:</strong> {submissionData.cinNumber}</p>
                <p><strong>GitHub URL:</strong> 
                  <a 
                    href={submissionData.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline ml-1"
                  >
                    {submissionData.fileUrl}
                  </a>
                </p>
                <p><strong>Submitted:</strong> {new Date(submissionData.createdAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}