// models/Candidature.js
import mongoose from "mongoose";

const CandidatureSchema = new mongoose.Schema(
  {
    offre_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OffreStageEmploi',
      required: [true, "La référence à l'offre est requise"],
      validate: {
        validator: (v) => mongoose.Types.ObjectId.isValid(v),
        message: "Référence d'offre invalide"
      }
    },
    etudiant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assumant que 'User' est le modèle pour les étudiants
      required: [true, "La référence à l'étudiant est requise"],
      validate: {
        validator: (v) => mongoose.Types.ObjectId.isValid(v),
        message: "Référence d'étudiant invalide"
      }
    },
    statut: {
      type: String,
      enum: {
        values: ['Soumise', 'En cours', 'Acceptée', 'Refusée', 'Retirée'],
        message: "Le statut doit être 'Soumise', 'En cours', 'Acceptée', 'Refusée' ou 'Retirée'"
      },
      default: 'Soumise',
    },
    cv_url: {
      type: String,
      required: [true, "L'URL du CV est requise"],
      trim: true,
    },
    lettre_motivation_url: {
      type: String,
      trim: true,
    },
    commentaires_entreprise: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Ajoute createdAt (date_candidature) et updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual population pour récupérer les détails de l'offre et de l'étudiant
CandidatureSchema.virtual('offreDetails', {
  ref: 'OffreStageEmploi',
  localField: 'offre_id',
  foreignField: '_id',
  justOne: true
});

CandidatureSchema.virtual('etudiantDetails', {
  ref: 'User', // Assurez-vous que c'est le bon nom de modèle pour les étudiants
  localField: 'etudiant_id',
  foreignField: '_id',
  justOne: true
});

const Candidature = mongoose.model("Candidature", CandidatureSchema);

export default Candidature;
