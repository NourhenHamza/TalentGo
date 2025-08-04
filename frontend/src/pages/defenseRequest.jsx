"use client";

import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Send,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const DefenseRequest = () => {
  const { userData, token, backendUrl, handleLogout } = useContext(AppContext);
  const [formData, setFormData] = useState({
    preferredDate: "",
    notes: "",
  });
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentSubject = async () => {
      setLoading(true);
      try {
        const userId = jwtDecode(token)?.id;
        const { data } = await axios.get(`${backendUrl}/api/defense/student/${userId}`, {
          headers: { token },
        });
        
        if (data) {
          setSubject(data);
        } else {
          toast.error("No subject assigned to you for defense.");
          navigate("/defenses");
        }
      } catch (error) {
        if (error.response?.status === 401) {
          handleLogout();
          navigate("/login");
        } else {
          toast.error("Unable to fetch your subject.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchStudentSubject();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !formData.preferredDate) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const userId = jwtDecode(token)?.id;
    try {
      setSubmitting(true);
      await axios.post(
        `${backendUrl}/api/defense/request`,
        { 
          subjectId: subject._id,
          preferredDate: formData.preferredDate,
          notes: formData.notes,
          studentId: userId,
          universityId: userData.university
        },
        { headers: { token } }
      );
      toast.success("Request submitted!");
      navigate("/defenses");
    } catch (error) {
      toast.error(error.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center mx-auto justify-center px-4 py-12">
      <div className="w-full max-w-2xl ">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 p-6 flex items-center gap-4 border border-blue-100">
          <div className="bg-gradient-to-r from-blue-600 to-sky-500 text-white p-3 rounded-xl shadow-md">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-sky-500">
              Defense Request
            </h1>
            <p className="text-slate-500">
              Schedule your thesis defense presentation
            </p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 relative">
                <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin"></div>
                <div className="absolute inset-3 rounded-full border-2 border-dashed border-blue-200 animate-spin animation-delay-500"></div>
              </div>
              <p className="mt-6 text-slate-600 font-medium">
                Loading your subject information...
              </p>
            </div>
          ) : (
            <>
              {/* Form Header */}
              <div className="bg-gradient-to-r from-blue-500/10 to-sky-500/10 p-6 border-b border-blue-100">
                <h2 className="text-lg font-semibold text-slate-800">
                  Complete Your Request
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Fill in the details below to submit your defense request
                </p>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Subject Information (read-only) */}
                  <div className="space-y-2">
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        Subject
                      </span>
                    </label>
                    <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700">
                      {subject ? (
                        <div>
                          <p className="font-medium">{subject.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{subject.code}</p>
                        </div>
                      ) : (
                        <p className="text-slate-400">No subject assigned</p>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      This is the subject assigned for your defense
                    </p>
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-2">
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        Preferred Date & Time
                      </span>
                      <span className="text-xs text-rose-500 font-medium">
                        Required
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        value={formData.preferredDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            preferredDate: e.target.value,
                          })
                        }
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
                        required
                      />
                      <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                    <p className="text-xs text-slate-500">
                      Choose your preferred date and time for the defense
                    </p>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      <svg
                        className="h-4 w-4 text-blue-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                        />
                      </svg>
                      Additional Notes
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Optional
                    </span>
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={4}
                    placeholder="Any relevant notes for the jury..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 resize-none"
                  ></textarea>
                  <p className="text-xs text-slate-500">
                    Include any additional information for the committee
                  </p>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                  <div className="text-blue-500 mt-0.5">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">
                      Important Information
                    </h3>
                    <p className="text-xs text-blue-700 mt-1">
                      Defense requests must be submitted at least 14 days before
                      your preferred date. The committee will review your
                      request and confirm the final date and time.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !subject}
                    className="w-full bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {submitting ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing Request...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Submit Defense Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
              >
                ← Back
              </button>
              <p className="text-xs text-slate-500">
                All defense requests are subject to approval by the academic
                committee
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefenseRequest;