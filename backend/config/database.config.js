// Configuration de la base de données
export const DATABASE_CONFIG = {
  // Configuration MongoDB
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/pfe-managment',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },

  // Collections utilisées par le système de notifications
  collections: {
    notifications: 'notifications',
    emailLogs: 'email_logs',
    notificationSettings: 'notification_settings',
    templates: 'email_templates'
  },

  // Index recommandés pour les performances
  indexes: {
    notifications: [
      { user: 1, createdAt: -1 },
      { user: 1, status: 1 },
      { eventType: 1, createdAt: -1 },
      { 'metadata.entityId': 1, 'metadata.entityType': 1 }
    ],
    emailLogs: [
      { recipient: 1, createdAt: -1 },
      { status: 1, createdAt: -1 },
      { eventType: 1, createdAt: -1 }
    ],
    notificationSettings: [
      { user: 1, userType: 1 },
      { user: 1, eventType: 1 }
    ]
  }
};

