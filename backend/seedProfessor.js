// seedProfessor.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Professor from './models/ProfessorModel.js'; // Adjust the path if needed
import University from './models/University.js'; // Needed to get a valid university _id

dotenv.config();

// Replace with your MongoDB URI
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pfe_management_db';

async function seedProfessor() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    // Find one university to associate the professor with
    const university = await University.findOne();
    if (!university) {
      console.error("No university found. Please seed a university first.");
      return;
    }

    const newProfessor = new Professor({
      name: "Dr. Sarah Ben Salem",
      email: "sarah.bensalem@university.edu",
      password: "123456789", // Ideally, hash this in production
     
      professorData: {
        maxStudents: 8,
        currentStudents: 2,
        maxDefenses: 6,
        currentDefenses: 1
      },
      university: '6859d9f6ef9899d47d831234'
    });

    await newProfessor.save();
    console.log("Professor seeded successfully!");
  } catch (error) {
    console.error("Seeding error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seedProfessor();
