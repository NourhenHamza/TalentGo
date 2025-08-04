// Fixed cvRoutes.js with better error handling and debugging
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadCV, getMyCVs, getCVFile, getPrimaryCV, getActiveCV, deleteCV } from '../controllers/cvController.js';
import authUser from '../middlewars/authUser.js';

const router = express.Router();

// Créer le dossier uploads/cvs s'il n'existe pas
const uploadDir = 'uploads/cvs/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Dossier créé:', uploadDir);
}

// Configuration de multer pour l'upload de CV
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('📁 Destination multer:', uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'cv-' + uniqueSuffix + path.extname(file.originalname);
    console.log('📝 Nom de fichier généré:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (req, file, cb) => {
    console.log('🔍 Vérification du fichier:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      fieldname: file.fieldname,
      size: file.size
    });
    
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont autorisés!'), false);
    }
  }
});

// Middleware de logging pour debug
const logMiddleware = (routeName) => (req, res, next) => {
  console.log(`🎯 Route ${routeName} appelée`);
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Content-Length:', req.headers['content-length']);
  console.log('Authorization:', req.headers.authorization ? 'Present' : 'Missing');
  console.log('Cookies:', Object.keys(req.cookies || {}));
  next();
};

// FIXED: Removed checkAuth middleware that was causing issues
// The authUser middleware will handle authentication after multer

// Routes with improved error handling
router.post('/upload', 
  logMiddleware('POST /upload'),
  upload.single('cv'), // Process file first
  (req, res, next) => {
    console.log('📤 Middleware multer terminé');
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);
    console.log('req.headers:', req.headers);
    
    // More detailed debugging
    if (!req.file) {
      console.log('❌ Aucun fichier reçu par multer');
      console.log('❌ Debugging info:');
      console.log('  - Content-Type:', req.headers['content-type']);
      console.log('  - Content-Length:', req.headers['content-length']);
      console.log('  - Body keys:', Object.keys(req.body || {}));
      console.log('  - Files:', req.files);
      
      return res.status(400).json({
        success: false,
        message: "Aucun fichier CV n'a été fourni. Vérifiez que le champ 'cv' est présent dans votre FormData.",
        debug: {
          contentType: req.headers['content-type'],
          contentLength: req.headers['content-length'],
          bodyKeys: Object.keys(req.body || {}),
          hasFiles: !!req.files
        }
      });
    }
    
    next();
  },
  authUser, // Then authenticate
  (req, res, next) => {
    console.log('🔐 Middleware authUser terminé pour upload');
    console.log('req.user après auth:', req.user);
    
    if (!req.user) {
      console.log('❌ Authentification échouée');
      // Clean up uploaded file if auth fails
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Erreur suppression fichier:', err);
        });
      }
      return res.status(401).json({
        success: false,
        message: "Authentification requise."
      });
    }
    
    next();
  },
  uploadCV
);

// Other routes remain the same...
router.get('/my-cvs', 
  logMiddleware('GET /my-cvs'),
  authUser, 
  getMyCVs
);

router.get('/file/:filename', 
  logMiddleware('GET /file/:filename'),
  getCVFile
);

router.get('/primary-cv', 
  logMiddleware('GET /primary-cv'),
  authUser, 
  (req, res, next) => {
    console.log('🔐 Middleware authUser terminé pour primary-cv');
    console.log('req.user après auth:', req.user);
    next();
  },
  getPrimaryCV
);

router.get('/active-cv', 
  logMiddleware('GET /active-cv'),
  authUser, 
  getActiveCV
);

router.delete('/:cvId', 
  logMiddleware('DELETE /:cvId'),
  authUser, 
  deleteCV
);

// Enhanced error handling for multer
router.use((error, req, res, next) => {
  console.error('❌ Erreur multer détaillée:', error);
  console.error('❌ Stack:', error.stack);
  
  if (error instanceof multer.MulterError) {
    console.error('❌ Type d\'erreur multer:', error.code);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Le fichier est trop volumineux. Taille maximale: 5MB.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Nom de champ de fichier incorrect. Utilisez "cv".',
        debug: {
          field: error.field,
          expectedField: 'cv'
        }
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Trop de fichiers. Un seul fichier autorisé.'
      });
    }
    
    return res.status(400).json({
      success: false,
      message: `Erreur d'upload: ${error.message}`,
      code: error.code
    });
  }
  
  if (error.message === 'Seuls les fichiers PDF sont autorisés!') {
    return res.status(400).json({
      success: false,
      message: 'Seuls les fichiers PDF sont autorisés!'
    });
  }
  
  // Generic error
  console.error('❌ Erreur générique:', error);
  res.status(500).json({
    success: false,
    message: 'Erreur serveur lors du traitement du fichier.',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

export default router;