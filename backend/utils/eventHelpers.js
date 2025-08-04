import { eventManager } from '../events/index.js';

/**
 * Utilitaires pour faciliter l'utilisation du système d'événements
 */

/**
 * Décorateur pour les méthodes de contrôleur qui doivent émettre des événements
 * @param {string} eventType - Type d'événement à émettre
 * @param {Function} dataExtractor - Fonction pour extraire les données de l'événement
 */
export function emitEvent(eventType, dataExtractor = (result, req) => result) {
  return function(target, propertyName, descriptor) {
    const method = descriptor.value;

    descriptor.value = async function(...args) {
      try {
        const result = await method.apply(this, args);
        
        // Extraire les données de l'événement
        const req = args.find(arg => arg && arg.method && arg.path); // Trouver l'objet request
        const eventData = dataExtractor(result, req);
        
        // Émettre l'événement
        eventManager.emitSafe(eventType, eventData);
        
        return result;
      } catch (error) {
        console.error(`❌ Erreur dans la méthode ${propertyName}:`, error);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Classe pour gérer les événements de manière fluide
 */
export class EventBuilder {
  constructor() {
    this.eventType = null;
    this.eventData = {};
    this.context = {};
    this.delay = 0;
    this.condition = () => true;
  }

  /**
   * Définit le type d'événement
   * @param {string} type - Type d'événement
   */
  type(type) {
    this.eventType = type;
    return this;
  }

  /**
   * Définit les données de l'événement
   * @param {Object} data - Données de l'événement
   */
  data(data) {
    this.eventData = { ...this.eventData, ...data };
    return this;
  }

  /**
   * Ajoute du contexte à l'événement
   * @param {Object} context - Contexte supplémentaire
   */
  withContext(context) {
    this.context = { ...this.context, ...context };
    return this;
  }

  /**
   * Définit un délai avant l'émission de l'événement
   * @param {number} ms - Délai en millisecondes
   */
  withDelay(ms) {
    this.delay = ms;
    return this;
  }

  /**
   * Définit une condition pour l'émission de l'événement
   * @param {Function} conditionFn - Fonction de condition
   */
  when(conditionFn) {
    this.condition = conditionFn;
    return this;
  }

  /**
   * Émet l'événement
   */
  emit() {
    if (!this.eventType) {
      throw new Error('Type d\'événement non défini');
    }

    if (!this.condition()) {
      console.log(`⏭️ Condition non remplie pour l'événement: ${this.eventType}`);
      return;
    }

    const finalData = {
      ...this.eventData,
      context: this.context,
      timestamp: new Date()
    };

    if (this.delay > 0) {
      setTimeout(() => {
        eventManager.emitSafe(this.eventType, finalData);
      }, this.delay);
    } else {
      eventManager.emitSafe(this.eventType, finalData);
    }
  }

  /**
   * Émet l'événement de manière asynchrone
   */
  async emitAsync() {
    return new Promise((resolve) => {
      if (this.delay > 0) {
        setTimeout(() => {
          this.emit();
          resolve();
        }, this.delay);
      } else {
        this.emit();
        resolve();
      }
    });
  }
}

/**
 * Factory pour créer un EventBuilder
 */
export const createEvent = () => new EventBuilder();

/**
 * Utilitaires pour les événements spécifiques aux modèles
 */
export class ModelEventHelper {
  constructor(modelName) {
    this.modelName = modelName.toLowerCase();
  }

  /**
   * Émet un événement de création
   * @param {Object} data - Données du modèle créé
   * @param {Object} context - Contexte supplémentaire
   */
  created(data, context = {}) {
    return createEvent()
      .type(`${this.modelName}:created`)
      .data(data)
      .withContext(context)
      .emit();
  }

  /**
   * Émet un événement de mise à jour
   * @param {Object} data - Données du modèle mis à jour
   * @param {Object} changes - Changements effectués
   * @param {Object} context - Contexte supplémentaire
   */
  updated(data, changes = {}, context = {}) {
    return createEvent()
      .type(`${this.modelName}:updated`)
      .data({ ...data, changes })
      .withContext(context)
      .emit();
  }

  /**
   * Émet un événement de suppression
   * @param {Object} data - Données du modèle supprimé
   * @param {Object} context - Contexte supplémentaire
   */
  deleted(data, context = {}) {
    return createEvent()
      .type(`${this.modelName}:deleted`)
      .data(data)
      .withContext(context)
      .emit();
  }

  /**
   * Émet un événement de changement de statut
   * @param {Object} data - Données du modèle
   * @param {string} oldStatus - Ancien statut
   * @param {string} newStatus - Nouveau statut
   * @param {Object} context - Contexte supplémentaire
   */
  statusChanged(data, oldStatus, newStatus, context = {}) {
    return createEvent()
      .type(`${this.modelName}:status_changed`)
      .data({ ...data, oldStatus, newStatus })
      .withContext(context)
      .emit();
  }
}

/**
 * Helpers spécifiques pour chaque modèle
 */
export const AssignmentEvents = new ModelEventHelper('assignment');
export const DefenseEvents = new ModelEventHelper('defense');
export const CompanyEvents = new ModelEventHelper('company');
export const UniversityEvents = new ModelEventHelper('university');
export const ReportEvents = new ModelEventHelper('report');
export const ProgressEvents = new ModelEventHelper('progress');
export const AvailabilityEvents = new ModelEventHelper('availability');
export const EncadreurEvents = new ModelEventHelper('encadreur');
export const UserEvents = new ModelEventHelper('user');
export const SubjectEvents = new ModelEventHelper('subject');
export const EventsEvents = new ModelEventHelper('events');

/**
 * Utilitaire pour créer des événements conditionnels
 */
export class ConditionalEventEmitter {
  constructor() {
    this.events = [];
  }

  /**
   * Ajoute un événement conditionnel
   * @param {string} eventType - Type d'événement
   * @param {Function} condition - Condition pour émettre l'événement
   * @param {Function} dataProvider - Fonction qui fournit les données
   */
  addConditionalEvent(eventType, condition, dataProvider) {
    this.events.push({ eventType, condition, dataProvider });
    return this;
  }

  /**
   * Évalue et émet tous les événements conditionnels
   * @param {Object} context - Contexte pour l'évaluation
   */
  evaluate(context) {
    this.events.forEach(({ eventType, condition, dataProvider }) => {
      try {
        if (condition(context)) {
          const data = dataProvider(context);
          eventManager.emitSafe(eventType, data);
        }
      } catch (error) {
        console.error(`❌ Erreur lors de l'évaluation de l'événement conditionnel ${eventType}:`, error);
      }
    });
  }

  /**
   * Vide la liste des événements conditionnels
   */
  clear() {
    this.events = [];
    return this;
  }
}

/**
 * Utilitaire pour grouper plusieurs événements
 */
export class EventBatch {
  constructor() {
    this.events = [];
  }

  /**
   * Ajoute un événement au batch
   * @param {string} eventType - Type d'événement
   * @param {Object} data - Données de l'événement
   */
  add(eventType, data) {
    this.events.push({ eventType, data, timestamp: new Date() });
    return this;
  }

  /**
   * Émet tous les événements du batch
   * @param {number} delay - Délai entre chaque événement (optionnel)
   */
  async emit(delay = 0) {
    for (let i = 0; i < this.events.length; i++) {
      const { eventType, data } = this.events[i];
      
      eventManager.emitSafe(eventType, data);
      
      if (delay > 0 && i < this.events.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Émet tous les événements en parallèle
   */
  emitParallel() {
    this.events.forEach(({ eventType, data }) => {
      eventManager.emitSafe(eventType, data);
    });
  }

  /**
   * Vide le batch
   */
  clear() {
    this.events = [];
    return this;
  }

  /**
   * Retourne le nombre d'événements dans le batch
   */
  size() {
    return this.events.length;
  }
}

/**
 * Utilitaire pour déboguer les événements
 */
export class EventDebugger {
  constructor() {
    this.logs = [];
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  /**
   * Active ou désactive le débogage
   * @param {boolean} enabled - État du débogage
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  /**
   * Enregistre un événement pour le débogage
   * @param {string} eventType - Type d'événement
   * @param {Object} data - Données de l'événement
   */
  logEvent(eventType, data) {
    if (!this.isEnabled) return;

    const logEntry = {
      timestamp: new Date(),
      eventType,
      data: JSON.stringify(data, null, 2),
      stackTrace: new Error().stack
    };

    this.logs.push(logEntry);
    
    // Garder seulement les 100 derniers logs
    if (this.logs.length > 100) {
      this.logs.shift();
    }

    console.log(`🐛 [EventDebugger] ${eventType}:`, data);
  }

  /**
   * Retourne tous les logs
   */
  getLogs() {
    return this.logs;
  }

  /**
   * Filtre les logs par type d'événement
   * @param {string} eventType - Type d'événement à filtrer
   */
  getLogsByType(eventType) {
    return this.logs.filter(log => log.eventType === eventType);
  }

  /**
   * Vide les logs
   */
  clearLogs() {
    this.logs = [];
  }
}

// Instance globale du debugger
export const eventDebugger = new EventDebugger();

// Ajouter le debugger aux événements si activé
if (eventDebugger.isEnabled) {
  eventManager.on('*', (eventType, data) => {
    eventDebugger.logEvent(eventType, data);
  });
}

/**
 * Fonction utilitaire pour créer des événements personnalisés facilement
 */
export const quickEvent = (type, data = {}, context = {}) => {
  return createEvent()
    .type(type)
    .data(data)
    .withContext(context)
    .emit();
};

/**
 * Fonction utilitaire pour créer des événements avec délai
 */
export const delayedEvent = (type, data = {}, delay = 1000) => {
  return createEvent()
    .type(type)
    .data(data)
    .withDelay(delay)
    .emit();
};

export default {
  createEvent,
  EventBuilder,
  ModelEventHelper,
  ConditionalEventEmitter,
  EventBatch,
  EventDebugger,
  eventDebugger,
  quickEvent,
  delayedEvent,
  AssignmentEvents,
  DefenseEvents,
  CompanyEvents,
  UniversityEvents,
  SubjectEvents,
  ReportEvents,
  ProgressEvents,
  AvailabilityEvents,
  EncadreurEvents,
  UserEvents,
  EventsEvents
};

