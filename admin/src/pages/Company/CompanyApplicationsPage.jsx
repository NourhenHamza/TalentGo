// app/company/CompanyApplicationsPage/page.jsx
"use client";

import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, ChevronDown, Filter, Loader2, Search, Users } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import CompanyApplicationCard from "../../components/CompanyApplicationCard";
import CompanyApplicationDetailsModal from "../../components/CompanyApplicationDetailsModal";
import { CompanyContext } from "../../context/CompanyContext";

const CompanyApplicationsPage = () => {
  const { 
    cToken, 
    currentCompany, 
    isLoading: contextLoading,
    backendUrl 
  } = useContext(CompanyContext);
  
  const [applicationsByOffer, setApplicationsByOffer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState(""); // State for category filter
  const [categories, setCategories] = useState([]); // State for dynamic categories
  const [showFilters, setShowFilters] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Fetch categories dynamically
  useEffect(() => {
    const fetchCategories = async () => {
      if (!cToken) return;
      try {
        const response = await axios.get(
          `${backendUrl}/api/applications/categories`,
          {
            headers: { 'cToken': cToken }
          }
        );
        if (response.data.success) {
          setCategories(response.data.categories);
        } else {
          toast.error(response.data.message || "Error loading categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Error loading categories");
      }
    };

    if (cToken) {
      fetchCategories();
    }
  }, [cToken, backendUrl]);

  const fetchCompanyApplications = async () => {
    if (!cToken) {
      console.log("Missing token");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (currentCompany?._id) {
        params.append('companyId', currentCompany._id);
        console.log("Using currentCompany._id:", currentCompany._id);
      } else {
        console.log("currentCompany not available, backend will use token to identify company");
      }
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      if (filterStatus) {
        params.append('status', filterStatus);
      }

      if (filterCategory) {
        params.append('category', filterCategory); // Add category to query params
      }

      console.log("Fetching applications with params:", params.toString());
      console.log("Headers:", { cToken: cToken ? "Present" : "Missing" });
      
      const response = await axios.get(
        `${backendUrl}/api/applications/company-applications?${params.toString()}`,
        {
          headers: {
            'cToken': cToken,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("API Response:", response.data);
      console.log("Response Status:", response.status);
      
      if (response.data.success) {
        setApplicationsByOffer(response.data.applicationsByOffer || []);
        console.log("Applications loaded:", response.data.applicationsByOffer?.length || 0);
      } else {
        console.error("API returned success: false", response.data);
        toast.error(response.data.message || "Error loading applications");
      }
    } catch (error) {
      console.error("Error loading company applications:", error);
      console.error("Error response:", error.response?.data);
      
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error(error.response?.data?.message || "Error loading applications");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cToken) {
      fetchCompanyApplications();
    }
  }, [searchTerm, filterStatus, filterCategory, cToken]); // Add filterCategory to dependencies

  const handleViewDetails = (application) => {
    console.log("Opening details for application:", application);
    setSelectedApplication(application);
    setIsDetailsModalOpen(true);
  };

  const handleStatusUpdateSuccess = (updatedApplication) => {
    console.log("Status update success:", updatedApplication);
    toast.success("Application status updated!");
    setIsDetailsModalOpen(false);
    setSelectedApplication(null);
    fetchCompanyApplications();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  if (contextLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="inline-flex items-center">
          <Loader2 className="animate-spin h-6 w-6 mr-3" />
          Loading...
        </div>
      </div>
    );
  }

  if (!cToken) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to view applications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 relative bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="shape-blob shape-blob-1 absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-100/30 blur-xl"></div>
        <div className="shape-blob shape-blob-2 absolute bottom-0 left-0 w-96 h-96 rounded-full bg-blue-200/20 blur-xl"></div>
        <div className="shape-blob shape-blob-3 absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-indigo-100/20 blur-xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-xl shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-indigo-700 text-transparent bg-clip-text">
              Applications Management
            </h1>
          </div>
          <p className="text-purple-600 ml-12">
            View and manage applications for your job offers.
          </p>
        </motion.header>

        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-blue-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-blue-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by student name, offer title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg flex items-center transition-all duration-300 shadow-md"
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
                <ChevronDown
                  className={`h-4 w-4 ml-2 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      Application Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full p-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      Offer Category
                    </label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full p-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-10 text-purple-600 text-lg">
            <div className="inline-flex items-center">
              <Loader2 className="animate-spin h-6 w-6 mr-3" />
              Loading applications...
            </div>
          </div>
        ) : applicationsByOffer.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-lg">
            {searchTerm || filterStatus || filterCategory ? 
              "No applications found with these search criteria." :
              "No applications found for your offers."
            }
          </div>
        ) : (
          <div className="space-y-8">
            {applicationsByOffer.map((offerGroup) => (
              <div key={offerGroup.offerDetails._id} className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
                <h2 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                  <Briefcase className="h-6 w-6" />
                  Applications for offer: {offerGroup.offerDetails.titre}
                  <span className="ml-auto text-slate-600 text-base font-normal">
                    ({offerGroup.applications.length} application{offerGroup.applications.length > 1 ? 's' : ''})
                  </span>
                </h2>
                {offerGroup.applications.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">
                    No applications for this offer.
                  </p>
                ) : (
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {offerGroup.applications.map((application) => (
                      <CompanyApplicationCard
                        key={application._id}
                        application={application}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <CompanyApplicationDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          console.log("Closing modal");
          setIsDetailsModalOpen(false);
          setSelectedApplication(null);
        }}
        application={selectedApplication}
        onStatusUpdateSuccess={handleStatusUpdateSuccess}
      />
    </div>
  );
};

export default CompanyApplicationsPage;