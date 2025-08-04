// firebase-config.js
// Configuration Firebase pour l'environnement de développement

// Configuration côté client (Frontend React)
export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "your-api-key-here",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// Configuration côté serveur (Backend Node.js)
export const firebaseAdminConfig = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID || "your-project-id",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "key-id",
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  client_email: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  client_id: process.env.FIREBASE_CLIENT_ID || "123456789",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL || "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com"
};

// Fonction pour vérifier si Firebase est configuré
export const isFirebaseConfigured = () => {
  const requiredEnvVars = [
    'REACT_APP_FIREBASE_API_KEY',
    'REACT_APP_FIREBASE_AUTH_DOMAIN',
    'REACT_APP_FIREBASE_PROJECT_ID'
  ];
  
  return requiredEnvVars.every(envVar => process.env[envVar]);
};

// Fonction pour vérifier si Firebase Admin est configuré
export const isFirebaseAdminConfigured = () => {
  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL'
  ];
  
  return requiredEnvVars.every(envVar => process.env[envVar]);
};

// Configuration pour l'environnement de développement
export const devAuthConfig = {
  // Utilisateurs de test prédéfinis pour le développement
  testUsers: [
    {
      uid: 'dev-user-1',
      email: 'test1@example.com',
      displayName: 'Utilisateur Test 1',
      firstName: 'Jean',
      lastName: 'Dupont',
      provider: 'firebase-dev'
    },
    {
      uid: 'dev-user-2', 
      email: 'test2@example.com',
      displayName: 'Utilisateur Test 2',
      firstName: 'Marie',
      lastName: 'Martin',
      provider: 'firebase-dev'
    },
    {
      uid: 'dev-user-3',
      email: 'test3@example.com', 
      displayName: 'Utilisateur Test 3',
      firstName: 'Pierre',
      lastName: 'Durand',
      provider: 'firebase-dev'
    }
  ],
  
  // Configuration pour créer des utilisateurs temporaires
  tempUserConfig: {
    domain: '@dev-test.local',
    passwordDefault: 'DevTest123!',
    autoVerifyEmail: true
  }
};

// Fonction utilitaire pour générer un utilisateur de test
export const generateTestUser = (index = 1) => {
  const firstNames = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Paul', 'Julie', 'Marc', 'Anne'];
  const lastNames = ['Dupont', 'Martin', 'Durand', 'Moreau', 'Petit', 'Robert', 'Richard', 'Michel'];
  
  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[index % lastNames.length];
  
  return {
    uid: `dev-user-${Date.now()}-${index}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}${devAuthConfig.tempUserConfig.domain}`,
    displayName: `${firstName} ${lastName}`,
    firstName,
    lastName,
    provider: 'firebase-dev',
    emailVerified: true,
    createdAt: new Date().toISOString()
  };
};

export default {
  firebaseConfig,
  firebaseAdminConfig,
  isFirebaseConfigured,
  isFirebaseAdminConfigured,
  devAuthConfig,
  generateTestUser
};

