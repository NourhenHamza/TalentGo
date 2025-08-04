import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CompanyContext } from '../../context/CompanyContext';

const ManageSupervisors = () => {
    const { 
        cToken, 
        backendUrl, 
        currentCompany, 
        isLoading: contextLoading,
        verifyToken
    } = useContext(CompanyContext);
    
    const [supervisors, setSupervisors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedSupervisor, setSelectedSupervisor] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState('');
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [email, setEmail] = useState('');
    const [emailSending, setEmailSending] = useState(false);
    const [mode, setMode] = useState('list'); // 'list', 'view', 'edit'
    const [editFormData, setEditFormData] = useState(null);
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
            
            fetchSupervisors();
        };

        checkAuth();
    }, [cToken, navigate, verifyToken]);

    const fetchSupervisors = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${backendUrl}/api/companies/supervisors`, {
                headers: {
                    cToken: cToken
                }
            });
            setSupervisors(response.data.supervisors || []);
        } catch (error) {
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                config: error.config
            });
            toast.error(error.response?.data?.message || "Failed to load supervisors");
            setSupervisors([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle supervisor status change
const handleStatusChange = async (supervisorId, isActive) => {
    try {
        const { data } = await axios.put(
            `${backendUrl}/api/companies/supervisor-status`,
            { encadreurId: supervisorId, isActive }, // Changed parameter name to encadreurId
            { headers: { cToken } }
        );

        if (data.success) {
            toast.success(`Supervisor ${isActive ? 'activated' : 'deactivated'} successfully`);
            fetchSupervisors();
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
                `${backendUrl}/api/companies/invite-supervisor`,
                { email, companyId: currentCompany._id },
                { headers: { cToken } }
            );

            if (data.success) {
                toast.success('Invitation sent successfully');
                setShowEmailModal(false);
                setEmail('');
                fetchSupervisors();
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
    const confirmAction = (supervisor, action) => {
        setSelectedSupervisor(supervisor);
        setModalAction(action);
        setShowModal(true);
    };

    // View supervisor details
    const viewSupervisor = (supervisor) => {
        setSelectedSupervisor(supervisor);
        setMode('view');
    };

    // Edit supervisor
    const editSupervisor = (supervisor) => {
        setSelectedSupervisor(supervisor);
        setEditFormData({
            prenom: supervisor.prenom,
            nom: supervisor.nom,
            email: supervisor.email,
            poste: supervisor.poste,
            telephone: supervisor.telephone
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
        const { data } = await axios.put(
            `${backendUrl}/api/companies/edit_supervisor/${selectedSupervisor._id}`, // Changed to edit_supervisor
            editFormData,
            { headers: { cToken } }
        );

        if (data.success) {
            toast.success('Supervisor updated successfully');
            fetchSupervisors();
            setMode('list');
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update supervisor');
    }
};

    // Cancel edit/view and return to list
    const cancelEditView = () => {
        setMode('list');
        setSelectedSupervisor(null);
        setEditFormData(null);
    };

    // Filter supervisors based on search term
    const filteredSupervisors = supervisors.filter((supervisor) => {
        return (
            supervisor.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supervisor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supervisor.poste?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredSupervisors.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredSupervisors.length / itemsPerPage);

    // Status badge component
    const StatusBadge = ({ isActive }) => (
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
            isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
            {isActive ? 'ACTIVE' : 'INACTIVE'}
        </span>
    );

    if (contextLoading || loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    // View Supervisor Component
    const ViewSupervisor = () => (
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-blue-800">
                    {selectedSupervisor.prenom} {selectedSupervisor.nom}
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
                        <p><span className="font-medium">Email:</span> {selectedSupervisor.email}</p>
                        <p><span className="font-medium">Phone:</span> {selectedSupervisor.telephone || 'N/A'}</p>
                        <p><span className="font-medium">Position:</span> {selectedSupervisor.poste}</p>
                        <p><span className="font-medium">Status:</span> <StatusBadge isActive={selectedSupervisor.est_actif} /></p>
                    </div>
                </div>
                
                <div>
                    <h3 className="text-lg font-medium text-blue-700 mb-3">Actions</h3>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => editSupervisor(selectedSupervisor)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => confirmAction(
                                selectedSupervisor, 
                                selectedSupervisor.est_actif ? 'deactivate' : 'activate'
                            )}
                            className={`px-4 py-2 rounded-lg text-white ${
                                selectedSupervisor.est_actif 
                                    ? 'bg-red-600 hover:bg-red-700' 
                                    : 'bg-green-600 hover:bg-green-700'
                            }`}
                        >
                            {selectedSupervisor.est_actif ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // Edit Supervisor Component
    const EditSupervisor = () => (
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-blue-800">
                    Edit Supervisor
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
                        {mode === 'list' ? 'Manage Supervisors' : 
                         mode === 'view' ? 'Supervisor Details' : 'Edit Supervisor'}
                    </h1>
                    <p className="text-blue-600">
                        {mode === 'list' ? 'Manage your company\'s PFE supervisors' : 
                         mode === 'view' ? 'View supervisor details' : 'Edit supervisor information'}
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
                                        placeholder="Search supervisors..."
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => setShowEmailModal(true)}
                                    className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                                >
                                    Add Supervisor
                                </button>
                            </div>
                        </div>

                        {/* Supervisors table */}
                        <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-blue-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Position</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Phone</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-blue-800 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentItems.map((supervisor) => (
                                            <tr key={supervisor._id} className="hover:bg-blue-50/50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {supervisor.prenom} {supervisor.nom}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {supervisor.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {supervisor.poste}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {supervisor.telephone || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StatusBadge isActive={supervisor.est_actif} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={() => editSupervisor(supervisor)}
                                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => confirmAction(supervisor, supervisor.est_actif ? 'deactivate' : 'activate')}
                                                            className={supervisor.est_actif ? "text-red-600 hover:text-red-800 hover:underline" : "text-green-600 hover:text-green-800 hover:underline"}
                                                        >
                                                            {supervisor.est_actif ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                        <button
                                                            onClick={() => viewSupervisor(supervisor)}
                                                            className="text-green-600 hover:text-green-800 hover:underline"
                                                        >
                                                            View
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
                    <ViewSupervisor />
                ) : (
                    <EditSupervisor />
                )}
            </div>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-blue-100">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
                                {modalAction === 'deactivate' 
                                    ? `Deactivate ${selectedSupervisor?.prenom} ${selectedSupervisor?.nom}?` 
                                    : `Activate ${selectedSupervisor?.prenom} ${selectedSupervisor?.nom}?`}
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
                                    onClick={() => handleStatusChange(selectedSupervisor._id, modalAction === 'activate')}
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
                            <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Invite New Supervisor</h3>
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                                    placeholder="Enter supervisor's email"
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

export default ManageSupervisors;