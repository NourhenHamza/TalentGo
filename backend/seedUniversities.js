import mongoose from 'mongoose';
import University from './models/University.js'; // Assure-toi que ce chemin est correct

// Connexion à la base de données
const mongoURI = 'mongodb://localhost:27017/pfe_management_db';

try {
  await mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('✅ Connecté à MongoDB');

  // Universités à insérer
  const universities = [
    {
      name: 'ESPRIT',
      status: 'approved',
      description: 'École Supérieure Privée d\'Ingénierie et de Technologie.',
      address: {
        street: 'Rue de l’innovation',
        city: 'Ariana',
        zipCode: '2083',
        country: 'Tunisie',
      },
      contactPerson: {
        name: 'Mme Amal Trabelsi',
        email: 'contact@esprit.tn',
        phone: '+21671234567',
      },
      logo: 'https://www.esprit.tn/logo.png',
    },
    {
      name: 'FST',
      status: 'approved',
      description: 'Faculté des Sciences de Tunis.',
      address: {
        street: 'Campus Universitaire El Manar',
        city: 'Tunis',
        zipCode: '2092',
        country: 'Tunisie',
      },
      contactPerson: {
        name: 'Dr Karim Ben Rejeb',
        email: 'fst@univ.tn',
        phone: '+21671345678',
      },
      logo: 'https://www.fst.rnu.tn/logo.png',
    },
  ];

  // Suppression et insertion
  await University.deleteMany();
  await University.insertMany(universities);

  console.log('🎉 Universités insérées avec succès');
  process.exit();
} catch (error) {
  console.error('❌ Erreur d\'insertion :', error);
  process.exit(1);
}
