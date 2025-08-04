// models/EncadreurExterne.js
import mongoose from "mongoose";

const EncadreurExterneSchema = new mongoose.Schema(
  {
    entreprise_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Entreprise',
      required: [true, "La référence à l'entreprise est requise"],
      validate: {
        validator: (v) => mongoose.Types.ObjectId.isValid(v),
        message: "Référence d'entreprise invalide"
      }
    },
    nom: {
      type: String,
      required: [true, "Le nom est requis"],
      trim: true,
    },
    prenom: {
      type: String,
      required: [true, "Le prénom est requis"],
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
    mot_de_passe_hache: { // Stocker le hash du mot de passe
      type: String,
      required: [true, "Le mot de passe est requis"],
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
        values: ['Admin Entreprise', 'Recruteur', 'Encadreur'],
        message: "Le rôle interne doit être 'Admin Entreprise', 'Recruteur' ou 'Encadreur'"
      },
      default: 'Encadreur',
    },
    est_actif: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual population pour récupérer les détails de l'entreprise
EncadreurExterneSchema.virtual('entrepriseDetails', {
  ref: 'Entreprise',
  localField: 'entreprise_id',
  foreignField: '_id',
  justOne: true
});

const EncadreurExterne = mongoose.model("EncadreurExterne", EncadreurExterneSchema);

export default EncadreurExterne;
