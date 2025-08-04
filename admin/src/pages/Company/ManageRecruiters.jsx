import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CompanyContext } from '../../context/CompanyContext';

const ManageRecruiters = () => {
    const { 
        cToken, 
        backendUrl, 
        currentCompany, 
        isLoading: contextLoading,
        verifyToken
    } = useContext(CompanyContext);
    
    const [recruiters, setRecruiters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedRecruiter, setSelectedRecruiter] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState('');
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [email, setEmail] = useState('');
    const [emailSending, setEmailSending] = useState(false);
    const [mode, setMode] = useState('list'); // 'list', 'view', 'edit'
    const [editFormData, setEditFormData] = useState({
        prenom: '',
        nom: '',
        email: '',
        poste: '',
        telephone: ''
    });
    const navigate = useNavigate();

    // Check authentication status
    useEffect(() => {
        const checkAuth = async () => {
            if (!cToken) {
                navigate('/company-login');
                return;
            }
            
            const isValid = await verifyToken();
            if (!isValid) {
                navigate('/company-login');
                return;
            }
            
            fetchRecruiters();
        };

        checkAuth();
    }, [cToken, navigate, verifyToken]);

    // Fetch recruiters data
    const fetchRecruiters = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${backendUrl}/api/companies/recruiters`, {
                headers: { cToken },
                params: { companyId: currentCompany?._id }
            });
            if (data.success) {
                setRecruiters(data.recruiters || []);
            } else {
                toast.error(data.message);
                setRecruiters([]);
            }
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error(error.response?.data?.message || 'Failed to fetch recruiters');
            }
            setRecruiters([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle recruiter status change
    const handleStatusChange = async (recruiterId, isActive) => {
        try {
            const { data } = await axios.put(
                `${backendUrl}/api/companies/recruiter-status`,
                { recruiterId, isActive },
                { headers: { cToken } }
            );

            if (data.success) {
                toast.success(`Recruiter ${isActive ? 'activated' : 'deactivated'} successfully`);
                fetchRecruiters();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
        setShowModal(false);
    };

    // Send invitation email
    const sendInvitationEmail = async () => {
        if (!email) {
            toast.error('Please enter a valid email address');
            return;
        }

        setEmailSending(true);
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/companies/invite-recruiter`,
                { email, companyId: currentCompany._id },
                { headers: { cToken } }
            );

            if (data.success) {
                toast.success('Invitation sent successfully');
                setShowEmailModal(false);
                setEmail('');
                fetchRecruiters();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send invitation');
        } finally {
            setEmailSending(false);
        }
    };

    // Confirm action modal
    const confirmAction = (recruiter, action) => {
        setSelectedRecruiter(recruiter);
        setModalAction(action);
        setShowModal(true);
    };

    // View recruiter details
    const viewRecruiter = (recruiter) => {
        setSelectedRecruiter(recruiter);
        setMode('view');
    };

    // Edit recruiter
    const editRecruiter = (recruiter) => {
        setSelectedRecruiter(recruiter);
        setEditFormData({
            prenom: recruiter.prenom,
            nom: recruiter.nom,
            email: recruiter.email,
            poste: recruiter.poste,
            telephone: recruiter.telephone
        });
        setMode('edit');
    };

    // Handle edit form changes
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Submit edit form
const submitEdit = async () => {
    try {
        console.log('Submitting edit:', {
            url: `${backendUrl}/api/companies/edit-recruiter/${selectedRecruiter._id}`,
            data: editFormData,
            headers: { cToken }
        });

        const { data } = await axios.put(
            `${backendUrl}/api/companies/edit-recruiter/${selectedRecruiter._id}`,
            editFormData,
            { 
                headers: { 
                    cToken,
                    'Content-Type': 'application/json'
                } 
            }
        );

        if (data.success) {
            toast.success('Recruiter updated successfully');
            fetchRecruiters();
            setMode('list');
        } else {
            console.error('Update failed:', data.message);
            toast.error(data.message);
        }
    } catch (error) {
        console.error('Full error details:', {
            message: error.message,
            response: error.response?.data,
            config: error.config
        });
        toast.error(error.response?.data?.message || 'Failed to update recruiter');
    }
};

    // Cancel edit/view and return to list
    const cancelEditView = () => {
        setMode('list');
        setSelectedRecruiter(null);
        setEditFormData({
            prenom: '',
            nom: '',
            email: '',
            poste: '',
            telephone: ''
        });
    };

    // Filter recruiters based on search term
    const filteredRecruiters = recruiters.filter((recruiter) => {
        return (
            recruiter.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            recruiter.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            recruiter.poste?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRecruiters.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRecruiters.length / itemsPerPage);

    // Status badge component
    const StatusBadge = ({ isActive }) => (
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
            isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
            {isActive ? 'ACTIVE' : 'INACTIVE'}
        </span>
    );

    // View Recruiter Component
    const ViewRecruiter = () => (
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-blue-800">
                    {selectedRecruiter.prenom} {selectedRecruiter.nom}
                </h2>
                <button 
                    onClick={cancelEditView}
                    className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                >
                    Back to List
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-medium text-blue-700 mb-3">Contact Information</h3>
                    <div className="space-y-2">
                        <p><span className="font-medium">Email:</span> {selectedRecruiter.email}</p>
                        <p><span className="font-medium">Phone:</span> {selectedRecruiter.telephone || 'N/A'}</p>
                        <p><span className="font-medium">Position:</span> {selectedRecruiter.poste}</p>
                        <p><span className="font-medium">Status:</span> <StatusBadge isActive={selectedRecruiter.est_actif} /></p>
                    </div>
                </div>
                
                <div>
                    <h3 className="text-lg font-medium text-blue-700 mb-3">Actions</h3>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => editRecruiter(selectedRecruiter)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => confirmAction(
                                selectedRecruiter, 
                                selectedRecruiter.est_actif ? 'deactivate' : 'activate'
                            )}
                            className={`px-4 py-2 rounded-lg text-white ${
                                selectedRecruiter.est_actif 
                                    ? 'bg-red-600 hover:bg-red-700' 
                                    : 'bg-green-600 hover:bg-green-700'
                            }`}
                        >
                            {selectedRecruiter.est_actif ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // Edit Recruiter Component
    const EditRecruiter = () => (
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-blue-800">
                    Edit Recruiter
                </h2>
                <button 
                    onClick={cancelEditView}
                    className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                >
                    Cancel
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                            type="text"
                            name="prenom"
                            value={editFormData.prenom}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                            type="text"
                            name="nom"
                            value={editFormData.nom}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>
                
                <div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={editFormData.email}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            disabled
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                        <input
                            type="text"
                            name="poste"
                            value={editFormData.poste}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                            type="text"
                            name="telephone"
                            value={editFormData.telephone}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
                <button
                    onClick={cancelEditView}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                >
                    Cancel
                </button>
                <button
                    onClick={submitEdit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );

    if (contextLoading || loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
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
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-blue-800 mb-2">
                        {mode === 'list' ? 'Manage Recruiters' : 
                         mode === 'view' ? 'Recruiter Details' : 'Edit Recruiter'}
                    </h1>
                    <p className="text-blue-600">
                        {mode === 'list' ? 'Manage your company\'s recruiters' : 
                         mode === 'view' ? 'View recruiter details' : 'Edit recruiter information'}
                    </p>
                </header>

                {mode === 'list' ? (
                    <>
                        {/* Search and add new */}
                        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-5 mb-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="relative w-full md:w-64">
                                    <input
                                        type="text"
                                        placeholder="Search recruiters..."
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => setShowEmailModal(true)}
                                    className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                                >
                                    Add Recruiter
                                </button>
                            </div>
                        </div>

                        {/* Recruiters table */}
                        <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-blue-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Position</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-blue-800 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentItems.map((recruiter) => (
                                            <tr key={recruiter._id} className="hover:bg-blue-50/50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {recruiter.prenom} {recruiter.nom}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {recruiter.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {recruiter.poste}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StatusBadge isActive={recruiter.est_actif} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={() => viewRecruiter(recruiter)}
                                                            className="text-green-600 hover:text-green-800 hover:underline"
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            onClick={() => editRecruiter(recruiter)}
                                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => confirmAction(recruiter, recruiter.est_actif ? 'deactivate' : 'activate')}
                                                            className={recruiter.est_actif ? "text-red-600 hover:text-red-800 hover:underline" : "text-green-600 hover:text-green-800 hover:underline"}
                                                        >
                                                            {recruiter.est_actif ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : mode === 'view' ? (
                    <ViewRecruiter />
                ) : (
                    <EditRecruiter />
                )}
            </div>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-blue-100">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
                                {modalAction === 'deactivate' 
                                    ? `Deactivate ${selectedRecruiter?.prenom} ${selectedRecruiter?.nom}?` 
                                    : `Activate ${selectedRecruiter?.prenom} ${selectedRecruiter?.nom}?`}
                            </h3>
                            <div className="flex justify-center space-x-3">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className={`px-4 py-2 rounded-xl text-white ${
                                        modalAction === 'deactivate' 
                                            ? 'bg-red-600 hover:bg-red-700' 
                                            : 'bg-green-600 hover:bg-green-700'
                                    }`}
                                    onClick={() => handleStatusChange(selectedRecruiter._id, modalAction === 'activate')}
                                >
                                    {modalAction === 'deactivate' ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Email Invitation Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-blue-100">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Invite New Recruiter</h3>
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                                    placeholder="Enter recruiter's email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-center space-x-3">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200"
                                    onClick={() => {
                                        setShowEmailModal(false);
                                        setEmail('');
                                    }}
                                    disabled={emailSending}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                                    onClick={sendInvitationEmail}
                                    disabled={emailSending}
                                >
                                    {emailSending ? 'Sending...' : 'Send Invitation'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageRecruiters;