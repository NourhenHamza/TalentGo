import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // Destinataire de la notification
  user: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    
  },
  
  // Type d'utilisateur (pour optimiser les requêtes)
  userType: {
    type: String,
    enum: ['student', 'professor', 'company', 'university', 'encadreur_externe', 'recruteur', 'admin'],
    required: true,
    index: true
  },

  // Type d'événement qui a déclenché la notification
  eventType: {
    type: String,
    required: true,
    index: true
  },

  // Message de la notification
  message: {
    type: String,
    required: true,
    maxlength: 500
  },

  // Titre de la notification (optionnel)
  title: {
    type: String,
    maxlength: 100
  },

  // Statut de la notification
  status: {
    type: String,
    enum: ['unread', 'read', 'archived','sent'],
    default: 'unread',
    index: true
  },

  // Priorité de la notification
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },

  // Date de lecture
  readAt: {
    type: Date,
    default: null
  },

  // Date d'archivage
  archivedAt: {
    type: Date,
    default: null
  },

  // Métadonnées de la notification
  metadata: {
    // Type d'entité liée (assignment, defense, etc.)
    entityType: {
      type: String,
      index: true
    },
    
    // ID de l'entité liée
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true
    },
    
    // Données originales de l'événement
    originalData: {
      type: mongoose.Schema.Types.Mixed
    },
    
    // URL d'action (optionnel)
    actionUrl: {
      type: String
    },
    
    // Texte du bouton d'action (optionnel)
    actionText: {
      type: String
    },
    
    // Icône de la notification (optionnel)
    icon: {
      type: String
    },
    
    // Couleur de la notification (optionnel)
    color: {
      type: String
    }
  },

  // Informations sur l'expéditeur/déclencheur
  sender: {
    userId: {
      type: mongoose.Schema.Types.ObjectId
    },
    userType: {
      type: String
    },
    name: {
      type: String
    }
  },

  // Date d'expiration (optionnel)
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  },

  // Indique si un email a été envoyé
  emailSent: {
    type: Boolean,
    default: false
  },

  // ID du job d'email (si applicable)
  emailJobId: {
    type: String
  },

  // Groupement de notifications (pour éviter le spam)
  groupKey: {
    type: String,
    index: true
  },

  // Nombre de notifications similaires groupées
  groupCount: {
    type: Number,
    default: 1
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
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, status: 1, createdAt: -1 });
notificationSchema.index({ eventType: 1, createdAt: -1 });
notificationSchema.index({ 'metadata.entityId': 1, 'metadata.entityType': 1 });
notificationSchema.index({ groupKey: 1, createdAt: -1 });
notificationSchema.index({ priority: 1, status: 1, createdAt: -1 });

// Virtual pour vérifier si la notification est récente (moins de 24h)
notificationSchema.virtual('isRecent').get(function() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.createdAt > oneDayAgo;
});

// Virtual pour vérifier si la notification est urgente et non lue
notificationSchema.virtual('isUrgentUnread').get(function() {
  return this.priority === 'urgent' && this.status === 'unread';
});

// Virtual pour obtenir l'âge de la notification en minutes
notificationSchema.virtual('ageInMinutes').get(function() {
  return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60));
});

// Méthode pour marquer comme lue
notificationSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

// Méthode pour archiver
notificationSchema.methods.archive = function() {
  this.status = 'archived';
  this.archivedAt = new Date();
  return this.save();
};

// Méthode statique pour marquer plusieurs notifications comme lues
notificationSchema.statics.markManyAsRead = function(userId, notificationIds = null) {
  const query = { user: userId, status: 'unread' };
  
  if (notificationIds && Array.isArray(notificationIds)) {
    query._id = { $in: notificationIds };
  }
  
  return this.updateMany(query, {
    status: 'read',
    readAt: new Date()
  });
};

// Méthode statique pour obtenir le nombre de notifications non lues
notificationSchema.statics.getUnreadCount = function(userId, filters = {}) {
  const query = { user: userId, status: 'unread', ...filters };
  return this.countDocuments(query);
};

// Méthode statique pour obtenir les notifications avec pagination
notificationSchema.statics.getPaginated = function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    status = null,
    eventType = null,
    priority = null,
    entityType = null,
    sortBy = 'createdAt',
    sortOrder = -1
  } = options;

  const query = { user: userId };
  
  if (status) query.status = status;
  if (eventType) query.eventType = eventType;
  if (priority) query.priority = priority;
  if (entityType) query['metadata.entityType'] = entityType;

  const sort = { [sortBy]: sortOrder };
  
  return this.find(query)
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();
};

// Méthode statique pour nettoyer les anciennes notifications
notificationSchema.statics.cleanupOld = function(daysOld = 30) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  
  return this.deleteMany({
    $or: [
      { status: 'archived', archivedAt: { $lt: cutoffDate } },
      { status: 'read', readAt: { $lt: cutoffDate } },
      { createdAt: { $lt: cutoffDate }, priority: { $in: ['low', 'medium'] } }
    ]
  });
};

// Méthode statique pour grouper les notifications similaires
notificationSchema.statics.groupSimilar = function(notification) {
  const groupKey = `${notification.user}_${notification.eventType}_${notification.metadata?.entityType || 'general'}`;
  
  return this.findOneAndUpdate(
    {
      groupKey: groupKey,
      status: 'unread',
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Dernière heure
    },
    {
      $inc: { groupCount: 1 },
      $set: {
        message: notification.message,
        updatedAt: new Date()
      }
    },
    { new: true }
  );
};

// Hook pre-save pour générer la clé de groupement
notificationSchema.pre('save', function(next) {
  if (this.isNew && !this.groupKey) {
    this.groupKey = `${this.user}_${this.eventType}_${this.metadata?.entityType || 'general'}`;
  }
  next();
});

// Hook post-save pour nettoyer automatiquement
notificationSchema.post('save', function(doc, next) {
  // Nettoyer les anciennes notifications de manière asynchrone
  if (Math.random() < 0.01) { // 1% de chance à chaque sauvegarde
    setImmediate(() => {
      this.constructor.cleanupOld().catch(err => {
        console.error('❌ Erreur lors du nettoyage automatique des notifications:', err);
      });
    });
  }
  next();
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;

