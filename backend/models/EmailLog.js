import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema({
  // Destinataire de l'email
  recipient: {
    type: String,
    required: true,
    index: true,
    lowercase: true,
    trim: true
  },

  // Sujet de l'email
  subject: {
    type: String,
    required: true,
    maxlength: 200
  },

  // Statut de l'envoi
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'bounced', 'delivered', 'opened', 'clicked'],
    default: 'pending',
    index: true
  },

  // Fournisseur d'email utilisé
  provider: {
    type: String,
    enum: ['smtp', 'sendgrid', 'mailgun', 'ses'],
    required: true
  },

  // ID du message (fourni par le fournisseur)
  messageId: {
    type: String,
    index: true
  },

  // Type d'événement qui a déclenché l'email
  eventType: {
    type: String,
    index: true
  },

  // ID du destinataire dans le système
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },

  // Type d'utilisateur destinataire
  recipientType: {
    type: String,
    enum: ['student', 'professor', 'company', 'university', 'encadreur_externe', 'recruteur', 'admin'],
    index: true
  },

  // Template utilisé
  template: {
    type: String,
    index: true
  },

  // Taille de l'email en octets
  size: {
    type: Number
  },

  // Nombre de tentatives d'envoi
  attempts: {
    type: Number,
    default: 1
  },

  // Date d'envoi réussie
  sentAt: {
    type: Date,
    index: true
  },

  // Date de livraison (si disponible)
  deliveredAt: {
    type: Date
  },

  // Date d'ouverture (si disponible)
  openedAt: {
    type: Date
  },

  // Date de clic (si disponible)
  clickedAt: {
    type: Date
  },

  // Message d'erreur (si échec)
  error: {
    type: String
  },

  // Code d'erreur (si échec)
  errorCode: {
    type: String
  },

  // Réponse du fournisseur d'email
  providerResponse: {
    type: mongoose.Schema.Types.Mixed
  },

  // Métadonnées supplémentaires
  metadata: {
    // ID de la notification liée
    notificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notification'
    },
    
    // ID du job de queue
    jobId: {
      type: String
    },
    
    // Priorité de l'email
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    
    // Tags pour catégoriser
    tags: [{
      type: String
    }],
    
    // Données personnalisées
    customData: {
      type: mongoose.Schema.Types.Mixed
    }
  },

  // Informations de tracking
  tracking: {
    // User agent du client (pour les ouvertures)
    userAgent: {
      type: String
    },
    
    // Adresse IP du client
    ipAddress: {
      type: String
    },
    
    // Liens cliqués
    clickedLinks: [{
      url: String,
      clickedAt: Date
    }]
  },

  // Date d'expiration du log
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Index composés pour les performances
emailLogSchema.index({ recipient: 1, createdAt: -1 });
emailLogSchema.index({ status: 1, createdAt: -1 });
emailLogSchema.index({ eventType: 1, createdAt: -1 });
emailLogSchema.index({ recipientId: 1, recipientType: 1 });
emailLogSchema.index({ provider: 1, status: 1 });
emailLogSchema.index({ 'metadata.priority': 1, status: 1 });

// Virtual pour calculer le temps de livraison
emailLogSchema.virtual('deliveryTime').get(function() {
  if (this.sentAt && this.deliveredAt) {
    return this.deliveredAt.getTime() - this.sentAt.getTime();
  }
  return null;
});

// Virtual pour vérifier si l'email a été ouvert
emailLogSchema.virtual('wasOpened').get(function() {
  return !!this.openedAt;
});

// Virtual pour vérifier si l'email a été cliqué
emailLogSchema.virtual('wasClicked').get(function() {
  return !!this.clickedAt || (this.tracking.clickedLinks && this.tracking.clickedLinks.length > 0);
});

// Virtual pour calculer le taux d'engagement
emailLogSchema.virtual('engagementScore').get(function() {
  let score = 0;
  if (this.status === 'delivered') score += 1;
  if (this.wasOpened) score += 2;
  if (this.wasClicked) score += 3;
  return score;
});

// Méthode pour marquer comme livré
emailLogSchema.methods.markAsDelivered = function(deliveredAt = new Date()) {
  this.status = 'delivered';
  this.deliveredAt = deliveredAt;
  return this.save();
};

// Méthode pour marquer comme ouvert
emailLogSchema.methods.markAsOpened = function(openedAt = new Date(), userAgent = null, ipAddress = null) {
  this.status = 'opened';
  this.openedAt = openedAt;
  
  if (userAgent) {
    this.tracking.userAgent = userAgent;
  }
  
  if (ipAddress) {
    this.tracking.ipAddress = ipAddress;
  }
  
  return this.save();
};

// Méthode pour enregistrer un clic
emailLogSchema.methods.recordClick = function(url, clickedAt = new Date()) {
  if (!this.tracking.clickedLinks) {
    this.tracking.clickedLinks = [];
  }
  
  this.tracking.clickedLinks.push({ url, clickedAt });
  
  if (!this.clickedAt) {
    this.clickedAt = clickedAt;
    this.status = 'clicked';
  }
  
  return this.save();
};

// Méthode statique pour obtenir les statistiques d'envoi
emailLogSchema.statics.getStats = function(filters = {}) {
  const {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate = new Date(),
    eventType = null,
    recipientType = null,
    provider = null
  } = filters;

  const matchStage = {
    createdAt: { $gte: startDate, $lte: endDate }
  };

  if (eventType) matchStage.eventType = eventType;
  if (recipientType) matchStage.recipientType = recipientType;
  if (provider) matchStage.provider = provider;

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        sent: { $sum: { $cond: [{ $in: ['$status', ['sent', 'delivered', 'opened', 'clicked']] }, 1, 0] } },
        delivered: { $sum: { $cond: [{ $in: ['$status', ['delivered', 'opened', 'clicked']] }, 1, 0] } },
        opened: { $sum: { $cond: [{ $in: ['$status', ['opened', 'clicked']] }, 1, 0] } },
        clicked: { $sum: { $cond: [{ $eq: ['$status', 'clicked'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        bounced: { $sum: { $cond: [{ $eq: ['$status', 'bounced'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }
      }
    },
    {
      $addFields: {
        deliveryRate: { $cond: [{ $gt: ['$sent', 0] }, { $multiply: [{ $divide: ['$delivered', '$sent'] }, 100] }, 0] },
        openRate: { $cond: [{ $gt: ['$delivered', 0] }, { $multiply: [{ $divide: ['$opened', '$delivered'] }, 100] }, 0] },
        clickRate: { $cond: [{ $gt: ['$delivered', 0] }, { $multiply: [{ $divide: ['$clicked', '$delivered'] }, 100] }, 0] },
        bounceRate: { $cond: [{ $gt: ['$sent', 0] }, { $multiply: [{ $divide: ['$bounced', '$sent'] }, 100] }, 0] }
      }
    }
  ]);
};

// Méthode statique pour obtenir les statistiques par période
emailLogSchema.statics.getStatsByPeriod = function(period = 'day', filters = {}) {
  const {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate = new Date()
  } = filters;

  let dateFormat;
  switch (period) {
    case 'hour':
      dateFormat = { $dateToString: { format: '%Y-%m-%d %H:00', date: '$createdAt' } };
      break;
    case 'day':
      dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
      break;
    case 'week':
      dateFormat = { $dateToString: { format: '%Y-W%U', date: '$createdAt' } };
      break;
    case 'month':
      dateFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
      break;
    default:
      dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
  }

  return this.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: dateFormat,
        total: { $sum: 1 },
        sent: { $sum: { $cond: [{ $in: ['$status', ['sent', 'delivered', 'opened', 'clicked']] }, 1, 0] } },
        delivered: { $sum: { $cond: [{ $in: ['$status', ['delivered', 'opened', 'clicked']] }, 1, 0] } },
        opened: { $sum: { $cond: [{ $in: ['$status', ['opened', 'clicked']] }, 1, 0] } },
        clicked: { $sum: { $cond: [{ $eq: ['$status', 'clicked'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// Méthode statique pour nettoyer les anciens logs
emailLogSchema.statics.cleanupOld = function(daysOld = 90) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  
  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    status: { $in: ['sent', 'delivered', 'failed', 'bounced'] }
  });
};

// Hook pre-save pour définir l'expiration automatique
emailLogSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    // Expirer après 6 mois par défaut
    this.expiresAt = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

const EmailLog = mongoose.model('EmailLog', emailLogSchema);

export default EmailLog;

