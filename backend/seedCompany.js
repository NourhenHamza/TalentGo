// seeds/seedCompany.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from './models/Company.js'; // adjust the path if needed

dotenv.config();

const seedCompany = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Optional: Clear existing companies first
    await Company.deleteMany();

    // Add one or more company documents
    const company = await Company.create({
      nom: "TechNova",
      status: "approved",
      adresse: "123 Rue des Innovations",
      ville: "Paris",
      code_postal: "75001",
      pays: "France",
      email_contact: "contact@technova.com",
      telephone_contact: "+33 1 23 45 67 89",
      description: "Entreprise innovante dans la tech",
      secteur_activite: "Technologie",
      site_web: "https://www.technova.com",
      logo_url: "https://example.com/logo.png",
      password: "123456789", // will be hashed by pre-save hook
      approvedAt: new Date(),
      registrationCompletedAt: new Date(),
    });

    console.log('Company seeded:', company.nom);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding company:', error);
    process.exit(1);
  }
};

seedCompany();
