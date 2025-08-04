// components/ConfirmedStudentCard.jsx
"use client";

import { motion } from "framer-motion";
import { 
  Calendar, 
  MapPin, 
  GraduationCap, 
  Briefcase,
  Eye,
  User,
  FileText,
  Award,
  CheckCircle
} from "lucide-react";

const ConfirmedStudentCard = ({ studentData, onViewDetails, onMarkAsCompleted }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const { student, offre, confirmedAt, cv } = studentData;

  // Generate initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
    >
      {/* Header with student info */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {getInitials(student?.name)}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {student?.name || 'Name not available'}
              </h3>
              <p className="text-sm text-gray-600">
                {student?.email || 'Email not available'}
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmed
          </span>
        </div>

        {/* Student Details */}
        <div className="mt-4 space-y-2">
          {student?.specialization && (
            <div className="flex items-center text-sm text-gray-600">
              <GraduationCap className="h-4 w-4 mr-2" />
              <span>{student.specialization}</span>
            </div>
          )}
          
          {student?.currentClass && (
            <div className="flex items-center text-sm text-gray-600">
              <Briefcase className="h-4 w-4 mr-2" />
              <span>{student.currentClass}</span>
            </div>
          )}
        </div>
      </div>

      {/* Offer Information */}
      <div className="p-6 border-b border-gray-100">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Confirmed Offer</h4>
        <div className="space-y-2">
          <p className="text-sm font-medium text-blue-600">
            {offre?.titre || 'Title not available'}
          </p>
          
          {offre?.type_offre && (
            <div className="flex items-center text-sm text-gray-600">
              <Briefcase className="h-4 w-4 mr-2" />
              <span>{offre.type_offre}</span>
            </div>
          )}
          
          {offre?.localisation && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{offre.localisation}</span>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Details */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-green-500" />
            <span>Confirmed on {formatDate(confirmedAt)}</span>
          </div>
          
          {cv && (
            <div className="flex items-center text-sm text-blue-600">
              <FileText className="h-4 w-4 mr-1" />
              <span>CV Available</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-6">
        <div className="flex flex-col space-y-3">
          {/* Primary Action - Mark as Completed */}
          <button
            onClick={() => onMarkAsCompleted(studentData)}
            className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Award className="h-4 w-4 mr-2" />
            Mark as Completed
          </button>

          {/* Secondary Action - View Details */}
          <button
            onClick={() => onViewDetails(studentData)}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ConfirmedStudentCard;
