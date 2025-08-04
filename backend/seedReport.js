// seedReport.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Report from './models/Report.js'; // adjust path if needed

dotenv.config(); // Load MongoDB URI from .env

// Replace with your actual MongoDB URI if not using .env
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pfe_management_db';

const seedReport = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected');

    const reportData = {
      student: '685fe3d14e873d4b06feef72',
      subject: '685feeb5c4de7a7915f63dc8',
      fileUrl: 'https://github.com/Ouchemeya/Client-Serveur-RMI', // Replace with real file URL
      type: 'final',
      status: 'validated',
      feedback: 'Excellent work. All objectives met and well documented.'
    };

    const report = new Report(reportData);
    await report.save();

    console.log('✅ Report seeded:', report);
  } catch (error) {
    console.error('❌ Error seeding report:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

seedReport();
