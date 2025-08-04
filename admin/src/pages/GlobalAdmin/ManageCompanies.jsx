// src/components/ManageCompanies.jsx (ou où vous stockez vos composants d'administration)

import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets'; // Assurez-vous que ce chemin est correct
import { GlobalAdminContext } from '../../context/GlobalAdminContext'; // Assurez-vous que ce chemin est correct

const ManageCompanies = () => {
  const { bToken, backendUrl } = useContext(GlobalAdminContext);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const navigate = useNavigate();

  // Fetch companies data
  const fetchCompanies = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/globaladmin/companies`, {
        headers: { bToken },
      });
      if (data.success) {
        setCompanies(data.companies || []);
      } else {
        toast.error(data.message);
        setCompanies([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch companies');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!bToken) {
      navigate('/globaladmin-login'); // Rediriger si non authentifié
      return;
    }
    fetchCompanies();
  }, [bToken, navigate]);

  // Handle company status change
  const handleStatusChange = async (companyId, status, reason = '') => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/globaladmin/company-status`,
        { companyId, status, reason },
        { headers: { bToken } }
      );

      if (data.success) {
        toast.success(`Company ${status} successfully`);
        fetchCompanies(); // Re-fetch data to update the list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
    setShowModal(false);
    setRejectionReason('');
  };

  // Confirm action modal
  const confirmAction = (company, action) => {
    setSelectedCompany(company);
    setModalAction(action);
    setShowModal(true);
  };

  // Filter companies based on search term
  const filteredCompanies = companies.filter((comp) => {
    if (!comp) return false;
    return (
      comp.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.email_contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.pays?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.secteur_activite?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCompanies.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);

  // Status badge component
  const StatusBadge = ({ status }) => {
    let badgeClass = '';
    switch (status) {
      case 'pending':
        badgeClass = 'bg-yellow-100 text-yellow-800';
        break;
      case 'approved':
        badgeClass = 'bg-green-100 text-green-800';
        break;
      case 'rejected':
        badgeClass = 'bg-red-100 text-red-800';
        break;
      default:
        badgeClass = 'bg-gray-100 text-gray-800';
    }
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${badgeClass}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 relative bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-100/30 blur-xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-blue-200/20 blur-xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">
            Company Access Management
          </h1>
          <p className="text-blue-600">
            Review and approve company registration requests
          </p>
        </header>

        {/* Search and filter */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-5 mb-6 transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search companies..."
                className="pl-10 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all"
              >
                Clear
              </button>
              <button
                onClick={() => navigate('/globaladmin-dashboard')}
                className="px-4 py-2.5 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Companies table */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((company) => (
                    <tr key={company._id} className="hover:bg-blue-50/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={company.logo_url || assets.upload_area} // Utilisez logo_url
                              alt={company.nom}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {company.nom}
                            </div>
                            <div className="text-sm text-gray-500">
                              {company.secteur_activite}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{company.email_contact}</div>
                        <div className="text-sm text-gray-500">
                          {company.telephone_contact}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{company.pays}</div>
                        <div className="text-sm text-gray-500">
                          {company.ville}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={company.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(company.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {company.status === 'pending' && (
                            <>
                              <button
                                onClick={() => confirmAction(company, 'approve')}
                                className="text-green-600 hover:text-green-800 hover:underline"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => confirmAction(company, 'reject')}
                                className="text-red-600 hover:text-red-800 hover:underline"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => navigate(`/company-details/${company._id}`)} // Adaptez le chemin si nécessaire
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      {companies.length === 0 ? 'No companies found' : 'No matching companies found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-blue-100 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, filteredCompanies.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredCompanies.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-blue-200 bg-white text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i ) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-blue-200 bg-white text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
           )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-blue-100">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {modalAction === 'approve'
                  ? `Approve ${selectedCompany?.nom}?`
                  : `Reject ${selectedCompany?.nom}?`}
              </h3>
              {modalAction === 'reject' && (
                <div className="mb-4">
                  <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for rejection (optional)
                  </label>
                  <textarea
                    id="rejectionReason"
                    rows="3"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  ></textarea>
                </div>
              )}
              <p className="text-sm text-gray-500 mb-4">
                {modalAction === 'approve'
                  ? 'This will grant the company access to the platform.'
                  : 'This will prevent the company from accessing the platform.'}
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all"
                  onClick={() => {
                    setShowModal(false);
                    setRejectionReason('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-xl text-white transition-all ${
                    modalAction === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                  onClick={() => {
                    handleStatusChange(
                      selectedCompany?._id,
                      modalAction === 'approve' ? 'approved' : 'rejected',
                      rejectionReason
                    );
                  }}
                >
                  {modalAction === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCompanies;
