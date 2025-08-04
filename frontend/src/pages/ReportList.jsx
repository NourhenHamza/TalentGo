import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";

const ReportsList = () => {
  const { user } = useContext(AppContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/reports/student/${user._id}`
        );
        setReports(res.data);
      } catch (err) {
        console.error("Failed to fetch reports", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchReports();
    }
  }, [user]);

  if (loading) return <div className="text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4 bg-white shadow rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">My Reports</h2>

      {reports.length === 0 ? (
        <p className="text-center text-gray-500">No reports submitted yet.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Type</th>
              <th className="p-3">Subject</th>
              <th className="p-3">File</th>
              <th className="p-3">Status</th>
              <th className="p-3">Feedback</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report._id} className="border-t">
                <td className="p-3 capitalize">{report.type}</td>
                <td className="p-3">{report.subject?.title || "N/A"}</td>
                <td className="p-3">
                  <a
                    href={report.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View
                  </a>
                </td>
                <td className="p-3">{report.status}</td>
                <td className="p-3">{report.feedback || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ReportsList;
