// components/MyApplicationsModal.jsx
"use client";

import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, Calendar, Check, CheckCircle, Clock, Eye, FileText, MapPin, Trash2, X, XCircle } from "lucide-react";
import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const MyApplicationsModal = ({ isOpen, onClose, applications, getStatusBadge, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const { backendUrl, token } = useContext(AppContext);

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const getStatusDetails = (status) => {
    const statusConfig = {
      pending: { 
        text: "Pending", 
        color: "bg-yellow-50 border-yellow-200 text-yellow-800", 
        icon: <Clock className="h-5 w-5 text-yellow-600" />,
        description: "Your application has been submitted and is awaiting review."
      },
      reviewed: { 
        text: "Reviewed", 
        color: "bg-blue-50 border-blue-200 text-blue-800", 
        icon: <Eye className="h-5 w-5 text-blue-600" />,
        description: "Your application has been reviewed by the company."
      },
      accepted: { 
        text: "Accepted", 
        color: "bg-green-50 border-green-200 text-green-800", 
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
        description: "Congratulations! Your application has been accepted."
      },
      rejected: { 
        text: "Rejected", 
        color: "bg-red-50 border-red-200 text-red-800", 
        icon: <XCircle className="h-5 w-5 text-red-600" />,
        description: "Your application was not selected this time."
      }
    };

    return statusConfig[status] || statusConfig.pending;
  };

  const handleDeleteApplication = async (applicationId) => {
    if (!window.confirm("Are you sure you want to delete this application?")) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`${backendUrl}/api/applications/${applicationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Application deleted successfully");
      onRefresh(); // Refresh the list
    } catch (error) {
      console.error("Error during deletion:", error);
      toast.error(error.response?.data?.message || "Error deleting application");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmApplication = async (applicationId) => {
    if (!window.confirm("Are you sure you want to confirm this application?")) {
      return;
    }

    setLoading(true);
    try {
      await axios.put(`${backendUrl}/api/applications/${applicationId}/confirm`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Application confirmed successfully");
      onRefresh(); // Refresh the list
    } catch (error) {
      console.error("Error during confirmation:", error);
      toast.error(error.response?.data?.message || "Error confirming application");
    } finally {
      setLoading(false);
    }
  };

  const canDeleteApplication = (application) => {
    return application.status === 'pending';
  };

  const canConfirmApplication = (application) => {
    return application.status === 'accepted' && !application.confirmed;
  };

  if (!isOpen) return null;

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
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">My Applications</h2>
                <p className="text-slate-600">Track the status of your applications</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-slate-500 hover:text-slate-800 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            {applications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="bg-slate-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">No Applications</h3>
                <p className="text-slate-600">You haven't submitted any applications yet.</p>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {applications.map((application) => {
                  const statusDetails = getStatusDetails(application.status);
                  
                  return (
                    <motion.div
                      key={application._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`border rounded-xl p-6 ${statusDetails.color} transition-all duration-200 hover:shadow-md`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            {application.offre?.entreprise_id?.logo_url && (
                              <img
                                src={application.offre.entreprise_id.logo_url}
                                alt={application.offre.entreprise_id.nom}
                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                              />
                            )}
                            <div>
                              <h3 className="text-lg font-semibold text-slate-800">
                                {application.offre?.titre || "Title not available"}
                              </h3>
                              <p className="text-slate-600 font-medium">
                                {application.offre?.entreprise_id?.nom || "Company not available"}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-slate-500" />
                              <span className="text-sm text-slate-700">
                                {application.offre?.type_offre || "Type not specified"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-slate-500" />
                              <span className="text-sm text-slate-700">
                                {application.offre?.localisation || "Location not specified"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-slate-500" />
                              <span className="text-sm text-slate-700">
                                Applied: {formatDate(application.appliedAt)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            {statusDetails.icon}
                            <span className="font-medium">{statusDetails.text}</span>
                          </div>
                          
                          <p className="text-sm text-slate-600 mb-4">{statusDetails.description}</p>

                          {application.cv && (
                            <div className="bg-white/50 rounded-lg p-3 mb-4">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-slate-500" />
                                <span className="text-sm font-medium text-slate-700">CV used:</span>
                                <span className="text-sm text-slate-600">{application.cv.filename}</span>
                              </div>
                            </div>
                          )}

                          {application.coverLetter && (
                            <div className="bg-white/50 rounded-lg p-3">
                              <h4 className="text-sm font-medium text-slate-700 mb-2">Cover Letter:</h4>
                              <p className="text-sm text-slate-600 line-clamp-3">
                                {application.coverLetter}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          {getStatusBadge(application.status)}
                          
                          {canConfirmApplication(application) && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleConfirmApplication(application._id)}
                              disabled={loading}
                              className="flex items-center gap-1 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                              title="Confirm application"
                            >
                              <Check className="h-3 w-3" />
                              Confirm
                            </motion.button>
                          )}

                          {canDeleteApplication(application) && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDeleteApplication(application._id)}
                              disabled={loading}
                              className="flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                              title="Delete application"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </motion.button>
                          )}
                        </div>
                      </div>

                      {application.notes && (
                        <div className="mt-4 bg-white/50 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-slate-700 mb-2">Company Notes:</h4>
                          <p className="text-sm text-slate-600">{application.notes}</p>
                        </div>
                      )}

                      {application.reviewedAt && (
                        <div className="mt-2 text-xs text-slate-500">
                          Reviewed on: {formatDate(application.reviewedAt)}
                        </div>
                      )}

                      {application.confirmed && (
                        <div className="mt-2 text-xs text-green-600">
                          Confirmed by student
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MyApplicationsModal;