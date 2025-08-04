// AdminContext.jsx

import axios from 'axios';
import PropTypes from 'prop-types';
import { createContext, useCallback, useEffect, useState } from "react";
import { toast } from 'react-toastify';

export const AdminContext = createContext();

const AdminContextProvider = ({ children }) => {
    const [aToken, setAToken] = useState(localStorage.getItem('aToken') || '');
    const [uToken, setUToken] = useState(localStorage.getItem('uToken') || '');
    const [currentUser, setCurrentUser] = useState(null);
    const [Professors, setProfessors] = useState([]);
    const [projects, setProjects] = useState([]);
    const [pendingProjects, setPendingProjects] = useState([]);
    const [assignments] = useState([]);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

    // Load user data on mount or when tokens change
    useEffect(() => {
        const loadUserData = async () => {
            const token = aToken || uToken;
            if (token) {
                try {
                    // Decode JWT token to get user info
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    console.log('Token payload:', payload);
                    
                    if (payload.role === 'university') {
                        // For university users, fetch full university data
                        const response = await axios.get(`${backendUrl}/api/universities/profile`, {
                            headers: { token }
                        });
                        
                        if (response.data.success) {
                            setCurrentUser(response.data.university);
                        } else {
                            // If API call fails, use data from token
                            setCurrentUser({
                                _id: payload.id,
                                name: payload.name,
                                email: payload.email,
                                role: payload.role
                            });
                        }
                    } else if (payload.role === 'admin') {
                        // For admin users
                        setCurrentUser({
                            _id: payload.id,
                            name: payload.name,
                            email: payload.email,
                            role: payload.role
                        });
                    }
                } catch (error) {
                    console.error('Error loading user data:', error);
                    // If token is invalid, clear it
                    if (error.response?.status === 401) {
                        logout();
                    }
                }
            }
        };

        loadUserData();
    }, [aToken, uToken]);

    // Unified login function
    const login = async (credentials) => {
        try {
            const { data } = await axios.post(
                `http://localhost:4000/api/admin/login`,
                credentials
            );
            
            if (data.success) {
                if (data.role === 'admin') {
                    setAToken(data.token);
                    localStorage.setItem('aToken', data.token);
                    setCurrentUser(data.admin || {
                        _id: data.id,
                        name: data.name,
                        email: data.email,
                        role: 'admin'
                    });
                } else if (data.role === 'university') {
                    setUToken(data.token);
                    localStorage.setItem('uToken', data.token);
                    setCurrentUser(data.university || {
                        _id: data.id,
                        name: data.name,
                        email: data.email,
                        role: 'university'
                    });
                }
                return data;
            } else {
                toast.error(data.message);
                return null;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
            return null;
        }
    };

    // Logout function
    const logout = () => {
        if (aToken) {
            localStorage.removeItem('aToken');
            setAToken('');
        }
        if (uToken) {
            localStorage.removeItem('uToken');
            setUToken('');
        }
        setCurrentUser(null);
    };

    // Authentication check functions
    const isAuthenticated = useCallback(() => {
        return !!(aToken || uToken);
    }, [aToken, uToken]);

    const isAdmin = useCallback(() => {
        return !!aToken || (currentUser && currentUser.role === 'admin');
    }, [aToken, currentUser]);

    const isUniversity = useCallback(() => {
        return !!uToken || (currentUser && currentUser.role === 'university');
    }, [uToken, currentUser]);

    // Professor methods (only for admin)
    const addProfessor = async (professorData) => {
        if (!isAdmin() && !isUniversity()) {
            toast.error("Admin or University access required");
            return null;
        }

        let tokenToSend = aToken || uToken;
        let dataToSend = { ...professorData };

        // Si une université est connectée, ajoutez son ID au professeur
        if (isUniversity() && currentUser) {
            dataToSend.university = currentUser._id;
        }

        try {
            const { data } = await axios.post(
                `${backendUrl}/api/admin/add-professor`,
                dataToSend,
                { headers: { token: tokenToSend } }
            );
            
            if (data.success) {
                toast.success("Professor added successfully");
                await getAllProfessors();
                return data.professor;
            }
            toast.error(data.message);
            return null;
        } catch (error) {
            handleAuthError(error);
            return null;
        }
    };

    const getAllProfessors = useCallback(async () => {
        let token = null;
        let url = `${backendUrl}/api/admin/all-professors`;

        if (isAdmin()) {
            token = aToken;
        } else if (isUniversity() && currentUser) {
            token = uToken;
            url = `${backendUrl}/api/admin/all-professors`;
        } else {
            return [];
        }

        if (!token) {
            toast.error("Authentication token missing.");
            return [];
        }

        try { 
            const { data } = await axios.get(url, { 
                headers: { token }
            });
            
            if (data.success) {
                setProfessors(data.professors || data.Professors || []);
                return data.professors || data.Professors || [];
            }
            toast.error(data.message);
            return [];
        } catch (error) {
            handleAuthError(error);
            return [];
        }
    }, [aToken, uToken, isAdmin, isUniversity, currentUser, backendUrl]);

    // Project methods (available for both admin and university)
    const getAllProjects = useCallback(async () => {
        const token = aToken || uToken;
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/projects`, { 
                headers: { token } 
            });
            
            if (data.success) {
                setProjects(data.projects || []);
                setPendingProjects((data.projects || []).filter(project => 
                    project.status === 'pending' || project.status === 'approved'
                ));
                return data.projects || [];
            }
            toast.error(data.message);
            return [];
        } catch (error) {
            handleAuthError(error);
            return [];
        }
    }, [aToken, uToken, backendUrl]);

    // Handle authentication errors
    const handleAuthError = (error) => {
        if (error.response?.status === 401) {
            toast.error("Session expired. Please login again.");
            logout();
        } else {
            toast.error(error.response?.data?.message || "Operation failed");
        }
    };

    const value = {
        // Tokens and auth state
        aToken, uToken, currentUser,
        isAuthenticated, isAdmin, isUniversity,
        
        // Auth methods
        login, logout,
        
        // Token setter
        setAToken,
        
        // Data state
        Professors, projects, pendingProjects, assignments,
        
        // Professor methods
        addProfessor,
        getAllProfessors,
        
        // Project methods
        getAllProjects,
        assignProject: async (projectId, professorId) => {
            if (!isAdmin() && !isUniversity()) {
                toast.error("Admin or University access required");
                return false;
            }
            
            const tokenToUse = isAdmin() ? aToken : uToken;
            try {
                const { data } = await axios.post(
                    `${backendUrl}/api/admin/assign-project`,
                    { projectId, professorId },
                    { headers: { token: tokenToUse } }
                );
                if (data.success) {
                    toast.success("Project assigned successfully!");
                    await getAllProjects();
                    return true;
                } else {
                    toast.error(data.message);
                    return false;
                }
            } catch (error) {
                handleAuthError(error);
                return false;
            }
        },
        deleteProject: async (projectId) => {
            if (!isAdmin()) {
                toast.error("Admin access required");
                return false;
            }
            // ... existing deleteProject implementation
        },
        
        // Dashboard methods
        getDashboardData: async () => {
            const token = aToken || uToken;
            try {
                const { data } = await axios.get(
                    `${backendUrl}/api/admin/dashboard`,
                    { headers: { token } }
                );
                return data.data || data.dashData;
            } catch (error) {
                handleAuthError(error);
                return null;
            }
        }
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};

AdminContextProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export default AdminContextProvider;