import { EventEmitter } from 'events';
import { NotificationService } from '../services/NotificationService.js';

// Gestionnaire d'événements global
export class EventManager extends EventEmitter {
  constructor() {
    super();
    this.notificationService = new NotificationService();
    this.setupEventListeners();
    
    // Augmenter la limite des listeners pour éviter les warnings
    this.setMaxListeners(50);
  }

  /**
   * Configure les listeners d'événements pour les notifications
   */
  setupEventListeners() {
    // Événements d'affectation
    this.on('assignment:created', this.handleAssignmentCreated.bind(this));
    this.on('assignment:confirmed', this.handleAssignmentConfirmed.bind(this));
    this.on('assignment:rejected', this.handleAssignmentRejected.bind(this));

    // Événements de soutenance
    this.on('defense:requested', this.handleDefenseRequested.bind(this));
    this.on('defense:scheduled', this.handleDefenseScheduled.bind(this));
    this.on('defense:accepted', this.handleDefenseAccepted.bind(this));
    this.on('defense:rejected', this.handleDefenseRejected.bind(this));
    this.on('defense:completed', this.handleDefenseCompleted.bind(this));

  this.on('partnership:requested', this.handlePartnershipRequested.bind(this));

    // Événements d'entreprise
    this.on('company:registered', this.handleCompanyRegistered.bind(this));
    this.on('company:approved', this.handleCompanyApproved.bind(this));
    this.on('company:rejected', this.handleCompanyRejected.bind(this));
     // Événements d'université
    this.on('university:registered', this.handleUniversityRegistered.bind(this));
    this.on('university:approved', this.handleUniversityApproved.bind(this));
    this.on('university:rejected', this.handleUniversityRejected.bind(this));

    this.on('subject:approved', this.handleSubjectApproved.bind(this));
    this.on('subject:rejected', this.handleSubjectRejected.bind(this));

    // Événements de rapport
    this.on('report:submitted', this.handleReportSubmitted.bind(this));
    this.on('report:validated', this.handleReportValidated.bind(this));
    this.on('report:rejected', this.handleReportRejected.bind(this));

    // Événements de progression
    this.on('progress:updated', this.handleProgressUpdated.bind(this));
    this.on('progress:feedback', this.handleProgressFeedback.bind(this));

    // Événements de disponibilité
    this.on('availability:updated', this.handleAvailabilityUpdated.bind(this));

    // Événements d'encadreur externe
    this.on('encadreur:created', this.handleEncadreurCreated.bind(this));
    this.on('encadreur:approved', this.handleEncadreurApproved.bind(this));

    // Événements système
    this.on('user:created', this.handleUserCreated.bind(this));
    this.on('password:reset', this.handlePasswordReset.bind(this));

    this.on('events:published', this.handleEventsPublished.bind(this));
    

    console.log('✅ Event listeners configurés');
  }

  // === HANDLERS D'ÉVÉNEMENTS ===

  async handleAssignmentCreated(data) {
    await this.notificationService.triggerNotification('assignment_created', data, {
      action: 'created',
      timestamp: new Date()
    });
  }

  async handleAssignmentConfirmed(data) {
    await this.notificationService.triggerNotification('assignment_confirmed', data, {
      action: 'confirmed',
      timestamp: new Date()
    });
  }

  async handleAssignmentRejected(data) {
    await this.notificationService.triggerNotification('assignment_rejected', data, {
      action: 'rejected',
      timestamp: new Date()
    });
  }

    async handlePartnershipRequested(data) {
    await this.notificationService.triggerNotification('partnership_requested', data, {
      action: 'requested',
      timestamp: new Date()
    });
  }
// === HANDLERS DE SOUTENANCE ===
  async handleDefenseRequested(data) {
    await this.notificationService.triggerNotification('defense_requested', data, {
      action: 'requested',
      timestamp: new Date()
    });
  }

  async handleDefenseScheduled(data) {
    await this.notificationService.triggerNotification('defense_scheduled', data, {
      action: 'scheduled',
      timestamp: new Date()
    });
  }

  async handleDefenseAccepted(data) {
    await this.notificationService.triggerNotification('defense_accepted', data, {
      action: 'accepted',
      timestamp: new Date()
    });
  }

  async handleDefenseRejected(data) {
    await this.notificationService.triggerNotification('defense_rejected', data, {
      action: 'rejected',
      timestamp: new Date()
    });
  }

  async handleDefenseCompleted(data) {
    await this.notificationService.triggerNotification('defense_completed', data, {
      action: 'completed',
      timestamp: new Date()
    });
  }

  async handleCompanyRegistered(data) {
    await this.notificationService.triggerNotification('company_registered', data, {
      action: 'registered',
      timestamp: new Date()
    });
  }

  async handleCompanyApproved(data) {
    await this.notificationService.triggerNotification('company_approved', data, {
      action: 'approved',
      timestamp: new Date()
    });
  }

  async handleCompanyRejected(data) {
    await this.notificationService.triggerNotification('company_rejected', data, {
      action: 'rejected',
      timestamp: new Date()
    });
  }

    async handleUniversityRegistered(data) {
    await this.notificationService.triggerNotification('university_registered', data, {
      action: 'registered',
      timestamp: new Date()
    });
  }

  async handleUniversityApproved(data) {
    await this.notificationService.triggerNotification('university_approved', data, {
      action: 'approved',
      timestamp: new Date()
    });
  }

  async handleUniversityRejected(data) {
    await this.notificationService.triggerNotification('university_rejected', data, {
      action: 'rejected',
      timestamp: new Date()
    });
  }
    async handleSubjectApproved(data) {
    await this.notificationService.triggerNotification('subject_approved', data, {
      action: 'approved',
      timestamp: new Date()
    });
  }

  async handleSubjectRejected(data) {
    await this.notificationService.triggerNotification('subject_rejected', data, {
      action: 'rejected',
      timestamp: new Date()
    });
  }

  async handleReportSubmitted(data) {
    await this.notificationService.triggerNotification('report_submitted', data, {
      action: 'submitted',
      timestamp: new Date()
    });
  }

  async handleReportValidated(data) {
    await this.notificationService.triggerNotification('report_validated', data, {
      action: 'validated',
      timestamp: new Date()
    });
  }

  async handleReportRejected(data) {
    await this.notificationService.triggerNotification('report_rejected', data, {
      action: 'rejected',
      timestamp: new Date()
    });
  }

  async handleProgressUpdated(data) {
    await this.notificationService.triggerNotification('progress_update_submitted', data, {
      action: 'updated',
      timestamp: new Date()
    });
  }

  async handleProgressFeedback(data) {
    await this.notificationService.triggerNotification('progress_feedback_given', data, {
      action: 'feedback',
      timestamp: new Date()
    });
  }

  async handleAvailabilityUpdated(data) {
    await this.notificationService.triggerNotification('availability_updated', data, {
      action: 'updated',
      timestamp: new Date()
    });
  }

  async handleEncadreurCreated(data) {
    await this.notificationService.triggerNotification('encadreur_externe_created', data, {
      action: 'created',
      timestamp: new Date()
    });
  }

  async handleEncadreurApproved(data) {
    await this.notificationService.triggerNotification('encadreur_externe_approved', data, {
      action: 'approved',
      timestamp: new Date()
    });
  }

  async handleUserCreated(data) {
    await this.notificationService.triggerNotification('user_created', data, {
      action: 'created',
      timestamp: new Date()
    });
  }

  async handlePasswordReset(data) {
    await this.notificationService.triggerNotification('password_reset', data, {
      action: 'reset',
      timestamp: new Date()
    });
  }

async handleEventsPublished(data) {
    try {
      console.log('🔔 Handling events published:', data);

      // Validate that we have recipients
      if (!data.allRecipients || data.allRecipients.length === 0) {
        console.log('⚠️ No recipients found for event:', data.eventTitle);
        return;
      }

      // FIXED: Process students and companies separately for better handling
      const studentRecipients = data.allRecipients.filter(r => r.type === 'STUDENT');
      const companyRecipients = data.allRecipients.filter(r => r.type === 'COMPANY');

      console.log(`👥 Processing ${studentRecipients.length} students and ${companyRecipients.length} companies`);

      // Process students
      for (const recipient of studentRecipients) {
        console.log('📧 Processing STUDENT recipient:', {
          id: recipient.id,
          email: recipient.email,
          name: recipient.name, // Log the name
          type: recipient.type
        });

        if (!recipient.email) {
          console.log(`⚠️ Skipping student ${recipient.id} - no email`);
          continue;
        }

        // FIXED: Create proper notification data for students
        const studentNotificationData = {
          eventId: data.eventId,
          eventTitle: data.eventTitle,
          eventDescription: data.eventDescription,
          eventDate: data.eventDate,
          eventLocation: data.eventLocation,
          universityId: data.universityId,
          universityName: data.universityName,
          universityEmail: data.universityEmail,
          action: 'published',
          timestamp: new Date(),
          entityType: 'event',
          entityId: data.eventId,
          // Pass only the student ID for population by NotificationService
          student: recipient.id, // Changed this line
          // Also add direct fields for easier access (these will be populated by NotificationService)
          _id: recipient.id,
          name: recipient.name, // Pass name for template rendering if needed
          email: recipient.email,
          recipientType: 'STUDENT'
        };

        try {
          await this.notificationService.triggerNotification(
            'university_event_published',
            studentNotificationData,
            {
              triggeredBy: data.universityId,
              test: false
            }
          );
          console.log(`✅ Notification sent to STUDENT: ${recipient.name} (${recipient.email})`);
        } catch (notificationError) {
          console.error(`❌ Error sending notification to STUDENT ${recipient.id}:`, notificationError);
        }
      }

      // Process companies
      for (const recipient of companyRecipients) {
        console.log('📧 Processing COMPANY recipient:', {
          id: recipient.id,
          email: recipient.email,
          name: recipient.name,
          type: recipient.type
        });

        if (!recipient.email) {
          console.log(`⚠️ Skipping company ${recipient.id} - no email`);
          continue;
        }

        // FIXED: Create proper notification data for companies
        const companyNotificationData = {
          eventId: data.eventId,
          eventTitle: data.eventTitle,
          eventDescription: data.eventDescription,
          eventDate: data.eventDate,
          eventLocation: data.eventLocation,
          universityId: data.universityId,
          universityName: data.universityName,
          universityEmail: data.universityEmail,
          action: 'published',
          timestamp: new Date(),
          entityType: 'event',
          entityId: data.eventId,
          // FIXED: Company data structure
          _id: recipient.id,
          nom: recipient.name, // Use 'nom' as per your schema for company name
          email_contact: recipient.email, // Use 'email_contact' as per your schema for company email
          recipientType: 'COMPANY'
        };

        try {
          await this.notificationService.triggerNotification(
            'university_event_published',
            companyNotificationData,
            {
              triggeredBy: data.universityId,
              test: false
            }
          );
          console.log(`✅ Notification sent to COMPANY: ${recipient.name} (${recipient.email})`);
        } catch (notificationError) {
          console.error(`❌ Error sending notification to COMPANY ${recipient.id}:`, notificationError);
        }
      }

      console.log(`✅ Processed ${data.allRecipients.length} recipients for event: ${data.eventTitle}`);

    } catch (error) {
      console.error('Error in handleEventsPublished:', error);
    }
  }
  /**
   * Émet un événement de manière sécurisée
   * @param {string} eventName - Nom de l'événement
   * @param {Object} data - Données de l'événement
   */
  emitSafe(eventName, data) {
    try {
      console.log(`🔔 Émission de l'événement: ${eventName}`);
      this.emit(eventName, data);
    } catch (error) {
      console.error(`❌ Erreur lors de l'émission de l'événement ${eventName}:`, error);
    }
  }

  /**
   * Ajoute un listener personnalisé
   * @param {string} eventName - Nom de l'événement
   * @param {Function} handler - Fonction de traitement
   */
  addCustomListener(eventName, handler) {
    this.on(eventName, async (data) => {
      try {
        await handler(data);
      } catch (error) {
        console.error(`❌ Erreur dans le listener personnalisé pour ${eventName}:`, error);
      }
    });
  }

  /**
   * Supprime tous les listeners pour un événement
   * @param {string} eventName - Nom de l'événement
   */
  removeAllListeners(eventName) {
    super.removeAllListeners(eventName);
    console.log(`🗑️ Tous les listeners supprimés pour l'événement: ${eventName}`);
  }

  /**
   * Obtient les statistiques des événements
   */
  getEventStats() {
    const eventNames = this.eventNames();
    const stats = {};
    
    eventNames.forEach(eventName => {
      stats[eventName] = this.listenerCount(eventName);
    });
    
    return {
      totalEvents: eventNames.length,
      totalListeners: Object.values(stats).reduce((sum, count) => sum + count, 0),
      eventStats: stats
    };
  }
}

// Instance globale du gestionnaire d'événements
export const eventManager = new EventManager();

// Fonctions utilitaires pour émettre des événements
export const emitEvent = (eventName, data) => {
  eventManager.emitSafe(eventName, data);
};

// Fonctions spécifiques pour chaque type d'événement
export const emitAssignmentEvent = (action, assignmentData) => {
  emitEvent(`assignment:${action}`, assignmentData);
};
export const emitSubjectEvent = (action, subjectData) => {
  emitEvent(`subject:${action}`, subjectData);
};
 
export const emitPartnershipEvent = (action, subjectData) => {
  emitEvent(`partnership:${action}`, subjectData);
};
export const emitDefenseEvent = (action, defenseData) => {
  emitEvent(`defense:${action}`, defenseData);
};

export const emitCompanyEvent = (action, companyData) => {
  emitEvent(`company:${action}`, companyData);
};
export const emitUniversityEvent = (action, universityData) => {
  emitEvent(`university:${action}`, universityData);
};

export const emitReportEvent = (action, reportData) => {
  emitEvent(`report:${action}`, reportData);
};

export const emitProgressEvent = (action, progressData) => {
  emitEvent(`progress:${action}`, progressData);
};

export const emitAvailabilityEvent = (action, availabilityData) => {
  emitEvent(`availability:${action}`, availabilityData);
};

export const emitEncadreurEvent = (action, encadreurData) => {
  emitEvent(`encadreur:${action}`, encadreurData);
};

export const emitUserEvent = (action, userData) => {
  emitEvent(`user:${action}`, userData);
};


export const emitEventsEvent = (action, eventData) => {
  emitEvent(`events:${action}`, eventData);
};
export default eventManager;