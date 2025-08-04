import {
  Archive,
  Bell,
  Check,
  Filter,
  RefreshCw,
  Search,
  Trash2,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications.jsx';
import { NotificationUtils } from '../../services/notification.api';
import NotificationItem from './NotificationItem';

/**
 * Complete notification list component
 */
const NotificationList = ({ 
  className = '',
  showFilters = true,
  showSearch = true,
  showBulkActions = true,
  pageSize = 20
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [isFiltersPanelOpen, setIsFiltersPanelOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    filters,
    loadMore,
    refresh,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    updateFilters,
    clearFilters
  } = useNotifications({
    autoRefresh: true,
    pageSize: pageSize
  });

  // Filter notifications by search term
  const filteredNotifications = notifications.filter(notification =>
    notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    NotificationUtils.translateEventType(notification.eventType).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle notification selection
  const handleSelectNotification = (notificationId, selected) => {
    const newSelected = new Set(selectedNotifications);
    if (selected) {
      newSelected.add(notificationId);
    } else {
      newSelected.delete(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  // Select/deselect all notifications
  const handleSelectAll = (selected) => {
    if (selected) {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n._id)));
    } else {
      setSelectedNotifications(new Set());
    }
  };

  // Bulk actions
  const handleBulkMarkAsRead = async () => {
    const promises = Array.from(selectedNotifications).map(id => markAsRead(id));
    await Promise.all(promises);
    setSelectedNotifications(new Set());
  };

  const handleBulkArchive = async () => {
    const promises = Array.from(selectedNotifications).map(id => archiveNotification(id));
    await Promise.all(promises);
    setSelectedNotifications(new Set());
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedNotifications.size} notification(s)?`)) {
      const promises = Array.from(selectedNotifications).map(id => deleteNotification(id));
      await Promise.all(promises);
      setSelectedNotifications(new Set());
    }
  };

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        if (hasMore && !loading) {
          loadMore();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, loadMore]);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Simplified header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
          
          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={refresh}
              disabled={loading}
              className={`p-2 text-gray-400 hover:text-gray-600 rounded-lg ${loading ? 'animate-spin' : ''}`}
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            {showFilters && (
              <button
                onClick={() => setIsFiltersPanelOpen(!isFiltersPanelOpen)}
                className={`p-2 rounded-lg ${isFiltersPanelOpen ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Filters"
              >
                <Filter className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Optional search bar */}
        {showSearch && (
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filters panel */}
      {isFiltersPanelOpen && (
        <FilterPanel
          filters={filters}
          onUpdateFilters={updateFilters}
          onClearFilters={clearFilters}
          onClose={() => setIsFiltersPanelOpen(false)}
        />
      )}

      {/* Bulk actions */}
      {showBulkActions && selectedNotifications.size > 0 && (
        <div className="p-4 bg-blue-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              {selectedNotifications.size} selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkMarkAsRead}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                <Check className="w-3 h-3 inline mr-1" />
                Mark as read
              </button>
              <button
                onClick={handleBulkArchive}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Archive className="w-3 h-3 inline mr-1" />
                Archive
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                <Trash2 className="w-3 h-3 inline mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications list */}
      <div className="divide-y divide-gray-100">
        {/* Select all checkbox */}
        {showBulkActions && filteredNotifications.length > 0 && (
          <div className="p-4 bg-gray-50">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedNotifications.size === filteredNotifications.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Select all</span>
            </label>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {loading && filteredNotifications.length === 0 && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredNotifications.length === 0 && !error && (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
            <p className="text-gray-500">
              {searchTerm ? 'No matching notifications found' : 'You have no notifications yet'}
            </p>
          </div>
        )}

        {/* Notifications */}
        {filteredNotifications.map((notification) => (
          <NotificationItem
            key={notification._id}
            notification={notification}
            selected={selectedNotifications.has(notification._id)}
            onSelect={showBulkActions ? handleSelectNotification : null}
            onMarkAsRead={markAsRead}
            onArchive={archiveNotification}
            onDelete={deleteNotification}
          />
        ))}

        {/* Infinite scroll loading indicator */}
        {loading && filteredNotifications.length > 0 && (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        )}

        {/* End of list */}
        {!hasMore && filteredNotifications.length > 0 && (
          <div className="p-4 text-center text-gray-500 text-sm">
            You've reached the end
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Filter panel component (aligned with MongoDB schema)
 */
const FilterPanel = ({ filters, onUpdateFilters, onClearFilters, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApplyFilters = () => {
    onUpdateFilters(localFilters);
    onClose();
  };

  const handleClearFilters = () => {
    setLocalFilters({ status: null, eventType: null, priority: null, userType: null });
    onClearFilters();
    onClose();
  };

  // Status options
  const statusOptions = [
    { value: '', label: 'All statuses' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' },
    { value: 'archived', label: 'Archived' },
    { value: 'sent', label: 'Sent' }
  ];

  // Priority options (matches MongoDB enum)
  const priorityOptions = [
    { value: '', label: 'All priorities' },
    { value: 'LOW', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'URGENT', label: 'Urgent' }
  ];

  // User type options (matches MongoDB enum)
  const userTypeOptions = [
    { value: '', label: 'All user types' },
    { value: 'student', label: 'Student' },
    { value: 'professor', label: 'Professor' },
    { value: 'company', label: 'Company' },
    { value: 'university', label: 'University' },
    { value: 'encadreur_externe', label: 'External Supervisor' },
    { value: 'recruteur', label: 'Recruiter' },
    { value: 'admin', label: 'Admin' }
  ];

  return (
    <div className="p-4 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Status filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => setLocalFilters({ 
              ...localFilters, 
              status: e.target.value || null 
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={localFilters.priority || ''}
            onChange={(e) => setLocalFilters({ 
              ...localFilters, 
              priority: e.target.value || null 
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* User type filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User Type
          </label>
          <select
            value={localFilters.userType || ''}
            onChange={(e) => setLocalFilters({ 
              ...localFilters, 
              userType: e.target.value || null 
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {userTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Event type search */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Type
          </label>
          <input
            type="text"
            placeholder="Filter by event type..."
            value={localFilters.eventType || ''}
            onChange={(e) => setLocalFilters({ 
              ...localFilters, 
              eventType: e.target.value || null 
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <button
          onClick={handleClearFilters}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Clear filters
        </button>
        <button
          onClick={handleApplyFilters}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Apply filters
        </button>
      </div>
    </div>
  );
};

export default NotificationList;