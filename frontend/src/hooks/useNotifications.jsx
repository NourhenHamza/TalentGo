import { useCallback, useEffect, useRef, useState } from 'react';
import { notificationAPI } from '../services/notification.api.jsx';

export const useNotifications = (options = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 30000,
    pageSize = 5, // Match your limit=5 query
    enableRealTime = true
  } = options;

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    status: null,
    eventType: null,
    priority: null
  });

  const refreshIntervalRef = useRef(null);
  const abortControllerRef = useRef(null);

  const loadNotifications = useCallback(async (page = 1, reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token ? token.substring(0, 10) + '...' : 'No token');
      if (!token) {
        setError('Aucun jeton d\'authentification trouvé. Veuillez vous reconnecter.');
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const params = {
        page,
        limit: pageSize,
        ...filters
      };

      const response = await notificationAPI.getNotifications(params, {
        signal: abortControllerRef.current.signal
      });

      if (response.success) {
        const newNotifications = response.data.notifications;
        if (reset || page === 1) {
          setNotifications(newNotifications);
        } else {
          setNotifications(prev => [...prev, ...newNotifications]);
        }
        setUnreadCount(response.data.unreadCount);
        setHasMore(response.data.pagination.page < response.data.pagination.pages);
        setCurrentPage(page);
      } else {
        throw new Error(response.error || 'Erreur lors du chargement des notifications');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Erreur lors du chargement des notifications');
        console.error('❌ Erreur lors du chargement des notifications:', err);
        if (err.message.includes('Authentification requise') || err.message.includes('Token invalide')) {
          setError('Session expirée. Veuillez vous reconnecter.');
          localStorage.removeItem('token');
          localStorage.removeItem('loggedInUser');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [filters, pageSize]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadNotifications(currentPage + 1, false);
    }
  }, [loading, hasMore, currentPage, loadNotifications]);

  const refresh = useCallback(() => {
    loadNotifications(1, true);
  }, [loadNotifications]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await notificationAPI.markAsRead(notificationId);
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId
              ? { ...notification, status: 'read', readAt: new Date() }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du marquage de la notification');
      console.error('❌ Erreur lors du marquage de la notification:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationAPI.markAllAsRead();
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.status === 'unread'
              ? { ...notification, status: 'read', readAt: new Date() }
              : notification
          )
        );
        setUnreadCount(0);
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du marquage des notifications');
      console.error('❌ Erreur lors du marquage des notifications:', err);
    }
  }, []);

  const archiveNotification = useCallback(async (notificationId) => {
    try {
      const response = await notificationAPI.archiveNotification(notificationId);
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId
              ? { ...notification, status: 'archived', archivedAt: new Date() }
              : notification
          )
        );
        const notification = notifications.find(n => n._id === notificationId);
        if (notification && notification.status === 'unread') {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'archivage de la notification');
      console.error('❌ Erreur lors de l\'archivage de la notification:', err);
    }
  }, [notifications]);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const response = await notificationAPI.deleteNotification(notificationId);
      if (response.success) {
        const notification = notifications.find(n => n._id === notificationId);
        if (notification && notification.status === 'unread') {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        setNotifications(prev => 
          prev.filter(notification => notification._id !== notificationId)
        );
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression de la notification');
      console.error('❌ Erreur lors de la suppression de la notification:', err);
    }
  }, [notifications]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      status: null,
      eventType: null,
      priority: null
    });
    setCurrentPage(1);
  }, []);

  const updateUnreadCount = useCallback(async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (err) {
      console.error('❌ Erreur lors de la mise à jour du compteur:', err);
    }
  }, []);

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (notification.status === 'unread') {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  const updateNotification = useCallback((notificationId, updates) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification._id === notificationId
          ? { ...notification, ...updates }
          : notification
      )
    );
  }, []);

  useEffect(() => {
    loadNotifications(1, true);
  }, [loadNotifications]);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        updateUnreadCount();
      }, refreshInterval);
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, updateUnreadCount]);

  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (!enableRealTime) return;

    let ws = null;
    let retryCount = 0;
    const maxRetries = 5;

    const connectWebSocket = () => {
      if (retryCount >= maxRetries) {
        console.error('❌ Max WebSocket retries reached');
        setError('Impossible de se connecter au serveur WebSocket');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        console.log('WebSocket Token:', token ? token.substring(0, 10) + '...' : 'No token');
        if (!token) {
          console.error('No token available for WebSocket');
          setError('Aucun jeton d\'authentification pour WebSocket.');
          retryCount++;
          setTimeout(connectWebSocket, 5000);
          return;
        }

        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:4000';
        console.log('Attempting WebSocket connection to:', `${wsUrl}/notifications?token=${encodeURIComponent(token)}`);
        ws = new WebSocket(`${wsUrl}/notifications?token=${encodeURIComponent(token)}`);

        ws.onopen = () => {
          console.log('✅ WebSocket connected with authentication');
          retryCount = 0;
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data);
            switch (data.type) {
              case 'new_notification':
                addNotification(data.notification);
                break;
              case 'notification_updated':
                updateNotification(data.notificationId, data.updates);
                break;
              case 'unread_count_updated':
                setUnreadCount(data.count);
                break;
              default:
                console.log('📨 Message WebSocket non géré:', data);
            }
          } catch (err) {
            console.error('WebSocket message error:', err);
          }
        };

        ws.onclose = () => {
          console.log('🔌 WebSocket disconnected, reconnecting in 5s...');
          retryCount++;
          setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setError('Erreur de connexion WebSocket. Veuillez vérifier le serveur.');
        };
      } catch (err) {
        console.error('WebSocket connection error:', err);
        retryCount++;
        setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [enableRealTime, addNotification, updateNotification]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    currentPage,
    filters,
    loadNotifications,
    loadMore,
    refresh,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    updateFilters,
    clearFilters,
    updateUnreadCount,
    addNotification,
    updateNotification
  };
};

export default useNotifications;