import React, { useState } from 'react';
import { 
  Check, 
  Archive, 
  Trash2, 
  ExternalLink, 
  Clock,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
  User,
  Building,
  Award
} from 'lucide-react';
import { NotificationUtils } from '../../services/notification.api';

/**
 * Composant pour un élément de notification individuel
 */
const NotificationItem = ({
  notification,
  selected = false,
  onSelect = null,
  onMarkAsRead,
  onArchive,
  onDelete,
  compact = false,
  showActions = true
}) => {
  const [showFullActions, setShowFullActions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Gérer les actions avec état de chargement
  const handleAction = async (action, ...args) => {
    setIsProcessing(true);
    try {
      await action(...args);
    } catch (error) {
      console.error('Erreur lors de l\'action:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Obtenir l'icône pour le type d'événement
  const getEventIcon = (eventType) => {
    const iconMap = {
      assignment_created: FileText,
      assignment_confirmed: CheckCircle,
      assignment_rejected: XCircle,
      defense_requested: Calendar,
      defense_scheduled: Clock,
      defense_accepted: CheckCircle,
      defense_rejected: XCircle,
      defense_completed: Award,
      company_registered: Building,
      company_approved: CheckCircle,
      company_rejected: XCircle,
      report_submitted: FileText,
      report_validated: CheckCircle,
      report_rejected: XCircle,
      progress_update_submitted: Info,
      progress_feedback_given: Info,
      availability_updated: Calendar,
      encadreur_externe_created: User,
      encadreur_externe_approved: CheckCircle,
      user_created: User,
      password_reset: AlertCircle
    };

    const IconComponent = iconMap[eventType] || Info;
    return <IconComponent className="w-5 h-5" />;
  };

  // Obtenir la couleur pour la priorité
  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'urgent':
        return {
          border: 'border-l-red-500',
          bg: 'bg-red-50',
          icon: 'text-red-500',
          badge: 'bg-red-100 text-red-800'
        };
      case 'high':
        return {
          border: 'border-l-orange-500',
          bg: 'bg-orange-50',
          icon: 'text-orange-500',
          badge: 'bg-orange-100 text-orange-800'
        };
      case 'medium':
        return {
          border: 'border-l-blue-500',
          bg: 'bg-blue-50',
          icon: 'text-blue-500',
          badge: 'bg-blue-100 text-blue-800'
        };
      default:
        return {
          border: 'border-l-gray-300',
          bg: 'bg-white',
          icon: 'text-gray-500',
          badge: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const priorityStyles = getPriorityStyles(notification.priority);
  const isUnread = notification.status === 'unread';

  return (
    <div
      className={`
        relative border-l-4 transition-all duration-200 hover:shadow-sm
        ${priorityStyles.border}
        ${isUnread ? 'bg-blue-50' : priorityStyles.bg}
        ${compact ? 'p-3' : 'p-4'}
      `}
      onMouseEnter={() => setShowFullActions(true)}
      onMouseLeave={() => setShowFullActions(false)}
    >
      <div className="flex items-start space-x-3">
        {/* Checkbox de sélection */}
        {onSelect && (
          <div className="flex-shrink-0 pt-1">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect(notification._id, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Icône du type d'événement */}
        <div className={`flex-shrink-0 pt-1 ${priorityStyles.icon}`}>
          {getEventIcon(notification.eventType)}
        </div>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Titre/Message */}
              <div className="flex items-center space-x-2 mb-1">
                {notification.title && (
                  <h4 className={`text-sm font-medium ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                    {notification.title}
                  </h4>
                )}
                
                {/* Badge de priorité */}
                {notification.priority === 'urgent' && (
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityStyles.badge}`}>
                    Urgent
                  </span>
                )}
                
                {/* Indicateur non lu */}
                {isUnread && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                )}
              </div>

              {/* Message principal */}
              <p className={`text-sm ${isUnread ? 'font-medium text-gray-900' : 'text-gray-700'} mb-2`}>
                {notification.message}
              </p>

              {/* Métadonnées */}
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {NotificationUtils.formatRelativeTime(notification.createdAt)}
                </span>
                
                <span>
                  {NotificationUtils.translateEventType(notification.eventType)}
                </span>
                
                {notification.metadata?.entityType && (
                  <span className="capitalize">
                    {notification.metadata.entityType}
                  </span>
                )}
                
                {!compact && (
                  <span>
                    {NotificationUtils.translatePriority(notification.priority)}
                  </span>
                )}
              </div>

              {/* Bouton d'action si disponible */}
              {notification.metadata?.actionUrl && notification.metadata?.actionText && (
                <div className="mt-3">
                  <a
                    href={notification.metadata.actionUrl}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
                    onClick={() => {
                      if (isUnread) {
                        handleAction(onMarkAsRead, notification._id);
                      }
                    }}
                  >
                    {notification.metadata.actionText}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              )}
            </div>

            {/* Actions */}
            {showActions && (showFullActions || compact) && (
              <div className="flex items-center space-x-1 ml-2">
                {isUnread && (
                  <button
                    onClick={() => handleAction(onMarkAsRead, notification._id)}
                    disabled={isProcessing}
                    className="p-1.5 text-gray-400 hover:text-green-600 rounded transition-colors disabled:opacity-50"
                    title="Marquer comme lu"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                
                {notification.status !== 'archived' && (
                  <button
                    onClick={() => handleAction(onArchive, notification._id)}
                    disabled={isProcessing}
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors disabled:opacity-50"
                    title="Archiver"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  onClick={() => {
                    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
                      handleAction(onDelete, notification._id);
                    }
                  }}
                  disabled={isProcessing}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors disabled:opacity-50"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          

          {/* Barre de progression pour les actions en cours */}
          {isProcessing && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-200">
              <div className="h-full bg-blue-500 animate-pulse"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;

