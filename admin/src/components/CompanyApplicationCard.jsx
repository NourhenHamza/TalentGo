// components/CompanyApplicationCard.jsx
"use client";

import { motion } from "framer-motion";
 
import { Briefcase, Eye, FileText, Mail, MapPin } from "lucide-react";
import StatusBadge from "./StatusBadge"; // Import the StatusBadge component
 
 

const CompanyApplicationCard = ({ application, onViewDetails }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 flex flex-col h-full"
      variants={cardVariants}
      whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
            {application.student?.name ? application.student.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              {application.student?.name || "Unknown Student"}
            </h3>
            <p className="text-slate-600 text-sm">{application.student?.email || "Unknown Email"}</p>
          </div>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="mb-4">
        <h4 className="text-md font-medium text-slate-700 mb-2">Offer Applied For:</h4>
        <p className="text-blue-600 font-semibold">{application.offre?.titre || "Unknown Offer Title"}</p>
        <p className="text-slate-500 text-sm">{application.offre?.type_offre || "Type not specified"} • {application.offre?.localisation || "Location not specified"}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700 mb-4 flex-grow">
        <div className="flex items-center">
          <FileText className="h-4 w-4 text-slate-500 mr-2" />
          <span>CV: {application.cv?.filename || "Not provided"}</span>
        </div>
        <div className="flex items-center">
          <Briefcase className="h-4 w-4 text-slate-500 mr-2" />
          <span>Specialization: {application.student?.specialization || "N/A"}</span>
        </div>
        <div className="flex items-center">
          <MapPin className="h-4 w-4 text-slate-500 mr-2" />
          <span>Class: {application.student?.currentClass || "N/A"}</span>
        </div>
        <div className="flex items-center">
          <Mail className="h-4 w-4 text-slate-500 mr-2" />
          <span>Applied on: {formatDate(application.appliedAt)}</span>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-blue-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onViewDetails(application)}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors duration-200 shadow-md flex items-center justify-center gap-2"
        >
          <Eye className="h-4 w-4" />
          View Details
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CompanyApplicationCard;
