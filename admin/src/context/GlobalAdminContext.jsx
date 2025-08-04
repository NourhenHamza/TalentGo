import axios from 'axios';
import PropTypes from 'prop-types';
import { createContext, useEffect, useMemo, useState } from "react";
import { toast } from 'react-toastify';

export const GlobalAdminContext = createContext();

const GlobalAdminContextProvider = ({ children }) => {
  // Initialize state with localStorage value, but handle potential localStorage issues
  const [bToken, setbToken] = useState(() => {
    try {
      return localStorage.getItem('bToken') || '';
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return '';
    }
  });

  const [assignments] = useState([]);
  const backendUrl = 'http://localhost:4000';

  // Sync localStorage whenever bToken changes
  useEffect(() => {
    try {
      if (bToken) {
        localStorage.setItem('bToken', bToken);
        console.log('✅ bToken saved to localStorage:', bToken);
      } else {
        localStorage.removeItem('bToken');
        console.log('🗑️ bToken removed from localStorage');
      }
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error);
    }
  }, [bToken]);

  // Protected function to clear only admin-specific tokens
  const clearAdminTokens = () => {
    try {
      setbToken('');
      localStorage.removeItem('bToken');
      console.log('🧹 Admin tokens cleared');
    } catch (error) {
      console.error('❌ Error clearing admin tokens:', error);
    }
  };

  // Enhanced function to check if token is still valid
  const isTokenValid = (token) => {
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check if token is expired
      if (payload.exp && payload.exp < currentTime) {
        console.log('🕰️ Token expired');
        return false;
      }
      
      // Check if it's an admin token
      if (payload.role !== 'admin') {
        console.log('🚫 Not an admin token');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error validating token:', error);
      return false;
    }
  };

  const loginAdmin = async (credentials) => {
    try {
      console.log('🔐 Attempting admin login with:', credentials);
      
      const { data } = await axios.post(
        `http://localhost:4000/api/globaladmin/login`,
        credentials
      );

      console.log('📝 Login response:', data);

      if (data.success && data.token) {
        // Validate the token before setting it
        if (isTokenValid(data.token)) {
          console.log('✅ Login successful, setting valid token');
          setbToken(data.token);
          
          // Double-check localStorage immediately
          try {
            localStorage.setItem('bToken', data.token);
            const savedToken = localStorage.getItem('bToken');
            console.log('🔍 Verification - Token saved to localStorage:', savedToken ? '✅ Success' : '❌ Failed');
          } catch (error) {
            console.error('❌ Error saving token to localStorage:', error);
          }
          
          return data;
        } else {
          console.error('❌ Invalid token received');
          toast.error('Invalid token received');
          return null;
        }
      } else {
        console.error('❌ Login failed:', data.message);
        toast.error(data.message || 'Login failed');
        return null;
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      toast.error(error.response?.data?.message || "Login failed");
      return null;
    }
  };

  // Enhanced logout function
  const logoutAdmin = () => {
    try {
      clearAdminTokens();
      console.log('🚪 Admin logged out successfully');
      toast.info('Logged out successfully');
    } catch (error) {
      console.error('❌ Error during logout:', error);
    }
  };

  // Function to refresh token if needed
  const refreshTokenIfNeeded = async () => {
    if (bToken && !isTokenValid(bToken)) {
      console.log('🔄 Token expired, clearing...');
      clearAdminTokens();
      return false;
    }
    return true;
  };

  // Function to get valid token
  const getValidToken = () => {
    if (bToken && isTokenValid(bToken)) {
      return bToken;
    }
    return null;
  };

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    bToken,
    setbToken,
    backendUrl,
    assignments,
    loginAdmin,
    logoutAdmin,
    clearAdminTokens,
    refreshTokenIfNeeded,
    getValidToken,
    isTokenValid: () => isTokenValid(bToken)
  }), [bToken, backendUrl]);

  return (
    <GlobalAdminContext.Provider value={value}>
      {children}
    </GlobalAdminContext.Provider>
  );
};

GlobalAdminContextProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default GlobalAdminContextProvider;