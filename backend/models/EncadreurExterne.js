// models/EncadreurExterne.js
import bcrypt from 'bcryptjs';
import mongoose from "mongoose";

const EncadreurExterneSchema = new mongoose.Schema(
  {
    entreprise_id: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Entreprise',
  required: [true, "La référence à l'entreprise est requise"],
  // Supprimez le validate pour éviter les conflits
},
    nom: {
      type: String,
      required: [false],
      trim: true,
    },
    prenom: {
      type: String,
      required: [false],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Veuillez utiliser une adresse email valide"],
    },
    mot_de_passe_hache: {
      type: String,
      required: [true, "Le mot de passe est requis"],
      select: false // Ne pas retourner le mot de passe dans les requêtes
    },
    telephone: {
      type: String,
      trim: true,
    },
    poste: {
      type: String,
      trim: true,
    },
    role_interne: {
      type: String,
      enum: {
        values: ['Recruteur', 'Encadreur'],
        message: "Le rôle interne doit être 'Recruteur' ou 'Encadreur'"
      },
      default: 'Encadreur',
    },
    est_actif: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'deleted'],
        message: "Le statut doit être 'pending', 'approved' ou 'deleted'"
      },
      default: 'pending'
    },
    refreshToken: { // Ajout du champ pour le refresh token
      type: String,
      select: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Méthode pour comparer les mots de passe
EncadreurExterneSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.mot_de_passe_hache);
};

// Hash du mot de passe avant sauvegarde
EncadreurExterneSchema.pre('save', async function(next) {
  if (!this.isModified('mot_de_passe_hache')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.mot_de_passe_hache = await bcrypt.hash(this.mot_de_passe_hache, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Virtual population pour récupérer les détails de l'entreprise
EncadreurExterneSchema.virtual('entrepriseDetails', {
  ref: 'Entreprise',
  localField: 'entreprise_id',
  foreignField: '_id',
  justOne: true
});

const EncadreurExterne = mongoose.model("EncadreurExterne", EncadreurExterneSchema);

export default EncadreurExterne;