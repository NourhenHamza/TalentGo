import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import NotificationList from './notifications/NotificationList';

const NotificationPage = () => {
  const { token, handleLogout } = useContext(AppContext);
  const navigate = useNavigate();

  // Check for authentication
  useEffect(() => {
    if (!token) {
      toast.error('Veuillez vous connecter pour voir les notifications');
      navigate('/signin');
    }
  }, [token, navigate]);

  // Handle unauthorized access
  const handleError = (error) => {
    if (error.includes('Session expirée') || error.includes('Authentification requise')) {
      handleLogout();
      navigate('/signin');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <NotificationList
          className="max-w-4xl mx-auto"
          showFilters={true}
          showSearch={true}
          showBulkActions={true}
          pageSize={20}
          onError={handleError}
        />
      </div>
    </div>
  );
};

export default NotificationPage;