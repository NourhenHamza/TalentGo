// components/StatusBadge.jsx
import React from 'react';
import { Clock, Eye, CheckCircle, XCircle, Award } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { text: "Pending", color: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-3 w-3" /> },
    reviewed: { text: "Reviewed", color: "bg-blue-100 text-blue-800", icon: <Eye className="h-3 w-3" /> },
    accepted: { text: "Accepted", color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-3 w-3" /> },
    rejected: { text: "Rejected", color: "bg-red-100 text-red-800", icon: <XCircle className="h-3 w-3" /> },
    completed: { text: "Completed", color: "bg-purple-100 text-purple-800", icon: <Award className="h-3 w-3" /> }
  };

  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon && <span className="mr-1">{config.icon}</span>}
      {config.text}
    </span>
  );
};

export default StatusBadge;