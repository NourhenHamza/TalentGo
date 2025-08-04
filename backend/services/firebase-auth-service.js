// services/firebase-auth-service.js
// Service d'authentification Firebase pour le développement

import crypto from 'crypto';
import admin from 'firebase-admin';

class FirebaseAuthService {
  constructor() {
    this.initialized = false;
    this.testUsers = [];
    this.initializeFirebase();
    this.generateTestUsers();
  }

  initializeFirebase() {
    try {
      // Vérifier si Firebase est déjà initialisé
      if (admin.apps.length > 0) {
        this.initialized = true;
        return;
      }

      // Configuration Firebase Admin
      const firebaseConfig = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
      };

      // Vérifier que les variables d'environnement sont présentes
      if (!firebaseConfig.projectId || !firebaseConfig.privateKey || !firebaseConfig.clientEmail) {
        console.warn('Configuration Firebase incomplète. Mode simulation activé.');
        this.initialized = false;
        return;
      }

      // Initialiser Firebase Admin
      admin.initializeApp({
        credential: admin.credential.cert(firebaseConfig),
        projectId: firebaseConfig.projectId
      });

      this.initialized = true;
      console.log('Firebase Admin initialisé avec succès');

    } catch (error) {
      console.warn('Erreur lors de l\'initialisation Firebase:', error.message);
      console.warn('Mode simulation Firebase activé');
      this.initialized = false;
    }
  }

  generateTestUsers() {
    // Utilisateurs de test prédéfinis pour le développement
    this.testUsers = [
      {
        uid: 'dev-user-001',
        email: 'jean.dupont@dev-test.local',
        displayName: 'Jean Dupont',
        firstName: 'Jean',
        lastName: 'Dupont',
        emailVerified: true,
        photoURL: null,
        disabled: false,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString()
        }
      },
      {
        uid: 'dev-user-002',
        email: 'marie.martin@dev-test.local',
        displayName: 'Marie Martin',
        firstName: 'Marie',
        lastName: 'Martin',
        emailVerified: true,
        photoURL: null,
        disabled: false,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString()
        }
      },
      {
        uid: 'dev-user-003',
        email: 'pierre.bernard@dev-test.local',
        displayName: 'Pierre Bernard',
        firstName: 'Pierre',
        lastName: 'Bernard',
        emailVerified: true,
        photoURL: null,
        disabled: false,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString()
        }
      },
      {
        uid: 'dev-user-004',
        email: 'sophie.dubois@dev-test.local',
        displayName: 'Sophie Dubois',
        firstName: 'Sophie',
        lastName: 'Dubois',
        emailVerified: true,
        photoURL: null,
        disabled: false,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString()
        }
      },
      {
        uid: 'dev-user-005',
        email: 'thomas.petit@dev-test.local',
        displayName: 'Thomas Petit',
        firstName: 'Thomas',
        lastName: 'Petit',
        emailVerified: true,
        photoURL: null,
        disabled: false,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString()
        }
      }
    ];
  }

  getTestUsers() {
    return this.testUsers;
  }

  async verifyToken(idToken) {
    try {
      if (!this.initialized) {
        throw new Error('Firebase non initialisé - mode simulation');
      }

      // Vérifier le token avec Firebase Admin
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      // Récupérer les informations utilisateur
      const userRecord = await admin.auth().getUser(decodedToken.uid);
      
      return {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        displayName: userRecord.displayName,
        firstName: userRecord.displayName?.split(' ')[0] || '',
        lastName: userRecord.displayName?.split(' ').slice(1).join(' ') || '',
        photoURL: userRecord.photoURL,
        isDevelopment: process.env.NODE_ENV === 'development'
      };

    } catch (error) {
      console.error('Erreur lors de la vérification du token Firebase:', error);
      throw new Error('Token Firebase invalide');
    }
  }

  async createTestUser() {
    try {
      // Générer un utilisateur temporaire unique
      const timestamp = Date.now();
      const randomId = crypto.randomBytes(4).toString('hex');
      
      const tempUser = {
        uid: `temp-user-${timestamp}-${randomId}`,
        email: `user-${timestamp}@dev-test.local`,
        displayName: this.generateRandomName(),
        emailVerified: true,
        photoURL: null,
        disabled: false,
        isTemporary: true,
        createdAt: new Date().toISOString(),
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString()
        }
      };

      // Ajouter les noms séparés
      const nameParts = tempUser.displayName.split(' ');
      tempUser.firstName = nameParts[0];
      tempUser.lastName = nameParts.slice(1).join(' ');

      // En mode simulation, on retourne directement l'utilisateur
      if (!this.initialized) {
        return tempUser;
      }

      // En mode Firebase réel, créer l'utilisateur
      try {
        const userRecord = await admin.auth().createUser({
          uid: tempUser.uid,
          email: tempUser.email,
          displayName: tempUser.displayName,
          emailVerified: true,
          disabled: false
        });

        return {
          ...tempUser,
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName
        };

      } catch (firebaseError) {
        console.warn('Erreur Firebase lors de la création:', firebaseError.message);
        // Retourner l'utilisateur simulé en cas d'erreur
        return tempUser;
      }

    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur de test:', error);
      throw new Error('Impossible de créer un utilisateur de test');
    }
  }

  generateRandomName() {
    const firstNames = [
      'Alexandre', 'Amélie', 'Antoine', 'Camille', 'Charlotte', 'Clément', 
      'Emma', 'Hugo', 'Julie', 'Lucas', 'Manon', 'Maxime', 'Nathan', 
      'Océane', 'Paul', 'Sarah', 'Thomas', 'Valentine'
    ];
    
    const lastNames = [
      'Bernard', 'Blanc', 'Bonnet', 'Dubois', 'Durand', 'Fournier', 
      'Garcia', 'Girard', 'Lambert', 'Leroy', 'Martin', 'Moreau', 
      'Petit', 'Richard', 'Robert', 'Roux', 'Simon', 'Thomas'
    ];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  }

  generateDevToken(user) {
    // Générer un token de développement simple (non sécurisé, uniquement pour les tests)
    const payload = {
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      dev: true,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 heure
    };

    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  async deleteTestUser(uid) {
    try {
      if (!this.initialized) {
        console.log(`Simulation: suppression de l'utilisateur ${uid}`);
        return true;
      }

      await admin.auth().deleteUser(uid);
      console.log(`Utilisateur de test ${uid} supprimé`);
      return true;

    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      return false;
    }
  }

  // Méthode pour nettoyer les utilisateurs temporaires (à appeler périodiquement)
  async cleanupTempUsers() {
    try {
      if (!this.initialized) {
        console.log('Simulation: nettoyage des utilisateurs temporaires');
        return;
      }

      // Récupérer tous les utilisateurs
      const listUsersResult = await admin.auth().listUsers();
      const now = Date.now();
      const oneHourAgo = now - (60 * 60 * 1000); // 1 heure

      for (const userRecord of listUsersResult.users) {
        // Supprimer les utilisateurs temporaires créés il y a plus d'1 heure
        if (userRecord.uid.startsWith('temp-user-')) {
          const creationTime = new Date(userRecord.metadata.creationTime).getTime();
          if (creationTime < oneHourAgo) {
            await this.deleteTestUser(userRecord.uid);
          }
        }
      }

    } catch (error) {
      console.error('Erreur lors du nettoyage des utilisateurs temporaires:', error);
    }
  }

  isInitialized() {
    return this.initialized;
  }

  getStatus() {
    return {
      initialized: this.initialized,
      mode: this.initialized ? 'Firebase réel' : 'Simulation',
      testUsersCount: this.testUsers.length,
      projectId: process.env.FIREBASE_PROJECT_ID || 'Non configuré'
    };
  }
}

// Créer une instance unique du service
const firebaseAuthService = new FirebaseAuthService();

export default firebaseAuthService;

