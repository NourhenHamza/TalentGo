/**
 * Service API pour les notifications
 */

class NotificationAPI {
  constructor() {
    this.baseURL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/notifications`;
  }

  /**
   * Récupère le jeton d'authentification depuis les options ou localStorage
   * Priorité: options.headers > localStorage tokens (bToken, aToken, etc.)
   * @param {Object} options - Options de la requête
   * @returns {Object} Objet contenant le token et sa source
   */
  getAuthToken(options = {}) {
    // First, check if token is provided in options
    let token = options.headers?.Authorization?.split(' ')[1];
    let tokenSource = 'options';
    
    if (!token) {
      // Try to get token from localStorage in priority order
      const tokenKeys = [
        'bToken',    // Admin token
        'aToken',    // Academic token
        'uToken',    // User token
        'cToken',    // Company token
        'dToken',    // Department token
        'eToken',    // External supervisor token
        'rToken',    // Responsible token
        'token'      // Generic token (fallback)
      ];
      
      for (const key of tokenKeys) {
        const localToken = localStorage.getItem(key);
        if (localToken) {
          token = localToken;
          tokenSource = key;
          console.log(`Retrieved token from localStorage (${key}):`, token.substring(0, 10) + '...');
          break;
        }
      }
    }
    
    if (!token) {
      console.log('No authentication token found in options or localStorage');
    }
    
    return { token: token || null, source: tokenSource };
  }

  /**
   * Effectue une requête HTTP avec gestion des erreurs
   * @param {string} url - URL de la requête
   * @param {Object} options - Options de la requête (method, headers, body, etc.)
   * @param {number} retries - Nombre de tentatives restantes
   * @param {number} delay - Délai avant la prochaine tentative
   * @returns {Promise<Object>} Réponse de la requête
   */
  async request(url, options = {}, retries = 3, delay = 5000) {
    const { token, source } = this.getAuthToken(options);
    console.log('API Request - URL:', url, 'Token:', token ? token.substring(0, 10) + '...' : 'No token', 'Source:', source);

    if (!token) {
      console.error('No authentication token found');
      throw new Error('Authentification requise');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      console.log('API Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || `Erreur HTTP: ${response.status}`;
        
        if (response.status === 401) {
          console.error('Unauthorized access for token from:', source);
          
          // Only clear the specific token that failed, not all tokens
          // This prevents clearing bToken when other tokens fail
          if (source !== 'options' && source !== 'bToken') {
            console.log(`Clearing failed token from ${source}`);
            localStorage.removeItem(source);
          } else if (source === 'bToken') {
            // For bToken, let the GlobalAdminContext handle it
            console.log('bToken unauthorized - letting context handle it');
          }
          
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        throw new Error(errorMsg);
      }

      return await response.json();
    } catch (error) {
      if (error.message.includes('Failed to fetch') && retries > 0) {
        console.warn(`Network error, retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.request(url, options, retries - 1, delay * 2);
      }
      console.error('API Request Failed:', error);
      throw error;
    }
  }

  /**
   * Construit une URL avec des paramètres de requête
   * @param {string} baseUrl - URL de base
   * @param {Object} params - Paramètres de requête
   * @returns {string} URL complète
   */
  buildURL(baseUrl, params = {}) {
    const url = new URL(baseUrl);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.append(key, value);
      }
    });
    
    return url.toString();
  }

  /**
   * Récupère les notifications de l'utilisateur
   * @param {Object} params - Paramètres de pagination et filtrage
   * @param {Object} options - Options de la requête
   * @returns {Promise<Object>} Liste des notifications
   */
  async getNotifications(params = {}, options = {}) {
    const url = this.buildURL(this.baseURL, params);
    return this.request(url, { method: 'GET', ...options });
  }

  /**
   * Récupère le nombre de notifications non lues
   * @param {Object} options - Options de la requête
   * @returns {Promise<Object>} Nombre de notifications non lues
   */
  async getUnreadCount(options = {}) {
    const url = `${this.baseURL}/unread-count`;
    return this.request(url, { method: 'GET', ...options });
  }

  /**
   * Marque une notification comme lue
   * @param {string} notificationId - ID de la notification
   * @param {Object} options - Options de la requête
   * @returns {Promise<Object>} Notification mise à jour
   */
  async markAsRead(notificationId, options = {}) {
    const url = `${this.baseURL}/${notificationId}/read`;
    return this.request(url, { method: 'PUT', ...options });
  }

  /**
   * Marque toutes les notifications comme lues
   * @param {Object} options - Options de la requête
   * @returns {Promise<Object>} Résultat de l'opération
   */
  async markAllAsRead(options = {}) {
    const url = `${this.baseURL}/mark-all-read`;
    return this.request(url, { method: 'PUT', ...options });
  }

  /**
   * Archive une notification
   * @param {string} notificationId - ID de la notification
   * @param {Object} options - Options de la requête
   * @returns {Promise<Object>} Notification archivée
   */
  async archiveNotification(notificationId, options = {}) {
    const url = `${this.baseURL}/${notificationId}/archive`;
    return this.request(url, { method: 'PUT', ...options });
  }

  /**
   * Supprime une notification
   * @param {string} notificationId - ID de la notification
   * @param {Object} options - Options de la requête
   * @returns {Promise<Object>} Résultat de la suppression
   */
  async deleteNotification(notificationId, options = {}) {
    const url = `${this.baseURL}/${notificationId}`;
    return this.request(url, { method: 'DELETE', ...options });
  }

  /**
   * Récupère les paramètres de notification
   * @param {Object} options - Options de la requête
   * @returns {Promise<Object>} Paramètres de notification
   */
  async getNotificationSettings(options = {}) {
    const url = `${this.baseURL}/settings`;
    return this.request(url, { method: 'GET', ...options });
  }

  /**
   * Met à jour les paramètres de notification
   * @param {Object} settings - Nouveaux paramètres
   * @param {Object} options - Options de la requête
   * @returns {Promise<Object>} Paramètres mis à jour
   */
  async updateNotificationSettings(settings, options = {}) {
    const url = `${this.baseURL}/settings`;
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(settings),
      ...options
    });
  }

  /**
   * Récupère les statistiques de notifications
   * @param {Object} params - Paramètres de filtrage
   * @param {Object} options - Options de la requête
   * @returns {Promise<Object>} Statistiques
   */
  async getNotificationStats(params = {}, options = {}) {
    const url = this.buildURL(`${this.baseURL}/stats`, params);
    return this.request(url, { method: 'GET', ...options });
  }

  /**
   * Récupère les statistiques d'emails
   * @param {Object} params - Paramètres de filtrage
   * @param {Object} options - Options de la requête
   * @returns {Promise<Object>} Statistiques d'emails
   */
  async getEmailStats(params = {}, options = {}) {
    const url = this.buildURL(`${this.baseURL}/email-stats`, params);
    return this.request(url, { method: 'GET', ...options });
  }

  /**
   * Déclenche une notification de test
   * @param {string} eventType - Type d'événement
   * @param {Object} eventData - Données de l'événement
   * @param {Object} options - Options de la requête
   * @returns {Promise<Object>} Résultat du test
   */
  async triggerTestNotification(eventType, eventData = {}, options = {}) {
    const url = `${this.baseURL}/test`;
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify({ eventType, eventData }),
      ...options
    });
  }

  /**
   * Récupère les types d'événements disponibles
   * @param {Object} options - Options de la requête
   * @returns {Promise<Object>} Types d'événements
   */
  async getEventTypes(options = {}) {
    const url = `${this.baseURL}/event-types`;
    return this.request(url, { method: 'GET', ...options });
  }

  /**
   * Nettoie les anciennes notifications (admin)
   * @param {number} daysOld - Âge en jours
   * @param {Object} options - Options de la requête
   * @returns {Promise<Object>} Résultat du nettoyage
   */
  async cleanupOldNotifications(daysOld = 30, options = {}) {
    const url = this.buildURL(`${this.baseURL}/cleanup`, { daysOld });
    return this.request(url, { method: 'DELETE', ...options });
  }
}

// Instance singleton de l'API
export const notificationAPI = new NotificationAPI();

// Fonctions utilitaires pour les composants (unchanged)
export const NotificationUtils = {
  formatRelativeTime(date) {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);

    if (diffInSeconds < 60) {
      return 'À l\'instant';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `Il y a ${diffInWeeks} semaine${diffInWeeks > 1 ? 's' : ''}`;
    }

    return notificationDate.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  getEventIcon(eventType) {
    const iconMap = {
      assignment_created: 'FileText',
      assignment_confirmed: 'CheckCircle',
      assignment_rejected: 'XCircle',
      defense_requested: 'Calendar',
      defense_scheduled: 'Clock',
      defense_accepted: 'CheckCircle2',
      defense_rejected: 'XCircle',
      defense_completed: 'Award',
      company_registered: 'Building',
      company_approved: 'CheckCircle',
      company_rejected: 'XCircle',
      report_submitted: 'FileText',
      report_validated: 'CheckCircle',
      report_rejected: 'XCircle',
      progress_update_submitted: 'TrendingUp',
      progress_feedback_given: 'MessageCircle',
      availability_updated: 'Calendar',
      encadreur_externe_created: 'UserPlus',
      encadreur_externe_approved: 'UserCheck',
      user_created: 'User',
      password_reset: 'Key'
    };

    return iconMap[eventType] || 'Bell';
  },

  getPriorityColor(priority) {
    const colorMap = {
      low: 'text-gray-500',
      medium: 'text-blue-500',
      high: 'text-orange-500',
      urgent: 'text-red-500'
    };

    return colorMap[priority] || 'text-gray-500';
  },

  getPriorityBgColor(priority) {
    const colorMap = {
      low: 'bg-gray-100',
      medium: 'bg-blue-100',
      high: 'bg-orange-100',
      urgent: 'bg-red-100'
    };

    return colorMap[priority] || 'bg-gray-100';
  },

  translateEventType(eventType) {
    const translations = {
      assignment_created: 'Affectation créée',
      assignment_confirmed: 'Affectation confirmée',
      assignment_rejected: 'Affectation rejetée',
      defense_requested: 'Soutenance demandée',
      defense_scheduled: 'Soutenance programmée',
      defense_accepted: 'Soutenance acceptée',
      defense_rejected: 'Soutenance rejetée',
      defense_completed: 'Soutenance terminée',
      company_registered: 'Entreprise enregistrée',
      company_approved: 'Entreprise approuvée',
      company_rejected: 'Entreprise rejetée',
      report_submitted: 'Rapport soumis',
      report_validated: 'Rapport validé',
      report_rejected: 'Rapport rejeté',
      progress_update_submitted: 'Progression mise à jour',
      progress_feedback_given: 'Feedback donné',
      availability_updated: 'Disponibilités mises à jour',
      encadreur_externe_created: 'Encadreur externe créé',
      encadreur_externe_approved: 'Encadreur externe approuvé',
      user_created: 'Utilisateur créé',
      password_reset: 'Mot de passe réinitialisé'
    };

    return translations[eventType] || eventType;
  },

  translateStatus(status) {
    const translations = {
      unread: 'Non lu',
      read: 'Lu',
      archived: 'Archivé'
    };

    return translations[status] || status;
  },

  translatePriority(priority) {
    const translations = {
      low: 'Faible',
      medium: 'Moyenne',
      high: 'Élevée',
      urgent: 'Urgente'
    };

    return translations[priority] || priority;
  }
};

export default notificationAPI;