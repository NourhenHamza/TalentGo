import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  offre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OffreStageEmploi',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Référence au modèle User (étudiant)
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  cv: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CV', // Référence au CV utilisé pour cette candidature
    required: false, // CHANGED: Made optional
    default: null
  },
  coverLetter: {
    type: String, // Lettre de motivation optionnelle
    default: ''
  },
  
  confirmed: {
    type: Boolean,
    default: false
  },
  confirmedAt: {
    type: Date
  },
  
  // Test result fields
  testResult: {
    testId: {
      type: String, // CHANGEMENT ICI: De ObjectId à String
      required: false
    },
    resultId: {
      type: String, // CHANGEMENT ICI: De ObjectId à String
      required: false
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: false
    },
    passed: {
      type: Boolean,
      required: false
    },
    completedAt: {
      type: Date,
      required: false
    }
  },
  
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'accepted', 'rejected', 'completed'],
    default: 'pending',
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  reviewedAt: {
    type: Date // Date de révision par l'entreprise
  },
  notes: {
    type: String, // Notes de l'entreprise sur la candidature
    default: ''
  },
  
  finalGrade: {
    type: Number,
    min: 0,
    max: 100,
    default: null,
    required: false
  },
  review: {
    type: String,
    default: '',
    required: false
  }
}, {
  timestamps: true,
  minimize: false // Ensures fields with null values are included
});

// Index composé pour empêcher les candidatures multiples à la même offre
ApplicationSchema.index({ offre: 1, student: 1 }, { unique: true });

// Index pour optimiser les requêtes
ApplicationSchema.index({ student: 1, status: 1 });
ApplicationSchema.index({ company: 1, status: 1 });
ApplicationSchema.index({ offre: 1 });
ApplicationSchema.index({ 'testResult.testId': 1 });

// Pre-save hook with better error handling
ApplicationSchema.pre('save', function(next) {
  try {
    // Ensure finalGrade is properly handled
    if (this.status === 'completed' && this.finalGrade !== null && this.finalGrade !== undefined) {
      this.finalGrade = parseFloat(this.finalGrade);
    }
    
    // Ensure review is properly handled
    if (this.status === 'completed' && this.review) {
      this.review = String(this.review).trim();
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Method to update application with validation
ApplicationSchema.methods.updateWithValidation = function(updateData) {
  Object.keys(updateData).forEach(key => {
    this[key] = updateData[key];
  });
  
  return this.save();
};

const Application = mongoose.model('Application', ApplicationSchema);

export default Application;