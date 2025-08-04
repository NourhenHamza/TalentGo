// Configuration pour le service d'email
export const EMAIL_CONFIG = {
  // Configuration SMTP (à adapter selon votre fournisseur)
  SMTP: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true pour le port 465
    auth: {
      user: process.env.SMTP_USER, // hamza@etudiant-fst.utm.tn
      pass: process.env.SMTP_PASS  // prkn gbtp khyt yfej
    }
  },

  // Configuration SendGrid (alternative)
  SENDGRID: {
    apiKey: process.env.SENDGRID_API_KEY,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@votre-plateforme.com'
  },

  // Configuration par défaut
  DEFAULT: {
    from: process.env.DEFAULT_FROM_EMAIL || 'noreply@votre-plateforme.com',
    replyTo: process.env.DEFAULT_REPLY_TO || 'support@votre-plateforme.com'
  },

  // Configuration des templates
  TEMPLATES: {
    baseUrl: process.env.TEMPLATE_BASE_URL || 'http://localhost:4000',
    logoUrl: process.env.LOGO_URL || 'http://localhost:4000/logo.png',
    companyName: process.env.COMPANY_NAME || 'Votre Plateforme',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@votre-plateforme.com'
  },

  // Limites et retry
  LIMITS: {
    maxRetries: 3,
    retryDelay: 5000, // 5 secondes
    batchSize: 50, // Nombre d'emails à envoyer par batch
    rateLimit: 100 // Emails par minute
  },

  // Configuration des queues
  QUEUE: {
    name: 'email-queue',
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD
    },
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    }
  }
};

