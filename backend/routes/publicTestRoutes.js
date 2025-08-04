// routes/publicTestRoutes.js - VERSION CORRIGÉE
import express from 'express';
import multer from 'multer';
import {
  accessPublicTest,
  downloadCV,
  getPublicApplicationDetails,
  getTestUsers,
  handleAppleAuth,
  handleFirebaseAuth,
  handleGoogleAuth,
  submitPublicApplication,
  submitTestResults,
  uploadCV,
  validateAppleAuthMiddleware
} from '../controllers/publicTestController.js';

const router = express.Router();
console.log('✅ publicTestRoutes.js a été chargé.');

// IMPORTANT: L'ordre des routes est crucial - les routes spécifiques doivent être AVANT les routes avec paramètres

// Routes pour l'authentification (PLACÉES EN PREMIER)
// POST /api/public-test/auth/google
router.post('/auth/google', handleGoogleAuth);

// Ajout d'une route GET pour /auth/google pour capturer les requêtes inattendues
router.get('/auth/google', (req, res) => {
  console.log(`⚠️ Requête GET inattendue sur /api/public-test/auth/google. La méthode attendue est POST.`);
  res.status(405).json({
    message: 'Méthode non autorisée. Veuillez utiliser la méthode POST pour l\'authentification Google.',
    path: req.path,
    method: req.method,
    originalUrl: req.originalUrl
  });
});

// POST /api/public-test/auth/apple
router.post('/auth/apple', validateAppleAuthMiddleware, handleAppleAuth);

// POST /api/public-test/auth/firebase
router.post('/auth/firebase', handleFirebaseAuth);

// Routes de développement (PLACÉES EN DEUXIÈME)
// GET /api/public-test/dev/test-users
router.get('/dev/test-users', getTestUsers);

// Routes pour les candidatures (PLACÉES EN TROISIÈME)
// GET /api/public-test/application/:applicationId
router.get('/application/:applicationId', getPublicApplicationDetails);

// GET /api/public-test/application/:applicationId/cv
router.get('/application/:applicationId/cv', downloadCV);

// Routes avec UUID (PLACÉES EN DERNIER car elles sont plus génériques)
// GET /api/public-test/:uuid
router.get('/:uuid', accessPublicTest);

// POST /api/public-test/:uuid/apply
router.post('/:uuid/apply', uploadCV, submitPublicApplication);

// POST /api/public-test/:uuid/submit-results
router.post('/:uuid/submit-results', submitTestResults);

// Middleware de gestion d'erreurs pour multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Le fichier est trop volumineux. Taille maximale: 5 MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Trop de fichiers. Un seul CV est autorisé'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Champ de fichier inattendu'
      });
    }
  }
  
  if (error.message.includes('Type de fichier non autorisé')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
});

// Middleware de gestion d'erreur générale
router.use((error, req, res, next) => {
  console.error('Erreur dans publicTestRoutes:', error);
  
  res.status(500).json({
    success: false,
    message: 'Erreur serveur interne',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Middleware pour les routes non trouvées (PLACÉ À LA TOUTE FIN)
router.use((req, res, next) => {
  console.log(`❌ La requête ${req.method} ${req.originalUrl} a atteint la fin du routeur publicTestRoutes sans trouver de correspondance.`);
  res.status(404).json({
    message: 'Route non trouvée à l\'intérieur de publicTestRoutes',
    path: req.path,
    method: req.method,
    originalUrl: req.originalUrl
  });
});

export default router;