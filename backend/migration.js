import mongoose from 'mongoose';
import CV from './models/CV.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateCVs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connexion à MongoDB établie');

    const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
    
    // Récupérer tous les CV qui n'ont pas d'originalName ou fileUrl
    const cvsToUpdate = await CV.find({
      $or: [
        { originalName: { $exists: false } },
        { fileUrl: { $exists: false } }
      ]
    });

    console.log(`${cvsToUpdate.length} CV(s) à mettre à jour`);

    for (const cv of cvsToUpdate) {
      const updates = {};
      
      // Ajouter originalName si manquant
      if (!cv.originalName) {
        updates.originalName = cv.filename;
      }
      
      // Ajouter fileUrl si manquant
      if (!cv.fileUrl) {
        updates.fileUrl = `${baseUrl}/api/uploads/cvs/${cv.filename}`;
      }
      
      await CV.findByIdAndUpdate(cv._id, updates);
      console.log(`CV mis à jour: ${cv._id}`);
    }

    console.log('Migration terminée avec succès');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    process.exit(1);
  }
};

migrateCVs();