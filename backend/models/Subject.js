// models/Subject.js

import mongoose from 'mongoose';

const SPECIALITIES = [
  'AI',
  'Machine Learning',
  'Web Development',
  'Cybersecurity',
  'Data Science',
  'Cloud Computing',
  'IoT',
  'Blockchain',
  'Mobile Development',
  'DevOps',
  'Big Data',
  'Computer Vision',
  'NLP'
];

const subjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  technologies: {
    type: [String],
    default: []
  },
  company: { // Ce champ pourrait être lié à un futur modèle 'Company'
    type: String,
    required: true
  },
  proposedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Peut être 'User' (Student) ou 'Professor'
    required: true
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professor'
  },
  status: {
    type: String,
    enum: ['suggested', 'pending', 'approved', 'rejected'],
    default: 'suggested'
  },
  feedback: { 
    type: String 
  },
  speciality: {
    type: [String],
    enum: SPECIALITIES,
    required: true,
    validate: {
      validator: function (specialities) {
        return specialities && specialities.length > 0;
      },
      message: 'At least one speciality is required'
    }
  },
  // --- AJOUT NÉCESSAIRE ---
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: true // Un sujet appartient toujours à une université
  }
}, {
  timestamps: true
});

subjectSchema.index({
  title: 'text',
  description: 'text',
  technologies: 'text',
  speciality: 'text'
});

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;