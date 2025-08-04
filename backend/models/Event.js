import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    university_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: [true, "La référence à l'université est requise"],
      validate: {
        validator: (v) => mongoose.Types.ObjectId.isValid(v),
        message: "Référence d'université invalide"
      }
    },
    title: {
      type: String,
      required: [true, "Le titre de l'événement est requis"],
      trim: true,
      maxlength: [100, "Le titre ne peut pas dépasser 100 caractères"]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "La description ne peut pas dépasser 1000 caractères"]
    },
    date: {
      type: Date,
      required: [true, "La date de l'événement est requise"],
      validate: {
        validator: function(value) {
          return value > new Date();
        },
        message: "La date de l'événement doit être dans le futur"
      }
    },
    endDate: {
      type: Date,
      validate: {
        validator: function(value) {
          return !value || value > this.date;
        },
        message: "La date de fin doit être après la date de début"
      }
    },
    location: {
      type: String,
      trim: true,
      required: [true, "Le lieu de l'événement est requis"]
    },
    category: {
      type: String,
      enum: [ 'academic',
'conference', 'workshop', 'seminar', 'competition', 'cultural', 'sports','orientation', 'social','other'],
      default: 'other',
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled'],
      default: 'draft',
      required: true
    },
    isPublic: {
      type: Boolean,
      default: true // Public par défaut, peut être changé en privé
    },
    contactEmail: {
      type: String,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Veuillez ajouter une adresse email valide',
      ]
    },
    image: {
      type: String,
      default: 'no-event-image.jpg'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to populate university details
EventSchema.virtual('universityDetails', {
  ref: 'University',
  localField: 'university_id',
  foreignField: '_id',
  justOne: true
});

// Virtual pour vérifier si l'événement est passé
EventSchema.virtual('isPastEvent').get(function() {
  return this.date < new Date();
});

// Virtual pour formater la date
EventSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('fr-FR');
});

// Index pour améliorer les performances de recherche
EventSchema.index({ university_id: 1, date: 1 });
EventSchema.index({ category: 1, status: 1 });
EventSchema.index({ date: 1 });

const Event = mongoose.model("Event", EventSchema);

export default Event;