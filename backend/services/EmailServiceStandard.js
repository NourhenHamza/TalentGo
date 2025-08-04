import sgMail from '@sendgrid/mail';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import { EMAIL_CONFIG } from '../config/email.config.js';
import { createQueues } from '../config/queue.config.js';
import EmailLog from '../models/EmailLog.js';

export class EmailService {
  constructor() {
    this.transporter = null;
    this.queues = null;
    this.provider = process.env.EMAIL_PROVIDER || 'smtp'; // 'smtp' ou 'sendgrid'
    this.initializeProvider();
    this.initializeQueues();
  }

  /**
   * Initialise le fournisseur d'email
   */
  initializeProvider() {
    try {
      if (this.provider === 'sendgrid') {
        if (!EMAIL_CONFIG.SENDGRID.apiKey) {
          throw new Error('SendGrid API key manquante');
        }
        sgMail.setApiKey(EMAIL_CONFIG.SENDGRID.apiKey);
        console.log('✅ SendGrid initialisé');
      } else {
        // Configuration SMTP par défaut
        this.transporter = nodemailer.createTransport({
          ...EMAIL_CONFIG.SMTP,
          pool: true,
          maxConnections: 5,
          maxMessages: 100,
          rateLimit: EMAIL_CONFIG.LIMITS.rateLimit
        });
        console.log('✅ SMTP transporter initialisé');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du fournisseur d\'email:', error);
      throw error;
    }
  }

  /**
   * Initialise les queues pour l'envoi d'emails
   */
  initializeQueues() {
    try {
      this.queues = createQueues();
      this.setupEmailProcessor();
      console.log('✅ Queues d\'email initialisées');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des queues:', error);
      // Continuer sans les queues si Redis n'est pas disponible
      this.queues = null;
    }
  }

  /**
   * Configure le processeur de queue pour les emails
   */
  setupEmailProcessor() {
    if (!this.queues || !this.queues.email) return;

    this.queues.email.process('send-email', async (job) => {
      const { emailData } = job.data;
      
      try {
        job.progress(10);
        
        const result = await this.sendEmailDirect(emailData);
        
        job.progress(90);
        
        // Enregistrer le log d'email
        await this.logEmail(emailData, 'sent', result);
        
        job.progress(100);
        
        return result;
        
      } catch (error) {
        // Enregistrer l'erreur
        await this.logEmail(emailData, 'failed', null, error.message);
        throw error;
      }
    });

    // Traitement des emails en batch
    this.queues.batch.process('send-batch-emails', async (job) => {
      const { emails } = job.data;
      const results = [];
      
      for (let i = 0; i < emails.length; i++) {
        try {
          const result = await this.sendEmailDirect(emails[i]);
          results.push({ success: true, result });
          await this.logEmail(emails[i], 'sent', result);
        } catch (error) {
          results.push({ success: false, error: error.message });
          await this.logEmail(emails[i], 'failed', null, error.message);
        }
        
        job.progress(Math.round(((i + 1) / emails.length) * 100));
        
        // Délai entre les emails pour respecter les limites
        if (i < emails.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      return results;
    });
  }

  /**
   * Envoie un email (avec queue si disponible)
   * @param {Object} emailData - Données de l'email
   */
async sendEmail(to, subject, html, text, template = null, metadata = {}) {
  try {
    const emailData = {
      to,
      subject,
      html,
      text,
      template,
      metadata,
      from: process.env.SMTP_USER
    };

    // Créer le log avant l'envoi
    const emailLog = await this.logEmail(emailData, 'pending');

    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
      text
    };

    const info = await this.transporter.sendMail(mailOptions);

    // Mettre à jour le log après succès
    await EmailLog.findByIdAndUpdate(emailLog._id, {
      status: 'sent',
      messageId: info.messageId,
      sentAt: new Date(),
      providerResponse: info.response
    });

    return info;

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    
    // Mettre à jour le log en cas d'échec
    if (emailLog?._id) {
      await EmailLog.findByIdAndUpdate(emailLog._id, {
        status: 'failed',
        error: error.message,
        providerResponse: error.response
      });
    }

    throw error;
  }
}

  /**
   * Envoie un email directement (sans queue)
   * @param {Object} emailData - Données de l'email
   */
  async sendEmailDirect(emailData) {
    try {
      if (this.provider === 'sendgrid') {
        return await this.sendWithSendGrid(emailData);
      } else {
        return await this.sendWithSMTP(emailData);
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi direct de l\'email:', error);
      throw error;
    }
  }

  /**
   * Envoie un email via SendGrid
   * @param {Object} emailData - Données de l'email
   */
  async sendWithSendGrid(emailData) {
    const msg = {
      to: emailData.to,
      from: emailData.from || EMAIL_CONFIG.SENDGRID.from,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
      replyTo: emailData.replyTo || EMAIL_CONFIG.DEFAULT.replyTo
    };

    if (emailData.attachments) {
      msg.attachments = emailData.attachments;
    }

    const result = await sgMail.send(msg);
    console.log(`✅ Email envoyé via SendGrid à ${emailData.to}`);
    
    return {
      messageId: result[0].headers['x-message-id'],
      provider: 'sendgrid',
      response: result[0]
    };
  }

  /**
   * Envoie un email via SMTP
   * @param {Object} emailData - Données de l'email
   */
  async sendWithSMTP(emailData) {
    const mailOptions = {
      from: emailData.from || EMAIL_CONFIG.DEFAULT.from,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
      replyTo: emailData.replyTo || EMAIL_CONFIG.DEFAULT.replyTo
    };

    if (emailData.attachments) {
      mailOptions.attachments = emailData.attachments;
    }

    const result = await this.transporter.sendMail(mailOptions);
    console.log(`✅ Email envoyé via SMTP à ${emailData.to}`);
    
    return {
      messageId: result.messageId,
      provider: 'smtp',
      response: result
    };
  }

  /**
   * Envoie plusieurs emails en batch
   * @param {Array} emails - Liste des emails à envoyer
   */
  async sendBatchEmails(emails) {
    try {
      if (!Array.isArray(emails) || emails.length === 0) {
        throw new Error('Liste d\'emails invalide');
      }

      // Valider tous les emails
      emails.forEach(email => this.validateEmailData(email));

      // Si les queues sont disponibles, utiliser la queue batch
      if (this.queues && this.queues.batch) {
        const job = await this.queues.batch.add('send-batch-emails', {
          emails: emails
        });
        
        console.log(`📧 Batch de ${emails.length} emails ajouté à la queue avec l'ID: ${job.id}`);
        return { jobId: job.id, queued: true, count: emails.length };
      } else {
        // Envoi direct par batch
        const results = [];
        
        for (const email of emails) {
          try {
            const result = await this.sendEmailDirect(email);
            results.push({ success: true, result });
            await this.logEmail(email, 'sent', result);
          } catch (error) {
            results.push({ success: false, error: error.message });
            await this.logEmail(email, 'failed', null, error.message);
          }
          
          // Délai entre les emails
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        return { results, count: emails.length };
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du batch d\'emails:', error);
      throw error;
    }
  }

  /**
   * Valide les données d'un email
   * @param {Object} emailData - Données de l'email
   */
  validateEmailData(emailData) {
    if (!emailData.to) {
      throw new Error('Destinataire manquant');
    }
    
    if (!emailData.subject) {
      throw new Error('Sujet manquant');
    }
    
    if (!emailData.html && !emailData.text) {
      throw new Error('Contenu de l\'email manquant');
    }
    
    // Valider le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.to)) {
      throw new Error(`Format d'email invalide: ${emailData.to}`);
    }
  }

/**
 * Enregistre un log d'email
 * @param {Object} emailData - Données de l'email
 * @param {string} status - Statut de l'envoi
 * @param {Object} result - Résultat de l'envoi
 * @param {string} error - Message d'erreur si applicable
 */
async logEmail(emailData, status, result = null, error = null) {
  try {
    // FIXED: Ensure priority is valid
    const validPriorities = ['low', 'medium', 'high'];
    const priority = emailData.metadata?.priority?.toLowerCase() || 'medium';
    const validPriority = validPriorities.includes(priority) ? priority : 'medium';

    const logData = {
      recipient: emailData.to,
      subject: emailData.subject,
      status: status,
      provider: 'smtp', // Always SMTP in your case
      messageId: result?.messageId,
      eventType: emailData.metadata?.eventType,
      recipientId: emailData.metadata?.recipient?.id,
      recipientType: emailData.metadata?.recipient?.type,
      template: emailData.template,
      error: error?.message || error,
      sentAt: status === 'sent' ? new Date() : null,
      metadata: {
        priority: validPriority, // FIXED: Use valid priority
        eventType: emailData.metadata?.eventType,
        recipientType: emailData.metadata?.recipient?.type,
        ...emailData.metadata
      }
    };

    // Add tracking information if available
    if (result?.providerResponse) {
      logData.providerResponse = result.providerResponse;
    }

    console.log('📝 Creating email log:', logData);
    
    const emailLog = new EmailLog(logData);
    await emailLog.save();
    
    console.log('✅ Email log created successfully');
    return emailLog;

  } catch (logError) {
    console.error('❌ Error creating email log:', logError);
    // Return minimal object on failure
    return {
      recipient: emailData.to,
      status: 'log_failed',
      error: logError.message
    };
  }
}

  /**
   * Récupère les statistiques d'envoi d'emails
   * @param {Object} filters - Filtres pour les statistiques
   */
  async getEmailStats(filters = {}) {
    try {
      const EmailLog = mongoose.model('EmailLog');
      
      const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 jours par défaut
        endDate = new Date(),
        eventType = null,
        recipientType = null
      } = filters;
      
      const matchStage = {
        createdAt: { $gte: startDate, $lte: endDate }
      };
      
      if (eventType) {
        matchStage.eventType = eventType;
      }
      
      if (recipientType) {
        matchStage.recipientType = recipientType;
      }
      
      const stats = await EmailLog.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }
          }
        }
      ]);
      
      const result = stats[0] || { total: 0, sent: 0, failed: 0, pending: 0 };
      result.successRate = result.total > 0 ? (result.sent / result.total) * 100 : 0;
      
      return result;
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques d\'email:', error);
      throw error;
    }
  }

  /**
   * Teste la configuration email
   */
  async testEmailConfiguration() {
    try {
      const testEmail = {
        to: process.env.TEST_EMAIL || 'test@example.com',
        subject: 'Test de configuration email',
        text: 'Ceci est un email de test pour vérifier la configuration.',
        html: '<p>Ceci est un email de test pour vérifier la configuration.</p>'
      };
      
      const result = await this.sendEmailDirect(testEmail);
      console.log('✅ Test de configuration email réussi:', result);
      
      return { success: true, result };
      
    } catch (error) {
      console.error('❌ Test de configuration email échoué:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Ferme les connexions et nettoie les ressources
   */
  async close() {
    try {
      if (this.transporter) {
        this.transporter.close();
      }
      
      if (this.queues) {
        await Promise.all(Object.values(this.queues).map(queue => queue.close()));
      }
      
      console.log('✅ EmailService fermé proprement');
      
    } catch (error) {
      console.error('❌ Erreur lors de la fermeture de l\'EmailService:', error);
    }
  }
}

