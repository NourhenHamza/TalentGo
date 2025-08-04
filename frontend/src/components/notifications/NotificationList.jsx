import {
  Archive,
  Bell,
  Check,
  CheckCheck,
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
 * Composant liste complète des notifications
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

  // Filtrer les notifications par terme de recherche
  const filteredNotifications = notifications.filter(notification =>
    notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    NotificationUtils.translateEventType(notification.eventType).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gérer la sélection de notifications
  const handleSelectNotification = (notificationId, selected) => {
    const newSelected = new Set(selectedNotifications);
    if (selected) {
      newSelected.add(notificationId);
    } else {
      newSelected.delete(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  // Sélectionner/désélectionner toutes les notifications
  const handleSelectAll = (selected) => {
    if (selected) {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n._id)));
    } else {
      setSelectedNotifications(new Set());
    }
  };

  // Actions en lot
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
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedNotifications.size} notification(s) ?`)) {
      const promises = Array.from(selectedNotifications).map(id => deleteNotification(id));
      await Promise.all(promises);
      setSelectedNotifications(new Set());
    }
  };

  // Scroll infini
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
      {/* En-tête */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Bouton actualiser */}
            <button
              onClick={refresh}
              disabled={loading}
              className={`p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors ${
                loading ? 'animate-spin' : ''
              }`}
              title="Actualiser"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            
            {/* Bouton filtres */}
            {showFilters && (
              <button
                onClick={() => setIsFiltersPanelOpen(!isFiltersPanelOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  isFiltersPanelOpen ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Filtres"
              >
                <Filter className="w-5 h-5" />
              </button>
            )}
            
            {/* Bouton marquer tout comme lu */}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <CheckCheck className="w-4 h-4 inline mr-1" />
                Tout marquer comme lu
              </button>
            )}
          </div>
        </div>

        {/* Barre de recherche */}
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher dans les notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {/* Panneau de filtres */}
      {isFiltersPanelOpen && (
        <FilterPanel
          filters={filters}
          onUpdateFilters={updateFilters}
          onClearFilters={clearFilters}
          onClose={() => setIsFiltersPanelOpen(false)}
        />
      )}

      {/* Actions en lot */}
      {showBulkActions && selectedNotifications.size > 0 && (
        <div className="p-4 bg-blue-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              {selectedNotifications.size} notification{selectedNotifications.size > 1 ? 's' : ''} sélectionnée{selectedNotifications.size > 1 ? 's' : ''}
            </span>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkMarkAsRead}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <Check className="w-3 h-3 inline mr-1" />
                Marquer comme lu
              </button>
              
              <button
                onClick={handleBulkArchive}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Archive className="w-3 h-3 inline mr-1" />
                Archiver
              </button>
              
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-3 h-3 inline mr-1" />
                Supprimer
              </button>
              
              <button
                onClick={() => setSelectedNotifications(new Set())}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des notifications */}
      <div className="divide-y divide-gray-100">
        {/* Sélection globale */}
        {showBulkActions && filteredNotifications.length > 0 && (
          <div className="p-4 bg-gray-50">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedNotifications.size === filteredNotifications.length && filteredNotifications.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Sélectionner tout
              </span>
            </label>
          </div>
        )}

        {/* Messages d'état */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading && filteredNotifications.length === 0 && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des notifications...</p>
          </div>
        )}

        {!loading && filteredNotifications.length === 0 && !error && (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune notification</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Aucune notification ne correspond à votre recherche.' : 'Vous n\'avez aucune notification pour le moment.'}
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

        {/* Indicateur de chargement pour le scroll infini */}
        {loading && filteredNotifications.length > 0 && (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        )}

        {/* Message fin de liste */}
        {!hasMore && filteredNotifications.length > 0 && (
          <div className="p-4 text-center text-gray-500 text-sm">
            Toutes les notifications ont été chargées
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Composant panneau de filtres
 */
const FilterPanel = ({ filters, onUpdateFilters, onClearFilters, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApplyFilters = () => {
    onUpdateFilters(localFilters);
    onClose();
  };

  const handleClearFilters = () => {
    setLocalFilters({ status: null, eventType: null, priority: null });
    onClearFilters();
    onClose();
  };

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'unread', label: 'Non lu' },
    { value: 'read', label: 'Lu' },
    { value: 'archived', label: 'Archivé' }
  ];

  const priorityOptions = [
    { value: '', label: 'Toutes les priorités' },
    { value: 'urgent', label: 'Urgente' },
    { value: 'high', label: 'Élevée' },
    { value: 'medium', label: 'Moyenne' },
    { value: 'low', label: 'Faible' }
  ];

  return (
    <div className="p-4 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filtres</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Filtre par statut */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value || null })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre par priorité */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priorité
          </label>
          <select
            value={localFilters.priority || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, priority: e.target.value || null })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre par type d'événement */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type d'événement
          </label>
          <input
            type="text"
            placeholder="Filtrer par type..."
            value={localFilters.eventType || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, eventType: e.target.value || null })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <button
          onClick={handleClearFilters}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Effacer les filtres
        </button>
        <button
          onClick={handleApplyFilters}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Appliquer les filtres
        </button>
      </div>
    </div>
  );
};

export default NotificationList;