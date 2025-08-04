// models/ProvisionalProfessor.js

import mongoose from 'mongoose';

const provisionalProfessorSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email']
  },
  token: { type: String, required: false },
  createdAt: { type: Date, default: Date.now, expires: '24h' }, // Expire après 24h
  // Rendre university optionnel ou fournir une valeur par défaut
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: false // Changé de true à false
  }
});

export default mongoose.model('ProvisionalProfessor', provisionalProfessorSchema);