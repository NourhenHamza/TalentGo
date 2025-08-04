"use client";

import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useContext, useEffect, useState } from 'react';
import {
  FiActivity,
  FiAlertCircle,
  FiAlertTriangle,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiInfo,
  FiMail,
  FiMapPin,
  FiTrash2,
  FiUser,
  FiUsers,
  FiX
} from "react-icons/fi";
import { toast } from 'react-toastify';
import { AdminContext } from '../context/AdminContext';
import { CompanyContext } from '../context/CompanyContext';

const Partnerships = () => {
  const { aToken } = useContext(AdminContext);
  const { cToken } = useContext(CompanyContext);
  const [partnerships, setPartnerships] = useState([]);
  const [acceptedPartners, setAcceptedPartners] = useState([]);
  const [pendingPartners, setPendingPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailsModal, setDetailsModal] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState('accepted');

  const API_BASE_URL = 'http://localhost:4000';

  // Decode token to get user ID and role
  useEffect(() => {
    const token = aToken || cToken;
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.id);
        setUserRole(decoded.role);
      } catch (err) {
        console.error('Token decode error:', err);
        setError('Invalid authentication token');
      }
    }
  }, [aToken, cToken]);

  // Fetch partnerships based on user type
  useEffect(() => {
    const fetchPartnerships = async () => {
      if (!userId || !userRole) return;

      try {
        setLoading(true);
        setError(null);
        
        const token = aToken || cToken;
        const apiUrl = `${API_BASE_URL}/api/partnerships`;

        const response = await axios.get(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        });

        if (typeof response.data === 'string') {
          setError('Backend server not responding correctly.');
          return;
        }

        if (response.data && response.data.success) {
          const allPartnerships = response.data.partnerships || [];
          setPartnerships(allPartnerships);
          
          const accepted = [];
          const pending = [];
          
          allPartnerships.forEach(partnership => {
            const partner = partnership.yourRole === 'initiator' ? partnership.target : partnership.initiator;
            const partnerData = {
              _id: partner._id,
              name: partner.name,
              type: partner.type,
              email: partner.email,
              description: partner.description,
              address: partner.address,
              logo: partner.logo,
              partnershipStatus: partnership.status,
              partnershipId: partnership._id,
              yourRole: partnership.yourRole,
              partnership: partnership
            };
            
            if (partnership.status === 'accepted') {
              accepted.push(partnerData);
            } else if (partnership.status === 'pending') {
              pending.push(partnerData);
            }
          });
          
          setAcceptedPartners(accepted);
          setPendingPartners(pending);
        } else {
          setError(response.data?.message || 'Failed to fetch partnerships');
        }
      } catch (err) {
        console.error('Fetch partnerships error:', err);
        
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
          setError('Cannot connect to backend server.');
        } else if (err.response) {
          setError(`Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
        } else if (err.request) {
          setError('No response from server.');
        } else {
          setError(err.message || 'An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPartnerships();
  }, [userId, userRole, aToken, cToken]);

  // Handle accept partnership
  const handleAccept = async (partnershipId) => {
    try {
      const token = aToken || cToken;
      const response = await axios.patch(
        `${API_BASE_URL}/api/partnerships/${partnershipId}`,
        { action: 'accept' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success('Partnership accepted successfully');
        // Refresh the partnerships data
        const updatedPartnerships = partnerships.map(p => 
          p._id === partnershipId ? { ...p, status: 'accepted' } : p
        );
        setPartnerships(updatedPartnerships);
        
        // Update the accepted and pending lists
        const acceptedPartner = pendingPartners.find(p => p.partnershipId === partnershipId);
        if (acceptedPartner) {
          setAcceptedPartners([...acceptedPartners, { ...acceptedPartner, partnershipStatus: 'accepted' }]);
          setPendingPartners(pendingPartners.filter(p => p.partnershipId !== partnershipId));
        }
      }
    } catch (err) {
      console.error('Accept partnership error:', err);
      toast.error(err.response?.data?.message || 'Failed to accept partnership');
    }
  };

  // Handle remove partnership
  const handleRemovePartnership = async (partnershipId) => {
    if (window.confirm('Are you sure you want to remove this partnership?')) {
      try {
        const token = aToken || cToken;
        await axios.delete(`${API_BASE_URL}/api/partnerships/${partnershipId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Partnership removed successfully');
        setPartnerships(partnerships.filter(p => p._id !== partnershipId));
        setAcceptedPartners(acceptedPartners.filter(p => p.partnershipId !== partnershipId));
      } catch (err) {
        console.error('Remove partnership error:', err);
        toast.error(err.response?.data?.message || 'Failed to remove partnership');
      }
    }
  };

  // Handle delete partnership request
  const handleDeleteRequest = async (partnershipId) => {
    if (window.confirm('Are you sure you want to delete this partnership request?')) {
      try {
        const token = aToken || cToken;
        await axios.delete(`${API_BASE_URL}/api/partnerships/${partnershipId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Partnership request deleted successfully');
        setPartnerships(partnerships.filter(p => p._id !== partnershipId));
        setPendingPartners(pendingPartners.filter(p => p.partnershipId !== partnershipId));
      } catch (err) {
        console.error('Delete partnership request error:', err);
        toast.error(err.response?.data?.message || 'Failed to delete partnership request');
      }
    }
  };

  // Show partnership details
  const showDetails = async (partnershipId) => {
    try {
      const token = aToken || cToken;
      const response = await axios.get(`${API_BASE_URL}/api/partnerships/${partnershipId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        setDetailsModal(response.data.partnership);
      }
    } catch (err) {
      console.error('Fetch partnership details error:', err);
      toast.error(err.response?.data?.message || 'Failed to fetch partnership details');
    }
  };

  // Close details modal
  const closeDetails = () => {
    setDetailsModal(null);
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex justify-center items-center p-4">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-blue-800 font-medium">
            Loading partnerships...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex justify-center items-center p-4">
        <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-xl border-l-4 border-red-500">
          <div className="flex items-start">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <FiAlertCircle className="text-red-600 text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-700">
                Error Loading Data
              </h3>
              <p className="text-red-600 mt-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userId || !userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex justify-center items-center p-4">
        <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-xl border-l-4 border-red-500">
          <div className="flex items-start">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <FiAlertCircle className="text-red-600 text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-700">
                Authentication Error
              </h3>
              <p className="text-red-600 mt-2">Unable to authenticate user</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-xl border border-blue-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-3 rounded-xl text-white shadow-md mr-4">
                <FiUsers className="text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-900">
                  Partnership Management
                </h1>
                <p className="text-blue-600 mt-1">
                  {acceptedPartners.length} active partner{acceptedPartners.length !== 1 ? 's' : ''} • {pendingPartners.length} pending request{pendingPartners.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <p className="text-slate-500 max-w-2xl">
              Manage your institutional and corporate partnerships. View active collaborations and respond to pending requests.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-4">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('accepted')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'accepted'
                    ? 'border-white text-white'
                    : 'border-transparent text-blue-200 hover:text-white hover:border-blue-100'
                }`}
              >
                Active Partners ({acceptedPartners.length})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-white text-white'
                    : 'border-transparent text-blue-200 hover:text-white hover:border-blue-100'
                }`}
              >
                Pending Requests ({pendingPartners.length})
              </button>
            </nav>
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === 'accepted' ? (
              <div className="space-y-6">
                {acceptedPartners.length === 0 ? (
                  <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-blue-100">
                    <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FiUsers className="text-4xl text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">
                      No Active Partnerships
                    </h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                      You don't have any active partnerships yet. Partnerships will appear here once they are established.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {acceptedPartners.map((partner) => (
                      <div
                        key={partner._id}
                        className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-100 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
                      >
                        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-white">
                          <div className="flex items-center">
                            {partner.logo && (
                              <img 
                                src={partner.logo} 
                                alt={`${partner.name} logo`}
                                className="w-10 h-10 object-contain mr-3 rounded-full border-2 border-white"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            )}
                            <h2 className="text-xl font-semibold line-clamp-1">
                              {partner.name}
                            </h2>
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex items-center mb-4">
                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                              <FiBriefcase className="text-blue-600" />
                            </div>
                            <div>
                              <p className="text-slate-700 font-medium capitalize">
                                {partner.type}
                              </p>
                              <p className="text-sm text-blue-600">
                                Status: <span className="font-medium text-green-600">Active</span>
                              </p>
                            </div>
                          </div>
                          {partner.email && (
                            <div className="flex items-center mb-3">
                              <div className="bg-blue-100 p-2 rounded-full mr-3">
                                <FiMail className="text-blue-600" />
                              </div>
                              <p className="text-slate-700 line-clamp-1">
                                {partner.email}
                              </p>
                            </div>
                          )}
                          {partner.address && (
                            <div className="flex items-start">
                              <div className="bg-blue-100 p-2 rounded-full mr-3 mt-1">
                                <FiMapPin className="text-blue-600" />
                              </div>
                              <p className="text-slate-700 text-sm line-clamp-2">
                                {typeof partner.address === 'string' 
                                  ? partner.address 
                                  : `${partner.address.city || ''}, ${partner.address.country || ''}`.replace(/^,\s*/, '')}
                              </p>
                            </div>
                          )}
                          <div className="mt-4 flex justify-between">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                showDetails(partner.partnershipId);
                              }}
                              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors flex items-center"
                            >
                              <FiInfo className="mr-1" /> Details
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePartnership(partner.partnershipId);
                              }}
                              className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors flex items-center"
                            >
                              <FiTrash2 className="mr-1" /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {pendingPartners.length === 0 ? (
                  <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-blue-100">
                    <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FiAlertTriangle className="text-4xl text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">
                      No Pending Requests
                    </h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                      You don't have any pending partnership requests at this time.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {pendingPartners.map((partner) => (
                      <div
                        key={partner._id}
                        className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-100 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
                      >
                        <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 p-4 text-white">
                          <div className="flex items-center">
                            {partner.logo && (
                              <img 
                                src={partner.logo} 
                                alt={`${partner.name} logo`}
                                className="w-10 h-10 object-contain mr-3 rounded-full border-2 border-white"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            )}
                            <h2 className="text-xl font-semibold line-clamp-1">
                              {partner.name}
                            </h2>
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex items-center mb-4">
                            <div className="bg-yellow-100 p-2 rounded-full mr-3">
                              <FiBriefcase className="text-yellow-600" />
                            </div>
                            <div>
                              <p className="text-slate-700 font-medium capitalize">
                                {partner.type}
                              </p>
                              <p className="text-sm text-yellow-600">
                                Status: <span className="font-medium">Pending</span>
                              </p>
                            </div>
                          </div>
                          {partner.email && (
                            <div className="flex items-center mb-3">
                              <div className="bg-yellow-100 p-2 rounded-full mr-3">
                                <FiMail className="text-yellow-600" />
                              </div>
                              <p className="text-slate-700 line-clamp-1">
                                {partner.email}
                              </p>
                            </div>
                          )}
                          <div className="mt-4 flex justify-between">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                showDetails(partner.partnershipId);
                              }}
                              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors flex items-center"
                            >
                              <FiInfo className="mr-1" /> Details
                            </button>
                            {partner.yourRole === 'target' && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAccept(partner.partnershipId);
                                  }}
                                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors flex items-center"
                                >
                                  <FiCheckCircle className="mr-1" /> Accept
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteRequest(partner.partnershipId);
                                  }}
                                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors flex items-center"
                                >
                                  <FiX className="mr-1" /> Reject
                                </button>
                              </>
                            )}
                            {partner.yourRole === 'initiator' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteRequest(partner.partnershipId);
                                }}
                                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors flex items-center"
                              >
                                <FiTrash2 className="mr-1" /> Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Partnership Details Modal */}
        {detailsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white rounded-t-2xl flex justify-between items-start relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold flex items-center">
                    <FiUsers className="mr-3" />
                    Partnership Details
                  </h2>
                  <p className="mt-1 opacity-90">
                    {detailsModal.yourRole === 'initiator' 
                      ? `Request to ${detailsModal.target?.name}` 
                      : `Request from ${detailsModal.initiator?.name}`}
                  </p>
                </div>
                <button
                  onClick={closeDetails}
                  className="relative z-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-5 rounded-xl">
                    <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                      <FiUser className="mr-2" /> Initiator
                    </h3>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center mb-2">
                        {detailsModal.initiator?.logo && (
                          <img 
                            src={detailsModal.initiator.logo} 
                            alt={`${detailsModal.initiator.name} logo`}
                            className="w-10 h-10 object-contain mr-3 rounded-full border border-blue-200"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <div>
                          <p className="font-medium text-slate-800">
                            {detailsModal.initiator?.name || "Unknown"}
                          </p>
                          <p className="text-blue-600 capitalize">
                            {detailsModal.initiator?.type || ""}
                          </p>
                        </div>
                      </div>
                      {detailsModal.initiator?.email && (
                        <p className="text-sm text-slate-600 mt-2">
                          <FiMail className="inline mr-2" />
                          {detailsModal.initiator.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-5 rounded-xl">
                    <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                      <FiUser className="mr-2" /> Target
                    </h3>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center mb-2">
                        {detailsModal.target?.logo && (
                          <img 
                            src={detailsModal.target.logo} 
                            alt={`${detailsModal.target.name} logo`}
                            className="w-10 h-10 object-contain mr-3 rounded-full border border-blue-200"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <div>
                          <p className="font-medium text-slate-800">
                            {detailsModal.target?.name || "Unknown"}
                          </p>
                          <p className="text-blue-600 capitalize">
                            {detailsModal.target?.type || ""}
                          </p>
                        </div>
                      </div>
                      {detailsModal.target?.email && (
                        <p className="text-sm text-slate-600 mt-2">
                          <FiMail className="inline mr-2" />
                          {detailsModal.target.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-5 rounded-xl">
                  <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                    <FiInfo className="mr-2" /> Partnership Information
                  </h3>
                  <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <FiActivity className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-slate-500 text-sm">Status</p>
                        <p className="text-slate-700 font-medium capitalize">
                          {detailsModal.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <FiUser className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-slate-500 text-sm">Your Role</p>
                        <p className="text-slate-700 font-medium capitalize">
                          {detailsModal.yourRole}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <FiClock className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-slate-500 text-sm">Created At</p>
                        <p className="text-slate-700 font-medium">
                          {formatDate(detailsModal.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {detailsModal.request_message && (
                  <div className="bg-blue-50 p-5 rounded-xl">
                    <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                      <FiMail className="mr-2" /> Request Message
                    </h3>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-slate-700">
                        {detailsModal.request_message}
                      </p>
                    </div>
                  </div>
                )}

                {detailsModal.response_message && (
                  <div className="bg-blue-50 p-5 rounded-xl">
                    <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                      <FiMail className="mr-2" /> Response Message
                    </h3>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-slate-700">
                        {detailsModal.response_message}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                  {detailsModal.status === 'pending' && detailsModal.yourRole === 'target' && (
                    <>
                      <button
                        onClick={() => {
                          handleAccept(detailsModal._id);
                          closeDetails();
                        }}
                        className="flex items-center px-5 py-2.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <FiCheckCircle className="mr-2" /> Accept
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteRequest(detailsModal._id);
                          closeDetails();
                        }}
                        className="flex items-center px-5 py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <FiX className="mr-2" /> Reject
                      </button>
                    </>
                  )}
                  {detailsModal.status === 'pending' && detailsModal.yourRole === 'initiator' && (
                    <button
                      onClick={() => {
                        handleDeleteRequest(detailsModal._id);
                        closeDetails();
                      }}
                      className="flex items-center px-5 py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <FiTrash2 className="mr-2" /> Cancel Request
                    </button>
                  )}
                  {detailsModal.status === 'accepted' && (
                    <button
                      onClick={() => {
                        handleRemovePartnership(detailsModal._id);
                        closeDetails();
                      }}
                      className="flex items-center px-5 py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <FiTrash2 className="mr-2" /> Remove Partnership
                    </button>
                  )}
                  <button
                    onClick={closeDetails}
                    className="flex items-center px-5 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Partnerships;