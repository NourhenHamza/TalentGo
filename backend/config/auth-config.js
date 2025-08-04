// auth-config.js
// Configuration flexible pour l'authentification selon l'environnement

/**
 * Configuration d'authentification adaptative
 * Bascule automatiquement entre Firebase (dev) et Apple/Google (prod)
 * basé sur les variables d'environnement
 */

class AuthConfig {
  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.isProduction = this.environment === 'production';
    this.isDevelopment = this.environment === 'development';
    
    // Configuration des providers disponibles
    this.providers = this.detectAvailableProviders();
  }

  /**
   * Détecter les providers d'authentification disponibles
   * selon l'environnement et la configuration
   */
  detectAvailableProviders() {
    const providers = {
      google: {
        available: !!process.env.GOOGLE_CLIENT_ID,
        clientId: process.env.GOOGLE_CLIENT_ID,
        environment: 'both' // Disponible en dev et prod
      },
      apple: {
        available: this.isAppleConfigured() && this.isProduction,
        clientId: process.env.APPLE_CLIENT_ID,
        teamId: process.env.APPLE_TEAM_ID,
        keyId: process.env.APPLE_KEY_ID,
        privateKey: process.env.APPLE_PRIVATE_KEY,
        environment: 'production' // Uniquement en production
      },
      firebase: {
        available: this.isFirebaseConfigured() && this.isDevelopment,
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.REACT_APP_FIREBASE_PROJECT_ID,
        environment: 'development' // Uniquement en développement
      }
    };

    return providers;
  }

  /**
   * Vérifier si Apple Sign-In est configuré
   */
  isAppleConfigured() {
    const requiredVars = [
      'APPLE_CLIENT_ID',
      'APPLE_TEAM_ID', 
      'APPLE_KEY_ID',
      'APPLE_PRIVATE_KEY'
    ];
    
    return requiredVars.every(varName => !!process.env[varName]);
  }

  /**
   * Vérifier si Firebase est configuré
   */
  isFirebaseConfigured() {
    // Vérifier les variables côté serveur
    const serverVars = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL'
    ];
    
    // Vérifier les variables côté client
    const clientVars = [
      'REACT_APP_FIREBASE_API_KEY',
      'REACT_APP_FIREBASE_AUTH_DOMAIN',
      'REACT_APP_FIREBASE_PROJECT_ID'
    ];
    
    const serverConfigured = serverVars.every(varName => !!process.env[varName]);
    const clientConfigured = clientVars.every(varName => !!process.env[varName]);
    
    // En développement, on peut fonctionner même sans Firebase configuré
    return this.isDevelopment ? true : (serverConfigured && clientConfigured);
  }

  /**
   * Obtenir les providers disponibles pour l'environnement actuel
   */
  getAvailableProviders() {
    const available = {};
    
    Object.keys(this.providers).forEach(providerName => {
      const provider = this.providers[providerName];
      if (provider.available) {
        available[providerName] = {
          name: providerName,
          configured: true,
          environment: provider.environment
        };
      }
    });
    
    return available;
  }

  /**
   * Obtenir la configuration pour le frontend
   */
  getFrontendConfig() {
    const config = {
      environment: this.environment,
      providers: {}
    };

    // Google
    if (this.providers.google.available) {
      config.providers.google = {
        enabled: true,
        clientId: this.providers.google.clientId
      };
    }

    // Apple (uniquement en production)
    if (this.providers.apple.available) {
      config.providers.apple = {
        enabled: true,
        clientId: this.providers.apple.clientId
      };
    }

    // Firebase (uniquement en développement)
    if (this.providers.firebase.available) {
      config.providers.firebase = {
        enabled: true,
        projectId: this.providers.firebase.projectId,
        developmentMode: true
      };
    }

    return config;
  }

  /**
   * Obtenir la configuration pour le backend
   */
  getBackendConfig() {
    return {
      environment: this.environment,
      providers: this.providers,
      security: {
        requireHttps: this.isProduction,
        allowTestUsers: this.isDevelopment,
        tokenExpiration: this.isProduction ? 3600 : 7200 // 1h en prod, 2h en dev
      }
    };
  }

  /**
   * Valider la configuration actuelle
   */
  validateConfiguration() {
    const issues = [];
    const warnings = [];

    // Vérifications pour la production
    if (this.isProduction) {
      if (!this.providers.apple.available && !this.providers.google.available) {
        issues.push('Aucun provider d\'authentification configuré pour la production');
      }
      
      if (!this.isAppleConfigured()) {
        warnings.push('Apple Sign-In n\'est pas configuré pour la production');
      }
    }

    // Vérifications pour le développement
    if (this.isDevelopment) {
      if (!this.providers.firebase.available && !this.providers.google.available) {
        warnings.push('Aucun provider d\'authentification configuré pour le développement');
      }
    }

    // Vérifications générales
    if (Object.keys(this.getAvailableProviders()).length === 0) {
      issues.push('Aucun provider d\'authentification disponible');
    }

    return {
      valid: issues.length === 0,
      issues,
      warnings,
      environment: this.environment,
      availableProviders: Object.keys(this.getAvailableProviders())
    };
  }

  /**
   * Obtenir les instructions de configuration manquantes
   */
  getConfigurationInstructions() {
    const instructions = [];

    if (this.isProduction && !this.isAppleConfigured()) {
      instructions.push({
        provider: 'Apple',
        environment: 'production',
        variables: [
          'APPLE_CLIENT_ID=com.votre-app.service-id',
          'APPLE_TEAM_ID=votre_team_id', 
          'APPLE_KEY_ID=votre_key_id',
          'APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nvotre_cle_privee\\n-----END PRIVATE KEY-----"'
        ],
        documentation: 'https://developer.apple.com/sign-in-with-apple/'
      });
    }

    if (this.isDevelopment && !this.isFirebaseConfigured()) {
      instructions.push({
        provider: 'Firebase',
        environment: 'development',
        variables: [
          'FIREBASE_PROJECT_ID=votre-projet-dev',
          'FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----"',
          'FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@votre-projet.iam.gserviceaccount.com',
          'REACT_APP_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          'REACT_APP_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com',
          'REACT_APP_FIREBASE_PROJECT_ID=votre-projet-dev'
        ],
        documentation: 'https://console.firebase.google.com'
      });
    }

    if (!this.providers.google.available) {
      instructions.push({
        provider: 'Google',
        environment: 'both',
        variables: [
          'GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com'
        ],
        documentation: 'https://console.developers.google.com'
      });
    }

    return instructions;
  }

  /**
   * Générer un rapport de configuration
   */
  generateConfigReport() {
    const validation = this.validateConfiguration();
    const instructions = this.getConfigurationInstructions();
    
    return {
      environment: this.environment,
      timestamp: new Date().toISOString(),
      validation,
      providers: this.getAvailableProviders(),
      frontend: this.getFrontendConfig(),
      backend: this.getBackendConfig(),
      missingConfiguration: instructions,
      recommendations: this.getRecommendations()
    };
  }

  /**
   * Obtenir des recommandations basées sur l'environnement
   */
  getRecommendations() {
    const recommendations = [];

    if (this.isDevelopment) {
      recommendations.push({
        type: 'development',
        message: 'Utilisez Firebase pour créer des utilisateurs de test rapidement',
        action: 'Configurez Firebase Authentication dans votre projet'
      });
      
      if (this.providers.google.available) {
        recommendations.push({
          type: 'development',
          message: 'Google Sign-In est disponible pour tester l\'authentification réelle',
          action: 'Utilisez Google comme alternative à Firebase'
        });
      }
    }

    if (this.isProduction) {
      recommendations.push({
        type: 'production',
        message: 'Configurez Apple Sign-In pour une meilleure expérience utilisateur iOS',
        action: 'Ajoutez les variables d\'environnement Apple'
      });
      
      recommendations.push({
        type: 'security',
        message: 'Assurez-vous que HTTPS est activé en production',
        action: 'Vérifiez la configuration SSL/TLS'
      });
    }

    return recommendations;
  }
}

// Instance singleton
const authConfig = new AuthConfig();

// Fonctions utilitaires
export const getAuthConfig = () => authConfig;
export const getAvailableProviders = () => authConfig.getAvailableProviders();
export const getFrontendConfig = () => authConfig.getFrontendConfig();
export const getBackendConfig = () => authConfig.getBackendConfig();
export const validateAuthConfig = () => authConfig.validateConfiguration();
export const getConfigReport = () => authConfig.generateConfigReport();

// Middleware Express pour injecter la configuration d'auth
export const authConfigMiddleware = (req, res, next) => {
  req.authConfig = authConfig;
  next();
};

// Fonction pour vérifier si un provider est disponible
export const isProviderAvailable = (providerName) => {
  const available = authConfig.getAvailableProviders();
  return !!available[providerName];
};

// Fonction pour obtenir le provider recommandé pour l'environnement
export const getRecommendedProvider = () => {
  const available = authConfig.getAvailableProviders();
  
  if (authConfig.isDevelopment) {
    if (available.firebase) return 'firebase';
    if (available.google) return 'google';
  }
  
  if (authConfig.isProduction) {
    if (available.apple) return 'apple';
    if (available.google) return 'google';
  }
  
  return Object.keys(available)[0] || null;
};

export default authConfig;

