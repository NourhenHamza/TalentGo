import mongoose from 'mongoose';

const offreStageEmploiSchema = new mongoose.Schema({
  entreprise_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  categorie: {
    type: String,
    required: [true, 'La catégorie est requise'],
    enum: [
      'Tech', 'DeepTech', 'HighTech', 'MedTech', 'HealthTech', 'BioTech', 'WellnessTech', 'PharmaTech', 'CareTech',
      'EdTech', 'LearnTech', 'TeachTech', 'FinTech', 'InsurTech', 'LegalTech', 'RegTech', 'WealthTech',
      'GreenTech', 'CleanTech', 'AgriTech', 'FoodTech', 'ClimateTech', 'RetailTech', 'EcomTech', 'MarTech',
      'AdTech', 'SalesTech', 'LoyaltyTech', 'HRTech', 'WorkTech', 'RecruitTech', 'MobilityTech', 'AutoTech',
      'LogiTech', 'TravelTech', 'AeroTech', 'ShipTech', 'PropTech', 'ConstrucTech', 'BuildTech', 'HomeTech',
      'NanoTech', 'RoboTech', 'NeuroTech', 'GameTech', 'MediaTech', 'MusicTech', 'SportTech', 'ArtTech',
      'EventTech', 'FashionTech', 'BeautyTech', 'DesignTech', 'LuxuryTech', 'CivicTech', 'GovTech', 'SpaceTech',
      'MilTech', 'EduGovTech'
    ],
  },
  titre: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true,
  },
  type_offre: {
    type: String,
    required: [true, 'Le type d\'offre est requis'],
    enum: ["Stage", "Emploi", "Alternance"],
  },
  duree: {
    type: String,
    trim: true,
  },
  localisation: {
    type: String,
    trim: true,
  },
  competences_requises: [{
    type: String,
    trim: true,
  }],
  date_limite_candidature: {
    type: Date,
    required: [true, 'La date limite de candidature est requise'],
  },
  nombre_postes: {
    type: Number,
    required: [true, 'Le nombre de postes est requis'],
    min: [1, 'Le nombre de postes doit être supérieur à 0'],
  },
  remuneration: {
    type: String,
    trim: true,
  },
  hasRemuneration: {
    type: Boolean,
    default: false,
  },
  statut: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active',
  },
  test_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
  },
  test: {
    testName: String,
    description: String,
    testDuration: Number,
    passingScore: Number,
    maxAttempts: Number,
    instructions: String,
    security: {
      preventCopy: Boolean,
      timeLimit: Boolean,
      showResults: Boolean,
      allowBackNavigation: Boolean,
      preventTabSwitch: Boolean,
      fullscreenMode: Boolean,
      preventDevTools: Boolean,
    },
    questions: [{
      question: String,
      options: [String],
      correctAnswer: String,
      type: {
        type: String,
        enum: ['multiple_choice', 'text', 'code'],
      },
      isActive: Boolean,
      availableFrom: Date,
    }],
  },
  requiresTest: {
    type: Boolean,
    default: false,
  },
  publicTestLink: {
    type: String,
    unique: true,
    sparse: true,
  },
  publicTestEnabled: {
    type: Boolean,
    default: false,
  },
  publicTestGeneratedAt: {
    type: Date,
  },
  publicApplicationsCount: {
    type: Number,
    default: 0,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  isPublishedForStudents: {
    type: Boolean,
    default: false,
  },
  publishedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Méthodes d\'instance pour gérer le statut de publication
offreStageEmploiSchema.methods.canBePublished = function () {
  return this.statut === 'active' && new Date(this.date_limite_candidature) > new Date();
};

offreStageEmploiSchema.methods.publish = async function () {
  if (!this.canBePublished()) {
    throw new Error('Cette offre ne peut pas être publiée (inactive ou expirée)');
  }
  this.isPublished = true;
  this.publishedAt = new Date();
  return await this.save();
};

offreStageEmploiSchema.methods.unpublish = async function () {
  this.isPublished = false;
  this.publishedAt = null;
  return await this.save();
};

offreStageEmploiSchema.methods.publishForStudents = async function () {
  if (!this.canBePublished()) {
    throw new Error('Cette offre ne peut pas être publiée pour les étudiants (inactive ou expirée)');
  }
  this.isPublishedForStudents = true;
  this.publishedAt = new Date();
  return await this.save();
};

offreStageEmploiSchema.methods.unpublishForStudents = async function () {
  this.isPublishedForStudents = false;
  return await this.save();
};

export default mongoose.model('OffreStageEmploi', offreStageEmploiSchema);

