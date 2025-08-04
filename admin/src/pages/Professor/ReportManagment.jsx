"use client";
import axios from "axios";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { debounce } from "lodash";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  FileText,
  Filter,
  Search,
  User,
  XCircle
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ProfessorContext } from "../../context/ProfessorContext";

// Debug function to log important information
const debugLog = (message, data) => {
  console.log(`[DEBUG] ${message}:`, data);
};

// Styles for animations and components
const styles = `
  @keyframes float-1 {
    0%, 100% { transform: translateY(0) translateX(0); }
    50% { transform: translateY(-20px) translateX(10px); }
  }
  @keyframes float-2 {
    0%, 100% { transform: translateY(0) translateX(0); }
    50% { transform: translateY(15px) translateX(-10px); }
  }
  @keyframes float-3 {
    0%, 100% { transform: translateY(0) translateX(0); }
    50% { transform: translateY(-15px) translateX(-15px); }
  }
  @keyframes float-4 {
    0%, 100% { transform: translateY(0) translateX(0); }
    50% { transform: translateY(20px) translateX(15px); }
  }
  @keyframes float-5 {
    0%, 100% { transform: translateY(0) translateX(0); }
    50% { transform: translateY(-25px) translateX(5px); }
  }
  @keyframes float-6 {
    0%, 100% { transform: translateY(0) translateX(0); }
    50% { transform: translateY(10px) translateX(-20px); }
  }
  @keyframes fade-in {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes slide-up {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes scale-in {
    0% { opacity: 0; transform: scale(0.9); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes width-expand {
    0% { width: 0; }
    100% { width: 8rem; }
  }
  .animate-fade-in {
    animation: fade-in 0.6s ease-out forwards;
  }
  .animate-fade-in-delayed {
    opacity: 0;
    animation: fade-in 0.6s ease-out forwards;
    animation-delay: 0.3s;
  }
  .animate-slide-up {
    animation: slide-up 0.6s ease-out forwards;
  }
  .animate-scale-in {
    animation: scale-in 0.5s ease-out forwards;
  }
  .animate-width-expand {
    animation: width-expand 0.8s ease-out forwards;
  }
  .animate-card {
    opacity: 0;
    animation: slide-up 0.6s ease-out forwards;
  }
  
  /* Status badges */
  .status-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
  }
  .status-pending {
    background-color: rgba(234, 179, 8, 0.1);
    color: #854d0e;
    border: 1px solid rgba(234, 179, 8, 0.3);
  }
  .status-validated {
    background-color: rgba(34, 197, 94, 0.1);
    color: #166534;
    border: 1px solid rgba(34, 197, 94, 0.3);
  }
  .status-rejected {
    background-color: rgba(239, 68, 68, 0.1);
    color: #b91c1c;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }
  
  /* Card hover effects */
  .report-card {
    transition: all 0.3s ease;
  }
  .report-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1);
  }
  
  /* Button styles */
  .btn-primary {
    background-color: #2563eb;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    transition: all 0.2s ease;
  }
  .btn-primary:hover {
    background-color: #1d4ed8;
  }
  .btn-primary:focus {
    outline: none;
    ring: 2px;
    ring-offset: 2px;
    ring-blue-500;
  }
  .btn-secondary {
    background-color: white;
    color: #2563eb;
    border: 1px solid #2563eb;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    transition: all 0.2s ease;
  }
  .btn-secondary:hover {
    background-color: #f0f7ff;
  }
  
  /* Filter buttons */
  .filter-btn {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    transition: all 0.2s ease;
    background-color: white;
    color: #64748b;
    border: 1px solid #e2e8f0;
  }
  .filter-btn:hover {
    background-color: #f8fafc;
  }
  .filter-btn.active {
    background-color: #2563eb;
    color: white;
    border-color: #2563eb;
  }
  
  /* Search input */
  .search-input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 3rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    background-color: white;
    transition: all 0.2s ease;
  }
  .search-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }
  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
  }
`;

const ReportManagement = () => {
  const { dToken, backendUrl } = useContext(ProfessorContext);
  const [professorId, setProfessorId] = useState(null);

  // Report management states
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedReportId, setExpandedReportId] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [validatedCount, setValidatedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [processingReport, setProcessingReport] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'validate' or 'reject'
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'pending', 'validated', 'rejected'
  const [animateList, setAnimateList] = useState(false);

  // Validate MongoDB ObjectId
  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  // Safe access function for nested properties
  const safeAccess = (obj, path, fallback = '') => {
    try {
      return path.split('.').reduce((o, key) => (o && o[key] !== undefined) ? o[key] : null, obj) || fallback;
    } catch (e) {
      return fallback;
    }
  };

  // Extract professor ID from token
  useEffect(() => {
    if (dToken) {
      try {
        debugLog("Decoding JWT token", { tokenExists: !!dToken });
        const decoded = jwtDecode(dToken);
        debugLog("Token decoded successfully", { id: decoded.id });
        setProfessorId(decoded.id);
      } catch (error) {
        console.error("Error decoding token:", error);
        debugLog("Error decoding token", { error: error.message });
        toast.error("Authentication error. Please log in again.");
      }
    } else {
      debugLog("Token not available", { dToken });
    }
  }, [dToken]);

  // Get all reports
  const getAllReports = async () => {
    if (!professorId) {
      debugLog("getAllReports - professorId missing", { professorId });
      return false;
    }
    
    setLoading(true);
    const apiUrl = `${backendUrl || "http://localhost:4000"}/api/report/reports`;
    debugLog("getAllReports - Preparing request", { 
      apiUrl, 
      headers: { authorization: `Bearer ${dToken ? dToken.substring(0, 10) + '...' : 'undefined'}` }
    });
    
    try {
      debugLog("getAllReports - Sending request", { apiUrl });
      const { data } = await axios.get(apiUrl, {
        headers: { authorization: `Bearer ${dToken}` }
      });

      debugLog("getAllReports - Response received", { 
        success: data.success, 
        reportsCount: data.reports ? data.reports.length : 0,
        message: data.message || "No message"
      });

      if (data.success) {
        // Process reports to ensure they have studentDetails and subjectDetails
        const processedReports = data.reports.map(report => {
          const processedReport = { ...report };
          
          if (!processedReport.studentDetails && processedReport.student) {
            processedReport.studentDetails = {
              _id: processedReport.student._id,
              name: processedReport.student.name,
              email: processedReport.student.email,
              profile: processedReport.student.profile
            };
          }
          
          if (!processedReport.subjectDetails && processedReport.subject) {
            processedReport.subjectDetails = {
              _id: processedReport.subject._id,
              title: processedReport.subject.title,
              description: processedReport.subject.description,
              company: processedReport.subject.company,
              technologies: processedReport.subject.technologies
            };
          }
          
          return processedReport;
        });
        
        // Filter to only show final reports
        const finalReports = processedReports.filter(report => report.type === "final");
        setReports(finalReports);
        setFilteredReports(finalReports);
        
        // Count reports by status
        const pendingReports = finalReports.filter(report => report.status === "pending");
        const validatedReports = finalReports.filter(report => report.status === "validated");
        const rejectedReports = finalReports.filter(report => report.status === "rejected");
        
        setPendingCount(pendingReports.length);
        setValidatedCount(validatedReports.length);
        setRejectedCount(rejectedReports.length);
        setTotalCount(finalReports.length);
        
        // Trigger animation after data is loaded
        setTimeout(() => setAnimateList(true), 100);
        
        return true;
      } else {
        toast.error(data.message || "Failed to retrieve reports");
        return false;
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      debugLog("getAllReports - Error during retrieval", { 
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data
        } : "No response",
        request: error.request ? "Request sent but no response" : "Error before sending request"
      });
      toast.error(error.response?.data?.message || "Failed to retrieve reports");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Validate a report
  const validateReport = async (reportId, feedback) => {
    if (!isValidObjectId(reportId) || !professorId) {
      debugLog("validateReport - Invalid ID or missing professorId", { reportId, professorId });
      toast.error("Invalid report ID format or authentication error");
      return false;
    }
    
    setProcessingReport(reportId);
    const apiUrl = `${backendUrl || "http://localhost:4000"}/api/report/professor/validate-report`;
    debugLog("validateReport - Preparing request", { 
      apiUrl, 
      payload: { reportId, feedback },
      headers: { authorization: `Bearer ${dToken ? dToken.substring(0, 10) + '...' : 'undefined'}` }
    });
    
    try {
      debugLog("validateReport - Sending request", { apiUrl });
      const { data } = await axios.post(
        apiUrl,
        { reportId, feedback },
        { headers: { authorization: `Bearer ${dToken}` } }
      );

      debugLog("validateReport - Response received", { 
        success: data.success, 
        message: data.message || "No message"
      });

      if (data.success) {
        toast.success("Report validated successfully");
        return true;
      } else {
        toast.error(data.message || "Failed to validate report");
        return false;
      }
    } catch (error) {
      console.error("Error validating report:", error);
      debugLog("validateReport - Error during validation", { 
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data
        } : "No response",
        request: error.request ? "Request sent but no response" : "Error before sending request"
      });
      toast.error(error.response?.data?.message || "Failed to validate report");
      return false;
    } finally {
      setProcessingReport(null);
    }
  };

  // Reject a report
  const rejectReport = async (reportId, feedback) => {
    if (!isValidObjectId(reportId) || !professorId) {
      debugLog("rejectReport - Invalid ID or missing professorId", { reportId, professorId });
      toast.error("Invalid report ID format or authentication error");
      return false;
    }
    
    // Check that feedback is not empty (required by backend)
    if (!feedback || feedback.trim() === '') {
      debugLog("rejectReport - Empty feedback", { feedback });
      toast.error("Feedback is required to reject a report");
      return false;
    }
    
    setProcessingReport(reportId);
    const apiUrl = `${backendUrl || "http://localhost:4000"}/api/report/professor/reject-report`;
    debugLog("rejectReport - Preparing request", { 
      apiUrl, 
      payload: { reportId, feedback },
      headers: { authorization: `Bearer ${dToken ? dToken.substring(0, 10) + '...' : 'undefined'}` }
    });
    
    try {
      debugLog("rejectReport - Sending request", { apiUrl });
      const { data } = await axios.post(
        apiUrl,
        { reportId, feedback },
        { headers: { authorization: `Bearer ${dToken}` } }
      );

      debugLog("rejectReport - Response received", { 
        success: data.success, 
        message: data.message || "No message"
      });

      if (data.success) {
        toast.success("Report rejected successfully");
        return true;
      } else {
        toast.error(data.message || "Failed to reject report");
        return false;
      }
    } catch (error) {
      console.error("Error rejecting report:", error);
      debugLog("rejectReport - Error during rejection", { 
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data
        } : "No response",
        request: error.request ? "Request sent but no response" : "Error before sending request"
      });
      toast.error(error.response?.data?.message || "Failed to reject report");
      return false;
    } finally {
      setProcessingReport(null);
    }
  };

  // Fetch reports data when professorId is available
  useEffect(() => {
    if (professorId) {
      debugLog("Reports loading effect triggered", { professorId });
      getAllReports();
    } else {
      debugLog("Reports loading effect - professorId not available", { professorId });
    }
  }, [professorId]);

  // Apply filters when reports or filter changes
  useEffect(() => {
    if (reports.length > 0) {
      let filtered = [...reports];
      
      // Apply status filter
      if (activeFilter === "pending") {
        filtered = filtered.filter(report => report.status === "pending");
      } else if (activeFilter === "validated") {
        filtered = filtered.filter(report => report.status === "validated");
      } else if (activeFilter === "rejected") {
        filtered = filtered.filter(report => report.status === "rejected");
      }
      
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(report => {
          const subjectTitle = safeAccess(report, 'subjectDetails.title', safeAccess(report, 'subject.title', ''));
          const studentName = safeAccess(report, 'studentDetails.name', safeAccess(report, 'student.name', ''));
          return subjectTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 studentName.toLowerCase().includes(searchTerm.toLowerCase());
        });
      }
      
      setFilteredReports(filtered);
    }
  }, [reports, activeFilter, searchTerm]);

  // Handle search with debounce
  const debouncedSearch = debounce((value) => setSearchTerm(value), 300);
  const handleSearch = (e) => debouncedSearch(e.target.value);

  // Toggle report details
  const toggleReportDetails = (reportId) => {
    setExpandedReportId(expandedReportId === reportId ? null : reportId);
  };

  // Open feedback modal
  const openFeedbackModal = (report, type) => {
    setProcessingReport(report);
    setActionType(type);
    setFeedback(report.feedback || "");
    setShowFeedbackModal(true);
  };

  // Close feedback modal
  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setProcessingReport(null);
    setActionType(null);
    setFeedback("");
  };

  // Handle feedback submission
  const handleFeedbackSubmit = async () => {
    if (!processingReport) return;
    
    let success = false;
    if (actionType === 'validate') {
      success = await validateReport(processingReport._id, feedback);
    } else if (actionType === 'reject') {
      success = await rejectReport(processingReport._id, feedback);
    }
    
    if (success) {
      closeFeedbackModal();
      await getAllReports();
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Get status icon based on report status
  const getStatusIcon = (status) => {
    switch(status) {
      case 'validated':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 mr-1" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 mr-1" />;
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch(status) {
      case 'validated':
        return 'Validated';
      case 'rejected':
        return 'Rejected';
      case 'pending':
      default:
        return 'Pending';
    }
  };

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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      {/* Add animation styles */}
      <style>{styles}</style>
      
      <div className="py-16 px-6 sm:px-10 lg:px-16 relative overflow-hidden bg-white w-full">
        {/* Animated background circles */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i}
              className="absolute opacity-20 rounded-full bg-blue-500"
              style={{
                width: `${50 + (i * 20)}px`,
                height: `${50 + (i * 20)}px`,
                top: `${10 + (i * 15)}%`,
                left: i % 2 === 0 ? `${5 + (i * 10)}%` : `${80 - (i * 10)}%`,
                animation: `float-${i + 1} ${8 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`,
                zIndex: 0
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-block mb-4 animate-scale-in">
              <BookOpen className="h-16 w-16 text-blue-600 mx-auto" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-3">
              Final <span className="text-blue-500">Reports</span>
            </h1>
            <div className="w-32 h-1.5 bg-blue-500 mx-auto my-5 rounded-full animate-width-expand"></div>
            <p className="mt-4 text-lg md:text-xl text-blue-700 max-w-2xl mx-auto animate-fade-in-delayed">
              View and manage student final reports
            </p>
          </div>

          {/* Stats cards */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* All Reports Block */}
            <motion.div 
              className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-md p-4 border-l-4 border-blue-500 report-card"
              variants={itemVariants}
            >
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full mr-4">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">All Reports</h3>
                  <p className="text-2xl font-bold text-blue-600">{totalCount}</p>
                </div>
              </div>
            </motion.div>

            {/* Pending Reports Block */}
            <motion.div 
              className="bg-gradient-to-br from-yellow-50 to-white rounded-xl shadow-md p-4 border-l-4 border-yellow-500 report-card"
              variants={itemVariants}
            >
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full mr-4">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Pending</h3>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
              </div>
            </motion.div>

            {/* Validated Reports Block */}
            <motion.div 
              className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-md p-4 border-l-4 border-green-500 report-card"
              variants={itemVariants}
            >
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full mr-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Validated</h3>
                  <p className="text-2xl font-bold text-green-600">{validatedCount}</p>
                </div>
              </div>
            </motion.div>

            {/* Rejected Reports Block */}
            <motion.div 
              className="bg-gradient-to-br from-red-50 to-white rounded-xl shadow-md p-4 border-l-4 border-red-500 report-card"
              variants={itemVariants}
            >
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-full mr-4">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Rejected</h3>
                  <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Search and filter section */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Search box */}
              <div className="md:col-span-1">
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-md p-6 animate-slide-up">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">Search Reports</h3>
                  <div className="relative">
                    <Search className="h-5 w-5 search-icon" />
                    <input
                      type="text"
                      placeholder="Search by title or student name..."
                      className="search-input"
                      onChange={handleSearch}
                    />
                  </div>
                </div>
              </div>

              {/* Filter buttons */}
              <div className="md:col-span-2">
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-md p-6 animate-slide-up">
                  <div className="flex items-center mb-3">
                    <Filter className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-blue-800">Filter by Status</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
                      onClick={() => setActiveFilter("all")}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      All
                    </button>
                    <button
                      className={`filter-btn ${activeFilter === "pending" ? "active" : ""}`}
                      onClick={() => setActiveFilter("pending")}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Pending
                    </button>
                    <button
                      className={`filter-btn ${activeFilter === "validated" ? "active" : ""}`}
                      onClick={() => setActiveFilter("validated")}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Validated
                    </button>
                    <button
                      className={`filter-btn ${activeFilter === "rejected" ? "active" : ""}`}
                      onClick={() => setActiveFilter("rejected")}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejected
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reports list */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full mb-6 animate-spin"></div>
              <p className="text-blue-800 font-medium text-lg">Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-md max-w-3xl mx-auto animate-fade-in">
              <div className="text-blue-500 mb-4">
                <AlertCircle className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-blue-900 mb-2">No final reports found</h3>
              <p className="text-blue-700">No final reports match your search criteria.</p>
            </div>
          ) : (
            <motion.div 
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate={animateList ? "visible" : "hidden"}
            >
              {filteredReports.map((report, index) => {
                const subjectTitle = safeAccess(report, 'subjectDetails.title', safeAccess(report, 'subject.title', 'Unknown Subject'));
                const studentName = safeAccess(report, 'studentDetails.name', safeAccess(report, 'student.name', 'Unknown Student'));
                const studentEmail = safeAccess(report, 'studentDetails.email', safeAccess(report, 'student.email', ''));
                const isExpanded = expandedReportId === report._id;
                const isPending = report.status === 'pending';
                
                return (
                  <motion.div
                    key={report._id}
                    className={`bg-white rounded-xl shadow-md overflow-hidden report-card border-l-4 ${
                      report.status === 'pending' ? 'border-yellow-500' : 
                      report.status === 'validated' ? 'border-green-500' : 'border-red-500'
                    }`}
                    variants={itemVariants}
                  >
                    {/* Main row - always visible */}
                    <div 
                      className="p-5 cursor-pointer flex justify-between items-center"
                      onClick={() => toggleReportDetails(report._id)}
                    >
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-blue-900 truncate">
                          {subjectTitle}
                        </h3>
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          <span className={`status-badge status-${report.status}`}>
                            {getStatusIcon(report.status)}
                            {getStatusText(report.status)}
                          </span>
                          <span className="text-sm text-blue-700 flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {studentName}
                          </span>
                          <span className="text-sm text-blue-700 flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          aria-label={isExpanded ? "Hide details" : "Show details"}
                        >
                          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    
                    {/* Details section - only visible when expanded */}
                    <motion.div
                      className={`overflow-hidden ${
                        isExpanded ? "block" : "hidden"
                      }`}
                      initial="hidden"
                      animate={isExpanded ? "visible" : "hidden"}
                      variants={{
                        visible: { opacity: 1, height: "auto" },
                        hidden: { opacity: 0, height: 0 }
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="border-t border-blue-100 p-5 bg-gradient-to-br from-blue-50 to-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Student info */}
                          <div className="flex items-start space-x-3">
                            <User className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-blue-800">Student Information</h4>
                              <p className="text-blue-900 font-medium">
                                {studentName}
                              </p>
                              <p className="text-sm text-blue-700">
                                {studentEmail}
                              </p>
                            </div>
                          </div>
                          
                          {/* Submission date */}
                          <div className="flex items-start space-x-3">
                            <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-blue-800">Submission Details</h4>
                              <p className="text-blue-900">
                                {formatDate(report.createdAt)}
                              </p>
                              {report.feedback && (
                                <p className="text-sm text-blue-700 mt-1">
                                  <span className="font-medium">Feedback:</span> {report.feedback}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="mt-6 pt-4 border-t border-blue-100 flex flex-wrap justify-between gap-4">
                          {/* Git Repository Link */}
                          <a
                            href={report.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Git Repository
                          </a>
                          
                          {/* Validate/Reject buttons for pending reports */}
                          {isPending && (
                            <div className="flex flex-wrap gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openFeedbackModal(report, 'validate');
                                }}
                                className="btn-primary bg-green-600 hover:bg-green-700"
                                disabled={processingReport === report._id}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Validate
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openFeedbackModal(report, 'reject');
                                }}
                                className="btn-primary bg-red-600 hover:bg-red-700"
                                disabled={processingReport === report._id}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-blue-900 bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <motion.div 
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-blue-900">
              {actionType === 'validate' ? 'Validate Report' : 'Reject Report'}
            </h3>
            <p className="text-blue-700 mb-4">
              {actionType === 'validate' 
                ? 'Add optional feedback for this report validation.' 
                : 'Please provide feedback explaining why this report is being rejected.'}
            </p>
            <textarea
              className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 mb-4"
              rows="4"
              placeholder="Enter your feedback here..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            ></textarea>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeFeedbackModal}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleFeedbackSubmit}
                className={`btn-primary ${actionType === 'validate' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                disabled={actionType === 'reject' && (!feedback || feedback.trim() === '')}
              >
                {actionType === 'validate' ? 'Validate' : 'Reject'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default ReportManagement;
