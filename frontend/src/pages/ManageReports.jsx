"use client";

import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const ManageReports = () => {
  const { token, backendUrl } = useContext(AppContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({});
  const [activeTab, setActiveTab] = useState("all"); // "all" | "pending" | "approved" | "rejected"

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/reports/all`, {
        headers: { token },
      });
      setReports(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleApprove = async (reportId) => {
    try {
      await axios.put(
        `${backendUrl}/api/reports/update/${reportId}`,
        { status: "approved" },
        { headers: { token } }
      );
      toast.success("✅ Report approved!");
      fetchReports();
    } catch (error) {
      console.error(error);
      toast.error("Failed to approve report.");
    }
  };

  const handleReject = async (reportId) => {
    try {
      const reason = feedback[reportId] || "";
      await axios.put(
        `${backendUrl}/api/reports/update/${reportId}`,
        { status: "rejected", feedback: reason },
        { headers: { token } }
      );
      toast.success("❌ Report rejected with feedback.");
      fetchReports();
    } catch (error) {
      console.error(error);
      toast.error("Failed to reject report.");
    }
  };

  const getStatusBadge = (status) => {
    let color = "bg-gray-400";

    if (status === "approved") color = "bg-green-500";
    if (status === "rejected") color = "bg-red-500";
    if (status === "pending") color = "bg-yellow-400";

    return (
      <span className={`text-white text-xs py-1 px-3 rounded-full ${color}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const filteredReports = reports.filter((report) => {
    if (activeTab === "all") return true;
    return report.status === activeTab;
  });

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
        Manage Student Reports 🧑‍🏫
      </h1>

      {/* Tabs for Filtering */}
      <div className="flex gap-4 mb-8">
        {["all", "pending", "approved", "rejected"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 rounded-full text-sm font-medium ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {filteredReports.length === 0 ? (
        <p className="text-gray-500">No reports found for this filter.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <motion.div
              key={report._id}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white p-5 rounded-xl border shadow hover:shadow-lg transition duration-300"
            >
              <p className="text-sm text-gray-600 mb-1">
                <strong>Student:</strong> {report.student?.name || "N/A"}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Subject:</strong> {report.subject?.title || "N/A"}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Type:</strong> {report.type || "General"}
              </p>
              <div className="text-sm mb-2">{getStatusBadge(report.status)}</div>

              <a
                href={report.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-medium hover:underline mb-2 block"
              >
                View Report
              </a>

              {/* Only show feedback textarea if status is pending */}
              {report.status === "pending" && (
                <>
                  <textarea
                    placeholder="Feedback if rejecting..."
                    className="w-full p-2 mt-2 border rounded-md text-sm"
                    value={feedback[report._id] || ""}
                    onChange={(e) =>
                      setFeedback({ ...feedback, [report._id]: e.target.value })
                    }
                  />

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleApprove(report._id)}
                      className="bg-green-500 hover:bg-green-600 text-white py-1 px-4 rounded-md text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(report._id)}
                      className="bg-red-500 hover:bg-red-600 text-white py-1 px-4 rounded-md text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </>
              )}

              {/* If already rejected, show feedback */}
              {report.status === "rejected" && report.feedback && (
                <div className="text-xs text-red-500 mt-2">
                  <strong>Feedback:</strong> {report.feedback}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ManageReports;
