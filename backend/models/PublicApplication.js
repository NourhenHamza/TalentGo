import mongoose from 'mongoose';

const PublicApplicationSchema = new mongoose.Schema({
  // Référence à l'offre
  offre_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OffreStageEmploi',
    required: true
  },
  
  // Informations personnelles
  personalInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  
  // Type de candidature
  applicationType: {
    type: String,
    enum: ['Stage', 'Emploi', 'Alternance'],
    required: true
  },
  
  // Documents
  documents: {
    cv: {
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      uploadedAt: Date
    },
    coverLetter: {
      type: String,
      trim: true
    }
  },
  
  // Authentification - MISE À JOUR pour supporter Firebase
  authentication: {
    provider: {
      type: String,
      enum: ['google', 'apple', 'firebase', 'firebase-dev'], // Ajout de Firebase
      required: true
    },
    providerId: {
      type: String,
      required: true
    },
    verifiedEmail: {
      type: String,
      required: true
    },
    verificationDate: {
      type: Date,
      default: Date.now
    },
    // Données supplémentaires du provider
    providerData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  
  // NOUVEAU: Gestion des tentatives de test
  testAttempts: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // NOUVEAU: Historique des violations de sécurité
  securityViolations: [{
    violation: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    timestamp: {
      type: String,
      required: true
    },
    attemptNumber: {
      type: Number,
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Résultats du test - AMÉLIORÉ avec données de sécurité
  testResult: {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test'
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    passed: {
      type: Boolean
    },
    answers: [{
      questionIndex: Number,
      selectedAnswer: Number,
      isCorrect: Boolean,
      timeSpent: Number // en secondes
    }],
    startedAt: Date,
    completedAt: Date,
    timeSpent: Number, // durée totale en secondes
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'terminated'],
      default: 'in_progress'
    },
    // NOUVEAU: Données de sécurité pour ce test
    securityData: {
      violations: [{
        violation: String,
        description: String,
        timestamp: String
      }],
      violationCount: {
        type: Number,
        default: 0
      },
      testLocked: {
        type: Boolean,
        default: false
      },
      suspiciousActivity: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Statut de la candidature
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'accepted', 'rejected'],
    default: 'pending'
  },
  
  // Notes de l'entreprise
  companyNotes: {
    type: String,
    trim: true
  },
  
  // Données de session (pour le suivi du processus)
  sessionData: {
    publicTestLink: String,
    accessedAt: Date,
    completedSteps: [{
      step: {
        type: String,
        enum: ['info', 'auth', 'form', 'test', 'results']
      },
      completedAt: Date
    }],
    ipAddress: String,
    userAgent: String
  },
  
  // Métadonnées
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  }
}, {
  timestamps: true
});

// Index pour éviter les doublons (un utilisateur par offre)
PublicApplicationSchema.index({ 
  offre_id: 1, 
  'authentication.providerId': 1, 
  'authentication.provider': 1 
}, { unique: true });

// Index pour les recherches par email
PublicApplicationSchema.index({ 'personalInfo.email': 1 });

// Index pour les recherches par statut
PublicApplicationSchema.index({ status: 1 });

// NOUVEAU: Index pour les recherches par tentatives de test
PublicApplicationSchema.index({ testAttempts: 1 });

// NOUVEAU: Index pour les recherches par violations de sécurité
PublicApplicationSchema.index({ 'securityViolations.violation': 1 });

// Méthodes du schéma - AMÉLIORÉES
PublicApplicationSchema.methods.isTestCompleted = function() {
  return this.testResult && this.testResult.completedAt;
};

PublicApplicationSchema.methods.getTestScore = function() {
  return this.testResult ? this.testResult.score : null;
};

PublicApplicationSchema.methods.hasPassedTest = function() {
  return this.testResult ? this.testResult.passed : false;
};

// NOUVEAU: Méthodes pour la gestion des tentatives
PublicApplicationSchema.methods.canRetakeTest = function(maxAttempts) {
  if (!maxAttempts) return true; // Pas de limite
  return this.testAttempts < maxAttempts;
};

PublicApplicationSchema.methods.getRemainingAttempts = function(maxAttempts) {
  if (!maxAttempts) return null; // Pas de limite
  return Math.max(0, maxAttempts - this.testAttempts);
};

// NOUVEAU: Méthodes pour la gestion des violations de sécurité
PublicApplicationSchema.methods.hasSecurityViolations = function() {
  return this.securityViolations && this.securityViolations.length > 0;
};

PublicApplicationSchema.methods.getViolationCount = function() {
  return this.securityViolations ? this.securityViolations.length : 0;
};

PublicApplicationSchema.methods.getViolationsByType = function(violationType) {
  if (!this.securityViolations) return [];
  return this.securityViolations.filter(v => v.violation === violationType);
};

// NOUVEAU: Méthode pour ajouter une violation de sécurité
PublicApplicationSchema.methods.addSecurityViolation = function(violation, description, attemptNumber) {
  if (!this.securityViolations) {
    this.securityViolations = [];
  }
  
  this.securityViolations.push({
    violation: violation,
    description: description,
    timestamp: new Date().toISOString(),
    attemptNumber: attemptNumber || this.testAttempts || 1,
    submittedAt: new Date()
  });
  
  return this.save();
};

// NOUVEAU: Méthode pour incrémenter les tentatives de test
PublicApplicationSchema.methods.incrementTestAttempts = function() {
  this.testAttempts = (this.testAttempts || 0) + 1;
  return this.save();
};

// NOUVEAU: Méthode pour vérifier si le test est verrouillé
PublicApplicationSchema.methods.isTestLocked = function() {
  return this.testResult && this.testResult.securityData && this.testResult.securityData.testLocked;
};

// NOUVEAU: Méthode pour obtenir un résumé de sécurité
PublicApplicationSchema.methods.getSecuritySummary = function() {
  const summary = {
    totalViolations: this.getViolationCount(),
    testLocked: this.isTestLocked(),
    hasCompletedTest: this.isTestCompleted(),
    testAttempts: this.testAttempts || 0,
    violationTypes: {}
  };
  
  if (this.securityViolations) {
    this.securityViolations.forEach(violation => {
      if (!summary.violationTypes[violation.violation]) {
        summary.violationTypes[violation.violation] = 0;
      }
      summary.violationTypes[violation.violation]++;
    });
  }
  
  return summary;
};

// Hook pre-save pour validation - AMÉLIORÉ
PublicApplicationSchema.pre('save', function(next) {
  // Validation des tentatives de test
  if (this.testAttempts < 0) {
    this.testAttempts = 0;
  }
  
  // Validation des données de sécurité
  if (this.testResult && this.testResult.securityData) {
    if (this.testResult.securityData.violationCount < 0) {
      this.testResult.securityData.violationCount = 0;
    }
  }
  
  next();
});

// Hook post-save pour logging - NOUVEAU
PublicApplicationSchema.post('save', function(doc) {
  // Log des tentatives de test importantes
  if (doc.testAttempts > 3) {
    console.log(`[PublicApplication] Utilisateur ${doc.personalInfo.email} a fait ${doc.testAttempts} tentatives de test`);
  }
  
  // Log des violations de sécurité
  if (doc.securityViolations && doc.securityViolations.length > 0) {
    const recentViolations = doc.securityViolations.filter(v => 
      new Date(v.submittedAt) > new Date(Date.now() - 60000) // Dernière minute
    );
    
    if (recentViolations.length > 0) {
      console.log(`[PublicApplication] Nouvelles violations de sécurité pour ${doc.personalInfo.email}:`, 
        recentViolations.map(v => v.violation));
    }
  }
});

// Méthodes statiques - NOUVELLES
PublicApplicationSchema.statics.findByTestAttempts = function(minAttempts, maxAttempts) {
  const query = {};
  if (minAttempts !== undefined) query.testAttempts = { $gte: minAttempts };
  if (maxAttempts !== undefined) {
    if (query.testAttempts) {
      query.testAttempts.$lte = maxAttempts;
    } else {
      query.testAttempts = { $lte: maxAttempts };
    }
  }
  return this.find(query);
};

PublicApplicationSchema.statics.findWithSecurityViolations = function() {
  return this.find({ 
    $or: [
      { 'securityViolations.0': { $exists: true } },
      { 'testResult.securityData.violationCount': { $gt: 0 } }
    ]
  });
};

PublicApplicationSchema.statics.getSecurityStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalApplications: { $sum: 1 },
        applicationsWithViolations: {
          $sum: {
            $cond: [
              { $gt: [{ $size: { $ifNull: ['$securityViolations', []] } }, 0] },
              1,
              0
            ]
          }
        },
        averageTestAttempts: { $avg: '$testAttempts' },
        maxTestAttempts: { $max: '$testAttempts' }
      }
    }
  ]);
};

const PublicApplication = mongoose.model('PublicApplication', PublicApplicationSchema);

export default PublicApplication;

