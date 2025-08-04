// components/ConfirmedStudentDetailsModal.jsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Briefcase,
  FileText,
  CheckCircle,
  ExternalLink,
  Award,
  Star,
  Eye
} from "lucide-react";
import { useContext } from "react";
import { toast } from "react-toastify";
import { CompanyContext } from "../../context/CompanyContext";

const ConfirmedStudentDetailsModal = ({ 
  isOpen, 
  onClose, 
  studentData
}) => {
  const { backendUrl } = useContext(CompanyContext);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to get CV URL
  const getCVUrl = (filename) => {
    if (!filename) return null;
    return `${backendUrl}/api/uploads/cvs/${filename}`;
  };

  // Function to handle CV viewing with error handling
  const handleCVView = (filename) => {
    if (!filename) {
      toast.error("Missing CV filename");
      return;
    }

    const cvUrl = getCVUrl(filename);
    console.log("Attempting to open CV:", cvUrl);
    
    const newWindow = window.open(cvUrl, '_blank');
    
    if (!newWindow) {
      toast.error("Popup was blocked. Please allow popups for this site.");
    }
  };

  if (!studentData) return null;

  const { 
    student, 
    offre, 
    confirmedAt, 
    appliedAt, 
    cv, 
    coverLetter, 
    status,
    finalGrade,
    review,
    notes,
    reviewedAt
  } = studentData;

  const isCompleted = status === 'completed';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {student?.name || 'Name not available'}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-600">
                        Confirmed Student Details
                      </p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        isCompleted 
                          ? 'bg-gray-100 text-gray-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {isCompleted ? 'Completed' : 'Confirmed'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="p-6 space-y-6">
                  {/* Student Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Student Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <p className="mt-1 text-sm text-gray-900">{student?.name || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{student?.email || 'Not specified'}</p>
                      </div>

                      {student?.profile?.phone && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Phone</label>
                          <p className="mt-1 text-sm text-gray-900">{student.profile.phone}</p>
                        </div>
                      )}

                      {student?.specialization && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Specialization</label>
                          <p className="mt-1 text-sm text-gray-900">{student.specialization}</p>
                        </div>
                      )}

                      {student?.currentClass && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Current Class</label>
                          <p className="mt-1 text-sm text-gray-900">{student.currentClass}</p>
                        </div>
                      )}

                      {student?.university && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">University</label>
                          <p className="mt-1 text-sm text-gray-900">{student.university}</p>
                        </div>
                      )}

                      {student?.profile?.linkedin && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                          <a
                            href={student.profile.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            View Profile
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      )}
                    </div>

                    {student?.profile?.bio && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Bio</label>
                        <p className="mt-1 text-sm text-gray-900">{student.profile.bio}</p>
                      </div>
                    )}
                  </div>

                  {/* Offer Information */}
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Briefcase className="h-5 w-5 mr-2" />
                      Confirmed Offer
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Offer Title</label>
                        <p className="mt-1 text-sm font-medium text-blue-600">{offre?.titre || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Offer Type</label>
                        <p className="mt-1 text-sm text-gray-900">{offre?.type_offre || 'Not specified'}</p>
                      </div>

                      {offre?.localisation && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Location</label>
                          <p className="mt-1 text-sm text-gray-900">{offre.localisation}</p>
                        </div>
                      )}

                      {offre?.date_debut && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Start Date</label>
                          <p className="mt-1 text-sm text-gray-900">{formatDate(offre.date_debut)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Timeline
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-sm text-gray-600">
                          Application submitted on {formatDate(appliedAt)}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-sm text-gray-600">
                          Confirmed on {formatDate(confirmedAt)}
                        </span>
                      </div>

                      {isCompleted && reviewedAt && (
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                          <span className="text-sm text-gray-600">
                            Marked as completed on {formatDate(reviewedAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Final Evaluation (if completed) */}
                  {isCompleted && (finalGrade !== null || review) && (
                    <div className="bg-yellow-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Award className="h-5 w-5 mr-2" />
                        Final Evaluation
                      </h3>
                      
                      <div className="space-y-4">
                        {finalGrade !== null && finalGrade !== undefined && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Final Grade</label>
                            <div className="mt-1 flex items-center">
                              <span className="text-2xl font-bold text-yellow-600">{finalGrade}</span>
                              <span className="text-lg text-gray-500 ml-1">/100</span>
                            </div>
                          </div>
                        )}

                        {review && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Review</label>
                            <div className="bg-white rounded-lg border p-4">
                              <p className="text-sm text-gray-900 whitespace-pre-wrap">{review}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Documents */}
                  {(cv || coverLetter) && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Documents
                      </h3>
                      
                      <div className="space-y-3">
                        {cv && (
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-blue-500 mr-3" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{cv.filename}</p>
                                <p className="text-xs text-gray-500">
                                  Uploaded on {formatDate(cv.uploadedAt)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleCVView(cv.filename)}
                              className="flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View CV
                            </button>
                          </div>
                        )}

                        {coverLetter && (
                          <div className="p-3 bg-white rounded-lg border">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Cover Letter</h4>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{coverLetter}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmedStudentDetailsModal;
