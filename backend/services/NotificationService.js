import dotenv from 'dotenv';
import fs from 'fs';
import Handlebars from 'handlebars';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { MODEL_CONFIG, NOTIFICATION_CONFIG } from '../config/notification.config.js';
import { NotificationQueue } from '../config/queue.config.js';
import { eventManager } from '../events/index.js';
import EmailLog from '../models/EmailLog.js';
import Notification from '../models/Notification.js';
import { EmailService } from './EmailServiceStandard.js';
import { TemplateService } from './TemplateService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

export class NotificationService {
  constructor() {
    this.emailService = new EmailService();
    this.templateService = new TemplateService();
    this.notificationQueue = NotificationQueue;

    if (!NotificationService.processorsInitialized) {
      this.setupQueueProcessors();
      NotificationService.processorsInitialized = true;
    }
  }

  setupQueueProcessors() {
    this.notificationQueue.process('sendEmail', async (job) => {
      const { to, subject, html, text, logId } = job.data;
      try {
        await this.emailService.sendEmail(to, subject, html, text);
        if (logId) {
          await EmailLog.findByIdAndUpdate(logId, { status: 'sent', sentAt: new Date() });
        }
        console.log(`✉️ Email envoyé à ${to} pour le job ${job.id}`);
      } catch (error) {
        console.error(`❌ Erreur lors de l'envoi de l'email pour le job ${job.id}:`, error);
        if (logId) {
          await EmailLog.findByIdAndUpdate(logId, { status: 'failed', error: error.message });
        }
        throw error;
      }
    });

    this.notificationQueue.on('failed', (job, err) => {
      console.error(`❌ Job ${job.id} a échoué: ${err.message}`);
    });
  }

  static processorsInitialized = false;

  /**
   * Déclenche une notification pour un événement donné.
   * @param {string} eventType - Le type d'événement (ex: 'university_event_published').
   * @param {object} eventData - Les données initiales de l'événement (doit contenir eventId pour les événements d'université).
   * @param {object} options - Options supplémentaires, incluant 'explicitRecipients' pour les listes pré-calculées.
   * @param {string} [options.triggeredBy] - L'ID de l'utilisateur qui a déclenché l'événement.
   * @param {boolean} [options.test] - Indique si c'est un test.
   * @param {Array<Object>} [options.explicitRecipients] - Liste de destinataires pré-calculée ({ id, email, name, type }).
   */
  async triggerNotification(eventType, eventData, options = {}) {
    const { triggeredBy, test, explicitRecipients } = options;

    const config = NOTIFICATION_CONFIG.EVENT_RECIPIENTS[eventType];
    if (!config) {
      console.warn(`⚠️ Aucune configuration trouvée pour l'événement: ${eventType}`);
      return { success: false, message: 'No configuration for event type' };
    }

    const notificationsCreated = [];
    const emailsScheduled = [];

    const defaultMessage = NOTIFICATION_CONFIG.DEFAULT_MESSAGES[eventType];
    const emailTemplateConfig = NOTIFICATION_CONFIG.EMAIL_TEMPLATES[eventType];

    // Peupler les données de l'événement une seule fois
    // Cela récupérera les détails complets de l'événement (titre, description, date, catégorie, etc.)
    const populatedEventData = await this.populateEventData(eventData);
    console.log('📊 Données d\'événement peuplées:', JSON.stringify(populatedEventData, null, 2));

    // Déterminer la liste des destinataires à traiter
    let recipientsToProcess = [];
    if (explicitRecipients && explicitRecipients.length > 0) {
        // Si des destinataires explicites sont fournis (comme pour university_event_published), utilisez-les
        recipientsToProcess = explicitRecipients;
    } else {
        // Sinon, utilisez la logique existante basée sur config.recipients
        // Cette partie du code gère les cas où les destinataires sont déterminés
        // par le type d'utilisateur et les données de l'événement (ex: un seul étudiant, un seul professeur)
        for (const userTypeKey of config.recipients) {
            let recipientId;
            let recipientData;

            switch (userTypeKey) {
                case 'STUDENT':
                    if (populatedEventData.student) {
                        recipientId = populatedEventData.student._id || populatedEventData.student;
                        recipientData = populatedEventData.student;
                    } else if (populatedEventData._id && populatedEventData.recipientType === 'STUDENT') {
                        recipientId = populatedEventData._id;
                        recipientData = {
                            _id: populatedEventData._id,
                            firstName: populatedEventData.firstName,
                            lastName: populatedEventData.lastName,
                            email: populatedEventData.email,
                            university: populatedEventData.universityId
                        };
                    } else if (populatedEventData.proposedBy) {
                        recipientId = populatedEventData.proposedBy._id || populatedEventData.proposedBy;
                        recipientData = populatedEventData.proposedBy;
                    } else {
                        console.warn(`⚠️ Aucun étudiant défini pour l'événement ${eventType}`);
                        continue;
                    }
                    break;

                case 'PROFESSOR':
                    recipientId = populatedEventData.professor?._id || populatedEventData.professor;
                    recipientData = populatedEventData.professor;
                    break;

                case 'COMPANY':
                    // Handle partnership requests with initiator_id/target_id structure
                    if (eventType === 'partnership_requested' && populatedEventData.initiator_type === 'Company') {
                        recipientId = populatedEventData.initiator_id?._id || populatedEventData.initiator_id;
                        recipientData = populatedEventData.initiator_id;
                    } else if (eventType === 'partnership_requested' && populatedEventData.target_type === 'Company') {
                        recipientId = populatedEventData.target_id?._id || populatedEventData.target_id;
                        recipientData = populatedEventData.target_id;
                    } 
                    // Standard company notifications (existing functionality)
                    else if (populatedEventData.company) {
                        recipientId = populatedEventData.company?._id || populatedEventData.company;
                        recipientData = populatedEventData.company;
                    }
                    // Fallback for other company notification patterns
                    else {
                        recipientId = populatedEventData.companyId || populatedEventData._id;
                        recipientData = populatedEventData;
                    }
                    break;

                case 'UNIVERSITY':
                    // Handle partnership requests with initiator_id/target_id structure
                    if (eventType === 'partnership_requested' && populatedEventData.target_type === 'University') {
                        recipientId = populatedEventData.target_id?._id || populatedEventData.target_id;
                        recipientData = populatedEventData.target_id;
                    } else if (eventType === 'partnership_requested' && populatedEventData.initiator_type === 'University') {
                        recipientId = populatedEventData.initiator_id?._id || populatedEventData.initiator_id;
                        recipientData = populatedEventData.initiator_id;
                    }
                    // Standard university notifications (existing functionality)
                    else if (populatedEventData.university) {
                        recipientId = populatedEventData.university?._id || populatedEventData.university;
                        recipientData = populatedEventData.university;
                    }
                    // Fallback for other university notification patterns
                    else {
                        recipientId = populatedEventData.universityId || populatedEventData._id;
                        recipientData = populatedEventData;
                    }
                    break;

                case 'ADMIN':
                    recipientData = {
                        _id: '000000000000000000000000',
                        email: process.env.ADMIN_EMAIL || 'admin@example.com',
                        name: 'Admin System',
                        [MODEL_CONFIG.EMAIL_FIELDS.admin]: process.env.ADMIN_EMAIL || 'admin@example.com',
                        [MODEL_CONFIG.NAME_FIELDS.admin[0]]: 'Admin System'
                    };
                    recipientId = recipientData._id;
                    break;

                default:
                    recipientId = eventData[`${userTypeKey.toLowerCase()}Id`];
                    recipientData = eventData[userTypeKey.toLowerCase()];
                    break;
            }

            if (recipientId && recipientData) {
                const recipientEmail = this.getNestedProperty(recipientData, MODEL_CONFIG.EMAIL_FIELDS[userTypeKey.toLowerCase()]);
                const recipientName = MODEL_CONFIG.NAME_FIELDS[userTypeKey.toLowerCase()]
                    .map(field => this.getNestedProperty(recipientData, field))
                    .filter(Boolean)
                    .join(' ');
                
                recipientsToProcess.push({
                    id: recipientId.toString(),
                    email: recipientEmail,
                    name: recipientName,
                    type: userTypeKey
                });
            }
        }
    }

    // Itérer sur la liste finale des destinataires à traiter
    for (const recipient of recipientsToProcess) {
        const recipientId = recipient.id;
        const recipientEmail = recipient.email;
        const recipientName = recipient.name;
        const userTypeKey = recipient.type; // 'STUDENT', 'COMPANY', 'PROFESSOR', etc.

        if (!recipientId || !recipientEmail) {
            console.warn(`⚠️ Destinataire incomplet: ID ou email manquant pour ${userTypeKey}`);
            continue;
        }

        console.log(`📨 Destinataire ${userTypeKey}:`, {
            id: recipientId,
            name: recipientName,
            email: recipientEmail,
            channels: config.channels
        });

        if (config.channels === 'IN_APP' || config.channels === 'BOTH') {
            try {
                const notification = await this.createInAppNotification({
                    user: recipientId.toString(),
                    userType: userTypeKey.toLowerCase(),
                    eventType: eventType,
                    message: defaultMessage,
                    priority: config.priority,
                    metadata: {
                        entityType: populatedEventData.entityType || 'partnership',
                        entityId: populatedEventData._id || null,
                        originalData: populatedEventData,
                        actionUrl: this.generateActionUrl(eventType, populatedEventData, userTypeKey.toLowerCase()),
                        actionText: 'Voir les détails'
                    },
                    sender: triggeredBy ? { userId: triggeredBy, userType: 'user', name: 'System' } : undefined,
                });
                notificationsCreated.push(notification);
                console.log(`📲 Notification in-app créée pour ${userTypeKey} ${recipientId}`);
            } catch (error) {
                console.error('❌ Erreur lors de la création de la notification in-app:', error);
            }
        }

        if ((config.channels === 'EMAIL' || config.channels === 'BOTH') && recipientEmail) {
            try {
                // Préparer les données pour le template d'email
                const emailDataForTemplate = {
                    ...populatedEventData, // Inclut toutes les données peuplées de l'événement
                    recipient: {
                        id: recipientId,
                        name: recipientName,
                        email: recipientEmail,
                        type: userTypeKey.toLowerCase()
                    },
                    // Assurez-vous que ces champs sont bien présents dans populatedEventData
                    // Ils sont ajoutés ici pour être explicites pour le template
                    eventTitle: populatedEventData.title,
                    eventDescription: populatedEventData.description,
                    eventLocation: populatedEventData.location,
                    eventCategory: populatedEventData.category, // Ajout de la catégorie
                    formattedEventDate: populatedEventData.formattedDate, // Ajout de la date formatée
                    title: populatedEventData.title || populatedEventData.request_message,
                    actionUrl: this.generateActionUrl(eventType, populatedEventData, userTypeKey.toLowerCase()),
                    priority: config.priority,
                    priorityLabel: config.priority.toUpperCase()
                };

                const emailLog = await this.sendEmailNotification({
                    to: recipientEmail,
                    subject: emailTemplateConfig?.subject || defaultMessage,
                    template: emailTemplateConfig?.template,
                    data: emailDataForTemplate, // Utilisation des données préparées
                    eventType: eventType,
                    triggeredBy: triggeredBy,
                });
                emailsScheduled.push(emailLog);
                console.log(`📧 Email programmé pour ${userTypeKey} ${recipientEmail}`);
            } catch (error) {
                console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
            }
        } else if ((config.channels === 'EMAIL' || config.channels === 'BOTH') && !recipientEmail) {
            console.warn(`⚠️ Email manquant pour l'utilisateur ${recipientId} de type ${userTypeKey}`);
        }
    }

    console.log(`✅ Notifications traitées pour l'événement: ${eventType}`);
    eventManager.emit('notifications:processed', { eventType, notificationsCreated, emailsScheduled });

    return { success: true, notificationsCreated, emailsScheduled };
  }

  async createInAppNotification(notificationData) {
    const notification = new Notification(notificationData);
    await notification.save();
    eventManager.emit('notification:created', notification.toObject());
    return notification;
  }

 async sendEmailNotification(emailData) {
  let { to, subject, template, data, eventType, triggeredBy } = emailData;

  if (!to || !subject) {
    throw new Error('Destinataire et sujet sont obligatoires');
  }

  // --- NOUVEAU : Traiter le sujet avec Handlebars ---
  try {
    const templateSubject = Handlebars.compile(subject);
    subject = templateSubject(data); // 'data' contient eventTitle, etc.
  } catch (error) {
    console.error(`❌ Erreur lors du traitement du sujet avec Handlebars:`, error);
    // Fallback au sujet original ou un sujet par défaut si le traitement échoue
    subject = `Notification: ${data.eventTitle || 'Nouvel événement'}`;
  }
  // --- FIN NOUVEAU ---

  const validPriority = this.mapPriorityToValidValue(data?.priority);

  const emailLog = new EmailLog({
    to: to,
    subject: subject, // Le sujet est maintenant traité
    template: template || 'default',
    status: 'pending',
    eventType: eventType,
    triggeredBy: triggeredBy,
    metadata: {
      ...data,
      priority: validPriority
    },
    recipient: to,
    provider: process.env.EMAIL_PROVIDER || 'smtp'
  });

  try {
    await emailLog.save();

    const templatePath = path.join(
      process.cwd(),
      'templates',
      'emails',
      `${template || 'default'}.hbs`
    );

    if (!fs.existsSync(templatePath)) {
      console.warn(`Template ${template} non trouvé, utilisation du template par défaut`);
      template = 'default';
    }

    // Le corps de l'e-mail est déjà traité par TemplateService
    const { html, text } = await this.templateService.renderEmailTemplate(
      template,
      {
        ...data,
        currentYear: new Date().getFullYear(),
        appName: process.env.APP_NAME || 'Gestion PFE'
      }
    );

    const job = await this.notificationQueue.add('sendEmail', {
      to,
      subject, // Le sujet traité est passé ici
      html,
      text,
      logId: emailLog._id
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      },
      removeOnComplete: true,
      removeOnFail: true
    });

    console.log(`✉️ Email pour ${to} ajouté à la queue. Job ID: ${job.id}, Log ID: ${emailLog._id}`);

    return {
      emailLog,
      jobId: job.id
    };

  } catch (error) {
    console.error(`❌ Erreur lors de la préparation de l'email pour ${to}:`, error);

    if (emailLog._id) {
      await EmailLog.findByIdAndUpdate(emailLog._id, {
        status: 'failed',
        error: error.message,
        errorDetails: {
          stack: error.stack,
          code: error.code
        }
      });
    }

    throw error;
  }
}

  mapPriorityToValidValue(priority) {
    const priorityMap = {
      'LOW': 'low', 'medium': 'medium', 'high': 'high', 'URGENT': 'urgent',
      'low': 'low', 'medium': 'medium', 'high': 'high', 'urgent': 'urgent'
    };
    return priorityMap[priority] || 'medium';
  }

  getNestedProperty(obj, path) {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  /**
   * Peuple les données de l'événement en fonction de son type.
   * @param {object} eventData - Les données initiales de l'événement, potentiellement avec un eventId.
   * @returns {Promise<object>} Les données de l'événement peuplées.
   */
  async populateEventData(eventData) {
    const populated = { ...eventData };

    // Handle partnership requests (new functionality)
    if (eventData.initiator_type && eventData.target_type) {
      populated.entityType = 'partnership';
      populated.entityId = eventData._id;
      
      // Populate initiator data
      if (eventData.initiator_id && mongoose.Types.ObjectId.isValid(eventData.initiator_id)) {
        if (eventData.initiator_type === 'Company') {
          populated.initiator_id = await mongoose.model('Company')
            .findById(eventData.initiator_id)
            .select('nom email_contact');
        } else if (eventData.initiator_type === 'University') {
          populated.initiator_id = await mongoose.model('University')
            .findById(eventData.initiator_id)
            .select('name contactPerson.email');
        }
      }
      
      // Populate target data
      if (eventData.target_id && mongoose.Types.ObjectId.isValid(eventData.target_id)) {
        if (eventData.target_type === 'Company') {
          populated.target_id = await mongoose.model('Company')
            .findById(eventData.target_id)
            .select('nom email_contact');
        } else if (eventData.target_type === 'University') {
          populated.target_id = await mongoose.model('University')
            .findById(eventData.target_id)
            .select('name contactPerson.email');
        }
      }
      
      // Don't continue with other population logic for partnerships
      return populated;
    }

    // Cas spécial pour les événements d'université
    if (eventData.eventId && mongoose.Types.ObjectId.isValid(eventData.eventId)) {
        const event = await mongoose.model('Event')
            .findById(eventData.eventId)
            .populate('universityDetails'); // Assurez-vous que universityDetails est peuplé

        if (event) {
            populated.title = event.title;
            populated.description = event.description;
            populated.date = event.date;
            populated.location = event.location;
            populated.category = event.category; // Récupération de la catégorie
            populated.formattedDate = event.formattedDate; // Utilise le virtual 'formattedDate' du modèle Event
            populated.entityType = 'event';
            populated.entityId = event._id;
            populated.universityId = event.universityDetails?._id;
            populated.universityName = event.universityDetails?.name;
            populated.universityEmail = event.universityDetails?.contactPerson?.email;

            console.log('🔍 Événement peuplé:', {
                id: event._id,
                title: event.title,
                date: event.date,
                category: event.category,
                university: event.universityDetails?.name
            });
        } else {
            console.warn(`⚠️ Événement ${eventData.eventId} non trouvé dans la base de données`);
        }
    }

    // Cas spécial pour l'approbation de sujet (logique existante)
    if (eventData._id && mongoose.Types.ObjectId.isValid(eventData._id) && !populated.entityType) { // Ajout de !populated.entityType pour éviter le conflit avec eventId
      const subject = await mongoose.model('Subject')
        .findById(eventData._id)
        .populate({
          path: 'proposedBy',
          model: 'User',
          select: 'firstName lastName email role',
        })
        .populate({
          path: 'university',
          select: 'name contactPerson.email'
        })
        .select('title university proposedBy status');

      if (subject) {
        populated.title = subject.title;
        populated.proposedBy = subject.proposedBy;
        populated.university = subject.university;
        populated.status = subject.status;
        populated.entityType = 'subject';
        populated.entityId = subject._id;

        console.log('🔍 Sujet peuplé:', {
          id: subject._id,
          title: subject.title,
          proposedBy: subject.proposedBy ? {
            id: subject.proposedBy._id,
            name: `${subject.proposedBy.firstName} ${subject.proposedBy.lastName}`,
            email: subject.proposedBy.email,
            role: subject.proposedBy.role
          } : null,
          university: subject.university
        });
      } else {
        console.warn(`⚠️ Sujet ${eventData._id} non trouvé dans la base de données`);
      }
    }

    // Peuplement des autres entités si nécessaires (logique existante)
    if (eventData.student && mongoose.Types.ObjectId.isValid(eventData.student)) {
      populated.student = await mongoose.model('User').findById(eventData.student).select('firstName lastName email');
    } else if (eventData.student && eventData.student._id) {
      populated.student = await mongoose.model('User').findById(eventData.student._id).select('firstName lastName email');
    }

    if (eventData.professor && mongoose.Types.ObjectId.isValid(eventData.professor)) {
      populated.professor = await mongoose.model('Professor').findById(eventData.professor).select('firstName lastName email');
    } else if (eventData.professor && eventData.professor._id) {
      populated.professor = await mongoose.model('Professor').findById(eventData.professor._id).select('firstName lastName email');
    }

    if (eventData.university && mongoose.Types.ObjectId.isValid(eventData.university)) {
      populated.university = await mongoose.model('University').findById(eventData.university).select('name contactPerson.email');
    } else if (eventData.university && eventData.university._id) {
      populated.university = await mongoose.model('University').findById(eventData.university._id).select('name contactPerson.email');
    }

    // Additional entity type detection
    if (eventData.defenseId) {
      populated.entityType = 'defense';
      populated.entityId = eventData.defenseId;
    } else if (eventData.assignmentId) {
      populated.entityType = 'assignment';
      populated.entityId = eventData.assignmentId;
    }

    return populated;
  }

generateActionUrl(eventType, eventData, recipientType) {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const adminUrl = process.env.ADMIN_URL || 'http://localhost:5174';
  const professorUrl = process.env.PROFESSOR_URL || 'http://localhost:5173';
  const companyUrl = process.env.COMPANY_URL || 'http://localhost:5174'; // Add this line

  let url = `${baseUrl}/dashboard`;

  switch (eventType) {
    case 'partnership_requested':
      if (recipientType === 'company') {
        url = `${adminUrl}/partnerships/${eventData.entityId}`;
      } else if (recipientType === 'university') {
        url = `${adminUrl}/partnerships/${eventData.entityId}`;
      } else if (recipientType === 'admin') {
        url = `${adminUrl}/admin/partnerships/${eventData.entityId}`;
      }
      break;
    case 'defense_accepted':
    case 'defense_requested':
      if (recipientType === 'student') {
        url = `${baseUrl}/student/defenses/${eventData.entityId}`;
      } else if (recipientType === 'professor') {
        url = `${professorUrl}/professor/defenses/${eventData.entityId}`;
      } else if (recipientType === 'admin') {
        url = `${adminUrl}/admin/defenses/${eventData.entityId}`;
      }
      break;
    case 'assignment_created':
      if (recipientType === 'student') {
        url = `${baseUrl}/student/assignments/${eventData.entityId}`;
      } else if (recipientType === 'professor') {
        url = `${professorUrl}/professor/assignments/${eventData.entityId}`;
      }
      break;
    case 'subject_approved':
      if (recipientType === 'student') {
        url = `${baseUrl}/student/subjects/${eventData.entityId}`;
      } else if (recipientType === 'professor') {
        url = `${professorUrl}/professor/subjects/${eventData.entityId}`;
      } else if (recipientType === 'admin') {
        url = `${adminUrl}/admin/subjects/${eventData.entityId}`;
      }
      break;
    case 'university_event_published':
      if (recipientType === 'student') {
        url = `${baseUrl}/student/events/${eventData.entityId}`;
      } else if (recipientType === 'company') {
        url = `${companyUrl}/company/events/${eventData.entityId}`; // Fixed: use companyUrl and correct path
        console.log('🔗 Generated company URL:', url);
        console.log('🔗 Company URL base:', companyUrl);
        console.log('🔗 Recipient type:', recipientType);
        console.log('🔗 Event data:', eventData);
      }
      break;
  }
  return url;
}
}