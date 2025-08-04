// models/Message.js
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    expediteur_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "L'ID de l'expéditeur est requis"],
      validate: {
        validator: (v) => mongoose.Types.ObjectId.isValid(v),
        message: "ID d'expéditeur invalide"
      }
    },
    expediteur_type: {
      type: String,
      enum: {
        values: ['EncadreurExterne', 'User', 'Coordinateur'], // 'User' pour étudiant, 'Coordinateur' si ce modèle existe
        message: "Le type d'expéditeur est invalide"
      },
      required: [true, "Le type d'expéditeur est requis"],
    },
    destinataire_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "L'ID du destinataire est requis"],
      validate: {
        validator: (v) => mongoose.Types.ObjectId.isValid(v),
        message: "ID de destinataire invalide"
      }
    },
    destinataire_type: {
      type: String,
      enum: {
        values: ['EncadreurExterne', 'User', 'Coordinateur'],
        message: "Le type de destinataire est invalide"
      },
      required: [true, "Le type de destinataire est requis"],
    },
    sujet: {
      type: String,
      trim: true,
    },
    contenu: {
      type: String,
      required: [true, "Le contenu du message est requis"],
      trim: true,
    },
    est_lu: {
      type: Boolean,
      default: false,
    },
    offre_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OffreStageEmploi',
      validate: {
        validator: (v) => !v || mongoose.Types.ObjectId.isValid(v),
        message: "Référence d'offre invalide"
      }
    },
    candidature_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidature',
      validate: {
        validator: (v) => !v || mongoose.Types.ObjectId.isValid(v),
        message: "Référence de candidature invalide"
      }
    },
  },
  {
    timestamps: true, // Ajoute createdAt (date_envoi) et updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populations pour récupérer les détails de l'expéditeur et du destinataire
// Note: Ces virtuals sont plus complexes car ils dépendent du type.
// Il est souvent plus simple de faire des lookups côté application ou d'utiliser des populate conditionnels.
// Pour un exemple simple, nous allons les définir, mais leur utilisation directe via populate peut nécessiter des ajustements.

MessageSchema.virtual('expediteurDetails', {
  ref: function() {
    // Ceci est un exemple simplifié. En pratique, vous ne pouvez pas utiliser une fonction ici directement pour `ref`
    // avec `populate`. Il faudrait gérer le lookup côté application ou avec un agrégat.
    // Pour un `populate` simple, vous auriez besoin de champs séparés ou d'une logique plus complexe.
    // Pour l'instant, nous allons laisser les références génériques et vous devrez gérer le `populate`
    // en fonction du `expediteur_type` dans votre code.
    return 'User'; // Placeholder, à adapter
  },
  localField: 'expediteur_id',
  foreignField: '_id',
  justOne: true
});

MessageSchema.virtual('destinataireDetails', {
  ref: function() {
    return 'User'; // Placeholder, à adapter
  },
  localField: 'destinataire_id',
  foreignField: '_id',
  justOne: true
});

MessageSchema.virtual('offreDetails', {
  ref: 'OffreStageEmploi',
  localField: 'offre_id',
  foreignField: '_id',
  justOne: true
});

MessageSchema.virtual('candidatureDetails', {
  ref: 'Candidature',
  localField: 'candidature_id',
  foreignField: '_id',
  justOne: true
});


const Message = mongoose.model("Message", MessageSchema);

export default Message;
