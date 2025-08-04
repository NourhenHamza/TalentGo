import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';
import { ProfessorContext } from '../../context/ProfessorContext';

const ProfessorReports = () => {
  const { dToken, backendUrl } = useContext(ProfessorContext);
  const { currency } = useContext(AppContext);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const getReports = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/report/all`, {
        headers: { dToken },
      });

      if (data.success) {
        setReports(data.data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch reports.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (reportId, newStatus) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/report/update/${reportId}`,
        { status: newStatus },
        { headers: { dToken } }
      );

      if (data.success) {
        toast.success(data.message);
        getReports();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update report status.');
    }
  };

  const updateFeedback = async (reportId, feedback) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/report/update/${reportId}`,
        { feedback },
        { headers: { dToken } }
      );

      if (data.success) {
        toast.success('Feedback updated');
        getReports();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update feedback.');
    }
  };

  useEffect(() => {
    if (dToken) {
      getReports();
    } else {
      toast.warn('Please login as a professor.');
    }
  }, [dToken]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Submitted Reports</h1>
        {loading ? (
          <p>Loading reports...</p>
        ) : reports.length === 0 ? (
          <p className="text-gray-600">No reports found.</p>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <div
                key={report._id}
                className="border p-4 rounded-lg shadow-sm bg-gray-100"
              >
                <div className="mb-2">
                  <span className="font-semibold">Student:</span>{' '}
                  {report.studentName || 'N/A'}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Week:</span> {report.week}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Submitted At:</span>{' '}
                  {new Date(report.createdAt).toLocaleString()}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Status:</span>{' '}
                  <select
                    value={report.status}
                    onChange={(e) => updateStatus(report._id, e.target.value)}
                    className="ml-2 p-1 border rounded"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Feedback:</span>
                  <textarea
                    value={report.feedback || ''}
                    onChange={(e) => updateFeedback(report._id, e.target.value)}
                    placeholder="Write feedback here..."
                    className="w-full mt-1 p-2 border rounded"
                  />
                </div>
                <div>
                  {report.fileUrl ? (
                    <a
                      href={report.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Submitted Report
                    </a>
                  ) : (
                    <span className="text-red-500">No file submitted</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessorReports;
