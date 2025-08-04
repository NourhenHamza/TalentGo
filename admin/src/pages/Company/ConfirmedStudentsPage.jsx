// app/company/ConfirmedStudentsPage/page.jsx
"use client";

import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { 
  CheckCircle, 
  ChevronDown, 
  Filter, 
  Loader2, 
  Search, 
  Users, 
  Calendar,
  UserCheck,
  Award,
  TrendingUp,
  Clock,
  History
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import ConfirmedStudentCard from "./ConfirmedStudentCard";
import ConfirmedStudentDetailsModal from "./ConfirmedStudentDetailsModal";
import CompletionModal from "./CompletionModal";
import ConfirmedStudentsStats from "./ConfirmedStudentsStats";
import CompletedStudentsTable from "./CompletedStudentsTable";
import { CompanyContext } from "../../context/CompanyContext";

const ConfirmedStudentsPage = () => {
  const { 
    cToken, 
    currentCompany, 
    isLoading: contextLoading,
    backendUrl 
  } = useContext(CompanyContext);
  
  const [confirmedStudents, setConfirmedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOffer, setFilterOffer] = useState("");
  const [sortBy, setSortBy] = useState("confirmedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [studentToComplete, setStudentToComplete] = useState(null);
  const [statistics, setStatistics] = useState({});
  const [companyOffers, setCompanyOffers] = useState([]);

  // Separate pending and completed students
  const pendingStudents = confirmedStudents.filter(student => student.status === 'accepted');
  const completedStudents = confirmedStudents.filter(student => student.status === 'completed');

  // Fetch company offers for filter dropdown
  useEffect(() => {
    const fetchCompanyOffers = async () => {
      if (!cToken) return;
      try {
        const response = await axios.get(
          `${backendUrl}/api/offres/company-offers`,
          {
            headers: { 'cToken': cToken }
          }
        );
        if (response.data.success) {
          setCompanyOffers(response.data.offers || []);
        }
      } catch (error) {
        console.error("Error fetching company offers:", error);
      }
    };

    fetchCompanyOffers();
  }, [cToken, backendUrl]);

  // Fetch confirmed students
  const fetchConfirmedStudents = async () => {
    if (!cToken) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (filterOffer) params.append('offerId', filterOffer);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await axios.get(
        `${backendUrl}/api/applications/confirmed-students?${params.toString()}`,
        {
          headers: { 'cToken': cToken }
        }
      );

      if (response.data.success) {
        setConfirmedStudents(response.data.confirmedStudents || []);
        setStatistics(response.data.statistics || {});
      } else {
        toast.error(response.data.message || "Error loading confirmed students");
      }
    } catch (error) {
      console.error("Error fetching confirmed students:", error);
      toast.error("Error loading confirmed students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfirmedStudents();
  }, [cToken, searchTerm, filterOffer, sortBy, sortOrder]);

  // Handle completion
  const handleMarkAsCompleted = (studentData) => {
    setStudentToComplete(studentData);
    setIsCompletionModalOpen(true);
  };

  const handleCompletionSubmit = async (completionData) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/applications/${studentToComplete._id}/status-by-company`,
        {
          status: 'completed',
          finalGrade: completionData.finalGrade,
          review: completionData.review
        },
        {
          headers: { 'cToken': cToken }
        }
      );

      if (response.data.success) {
        toast.success("Student marked as completed successfully");
        fetchConfirmedStudents(); // Refresh the list
        setIsCompletionModalOpen(false);
        setStudentToComplete(null);
      } else {
        toast.error(response.data.message || "Error updating status");
      }
    } catch (error) {
      console.error("Error marking as completed:", error);
      toast.error("Error updating student status");
    }
  };

  // Handle student details view
  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setIsDetailsModalOpen(true);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilterOffer("");
    setSortBy("confirmedAt");
    setSortOrder("desc");
  };

  if (contextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Confirmed Students
                </h1>
                <p className="text-gray-600">
                  Manage students who have confirmed their participation in your offers
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {statistics.total || 0}
                </div>
                <div className="text-sm text-gray-500">Total Confirmed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {statistics.pending || 0}
                </div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {statistics.completed || 0}
                </div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Component */}
      <ConfirmedStudentsStats statistics={statistics} />

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by student name, email, or offer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Offer Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Offer
                      </label>
                      <select
                        value={filterOffer}
                        onChange={(e) => setFilterOffer(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Offers</option>
                        {companyOffers.map((offer) => (
                          <option key={offer._id} value={offer._id}>
                            {offer.titre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sort By */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sort By
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="confirmedAt">Confirmation Date</option>
                        <option value="appliedAt">Application Date</option>
                        <option value="student.name">Student Name</option>
                      </select>
                    </div>

                    {/* Sort Order */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order
                      </label>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                      </select>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pending Students Section */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Pending Completion
                  </h2>
                  <p className="text-sm text-gray-600">
                    Students awaiting completion evaluation ({pendingStudents.length})
                  </p>
                </div>
              </div>

              {pendingStudents.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Pending Students
                  </h3>
                  <p className="text-gray-600">
                    All confirmed students have been completed.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingStudents.map((studentData) => (
                    <ConfirmedStudentCard
                      key={studentData._id}
                      studentData={studentData}
                      onViewDetails={handleViewDetails}
                      onMarkAsCompleted={handleMarkAsCompleted}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Completed Students Section */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <History className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Completion History
                  </h2>
                  <p className="text-sm text-gray-600">
                    Students who have completed their participation ({completedStudents.length})
                  </p>
                </div>
              </div>

              <CompletedStudentsTable
                completedStudents={completedStudents}
                onViewDetails={handleViewDetails}
              />
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <ConfirmedStudentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        studentData={selectedStudent}
      />

      {/* Completion Modal */}
      <CompletionModal
        isOpen={isCompletionModalOpen}
        onClose={() => {
          setIsCompletionModalOpen(false);
          setStudentToComplete(null);
        }}
        studentData={studentToComplete}
        onSubmit={handleCompletionSubmit}
      />
    </div>
  );
};

export default ConfirmedStudentsPage;
