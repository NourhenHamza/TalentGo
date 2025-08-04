// models/University.js

import mongoose from "mongoose";

const UniversitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de l\'université est requis'],
    unique: true, // Chaque université doit avoir un nom unique
    trim: true, // Supprime les espaces blancs au début et à la fin
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'], // Statuts possibles pour une université
    default: 'pending', // Par défaut, une nouvelle demande est en attente
    required: true,
  },
  description: {
    type: String,
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères'],
  },
  address: {
    street: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
  },
  contactPerson: { // La personne de contact initiale pour l'université
    name: {
      type: String,
      required: [true, 'Le nom de la personne de contact est requis'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'L\'email de la personne de contact est requis'],
      unique: true, // L'email de contact doit être unique
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Veuillez ajouter une adresse email valide',
      ],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  logo: { // URL vers le logo de l'université
    type: String,
    default: 'no-photo.jpg', // Un logo par défaut si non fourni
  },
  // AJOUTEZ CE BLOC
  loginCredentials: {
    email: {
      type: String,
      unique: true, // Assurez-vous que l'email de connexion est unique
      sparse: true, // Permet les valeurs nulles pour les champs uniques (pour les universités qui n'ont pas encore de login)
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Veuillez ajouter une adresse email valide',
      ],
      trim: true,
    },
    password: {
      type: String,
      select: false, // Ne pas renvoyer le mot de passe par défaut lors des requêtes
    },
    lastLogin: {
      type: Date,
    },
  },
  // FIN DE L'AJOUT
}, {
  timestamps: true, // Ajoute automatiquement createdAt et updatedAt
});

const University = mongoose.model('University', UniversitySchema);
 
export default University;
 