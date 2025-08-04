 // app/company/CompanyApplicationsPage/page.jsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, ChevronDown, FileCheck, Filter, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
 
import api from "../../../admin/src/utils/api";
import ApplyModal from "../components/ApplyModal";
import MyApplicationsModal from "../components/MyApplicationsModal";
import OfferCard from "../components/OfferCard";

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [applicationStatuses, setApplicationStatuses] = useState({}); // To track application statuses
  const [applyingOffers, setApplyingOffers] = useState(new Set()); // Keeps track of offers currently being applied for
  const [loading, setLoading] = useState(true);
  const [checkingApplications, setCheckingApplications] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterSkills, setFilterSkills] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedOfferToApply, setSelectedOfferToApply] = useState(null);
  const [isMyApplicationsModalOpen, setIsMyApplicationsModalOpen] = useState(false);

const fetchOffers = async () => {
  setLoading(true);
  try {
    const params = {
      search: searchTerm,
      type: filterType,
      location: filterLocation,
      skills: filterSkills,
    };
    const response = await api.get("/offres", params);
    
    // Fix: Handle the correct response structure
    const offersData = response.data || response.offres || response;
    
    // Ensure offersData is an array
    const offersArray = Array.isArray(offersData) ? offersData : [];
    
    setOffers(offersArray);
    
    // After loading offers, check application statuses
    if (offersArray.length > 0) {
      await checkApplicationStatuses(offersArray);
    }
    
  } catch (error) {
    console.error("Error loading offers:", error);
    toast.error(error.message || "Error loading offers.");
    // Set offers to empty array on error
    setOffers([]);
  } finally {
    setLoading(false);
  }
};

  const fetchMyApplications = async () => {
    try {
      const response = await api.get("/applications/my-applications");
      const applications = response.applications || [];
      setMyApplications(applications);
      
      // Create an object to quickly track statuses
      const statuses = {};
      applications.forEach(app => {
        if (app.offre && app.offre._id) {
          statuses[app.offre._id] = {
            status: app.status,
            appliedAt: app.appliedAt,
            applicationId: app._id
          };
        }
      });
      setApplicationStatuses(statuses);
      
    } catch (error) {
      console.error("Error loading applications:", error);
      // Do not display an error here as it's a background request
    }
  };

  // Corrected function to check application statuses
  const checkApplicationStatuses = async (offersList) => {
    setCheckingApplications(true);
    console.log('Checking application statuses for', offersList.length, 'offers');
    
    try {
      const statusPromises = offersList.map(async (offer) => {
        try {
          const response = await api.get(`/applications/check/${offer._id}`);
          return {
            offerId: offer._id,
            status: response.hasApplied && response.application ? {
              status: response.application.status,
              appliedAt: response.application.appliedAt,
              applicationId: response.application._id
            } : null
          };
        } catch (error) {
          console.log(`Error checking status for offer ${offer._id}:`, error.message);
          return { offerId: offer._id, status: null };
        }
      });

      const results = await Promise.allSettled(statusPromises);
      const newStatuses = {};
      
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.status) {
          newStatuses[result.value.offerId] = result.value.status;
        }
      });

      console.log('Application statuses updated:', newStatuses);
      setApplicationStatuses(prev => ({ ...prev, ...newStatuses }));
      
    } catch (error) {
      console.error("Error checking statuses:", error);
    } finally {
      setCheckingApplications(false);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchMyApplications();
  }, [searchTerm, filterType, filterLocation, filterSkills]);

  // Function to handle applications with the modal
  const handleApplyClick = (offer) => {
    const offerId = offer._id;
    
    // Check if the student has already applied
    const hasApplied = applicationStatuses[offerId];
    if (hasApplied) {
      toast.warning("You have already applied for this offer.");
      return;
    }

    // Check if an application is already in progress for this offer
    if (applyingOffers.has(offerId)) {
      toast.info("Application in progress for this offer...");
      return;
    }
    
    setSelectedOfferToApply(offer);
    setIsApplyModalOpen(true);
  };

  // Function to handle application submission from the modal
  const handleApplicationSubmit = async (applicationData) => {
    const offerId = selectedOfferToApply._id;
    
    // Mark this offer as "application in progress"
    setApplyingOffers(prev => new Set(prev).add(offerId));
    
    try {
      // Call your API to submit the application
      const response = await api.post('/applications', {
        offreId: offerId,
        cvId: applicationData.cvId,
        coverLetter: applicationData.coverLetter
      });
      
      if (response.success || response.application) {
        // Close the modal
        setIsApplyModalOpen(false);
        setSelectedOfferToApply(null);
        
        // Update applications
        await fetchMyApplications();
        
        // Update the status immediately for this offer
        const newApplication = response.application || {
          status: 'pending',
          appliedAt: new Date().toISOString(),
          _id: response._id || `temp_${Date.now()}`
        };
        
        setApplicationStatuses(prev => ({
          ...prev,
          [offerId]: {
            status: newApplication.status,
            appliedAt: newApplication.appliedAt,
            applicationId: newApplication._id
          }
        }));
        
        toast.success('Application sent successfully!');
      }
    } catch (error) {
      console.error('Error during application:', error);
      toast.error(error.message || 'Error sending application');
    } finally {
      // Remove this offer from the "in progress" list
      setApplyingOffers(prev => {
        const newSet = new Set(prev);
        newSet.delete(offerId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: "Pending", color: "bg-yellow-100 text-yellow-800", icon: "⏳" },
      reviewed: { text: "Reviewed", color: "bg-blue-100 text-blue-800", icon: "👀" },
      accepted: { text: "Accepted", color: "bg-green-100 text-green-800", icon: "✅" },
      rejected: { text: "Rejected", color: "bg-red-100 text-red-800", icon: "❌" }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {config.text}
      </span>
    );
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

  return (
    <div className="p-6 relative bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen">
      {/* Background decorative elements */}
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 text-transparent bg-clip-text">
                  Discover Offers
                </h1>
                <p className="text-blue-600">Find your ideal internship or job among our listings.</p>
              </div>
            </div>
            
            {/* Button to view my applications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMyApplicationsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg transition-all duration-300"
            >
              <FileCheck className="h-5 w-5" />
              My Applications
              {myApplications.length > 0 && (
                <span className="bg-white text-indigo-600 px-2 py-1 rounded-full text-xs font-bold">
                  {myApplications.length}
                </span>
              )}
            </motion.button>
          </div>
        </motion.header>

        {/* Search and Filters */}
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
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg flex items-center transition-all duration-300 shadow-md"
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
                <ChevronDown
                  className={`h-4 w-4 ml-2 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {/* Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">Offer Type</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full p-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                    >
                      <option value="">All Types</option>
                      <option value="Stage">Internship</option>
                      <option value="Emploi">Job</option>
                      <option value="Alternance">Apprenticeship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                      placeholder="Ex: Paris, Remote"
                      className="w-full p-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">Skills (comma-separated)</label>
                    <input
                      type="text"
                      value={filterSkills}
                      onChange={(e) => setFilterSkills(e.target.value)}
                      placeholder="Ex: React, Node.js, Python"
                      className="w-full p-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Application checking indicator */}
        {checkingApplications && (
          <div className="mb-4 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
              Checking applications...
            </div>
          </div>
        )}

        {/* List of offers */}
        {loading ? (
          <div className="text-center py-10 text-blue-600 text-lg">
            <div className="inline-flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
              Loading offers...
            </div>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-lg">
            No offers found matching your criteria.
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {offers.map((offer) => {
              const applicationStatus = applicationStatuses[offer._id];
              
              return (
                <OfferCard 
                  key={offer._id} 
                  offer={offer} 
                  onApply={handleApplyClick}
                  applicationStatus={applicationStatus}
                  getStatusBadge={getStatusBadge}
                  isApplying={applyingOffers.has(offer._id)}
                />
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Application modal */}
      {selectedOfferToApply && (
        <ApplyModal
          isOpen={isApplyModalOpen}
          onClose={() => {
            setIsApplyModalOpen(false);
            setSelectedOfferToApply(null);
          }}
          offer={selectedOfferToApply}
          onApplicationSuccess={handleApplicationSubmit}
        />
      )}

      {/* My Applications modal */}
      <MyApplicationsModal
        isOpen={isMyApplicationsModalOpen}
        onClose={() => setIsMyApplicationsModalOpen(false)}
        applications={myApplications}
        getStatusBadge={getStatusBadge}
        onRefresh={fetchMyApplications}
      />
    </div>
  );
};

export default Offers;
