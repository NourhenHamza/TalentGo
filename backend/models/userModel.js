// models/User.js - Modèle étudiant adapté avec CV lors de l'inscription

import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  // === INFORMATIONS PERSONNELLES DE BASE ===
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  
  password: { 
    type: String, 
    required: true 
  },

  // === NOUVEAUX CHAMPS OBLIGATOIRES ===
  
  // Carte d'Identité Nationale
  cin: {
    type: String,
    required: [true, 'Le numéro CIN est requis'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Validation pour CIN (8 chiffres) - adaptez selon votre pays
        return /^\d{8}$/.test(v);
      },
      message: 'Le CIN doit contenir exactement 8 chiffres'
    }
  },

  // Date de naissance
  dateOfBirth: {
    type: Date,
    required: [true, 'La date de naissance est requise']
  },

  // Genre
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: [true, 'Le genre est requis']
  },

  // === INFORMATIONS ACADÉMIQUES ===
  
  // Université (référence vers le modèle University)
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: [true, 'L\'université est requise']
  },

  // Niveau d'études
  studyLevel: {
    type: String,
    enum: ['licence', 'master', 'cycle_ingenieur', 'doctorat'],
    required: [true, 'Le niveau d\'études est requis']
  },

  // Spécialité/Filière
  specialization: {
    type: String,
    required: [true, 'La spécialisation est requise'],
    trim: true
  },

  // Classe/Année d'études
  currentClass: {
    type: String,
    required: [true, 'La classe est requise'],
    trim: true
    // Exemples: "L1", "L2", "L3", "M1", "M2", "1ère année ingénieur", etc.
  },

  // Année académique
  academicYear: {
    type: String,
    required: [true, 'L\'année académique est requise'],
    match: [/^\d{4}-\d{4}$/, 'Format d\'année académique invalide (ex: 2024-2025)']
  },

  // === PROFIL EXISTANT ÉTENDU ===
  profile: {
    phone: { 
      type: String,
      required: [true, 'Le numéro de téléphone est requis']
    },
    linkedin: { type: String },
    bio: { type: String },
    
    // Adresse
    address: {
      street: { type: String },
      city: { 
        type: String, 
        required: [true, 'La ville est requise']
      },
      zipCode: { type: String },
      country: { 
        type: String, 
        default: 'Tunisia'
      }
    },

    // Photo de profil
    avatar: {
      type: String,
      default: 'default-avatar.jpg'
    }
  },

  // === CV PRINCIPAL (LORS DE L'INSCRIPTION) ===
  primaryCV: {
    filename: {
      type: String,
      required: [true, 'Le CV est requis lors de l\'inscription']
    },
    originalName: {
      type: String,
      required: true
    },
    filepath: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },

  // === DONNÉES ÉTUDIANT EXISTANTES ===
  studentData: {
    pfeSubmitted: { type: Boolean, default: false },
    finalReportApproved: { type: Boolean, default: false },
    defenseRequested: { type: Boolean, default: false },
    
    // Nouveaux champs PFE
    pfeStatus: {
      type: String,
      enum: ['not_started', 'in_progress', 'submitted', 'defended', 'completed'],
      default: 'not_started'
    },
    
    // Numéro d'étudiant (généré automatiquement)
    studentId: {
      type: String,
      unique: true,
      sparse: true
    },

    // Moyenne générale (optionnel)
    gpa: {
      type: Number,
      min: 0,
      max: 20
    }
  },

  // === CHAMPS DE VÉRIFICATION EXISTANTS ===
  isAccountVerified: { type: Boolean, default: false },
  verifyOtp: { type: String, default: '' },
  verifyOtpExpireAt: { type: Number, default: 0 },
  resetOtp: { type: String, default: '' },
  resetOtpExpireAt: { type: Number, default: 0 },

  // === NOUVEAUX CHAMPS DE STATUT ===
  accountStatus: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'graduated'],
    default: 'pending'
  },

  // Date de dernière connexion
  lastLogin: {
    type: Date
  }

}, { 
  timestamps: true 
});

// === INDEX POUR OPTIMISATION ===
StudentSchema.index({ university: 1, email: 1 });
StudentSchema.index({ university: 1, cin: 1 });
StudentSchema.index({ university: 1, 'studentData.studentId': 1 });

// === MÉTHODES D'INSTANCE ===

// Méthode pour générer un ID étudiant unique
StudentSchema.methods.generateStudentId = async function() {
  if (this.studentData.studentId) return this.studentData.studentId;
  
  // Format: UNI_YEAR_SEQUENCE (ex: TUN_2024_001234)
  const university = await mongoose.model('University').findById(this.university);
  const year = new Date().getFullYear();
  const prefix = university.name.substring(0, 3).toUpperCase();
  
  // Trouver le dernier numéro de séquence pour cette université et cette année
  const lastStudent = await this.constructor
    .findOne({
      university: this.university,
      'studentData.studentId': new RegExp(`^${prefix}_${year}_`)
    })
    .sort({ 'studentData.studentId': -1 });
  
  let sequence = 1;
  if (lastStudent && lastStudent.studentData.studentId) {
    const lastSequence = parseInt(lastStudent.studentData.studentId.split('_')[2]);
    sequence = lastSequence + 1;
  }
  
  this.studentData.studentId = `${prefix}_${year}_${sequence.toString().padStart(6, '0')}`;
  return this.studentData.studentId;
};

// Calculer l'âge
StudentSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// === MIDDLEWARE PRE-SAVE ===
StudentSchema.pre('save', async function(next) {
  // Générer l'ID étudiant si ce n'est pas déjà fait
  if (this.isNew && !this.studentData.studentId) {
    try {
      await this.generateStudentId();
    } catch (error) {
      console.log('Erreur lors de la génération de l\'ID étudiant:', error);
    }
  }
  
  next();
});

const UserModel = mongoose.model("User", StudentSchema);
export default UserModel;