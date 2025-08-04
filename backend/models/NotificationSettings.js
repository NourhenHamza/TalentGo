import mongoose from 'mongoose';

const notificationSettingsSchema = new mongoose.Schema({
  // Utilisateur concerné
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },

  // Type d'utilisateur
  userType: {
    type: String,
    enum: ['student', 'professor', 'company', 'university', 'encadreur_externe', 'recruteur', 'admin'],
    required: true,
    index: true
  },

  // Paramètres globaux
  globalSettings: {
    // Activer/désactiver toutes les notifications
    enabled: {
      type: Boolean,
      default: true
    },
    
    // Activer/désactiver tous les emails
    emailEnabled: {
      type: Boolean,
      default: true
    },
    
    // Heures de silence (ne pas envoyer d'emails)
    quietHours: {
      enabled: {
        type: Boolean,
        default: false
      },
      start: {
        type: String,
        default: '22:00'
      },
      end: {
        type: String,
        default: '08:00'
      },
      timezone: {
        type: String,
        default: 'Europe/Paris'
      }
    },
    
    // Fréquence de digest des emails
    digestFrequency: {
      type: String,
      enum: ['immediate', 'hourly', 'daily', 'weekly', 'never'],
      default: 'immediate'
    },
    
    // Langue préférée
    language: {
      type: String,
      default: 'fr',
      enum: ['fr', 'en', 'es', 'de']
    }
  },

  // Paramètres par type d'événement
  eventSettings: [{
    eventType: {
      type: String,
      required: true
    },
    
    // Notification in-app activée
    inAppEnabled: {
      type: Boolean,
      default: true
    },
    
    // Email activé
    emailEnabled: {
      type: Boolean,
      default: true
    },
    
    // Priorité minimale pour déclencher la notification
    minPriority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'low'
    },
    
    // Délai avant envoi (en minutes)
    delay: {
      type: Number,
      default: 0,
      min: 0,
      max: 1440 // 24 heures max
    },
    
    // Grouper les notifications similaires
    groupSimilar: {
      type: Boolean,
      default: true
    },
    
    // Période de groupement (en minutes)
    groupPeriod: {
      type: Number,
      default: 60,
      min: 5,
      max: 1440
    }
  }],

  // Paramètres de canaux de notification
  channels: {
    // Email
    email: {
      enabled: {
        type: Boolean,
        default: true
      },
      address: {
        type: String,
        lowercase: true,
        trim: true
      },
      verified: {
        type: Boolean,
        default: false
      },
      verificationToken: {
        type: String
      },
      verificationExpires: {
        type: Date
      }
    },
    
    // SMS (pour le futur)
    sms: {
      enabled: {
        type: Boolean,
        default: false
      },
      phoneNumber: {
        type: String
      },
      verified: {
        type: Boolean,
        default: false
      }
    },
    
    // Push notifications (pour le futur)
    push: {
      enabled: {
        type: Boolean,
        default: false
      },
      tokens: [{
        token: String,
        platform: {
          type: String,
          enum: ['web', 'ios', 'android']
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }]
    }
  },

  // Filtres avancés
  filters: {
    // Mots-clés à ignorer
    excludeKeywords: [{
      type: String,
      lowercase: true
    }],
    
    // Types d'entités à ignorer
    excludeEntityTypes: [{
      type: String
    }],
    
    // Utilisateurs à ignorer (pour éviter le spam)
    excludeUsers: [{
      type: mongoose.Schema.Types.ObjectId
    }],
    
    // Heures spécifiques pour certains types d'événements
    scheduleRules: [{
      eventType: String,
      allowedHours: [{
        start: String,
        end: String
      }],
      allowedDays: [{
        type: Number,
        min: 0,
        max: 6 // 0 = dimanche, 6 = samedi
      }]
    }]
  },

  // Statistiques d'utilisation
  stats: {
    // Dernière connexion
    lastSeen: {
      type: Date
    },
    
    // Nombre de notifications reçues
    totalNotifications: {
      type: Number,
      default: 0
    },
    
    // Nombre d'emails envoyés
    totalEmails: {
      type: Number,
      default: 0
    },
    
    // Taux d'ouverture des emails
    emailOpenRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    
    // Taux de clic des emails
    emailClickRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      delete ret.channels.email.verificationToken;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Index composés
notificationSettingsSchema.index({ user: 1, userType: 1 }, { unique: true });
notificationSettingsSchema.index({ 'channels.email.address': 1 });
notificationSettingsSchema.index({ 'eventSettings.eventType': 1 });

// Virtual pour vérifier si les notifications sont complètement désactivées
notificationSettingsSchema.virtual('isCompletelyDisabled').get(function() {
  return !this.globalSettings.enabled && !this.globalSettings.emailEnabled;
});

// Virtual pour obtenir l'adresse email effective
notificationSettingsSchema.virtual('effectiveEmail').get(function() {
  return this.channels.email.address || null;
});

// Méthode pour obtenir les paramètres d'un événement spécifique
notificationSettingsSchema.methods.getEventSettings = function(eventType) {
  const eventSetting = this.eventSettings.find(setting => setting.eventType === eventType);
  
  if (eventSetting) {
    return eventSetting;
  }
  
  // Retourner les paramètres par défaut si non trouvé
  return {
    eventType: eventType,
    inAppEnabled: true,
    emailEnabled: true,
    minPriority: 'low',
    delay: 0,
    groupSimilar: true,
    groupPeriod: 60
  };
};

// Méthode pour vérifier si une notification doit être envoyée
notificationSettingsSchema.methods.shouldSendNotification = function(eventType, priority = 'medium', channel = 'inApp') {
  // Vérifier les paramètres globaux
  if (!this.globalSettings.enabled && channel === 'inApp') {
    return false;
  }
  
  if (!this.globalSettings.emailEnabled && channel === 'email') {
    return false;
  }
  
  // Vérifier les paramètres de l'événement
  const eventSettings = this.getEventSettings(eventType);
  
  if (channel === 'inApp' && !eventSettings.inAppEnabled) {
    return false;
  }
  
  if (channel === 'email' && !eventSettings.emailEnabled) {
    return false;
  }
  
  // Vérifier la priorité minimale
  const priorityLevels = { low: 1, medium: 2, high: 3, urgent: 4 };
  const eventMinPriority = priorityLevels[eventSettings.minPriority] || 1;
  const notificationPriority = priorityLevels[priority] || 2;
  
  if (notificationPriority < eventMinPriority) {
    return false;
  }
  
  // Vérifier les heures de silence pour les emails
  if (channel === 'email' && this.globalSettings.quietHours.enabled) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const [startHour, startMinute] = this.globalSettings.quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = this.globalSettings.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    // Gérer le cas où les heures de silence traversent minuit
    if (startTime > endTime) {
      if (currentTime >= startTime || currentTime <= endTime) {
        return false;
      }
    } else {
      if (currentTime >= startTime && currentTime <= endTime) {
        return false;
      }
    }
  }
  
  return true;
};

// Méthode pour mettre à jour les paramètres d'un événement
notificationSettingsSchema.methods.updateEventSettings = function(eventType, newSettings) {
  const existingIndex = this.eventSettings.findIndex(setting => setting.eventType === eventType);
  
  if (existingIndex !== -1) {
    // Mettre à jour les paramètres existants
    Object.assign(this.eventSettings[existingIndex], newSettings);
  } else {
    // Ajouter de nouveaux paramètres
    this.eventSettings.push({
      eventType: eventType,
      ...newSettings
    });
  }
  
  return this.save();
};

// Méthode pour incrémenter les statistiques
notificationSettingsSchema.methods.incrementStats = function(type, value = 1) {
  switch (type) {
    case 'notification':
      this.stats.totalNotifications += value;
      break;
    case 'email':
      this.stats.totalEmails += value;
      break;
  }
  
  this.stats.lastSeen = new Date();
  return this.save();
};

// Méthode statique pour créer les paramètres par défaut
notificationSettingsSchema.statics.createDefault = function(userId, userType, email = null) {
  const defaultSettings = new this({
    user: userId,
    userType: userType,
    globalSettings: {
      enabled: true,
      emailEnabled: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
        timezone: 'Europe/Paris'
      },
      digestFrequency: 'immediate',
      language: 'fr'
    },
    channels: {
      email: {
        enabled: !!email,
        address: email,
        verified: false
      },
      sms: {
        enabled: false
      },
      push: {
        enabled: false,
        tokens: []
      }
    },
    eventSettings: [],
    filters: {
      excludeKeywords: [],
      excludeEntityTypes: [],
      excludeUsers: [],
      scheduleRules: []
    },
    stats: {
      totalNotifications: 0,
      totalEmails: 0,
      emailOpenRate: 0,
      emailClickRate: 0
    }
  });
  
  return defaultSettings.save();
};

// Méthode statique pour obtenir ou créer les paramètres
notificationSettingsSchema.statics.getOrCreate = function(userId, userType, email = null) {
  return this.findOne({ user: userId, userType: userType })
    .then(settings => {
      if (settings) {
        return settings;
      }
      return this.createDefault(userId, userType, email);
    });
};

const NotificationSettings = mongoose.model('NotificationSettings', notificationSettingsSchema);

export default NotificationSettings;

