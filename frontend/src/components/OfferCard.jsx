// components/OfferCard.jsx
"use client";

import { motion } from "framer-motion";
import { Briefcase, MapPin, Tag, Calendar, Layers, DollarSign, CheckCircle, Clock, XCircle, Eye, Loader2, Check, Send } from "lucide-react";

const OfferCard = ({ offer, onApply, applicationStatus, getStatusBadge, isApplying = false }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Determine if the user has already applied
  const hasApplied = applicationStatus && applicationStatus.status;

  // Function to get the status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'reviewed':
        return <Eye className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Function to get the status text in English
  const getStatusText = (status) => {
    switch(status) {
      case 'pending':
        return 'Pending';
      case 'reviewed':
        return 'Reviewed';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending';
    }
  };

  // Function to get button configuration based on state
  const getButtonConfig = () => {
    // Loading state during submission
    if (isApplying) {
      return {
        text: "Sending...",
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        disabled: true,
        className: "px-4 py-2 bg-blue-400 text-white rounded-lg text-sm font-medium cursor-not-allowed opacity-75 flex items-center gap-2"
      };
    }

    // States after application
    if (hasApplied) {
      const statusConfigs = {
        pending: {
          text: "Application Sent",
          icon: <Send className="h-4 w-4" />,
          className: "px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium cursor-default flex items-center gap-2 border border-orange-200"
        },
        reviewed: {
          text: "Under Review",
          icon: <Eye className="h-4 w-4" />,
          className: "px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium cursor-default flex items-center gap-2 border border-blue-200"
        },
        accepted: {
          text: "Application Accepted",
          icon: <CheckCircle className="h-4 w-4" />,
          className: "px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium cursor-default flex items-center gap-2 border border-green-200"
        },
        rejected: {
          text: "Application Rejected",
          icon: <XCircle className="h-4 w-4" />,
          className: "px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium cursor-default flex items-center gap-2 border border-red-200"
        }
      };

      return {
        ...statusConfigs[applicationStatus.status],
        disabled: true
      };
    }

    // Default state - can apply
    return {
      text: "Apply",
      icon: <Send className="h-4 w-4" />,
      disabled: false,
      className: "px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md flex items-center gap-2"
    };
  };

  const buttonConfig = getButtonConfig();

  // Function to handle button click
  const handleButtonClick = () => {
    if (!buttonConfig.disabled && !hasApplied && !isApplying) {
      onApply(offer);
    }
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 flex flex-col h-full relative"
      variants={cardVariants}
      whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
      transition={{ duration: 0.2 }}
    >
      {/* Application status badge if applicable */}
      {hasApplied && (
        <div className="absolute top-4 right-4">
          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
            applicationStatus.status === 'pending' ? 'bg-orange-100 text-orange-700' :
            applicationStatus.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
            applicationStatus.status === 'accepted' ? 'bg-green-100 text-green-700' :
            'bg-red-100 text-red-700'
          }`}>
            {getStatusIcon(applicationStatus.status)}
            {getStatusText(applicationStatus.status)}
          </div>
        </div>
      )}

      <div className="flex items-center mb-4">
        {offer.entreprise_id?.logo_url && (
          <img
            src={offer.entreprise_id.logo_url}
            alt={offer.entreprise_id.nom}
            className="w-12 h-12 rounded-full mr-4 object-cover border border-blue-200"
          />
        )}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-slate-800 pr-16">{offer.titre}</h3>
          <p className="text-blue-600 font-medium">{offer.entreprise_id?.nom || "Unknown Company"}</p>
        </div>
      </div>

      <p className="text-slate-600 mb-4 flex-grow">{offer.description.substring(0, 150)}...</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700 mb-4">
        <div className="flex items-center">
          <Briefcase className="h-4 w-4 text-blue-500 mr-2" />
          <span>{offer.type_offre}</span>
        </div>
        {offer.localisation && (
          <div className="flex items-center">
            <MapPin className="h-4 w-4 text-blue-500 mr-2" />
            <span>{offer.localisation}</span>
          </div>
        )}
        {offer.duree && (
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-blue-500 mr-2" />
            <span>Duration: {offer.duree}</span>
          </div>
        )}
        {offer.remuneration && (
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-blue-500 mr-2" />
            <span>{offer.remuneration}</span>
          </div>
        )}
        <div className="flex items-center col-span-full">
          <Layers className="h-4 w-4 text-blue-500 mr-2" />
          <span className="flex flex-wrap gap-1">
            {offer.competences_requises && offer.competences_requises.length > 0 ? (
              offer.competences_requises.map((skill, index) => (
                <span key={index} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-slate-500">Skills not specified</span>
            )}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center mt-auto pt-4 border-t border-blue-50">
        <span className="text-xs text-slate-500">Deadline: {formatDate(offer.date_limite_candidature)}</span>
        
        <motion.button
          whileHover={!buttonConfig.disabled ? { scale: 1.05 } : {}}
          whileTap={!buttonConfig.disabled ? { scale: 0.95 } : {}}
          onClick={handleButtonClick}
          disabled={buttonConfig.disabled}
          className={buttonConfig.className}
          title={hasApplied ? `Application ${getStatusText(applicationStatus.status).toLowerCase()}` : "Apply for this offer"}
        >
          {buttonConfig.icon}
          <span>{buttonConfig.text}</span>
        </motion.button>
      </div>

      {/* Additional application information */}
      {hasApplied && (
        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-600 space-y-1">
            <div className="flex justify-between items-center">
              <span>Application sent:</span>
              <span className="font-medium">{formatDate(applicationStatus.appliedAt)}</span>
            </div>
            {applicationStatus.reviewedAt && (
              <div className="flex justify-between items-center">
                <span>Reviewed on:</span>
                <span className="font-medium">{formatDate(applicationStatus.reviewedAt)}</span>
              </div>
            )}
          </div>
          
          {/* Specific messages based on status */}
          {applicationStatus.status === 'accepted' && (
            <div className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
              🎉 Congratulations! Your application has been accepted!
            </div>
          )}
          
          {applicationStatus.status === 'pending' && (
            <div className="mt-2 text-xs text-orange-600 flex items-center gap-1">
              ⏳ Your application is pending review
            </div>
          )}
          
          {applicationStatus.status === 'reviewed' && (
            <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
              👀 Your application has been reviewed
            </div>
          )}
          
          {applicationStatus.status === 'rejected' && (
            <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
              ❌ Your application was not selected
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default OfferCard;
