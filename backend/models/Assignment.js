// models/Assignment.js

import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assumant que 'User' est votre modèle Student
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  professor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professor', // Référence au modèle Professor
    required: true
  },
  status: {
    type: String,
    enum: ['assigned', 'confirmed', 'rejected'],
    default: 'assigned'
  },
  // --- AJOUT NÉCESSAIRE ---
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: true // Une affectation appartient toujours à une université
  }
}, {
  timestamps: true
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;
