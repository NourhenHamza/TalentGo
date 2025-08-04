import axios from 'axios';
import { createContext, useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  axios.defaults.withCredentials = true;

  const dinarSymbol = 'DT';
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  const [Professors, setProfessors] = useState([]);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const loadUserProfileData = useCallback(async () => {
    if (!token) {
      setUserData(null);
      return;
    }

    try {
      setLoadingUser(true);
      const { data } = await axios.get(`${backendUrl}/api/user/get-profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setUserData(data.userData);
        localStorage.setItem('loggedInUser', JSON.stringify(data.userData));
        console.log('Profile loaded:', data.userData);
      } else {
        toast.error(data.message);
        handleLogout();
      }
    } catch (error) {
      console.error('Profile load error:', error);
      if (error.response?.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        handleLogout();
      } else {
        toast.error(error.response?.data?.message || 'Failed to load profile');
      }
    } finally {
      setLoadingUser(false);
    }
  }, [token, backendUrl]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    setToken(null);
    setUserData(null);
    toast.info('Logged out successfully');
  };

  useEffect(() => {
    loadUserProfileData();
  }, [loadUserProfileData]);

  const value = {
    Professors,
    dinarSymbol,
    backendUrl,
    token,
    setToken,
    userData,
    loadUserProfileData,
    loadingUser,
    handleLogout
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;