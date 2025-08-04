// models/Defense.js

import mongoose from "mongoose";

const DefenseSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assumant que 'User' est votre modèle Student
      required: [true, "Student reference is required"],
      validate: {
        validator: (v) => mongoose.Types.ObjectId.isValid(v),
        message: "Invalid student reference"
      }
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, "Subject reference is required"],
      validate: {
        validator: (v) => mongoose.Types.ObjectId.isValid(v),
        message: "Invalid subject reference"
      }
    },
    jury: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Professor', // Référence au modèle Professor
      validate: {
        validator: function(id) {
          return mongoose.Types.ObjectId.isValid(id);
        },
        message: "Invalid jury member reference"
      }
    }],
    acceptedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Professor', // Référence au modèle Professor
      validate: {
        validator: function(id) {
          return mongoose.Types.ObjectId.isValid(id);
        },
        message: "Invalid accepted reference"
      }
    }],
    date: {
      type: Date,
      required: [true, "Defense date is required"],
      validate: {
        validator: (date) => date > new Date(),
        message: "Defense date must be in the future"
      }
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'scheduled', 'completed', 'rejected'],
        message: "Status must be 'pending', 'scheduled', 'completed', or 'rejected'"
      },
      default: 'pending'
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Professor' // Référence au modèle Professor
    },
    notes: {
      type: String
    },
    // --- AJOUT NÉCESSAIRE ---
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true // Une soutenance appartient toujours à une université
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual population (pas de changement ici)
DefenseSchema.virtual('studentDetails', {
  ref: 'User',
  localField: 'student',
  foreignField: '_id',
  justOne: true
});

DefenseSchema.virtual('subjectDetails', {
  ref: 'Subject',
  localField: 'subject',
  foreignField: '_id',
  justOne: true
});

DefenseSchema.virtual('juryDetails', {
  ref: 'Professor', // Assurez-vous que c'est 'Professor' si c'est le modèle correct
  localField: 'jury',
  foreignField: '_id'
});

const Defense = mongoose.model("Defense", DefenseSchema);

export default Defense;
