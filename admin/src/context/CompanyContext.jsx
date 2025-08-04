import axios from 'axios';
import PropTypes from 'prop-types';
import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const CompanyContext = createContext();

const CompanyContextProvider = ({ children }) => {
    const [cToken, setCToken] = useState(localStorage.getItem('cToken') || '');
    const [isLoading, setIsLoading] = useState(true);
    const [currentCompany, setCurrentCompany] = useState(null);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
    const navigate = useNavigate();

    // Verify token validity
    const verifyToken = useCallback(async () => {
        if (!cToken) {
            setIsLoading(false);
            return false;
        }
                
        try {
            const { data } = await axios.get(`${backendUrl}/api/companies/verify-token`, {
                headers: { cToken }
            });
            if (data?.success) {
                setCurrentCompany(data.company);
                setIsLoading(false);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Token verification failed:", error);
            logout();
            return false;
        }
    }, [cToken, backendUrl]);

    // Company login function
    const login = async (credentials) => {
        try {
            setIsLoading(true);
            const { data } = await axios.post(
                `${backendUrl}/api/companies/login`,
                credentials
            );
                        
            if (data?.success) {
                setCToken(data.token);
                localStorage.setItem('cToken', data.token);
                setCurrentCompany(data.company);
                toast.success("Login successful!");
                navigate("/company-dashboard");
                return data;
            }
            toast.error(data?.message || "Login failed");
            return null;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Login failed";
            toast.error(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Logout function
    const logout = useCallback(() => {
        localStorage.removeItem('cToken');
        setCToken('');
        setCurrentCompany(null);
        navigate('/company-login');
        toast.info("Logged out successfully");
    }, [navigate]);

    // Check auth on initial load
    useEffect(() => {
        const checkAuth = async () => {
            if (cToken) {
                await verifyToken();
            } else {
                setIsLoading(false);
            }
        };
        
        checkAuth();

        // Add axios interceptor for 401 errors
        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response?.status === 401) {
                    logout();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [cToken, verifyToken, logout]);

    // Memoize the context value
    const value = useMemo(() => ({
        cToken,
        isLoading,
        currentCompany,
        backendUrl,
        login,
        logout,
        verifyToken,
        setCToken,
        setCurrentCompany
    }), [cToken, isLoading, currentCompany, backendUrl, login, logout, verifyToken]);

    return (
        <CompanyContext.Provider value={value}>
            {children}
        </CompanyContext.Provider>
    );
};

CompanyContextProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export default CompanyContextProvider;