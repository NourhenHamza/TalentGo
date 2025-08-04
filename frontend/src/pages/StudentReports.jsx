"use client";

import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const StudentReports = () => {
  const { token, backendUrl } = useContext(AppContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/reports/my-reports`, {
        headers: { token },
      });

      setReports(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch your reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  const getStatusBadge = (status) => {
    let color = "bg-gray-400";
    const normalized = status?.toLowerCase();

    if (normalized === "approved") color = "bg-green-500";
    if (normalized === "rejected") color = "bg-red-500";

    return (
      <span className={`text-white text-xs py-1 px-2 rounded-full ${color}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">
        My Submitted Reports 📄
      </h1>

      {reports.length === 0 ? (
        <p className="text-gray-500">You haven't submitted any reports yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div
              key={report._id}
              className="bg-white p-5 rounded-xl border shadow hover:shadow-lg transition duration-300"
            >
              <p className="text-sm text-gray-600 mb-1">
                <strong>Subject:</strong> {report.subject?.title || "N/A"}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Type:</strong> {report.type || "General"}
              </p>

              <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                <strong>Status:</strong> {getStatusBadge(report.status || "Pending")}
              </div>

              {report.status?.toLowerCase() === "rejected" && report.feedback && (
                <div className="text-xs text-red-500 mb-2">
                  <strong>Reason:</strong> {report.feedback}
                </div>
              )}

              <a
                href={report.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-medium hover:underline"
              >
                View Submitted Report
              </a>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default StudentReports;
