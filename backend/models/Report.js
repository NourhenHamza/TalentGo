// models/Report.js

import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
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
  fileUrl: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['weekly', 'final'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'validated','rejected'],
    default: 'pending'
  },
  feedback: {
    type: String,
    default: ''
  },

}, {
  timestamps: true
});

const Report = mongoose.model('Report', reportSchema);

export default Report;
