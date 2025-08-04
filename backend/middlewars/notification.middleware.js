import { eventManager } from '../events/index.js';

/**
 * Middleware principal pour déclencher automatiquement les notifications
 * Ce middleware intercepte les réponses des API et émet les événements appropriés
 */
export const notificationMiddleware = (options = {}) => {
  const {
    enableLogging = true,
    skipRoutes = [],
    customEventMapping = {}
  } = options;

  return (req, res, next) => {
    // Sauvegarder la méthode send originale
    const originalSend = res.send;
    const originalJson = res.json;

    // Fonction pour déterminer l'événement à émettre
    const determineEvent = (method, path, statusCode, responseData) => {
      // Ignorer certaines routes
      if (skipRoutes.some(route => path.includes(route))) {
        return null;
      }

      // Ignorer les erreurs
      if (statusCode >= 400) {
        return null;
      }

      // Mapping personnalisé
      if (customEventMapping[path]) {
        return customEventMapping[path](method, responseData);
      }

      // Mapping automatique basé sur les patterns d'URL
      return autoMapEvent(method, path, responseData);
    };

    // Fonction pour extraire les données pertinentes
    const extractEventData = (responseData, eventType) => {
      if (!responseData || typeof responseData !== 'object') {
        return {};
      }

      // Si c'est un objet avec une propriété data
      if (responseData.data) {
        return responseData.data;
      }

      // Si c'est directement l'objet
      return responseData;
    };

    // Override de res.send
    res.send = function(data) {
      try {
        const eventType = determineEvent(req.method, req.path, res.statusCode, data);
        
        if (eventType && enableLogging) {
          console.log(`🔔 Événement détecté: ${eventType} pour ${req.method} ${req.path}`);
        }

        if (eventType) {
          const eventData = extractEventData(data, eventType);
          
          // Ajouter des informations de contexte
          const contextData = {
            ...eventData,
            requestInfo: {
              method: req.method,
              path: req.path,
              userAgent: req.get('User-Agent'),
              ip: req.ip,
              userId: req.user?.id || req.user?._id,
              userType: req.user?.role || req.user?.userType
            }
          };

          // Émettre l'événement de manière asynchrone pour ne pas bloquer la réponse
          setImmediate(() => {
            eventManager.emitSafe(eventType, contextData);
          });
        }
      } catch (error) {
        console.error('❌ Erreur dans le middleware de notification:', error);
      }

      // Appeler la méthode send originale
      return originalSend.call(this, data);
    };

    // Override de res.json
    res.json = function(data) {
      try {
        const eventType = determineEvent(req.method, req.path, res.statusCode, data);
        
        if (eventType && enableLogging) {
          console.log(`🔔 Événement détecté: ${eventType} pour ${req.method} ${req.path}`);
        }

        if (eventType) {
          const eventData = extractEventData(data, eventType);
          
          const contextData = {
            ...eventData,
            requestInfo: {
              method: req.method,
              path: req.path,
              userAgent: req.get('User-Agent'),
              ip: req.ip,
              userId: req.user?.id || req.user?._id,
              userType: req.user?.role || req.user?.userType
            }
          };

          setImmediate(() => {
            eventManager.emitSafe(eventType, contextData);
          });
        }
      } catch (error) {
        console.error('❌ Erreur dans le middleware de notification:', error);
      }

      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Mapping automatique des événements basé sur les patterns d'URL et méthodes HTTP
 */
function autoMapEvent(method, path, responseData) {
  const pathLower = path.toLowerCase();
  
  // Événements d'affectation
  if (pathLower.includes('/assignment')) {
    if (method === 'POST') return 'assignment:created';
    if (method === 'PUT' || method === 'PATCH') {
      if (responseData?.status === 'confirmed') return 'assignment:confirmed';
      if (responseData?.status === 'rejected') return 'assignment:rejected';
    }
  }

  // Événements de soutenance
  if (pathLower.includes('/defense')) {
    if (method === 'POST') return 'defense:requested';
    if (method === 'PUT' || method === 'PATCH') {
      if (responseData?.status === 'scheduled') return 'defense:scheduled';
      if (responseData?.status === 'completed') return 'defense:completed';
      if (responseData?.acceptedBy) return 'defense:accepted';
      if (responseData?.rejectedBy) return 'defense:rejected';
    }
  }

  // Événements d'entreprise
  if (pathLower.includes('/company') || pathLower.includes('/entreprise')) {
    if (method === 'POST') return 'company:registered';
    if (method === 'PUT' || method === 'PATCH') {
      if (responseData?.status === 'approved') return 'company:approved';
      if (responseData?.status === 'rejected') return 'company:rejected';
    }
  }
    // Événements d'université
  if (pathLower.includes('/university') || pathLower.includes('/university')) {
    if (method === 'POST') return 'university:registered';
    if (method === 'PUT' || method === 'PATCH') {
      if (responseData?.status === 'approved') return 'university:approved';
      if (responseData?.status === 'rejected') return 'university:rejected';
    }
  }
 
  // Événements de rapport
  if (pathLower.includes('/report')) {
    if (method === 'POST') return 'report:submitted';
    if (method === 'PUT' || method === 'PATCH') {
      if (responseData?.status === 'validated') return 'report:validated';
      if (responseData?.status === 'rejected') return 'report:rejected';
    }
  }

  // Événements de progression
  if (pathLower.includes('/progress')) {
    if (method === 'POST') return 'progress:updated';
    if (method === 'PUT' || method === 'PATCH' && responseData?.feedback) {
      return 'progress:feedback';
    }
  }

  // Événements de disponibilité
  if (pathLower.includes('/availability')) {
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      return 'availability:updated';
    }
  }

  // Événements d'encadreur externe
  if (pathLower.includes('/encadreur')) {
    if (method === 'POST') return 'encadreur:created';
    if (method === 'PUT' || method === 'PATCH') {
      if (responseData?.status === 'approved') return 'encadreur:approved';
    }
  }

  // Événements utilisateur
  if (pathLower.includes('/user') || pathLower.includes('/register')) {
    if (method === 'POST') return 'user:created';
  }

  if (pathLower.includes('/password') && pathLower.includes('/reset')) {
    if (method === 'POST' || method === 'PUT') return 'password:reset';
  }

  return null;
}

/**
 * Middleware spécialisé pour les modèles Mongoose
 * Utilise les hooks Mongoose pour déclencher les événements
 */
export const mongooseNotificationPlugin = function(schema, options = {}) {
  const { modelName, eventMapping = {} } = options;

  // Hook post-save pour les créations et modifications
  schema.post('save', function(doc, next) {
    try {
      const isNew = this.isNew || this.$isNew;
      
      if (isNew) {
        // Document créé
        const eventType = eventMapping.created || `${modelName?.toLowerCase()}:created`;
        eventManager.emitSafe(eventType, doc.toObject());
      } else {
        // Document modifié
        const eventType = eventMapping.updated || `${modelName?.toLowerCase()}:updated`;
        eventManager.emitSafe(eventType, doc.toObject());
      }
    } catch (error) {
      console.error('❌ Erreur dans le plugin Mongoose de notification:', error);
    }
    
    next();
  });

  // Hook post-remove pour les suppressions
  schema.post('remove', function(doc, next) {
    try {
      const eventType = eventMapping.deleted || `${modelName?.toLowerCase()}:deleted`;
      eventManager.emitSafe(eventType, doc.toObject());
    } catch (error) {
      console.error('❌ Erreur dans le plugin Mongoose de notification:', error);
    }
    
    next();
  });

  // Hook post-findOneAndUpdate pour les mises à jour
  schema.post('findOneAndUpdate', function(doc, next) {
    try {
      if (doc) {
        const eventType = eventMapping.updated || `${modelName?.toLowerCase()}:updated`;
        eventManager.emitSafe(eventType, doc.toObject());
      }
    } catch (error) {
      console.error('❌ Erreur dans le plugin Mongoose de notification:', error);
    }
    
    next();
  });
};

/**
 * Middleware pour déclencher manuellement des événements
 */
export const manualEventTrigger = (eventType, extractData = (req) => req.body) => {
  return (req, res, next) => {
    // Ajouter une méthode pour déclencher l'événement
    req.triggerNotificationEvent = () => {
      try {
        const eventData = extractData(req);
        const contextData = {
          ...eventData,
          requestInfo: {
            method: req.method,
            path: req.path,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            userId: req.user?.id || req.user?._id,
            userType: req.user?.role || req.user?.userType
          }
        };
        
        eventManager.emitSafe(eventType, contextData);
      } catch (error) {
        console.error('❌ Erreur lors du déclenchement manuel de l\'événement:', error);
      }
    };
    
    next();
  };
};

/**
 * Middleware pour désactiver les notifications sur certaines routes
 */
export const disableNotifications = (req, res, next) => {
  req.skipNotifications = true;
  next();
};

/**
 * Utilitaire pour créer un middleware de notification personnalisé
 */
export const createCustomNotificationMiddleware = (config) => {
  const {
    eventType,
    condition = () => true,
    dataExtractor = (req, res) => res.locals.data || req.body,
    async = true
  } = config;

  return (req, res, next) => {
    const originalSend = res.send;
    const originalJson = res.json;

    const triggerEvent = (data) => {
      if (req.skipNotifications) return;
      
      if (condition(req, res, data)) {
        const eventData = dataExtractor(req, res, data);
        const contextData = {
          ...eventData,
          requestInfo: {
            method: req.method,
            path: req.path,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            userId: req.user?.id || req.user?._id,
            userType: req.user?.role || req.user?.userType
          }
        };

        if (async) {
          setImmediate(() => {
            eventManager.emitSafe(eventType, contextData);
          });
        } else {
          eventManager.emitSafe(eventType, contextData);
        }
      }
    };

    res.send = function(data) {
      triggerEvent(data);
      return originalSend.call(this, data);
    };

    res.json = function(data) {
      triggerEvent(data);
      return originalJson.call(this, data);
    };

    next();
  };
};

export default notificationMiddleware;

