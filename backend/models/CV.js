// models/CV.js - Modèle CV modifié avec type de CV

import mongoose from 'mongoose';

const CVSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true, // Nom original du fichier
  },
  filepath: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true, // URL complète pour accéder au fichier
  },
  mimetype: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  
  // === NOUVEAU CHAMP: TYPE DE CV ===
  cvType: {
    type: String,
    enum: ['primary', 'additional'], // 'primary' = CV d'inscription, 'additional' = autres CV
    default: 'additional',
    required: true
  },
  
  // Indique si c'est le CV actif (pour les additional)
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Description/titre du CV (optionnel pour les additional CV)
  description: {
    type: String,
    default: ''
  },
  
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true
});

// Index pour éviter plusieurs CV primary par étudiant
CVSchema.index({ student: 1, cvType: 1 }, { 
  unique: true,
  partialFilterExpression: { cvType: 'primary' }
});

// Index pour optimiser les requêtes
CVSchema.index({ student: 1, isActive: 1 });
CVSchema.index({ student: 1, uploadedAt: -1 });

// Méthode pour obtenir le CV actif d'un étudiant
CVSchema.statics.getActiveCV = async function(studentId) {
  // Priorité: CV primary, sinon le dernier CV additional actif
  let cv = await this.findOne({ 
    student: studentId, 
    cvType: 'primary' 
  });
  
  if (!cv) {
    cv = await this.findOne({ 
      student: studentId, 
      cvType: 'additional',
      isActive: true 
    }).sort({ uploadedAt: -1 });
  }
  
  return cv;
};

// Méthode pour désactiver les anciens CV
CVSchema.pre('save', async function(next) {
  if (this.isNew && this.cvType === 'additional' && this.isActive) {
    // Désactiver les autres CV additional actifs
    await this.constructor.updateMany(
      { 
        student: this.student, 
        cvType: 'additional',
        _id: { $ne: this._id }
      },
      { isActive: false }
    );
  }
  next();
});

const CV = mongoose.model('CV', CVSchema);
export default CV;