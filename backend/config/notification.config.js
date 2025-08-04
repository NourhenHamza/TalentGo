// Configuration centralisée pour le système de notifications
export const NOTIFICATION_CONFIG = {
  // Types d'utilisateurs dans le système
  USER_TYPES: {
    STUDENT: 'student',
    PROFESSOR: 'professor',
    COMPANY: 'company',
    UNIVERSITY: 'university',
    ENCADREUR_EXTERNE: 'encadreur_externe',
    RECRUTEUR: 'recruteur',
    ADMIN: 'admin'
  },

  // Types d'événements qui déclenchent des notifications
  EVENT_TYPES: {
    // Événements liés aux affectations
    ASSIGNMENT_CREATED: 'assignment_created',
    ASSIGNMENT_CONFIRMED: 'assignment_confirmed',
    ASSIGNMENT_REJECTED: 'assignment_rejected',
    
    PARTNERSHIP_REQUESTED: 'partnership_requested',
    // Événements liés aux soutenances
    DEFENSE_REQUESTED: 'defense_requested',
    DEFENSE_SCHEDULED: 'defense_scheduled',
    DEFENSE_ACCEPTED: 'defense_accepted',
    DEFENSE_REJECTED: 'defense_rejected',
    DEFENSE_COMPLETED: 'defense_completed',
    
    // Événements liés aux entreprises
    COMPANY_REGISTERED: 'company_registered',
    COMPANY_APPROVED: 'company_approved',
    COMPANY_REJECTED: 'company_rejected',
       // Événements liés aux universities
    UNIVERSITY_REGISTERED: 'university_registered',
    UNIVERSITY_APPROVED: 'university_approved',
    UNIVERSITY_REJECTED: 'university_rejected',

      SUBJECT_APPROVED: 'subject_approved',
    SUBJECT_REJECTED: 'subject_rejected',
    
    // Événements liés aux rapports
    REPORT_SUBMITTED: 'report_submitted',
    REPORT_VALIDATED: 'report_validated',
    REPORT_REJECTED: 'report_rejected',
    
    // Événements liés aux mises à jour de progression
    PROGRESS_UPDATE_SUBMITTED: 'progress_update_submitted',
    PROGRESS_FEEDBACK_GIVEN: 'progress_feedback_given',
    
    // Événements liés aux disponibilités
    AVAILABILITY_UPDATED: 'availability_updated',
    
    // Événements liés aux encadreurs externes
    ENCADREUR_EXTERNE_CREATED: 'encadreur_externe_created',
    ENCADREUR_EXTERNE_APPROVED: 'encadreur_externe_approved',
    
    // Événements système
    USER_CREATED: 'user_created',
    PASSWORD_RESET: 'password_reset',

    UNIVERSITY_EVENT_PUBLISHED: 'university_event_published',
  },

  // Priorités des notifications
  PRIORITY: {
    LOW: 'low',
    medium: 'medium',
    high: 'high',
    URGENT: 'urgent'
  },

  // Canaux de notification
  CHANNELS: {
    IN_APP: 'in_app',
    EMAIL: 'email',
    BOTH: 'both'
  },

  // Configuration des destinataires pour chaque type d'événement
  EVENT_RECIPIENTS: {
    // Affectations
    assignment_created: {
      recipients: ['STUDENT', 'PROFESSOR', 'UNIVERSITY'],
      priority: 'medium',
      channels: 'BOTH'
    },
    assignment_confirmed: {
      recipients: ['STUDENT', 'UNIVERSITY'],
      priority: 'high',
      channels: 'BOTH'
    },
    assignment_rejected: {
      recipients: ['STUDENT', 'UNIVERSITY'],
      priority: 'high',
      channels: 'BOTH'
    },
     partnership_requested: {
      recipients: ['UNIVERSITY','COMPANY'],
      priority: 'high',
      channels: 'BOTH'
    },

    // Soutenances
    defense_requested: {
      recipients: ['UNIVERSITY'],
      priority: 'high',
      channels: 'BOTH'
    },
    defense_scheduled: {
      recipients: ['STUDENT', 'PROFESSOR', 'UNIVERSITY'],
      priority: 'high',
      channels: 'BOTH'
    },
    defense_accepted: {
      recipients: ['STUDENT', 'UNIVERSITY'],
      priority: 'high',
      channels: 'BOTH'
    },
    defense_rejected: {
      recipients: ['STUDENT', 'UNIVERSITY'],
      priority: 'high',
      channels: 'BOTH'
    },
    defense_completed: {
      recipients: ['STUDENT', 'PROFESSOR', 'UNIVERSITY'],
      priority: 'medium',
      channels: 'BOTH'
    },

    // Entreprises
    company_registered: {
      recipients: ['ADMIN'],
      priority: 'medium',
      channels: 'BOTH'
    },
    company_approved: {
      recipients: ['COMPANY'],
      priority: 'high',
      channels: 'BOTH'
    },
    company_rejected: {
      recipients: ['COMPANY'],
      priority: 'high',
      channels: 'BOTH'
    },
    // université
    university_registered: {
      recipients: ['ADMIN'],
      priority: 'medium',
      channels: 'BOTH'
    },
    university_approved: {
      recipients: ['UNIVERSITY'],
      priority: 'high',
      channels: 'BOTH'
    },
    university_rejected: {
      recipients: ['UNIVERSITY'],
      priority: 'high',
      channels: 'BOTH'
    },

      subject_approved: {
      recipients: ['STUDENT'],
      priority: 'high',
      channels: 'BOTH'
    },
    subject_rejected: {
      recipients: ['STUDENT'],
      priority: 'high',
      channels: 'BOTH'
    },
    // Rapports
    report_submitted: {
      recipients: ['PROFESSOR', 'UNIVERSITY'],
      priority: 'medium',
      channels: 'BOTH'
    },
    report_validated: {
      recipients: ['STUDENT'],
      priority: 'medium',
      channels: 'BOTH'
    },
    report_rejected: {
      recipients: ['STUDENT'],
      priority: 'high',
      channels: 'BOTH'
    },

    // Mises à jour de progression
    progress_update_submitted: {
      recipients: ['PROFESSOR'],
      priority: 'medium',
      channels: 'BOTH'
    },
    progress_feedback_given: {
      recipients: ['STUDENT'],
      priority: 'medium',
      channels: 'BOTH'
    },

    // Disponibilités
    availability_updated: {
      recipients: ['UNIVERSITY'],
      priority: 'LOW',
      channels: 'IN_APP'
    },

    // Encadreurs externes
    encadreur_externe_created: {
      recipients: ['COMPANY', 'UNIVERSITY'],
      priority: 'medium',
      channels: 'BOTH'
    },
    encadreur_externe_approved: {
      recipients: ['ENCADREUR_EXTERNE', 'COMPANY'],
      priority: 'high',
      channels: 'BOTH'
    },

    // Événements système
    user_created: {
      recipients: ['USER'],
      priority: 'medium',
      channels: 'EMAIL'
    },
    password_reset: {
      recipients: ['USER'],
      priority: 'high',
      channels: 'EMAIL'
    },
    university_event_published: {
      recipients: ['STUDENT', 'COMPANY'], // Students and partner companies
      priority: 'medium',
      channels: 'BOTH'
    },
  },

  // Templates d'emails par type d'événement
  EMAIL_TEMPLATES: {
    assignment_created: {
      subject: 'Nouvelle affectation créée',
      template: 'assignment-created'
    },
    assignment_confirmed: {
      subject: 'Affectation confirmée',
      template: 'assignment-confirmed'
    },
    assignment_rejected: {
      subject: 'Affectation rejetée',
      template: 'assignment-rejected'
    },
     partnership_requested: {
      subject: 'Nouvelle demande de partenariat',
      template: 'partnership-requested'
    },
    defense_requested: {
      subject: 'Nouvelle demande de soutenance',
      template: 'defense-requested'
    },
    defense_scheduled: {
      subject: 'Soutenance programmée',
      template: 'defense-scheduled'
    },
    defense_accepted: {
      subject: 'Soutenance acceptée',
      template: 'defense-accepted'
    },
    defense_rejected: {
      subject: 'Soutenance rejetée',
      template: 'defense-rejected'
    },
    defense_completed: {
      subject: 'Soutenance terminée',
      template: 'defense-completed'
    },
    company_registered: {
      subject: 'Nouvelle entreprise enregistrée',
      template: 'company-registered'
    },
    company_approved: {
      subject: 'Votre entreprise a été approuvée',
      template: 'company-approved'
    },
    company_rejected: {
      subject: 'Votre demande d\'entreprise a été rejetée',
      template: 'company-rejected'
    },
    university_registered: {
      subject: 'Nouvelle université enregistrée',
      template: 'university-registered'
    },
    university_approved: {
      subject: 'Votre université a été approuvée',
      template: 'university-approved'
    },
    university_rejected: {
      subject: 'Votre demande d\'université a été rejetée',
      template: 'university-rejected'
    },
      subject_approved: {
      subject: 'Votre sujet a été approuvée',
      template: 'subject-approved'
    },
    subject_rejected: {
      subject: 'Votre demande de sujet a été rejetée',
      template: 'subject-rejected'
    },
    report_submitted: {
      subject: 'Nouveau rapport soumis',
      template: 'report-submitted'
    },
    report_validated: {
      subject: 'Votre rapport a été validé',
      template: 'report-validated'
    },
    report_rejected: {
      subject: 'Votre rapport a été rejeté',
      template: 'report-rejected'
    },
    progress_update_submitted: {
      subject: 'Nouvelle mise à jour de progression',
      template: 'progress-update-submitted'
    },
    progress_feedback_given: {
      subject: 'Nouveau feedback sur votre progression',
      template: 'progress-feedback-given'
    },
    availability_updated: {
      subject: 'Disponibilités mises à jour',
      template: 'availability-updated'
    },
    encadreur_externe_created: {
      subject: 'Nouvel encadreur externe créé',
      template: 'encadreur-externe-created'
    },
    encadreur_externe_approved: {
      subject: 'Votre compte encadreur a été approuvé',
      template: 'encadreur-externe-approved'
    },
    user_created: {
      subject: 'Bienvenue ! Votre compte a été créé',
      template: 'user-created'
    },
    password_reset: {
      subject: 'Réinitialisation de votre mot de passe',
      template: 'password-reset'
    },
 university_event_published: {
      subject: 'Nouvel événement: {{eventTitle}}',
      template: 'university_event_published'
    },
  },

  // Messages de notification par défaut
  DEFAULT_MESSAGES: {
    assignment_created: 'Une nouvelle affectation a été créée',
    assignment_confirmed: 'L\'affectation a été confirmée',
    assignment_rejected: 'L\'affectation a été rejetée',
    partnership_requested: 'Une nouvelle demande de partenariat a été soumise',
    defense_requested: 'Une nouvelle demande de soutenance a été soumise',
    defense_scheduled: 'Une soutenance a été programmée',
    defense_accepted: 'La soutenance a été acceptée',
    defense_rejected: 'La soutenance a été rejetée',
    defense_completed: 'La soutenance a été terminée',
    company_registered: 'Une nouvelle entreprise s\'est enregistrée',
    company_approved: 'Votre entreprise a été approuvée',
    company_rejected: 'Votre demande d\'entreprise a été rejetée',
    university_registered: 'Une nouvelle university s\'est enregistrée',
    university_approved: 'Votre university a été approuvée',
    university_rejected: 'Votre demande d\'university a été rejetée',
    subject_approved: 'Votre sujet a été approuvée',
    subject_rejected: 'Votre demande de sujet a été rejetée',
    report_submitted: 'Un nouveau rapport a été soumis',
    report_validated: 'Votre rapport a été validé',
    report_rejected: 'Votre rapport a été rejeté',
    progress_update_submitted: 'Une nouvelle mise à jour de progression a été soumise',
    progress_feedback_given: 'Un nouveau feedback a été donné sur votre progression',
    availability_updated: 'Les disponibilités ont été mises à jour',
    encadreur_externe_created: 'Un nouvel encadreur externe a été créé',
    encadreur_externe_approved: 'Votre compte encadreur a été approuvé',
    user_created: 'Votre compte a été créé avec succès',
    password_reset: 'Votre mot de passe a été réinitialisé',
    university_event_published: 'Un nouvel événement a été publié par votre université',
  }
};

// Configuration pour les modèles de données
export const MODEL_CONFIG = {
  // Mapping des types d'utilisateurs vers les modèles
  USER_TYPE_MODELS: {
    student: 'User',
    professor: 'Professor',
    company: 'Company',
    university: 'University',
    encadreur_externe: 'EncadreurExterne',
    recruteur: 'EncadreurExterne',
    admin: 'Admin'
  },

  // Champs email pour chaque type d'utilisateur
  EMAIL_FIELDS: {
    student: 'email',
    professor: 'email',
    company: 'email_contact',
     university: 'contactPerson.email',
    encadreur_externe: 'email',
    recruteur: 'email',
    admin: 'email'
  },

  // Champs nom pour chaque type d'utilisateur
  NAME_FIELDS: {
    student: ['firstName', 'lastName'],
    professor: ['name'],
    company: ['nom'],
    university: ['nom'],
    encadreur_externe: ['prenom', 'nom'],
    recruteur: ['prenom', 'nom'],
     admin: ['name']
  }
};