import Notification from '../models/Notification.js';
import NotificationSettings from '../models/NotificationSettings.js';
import EmailLog from '../models/EmailLog.js';
import { NotificationService } from '../services/NotificationService.js';
import { NOTIFICATION_CONFIG } from '../config/notification.config.js';

export class NotificationController {
  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Récupère les notifications d'un utilisateur avec pagination
   */
  async getUserNotifications(req, res) {
    try {
      const userId = req.user?.id || req.user?._id;
      if (!userId) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
      }

      const {
        page = 1,
        limit = 20,
        status = null,
        eventType = null,
        priority = null,
        entityType = null,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Construire la requête
      const query = { user: userId };
      
      if (status) query.status = status;
      if (eventType) query.eventType = eventType;
      if (priority) query.priority = priority;
      if (entityType) query['metadata.entityType'] = entityType;

      // Construire le tri
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // Exécuter la requête avec pagination
      const notifications = await Notification.find(query)
        .sort(sort)
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .lean();

      // Compter le total
      const total = await Notification.countDocuments(query);

      // Compter les non lues
      const unreadCount = await Notification.countDocuments({
        user: userId,
        status: 'unread'
      });

      res.json({
        success: true,
        data: {
          notifications,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          },
          unreadCount
        }
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des notifications:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des notifications',
        details: error.message 
      });
    }
  }

  /**
   * Marque une notification comme lue
   */
  async markAsRead(req, res) {
    try {
      const userId = req.user?.id || req.user?._id;
      const { notificationId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
      }

      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { 
          status: 'read', 
          readAt: new Date() 
        },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ error: 'Notification non trouvée' });
      }

      res.json({
        success: true,
        data: notification
      });

    } catch (error) {
      console.error('❌ Erreur lors du marquage de la notification:', error);
      res.status(500).json({ 
        error: 'Erreur lors du marquage de la notification',
        details: error.message 
      });
    }
  }

  /**
   * Marque toutes les notifications comme lues
   */
  async markAllAsRead(req, res) {
    try {
      const userId = req.user?.id || req.user?._id;

      if (!userId) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
      }

      const result = await Notification.updateMany(
        { user: userId, status: 'unread' },
        { 
          status: 'read', 
          readAt: new Date() 
        }
      );

      res.json({
        success: true,
        data: {
          modifiedCount: result.modifiedCount
        }
      });

    } catch (error) {
      console.error('❌ Erreur lors du marquage des notifications:', error);
      res.status(500).json({ 
        error: 'Erreur lors du marquage des notifications',
        details: error.message 
      });
    }
  }

  /**
   * Archive une notification
   */
  async archiveNotification(req, res) {
    try {
      const userId = req.user?.id || req.user?._id;
      const { notificationId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
      }

      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { 
          status: 'archived', 
          archivedAt: new Date() 
        },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ error: 'Notification non trouvée' });
      }

      res.json({
        success: true,
        data: notification
      });

    } catch (error) {
      console.error('❌ Erreur lors de l\'archivage de la notification:', error);
      res.status(500).json({ 
        error: 'Erreur lors de l\'archivage de la notification',
        details: error.message 
      });
    }
  }

  /**
   * Supprime une notification
   */
  async deleteNotification(req, res) {
    try {
      const userId = req.user?.id || req.user?._id;
      const { notificationId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
      }

      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        user: userId
      });

      if (!notification) {
        return res.status(404).json({ error: 'Notification non trouvée' });
      }

      res.json({
        success: true,
        message: 'Notification supprimée avec succès'
      });

    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la notification:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la suppression de la notification',
        details: error.message 
      });
    }
  }

  /**
   * Récupère le nombre de notifications non lues
   */
  async getUnreadCount(req, res) {
    try {
      const userId = req.user?.id || req.user?._id;

      if (!userId) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
      }

      const unreadCount = await Notification.countDocuments({
        user: userId,
        status: 'unread'
      });

      res.json({
        success: true,
        data: { unreadCount }
      });

    } catch (error) {
      console.error('❌ Erreur lors du comptage des notifications:', error);
      res.status(500).json({ 
        error: 'Erreur lors du comptage des notifications',
        details: error.message 
      });
    }
  }

  /**
   * Récupère les paramètres de notification d'un utilisateur
   */
  async getNotificationSettings(req, res) {
    try {
      const userId = req.user?.id || req.user?._id;
      const userType = req.user?.role || req.user?.userType || 'student';

      if (!userId) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
      }

      const settings = await NotificationSettings.getOrCreate(
        userId, 
        userType, 
        req.user?.email
      );

      res.json({
        success: true,
        data: settings
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des paramètres:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des paramètres',
        details: error.message 
      });
    }
  }

  /**
   * Met à jour les paramètres de notification d'un utilisateur
   */
  async updateNotificationSettings(req, res) {
    try {
      const userId = req.user?.id || req.user?._id;
      const userType = req.user?.role || req.user?.userType || 'student';

      if (!userId) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
      }

      const settings = await NotificationSettings.findOneAndUpdate(
        { user: userId, userType: userType },
        { $set: req.body },
        { new: true, upsert: true }
      );

      res.json({
        success: true,
        data: settings
      });

    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des paramètres:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la mise à jour des paramètres',
        details: error.message 
      });
    }
  }

  /**
   * Déclenche manuellement une notification (pour les tests)
   */
  async triggerTestNotification(req, res) {
    try {
      const userId = req.user?.id || req.user?._id;

      if (!userId) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
      }

      const { eventType, eventData = {} } = req.body;

      if (!eventType) {
        return res.status(400).json({ error: 'Type d\'événement requis' });
      }

      // Ajouter l'utilisateur aux données de l'événement
      const testEventData = {
        ...eventData,
        testMode: true,
        triggeredBy: userId
      };

      await this.notificationService.triggerNotification(
        eventType, 
        testEventData, 
        { manual: true, userId }
      );

      res.json({
        success: true,
        message: 'Notification de test déclenchée avec succès'
      });

    } catch (error) {
      console.error('❌ Erreur lors du déclenchement de la notification de test:', error);
      res.status(500).json({ 
        error: 'Erreur lors du déclenchement de la notification de test',
        details: error.message 
      });
    }
  }

  /**
   * Récupère les statistiques de notifications
   */
  async getNotificationStats(req, res) {
    try {
      const userId = req.user?.id || req.user?._id;

      if (!userId) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
      }

      const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate = new Date()
      } = req.query;

      // Statistiques des notifications
      const notificationStats = await Notification.aggregate([
        {
          $match: {
            user: userId,
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            unread: { $sum: { $cond: [{ $eq: ['$status', 'unread'] }, 1, 0] } },
            read: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } },
            archived: { $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] } },
            urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
            high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
            medium: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
            low: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } }
          }
        }
      ]);

      // Statistiques par type d'événement
      const eventTypeStats = await Notification.aggregate([
        {
          $match: {
            user: userId,
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
          }
        },
        {
          $group: {
            _id: '$eventType',
            count: { $sum: 1 },
            unreadCount: { $sum: { $cond: [{ $eq: ['$status', 'unread'] }, 1, 0] } }
          }
        },
        { $sort: { count: -1 } }
      ]);

      res.json({
        success: true,
        data: {
          overview: notificationStats[0] || {
            total: 0, unread: 0, read: 0, archived: 0,
            urgent: 0, high: 0, medium: 0, low: 0
          },
          byEventType: eventTypeStats
        }
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des statistiques',
        details: error.message 
      });
    }
  }

  /**
   * Récupère les statistiques d'emails
   */
  async getEmailStats(req, res) {
    try {
      const userId = req.user?.id || req.user?._id;

      if (!userId) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
      }

      const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate = new Date()
      } = req.query;

      const emailStats = await EmailLog.aggregate([
        {
          $match: {
            recipientId: userId,
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            sent: { $sum: { $cond: [{ $in: ['$status', ['sent', 'delivered', 'opened', 'clicked']] }, 1, 0] } },
            delivered: { $sum: { $cond: [{ $in: ['$status', ['delivered', 'opened', 'clicked']] }, 1, 0] } },
            opened: { $sum: { $cond: [{ $in: ['$status', ['opened', 'clicked']] }, 1, 0] } },
            clicked: { $sum: { $cond: [{ $eq: ['$status', 'clicked'] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }
          }
        },
        {
          $addFields: {
            deliveryRate: { $cond: [{ $gt: ['$sent', 0] }, { $multiply: [{ $divide: ['$delivered', '$sent'] }, 100] }, 0] },
            openRate: { $cond: [{ $gt: ['$delivered', 0] }, { $multiply: [{ $divide: ['$opened', '$delivered'] }, 100] }, 0] },
            clickRate: { $cond: [{ $gt: ['$delivered', 0] }, { $multiply: [{ $divide: ['$clicked', '$delivered'] }, 100] }, 0] }
          }
        }
      ]);

      res.json({
        success: true,
        data: emailStats[0] || {
          total: 0, sent: 0, delivered: 0, opened: 0, clicked: 0, failed: 0,
          deliveryRate: 0, openRate: 0, clickRate: 0
        }
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques d\'email:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des statistiques d\'email',
        details: error.message 
      });
    }
  }

  /**
   * Nettoie les anciennes notifications
   */
  async cleanupOldNotifications(req, res) {
    try {
      const { daysOld = 30 } = req.query;

      const result = await Notification.cleanupOld(parseInt(daysOld));

      res.json({
        success: true,
        data: {
          deletedCount: result.deletedCount
        }
      });

    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des notifications:', error);
      res.status(500).json({ 
        error: 'Erreur lors du nettoyage des notifications',
        details: error.message 
      });
    }
  }

  /**
   * Récupère la configuration des événements disponibles
   */
  async getEventTypes(req, res) {
    try {
      const eventTypes = Object.keys(NOTIFICATION_CONFIG.EVENT_RECIPIENTS).map(eventType => ({
        eventType,
        config: NOTIFICATION_CONFIG.EVENT_RECIPIENTS[eventType],
        template: NOTIFICATION_CONFIG.EMAIL_TEMPLATES[eventType],
        defaultMessage: NOTIFICATION_CONFIG.DEFAULT_MESSAGES[eventType]
      }));

      res.json({
        success: true,
        data: eventTypes
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des types d\'événements:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des types d\'événements',
        details: error.message 
      });
    }
  }
}

export default new NotificationController();

