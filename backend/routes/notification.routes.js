import express from 'express';
import jwt from 'jsonwebtoken';
import notificationController from '../controllers/notification.controller.js';

const router = express.Router();

const requireAuth = (req, res, next) => {
  // Vérification du header Authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No or invalid Authorization header');
    return res.status(401).json({ error: 'Authentification requise' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('Authenticated user for notifications:', req.user.id, 'Role:', req.user.role || 'Not provided');
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).json({ error: 'Token invalide' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    console.log('Admin access denied for user:', req.user?.id, 'Role:', req.user?.role);
    return res.status(403).json({ error: 'Accès administrateur requis' });
  }
  next();
};

// Routes protégées avec JWT
router.get('/', requireAuth, notificationController.getUserNotifications.bind(notificationController));
router.get('/unread-count', requireAuth, notificationController.getUnreadCount.bind(notificationController));
router.put('/:notificationId/read', requireAuth, notificationController.markAsRead.bind(notificationController));
router.put('/mark-all-read', requireAuth, notificationController.markAllAsRead.bind(notificationController));
router.put('/:notificationId/archive', requireAuth, notificationController.archiveNotification.bind(notificationController));
router.delete('/:notificationId', requireAuth, notificationController.deleteNotification.bind(notificationController));
router.get('/settings', requireAuth, notificationController.getNotificationSettings.bind(notificationController));
router.put('/settings', requireAuth, notificationController.updateNotificationSettings.bind(notificationController));
router.get('/stats', requireAuth, notificationController.getNotificationStats.bind(notificationController));
router.get('/email-stats', requireAuth, notificationController.getEmailStats.bind(notificationController));
router.post('/test', requireAuth, notificationController.triggerTestNotification.bind(notificationController));
router.get('/event-types', requireAuth, notificationController.getEventTypes.bind(notificationController));
router.delete('/cleanup', requireAuth, requireAdmin, notificationController.cleanupOldNotifications.bind(notificationController));

// Webhook routes (public, no auth)
router.post('/webhooks/email/delivered', async (req, res) => {
  try {
    const { messageId, deliveredAt } = req.body;
    if (!messageId) {
      return res.status(400).json({ error: 'messageId requis' });
    }
    const EmailLog = (await import('../models/EmailLog.js')).default;
    await EmailLog.findOneAndUpdate(
      { messageId: messageId },
      { 
        status: 'delivered',
        deliveredAt: new Date(deliveredAt || Date.now())
      }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur webhook delivered:', error);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

router.post('/webhooks/email/opened', async (req, res) => {
  try {
    const { messageId, openedAt, userAgent, ipAddress } = req.body;
    if (!messageId) {
      return res.status(400).json({ error: 'messageId requis' });
    }
    const EmailLog = (await import('../models/EmailLog.js')).default;
    const emailLog = await EmailLog.findOne({ messageId: messageId });
    if (emailLog) {
      await emailLog.markAsOpened(
        new Date(openedAt || Date.now()),
        userAgent,
        ipAddress
      );
    }
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur webhook opened:', error);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

router.post('/webhooks/email/clicked', async (req, res) => {
  try {
    const { messageId, url, clickedAt } = req.body;
    if (!messageId || !url) {
      return res.status(400).json({ error: 'messageId et url requis' });
    }
    const EmailLog = (await import('../models/EmailLog.js')).default;
    const emailLog = await EmailLog.findOne({ messageId: messageId });
    if (emailLog) {
      await emailLog.recordClick(url, new Date(clickedAt || Date.now()));
    }
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur webhook clicked:', error);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

router.post('/webhooks/email/bounced', async (req, res) => {
  try {
    const { messageId, bounceType, bounceReason } = req.body;
    if (!messageId) {
      return res.status(400).json({ error: 'messageId requis' });
    }
    const EmailLog = (await import('../models/EmailLog.js')).default;
    await EmailLog.findOneAndUpdate(
      { messageId: messageId },
      { 
        status: 'bounced',
        error: bounceReason,
        errorCode: bounceType
      }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur webhook bounced:', error);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

router.use((error, req, res, next) => {
  console.error('❌ Erreur dans les routes de notifications:', error);
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Données invalides',
      details: Object.values(error.errors).map(err => err.message)
    });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({
      error: 'ID invalide',
      details: error.message
    });
  }
  res.status(500).json({
    error: 'Erreur interne du serveur',
    details: process.env.NODE_ENV === 'development' ? error.message : 'Une erreur est survenue'
  });
});

export default router;