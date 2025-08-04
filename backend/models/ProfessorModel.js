// models/Professor.js

import mongoose from "mongoose";

const ProfessorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"]
    },
    profile: {
      phone: {
        type: String,
        match: [/^\+?[\d\s-]+$/, "Invalid phone number format"]
      },
      linkedin: {
        type: String,
        match: [/^https?:\/\/(www\. )?linkedin\.com\/.+/i, "Invalid LinkedIn URL"]
      },
      bio: { type: String }
    },
    professorData: {
      maxStudents: {
        type: Number,
        default: 5,
        min: [1, "Max students must be at least 1"]
      },
      currentStudents: {
        type: Number,
        default: 0,
        min: [0, "Current students cannot be negative"]
      },
      maxDefenses: {
        type: Number,
        default: 10,
        min: [1, "Max defenses must be at least 1"]
      },
      currentDefenses: {
        type: Number,
        default: 0,
        min: [0, "Current defenses cannot be negative"]
      }
    },
    preferences: {
      type: [String],  // Array of specialties
      default: [],
      validate: {
        validator: (prefs) => prefs.every(p => typeof p === 'string' && p.trim().length > 0),
        message: "Preferences must be non-empty strings"
      }
    },
    // --- AJOUT NÉCESSAIRE ---
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true // Un professeur est toujours rattaché à une université
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Professor", ProfessorSchema);
