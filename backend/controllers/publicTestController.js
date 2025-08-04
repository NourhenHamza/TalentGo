// controllers/publicTestController.js - VERSION CORRIGÉE POUR EXPIRATION PAR DATE LIMITE SEULEMENT
import crypto from 'crypto';
import fs from 'fs';
import { OAuth2Client } from 'google-auth-library';
import jwt from "jsonwebtoken";
import multer from 'multer';
import path from 'path';
import OffreStageEmploi from '../models/OffreStageEmploi.js';
import PublicApplication from '../models/PublicApplication.js';
import firebaseAuthService from '../services/firebase-auth-service.js';

// Configuration Google OAuth
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Configuration du stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'public-cvs',
      new Date().getFullYear().toString(),
      (new Date().getMonth() + 1).toString().padStart(2, '0')
    );

    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${extension}`);
  }
});

// Configuration de multer pour les CVs
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé. Seuls PDF, DOC et DOCX sont acceptés.'));
    }
  }
});

// Middleware pour gérer l'upload de CV
export const uploadCV = upload.single('cv');

// MODIFIÉ: Fonction pour accéder au test via le lien public avec vérification de la date limite SEULEMENT
export const accessPublicTest = async (req, res) => {
  try {
    const { uuid } = req.params;
    console.log(`[accessPublicTest] Reçu UUID: ${uuid}`);

    const offre = await OffreStageEmploi.findOne({
      publicTestLink: uuid,
      publicTestEnabled: true,
      statut: 'active'
    })
    .populate('entreprise_id', 'nom logo secteur email_contact');

    if (!offre) {
      console.log(`[accessPublicTest] Offre non trouvée pour UUID: ${uuid}`);
      return res.status(404).json({
        success: false,
        message: "Lien de test invalide, expiré ou désactivé"
      });
    }

    const now = new Date();
    
    // NOUVEAU: Vérification de la date limite de candidature de l'offre
    const dateLimiteCandidature = new Date(offre.date_limite_candidature);
    if (now > dateLimiteCandidature) {
      console.log(`[accessPublicTest] Date limite de candidature dépassée pour UUID: ${uuid}. Date limite: ${dateLimiteCandidature}, Maintenant: ${now}`);
      return res.status(410).json({
        success: false,
        message: "La date limite de candidature pour cette offre est dépassée",
        details: {
          dateLimite: dateLimiteCandidature,
          dateActuelle: now
        }
      });
    }

    // L'ancienne vérification de l'expiration du lien (2 heures après génération) a été supprimée

    if (!offre.test || !offre.test.testName) {
      return res.status(400).json({
        success: false,
        message: "Aucun test valide n'est associé à cette offre"
      });
    }

    // AMÉLIORÉ: Données de test avec paramètres de sécurité complets
    const testData = {
      _id: offre._id,
      testName: offre.test.testName,
      description: offre.test.description,
      testDuration: offre.test.testDuration,
      instructions: offre.test.instructions,
      passingScore: offre.test.passingScore,
      maxAttempts: offre.test.maxAttempts,
      // NOUVEAU: Paramètres de sécurité complets avec valeurs par défaut
      security: {
        preventCopy: offre.test.security?.preventCopy || false,
        timeLimit: offre.test.security?.timeLimit || true,
        showResults: offre.test.security?.showResults || true,
        allowBackNavigation: offre.test.security?.allowBackNavigation || false,
        preventTabSwitch: offre.test.security?.preventTabSwitch || false,
        fullscreenMode: offre.test.security?.fullscreenMode || false,
        preventDevTools: offre.test.security?.preventDevTools || false
      },
      questions: offre.test.questions.map(q => ({
        question: q.question,
        options: q.options,
        points: q.points || 1,
        explanation: q.explanation,
        // Note: correctAnswer n'est pas inclus pour des raisons de sécurité
      }))
    };

    const offerData = {
      _id: offre._id,
      titre: offre.titre,
      description: offre.description,
      type_offre: offre.type_offre,
      localisation: offre.localisation,
      competences_requises: offre.competences_requises,
      date_limite_candidature: offre.date_limite_candidature,
      remuneration: offre.remuneration,
      hasRemuneration: offre.hasRemuneration,
      entreprise: {
        nom: offre.entreprise_id.nom,
        logo: offre.entreprise_id.logo,
        secteur: offre.entreprise_id.secteur
      }
    };

    // NOUVEAU: Informations sur les délais d'expiration
    const expirationInfo = {
      dateLimiteCandidature: dateLimiteCandidature,
      tempsRestantCandidature: Math.max(0, dateLimiteCandidature - now),
    };

    res.status(200).json({
      success: true,
      data: {
        test: testData,
        offer: offerData,
        publicLink: uuid,
        expirationInfo: expirationInfo,
        authMethods: {
          google: !!process.env.GOOGLE_CLIENT_ID,
          apple: !!process.env.APPLE_CLIENT_ID && process.env.NODE_ENV === 'production',
          firebase: process.env.NODE_ENV === 'development'
        }
      }
    });

  } catch (error) {
    console.error('[accessPublicTest] Erreur lors de l\'accès au test public:', error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'accès au test"
    });
  }
};

// MODIFIÉ: Gestion Google Auth avec vérification de la date limite
export const handleGoogleAuth = async (req, res) => {
  try {
    const { credential, uuid } = req.body;
    console.log(`[handleGoogleAuth] Reçu UUID: ${uuid}`);

    if (!credential) {
      return res.status(400).json({ success: false, message: "Token Google manquant" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      return res.status(400).json({ success: false, message: "Token Google invalide" });
    }

    const offre = await OffreStageEmploi.findOne({
      publicTestLink: uuid,
      publicTestEnabled: true,
      statut: 'active'
    });

    if (!offre) {
      console.log(`[handleGoogleAuth] Offre non trouvée pour UUID: ${uuid}.`);
      return res.status(404).json({ success: false, message: "Offre non trouvée" });
    }

    // NOUVEAU: Vérification de la date limite de candidature
    const now = new Date();
    const dateLimiteCandidature = new Date(offre.date_limite_candidature);
    if (now > dateLimiteCandidature) {
      console.log(`[handleGoogleAuth] Date limite de candidature dépassée pour UUID: ${uuid}`);
      return res.status(410).json({ 
        success: false, 
        message: "La date limite de candidature pour cette offre est dépassée" 
      });
    }

    const existingApplication = await PublicApplication.findOne({
      offre_id: offre._id,
      'authentication.providerId': payload.sub,
      'authentication.provider': 'google'
    });

    // AMÉLIORÉ: Vérification des tentatives pour utilisateur existant
    if (existingApplication) {
      // Vérifier si l'utilisateur a dépassé le nombre maximum de tentatives
      const testAttempts = existingApplication.testAttempts || 0;
      const maxAttempts = offre.test?.maxAttempts || null;
      
      let canRetakeTest = true;
      if (maxAttempts && testAttempts >= maxAttempts) {
        canRetakeTest = false;
      }

      return res.status(200).json({
        success: true,
        message: "Utilisateur déjà authentifié",
        data: {
          applicationId: existingApplication._id,
          user: {
            firstName: existingApplication.personalInfo.firstName,
            lastName: existingApplication.personalInfo.lastName,
            email: existingApplication.personalInfo.email,
            provider: existingApplication.authentication.provider,
            providerId: existingApplication.authentication.providerId
          },
          testStatus: {
            attempts: testAttempts,
            maxAttempts: maxAttempts,
            canRetakeTest: canRetakeTest,
            hasCompletedTest: !!existingApplication.testResult?.completedAt
          },
          nextStep: offre.test ? (canRetakeTest ? 'test' : 'complete') : 'complete'
        }
      });
    }

    // AMÉLIORÉ: Nouvel utilisateur avec initialisation des tentatives
    const newApplication = new PublicApplication({
      offre_id: offre._id,
      personalInfo: {
        firstName: payload.given_name || '',
        lastName: payload.family_name || '',
        email: payload.email
      },
      applicationType: offre.type_offre,
      authentication: {
        provider: 'google',
        providerId: payload.sub,
        verifiedEmail: payload.email,
        verificationDate: new Date(),
        providerData: {
          name: payload.name,
          picture: payload.picture,
          locale: payload.locale
        }
      },
      // NOUVEAU: Initialisation des données de test
      testAttempts: 0,
      securityViolations: [],
      sessionData: {
        publicTestLink: uuid,
        accessedAt: new Date(),
        completedSteps: [{ step: 'auth', completedAt: new Date() }],
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    await newApplication.save();

    res.status(201).json({
      success: true,
      message: "Authentification Google réussie",
      data: {
        applicationId: newApplication._id,
        user: {
          firstName: newApplication.personalInfo.firstName,
          lastName: newApplication.personalInfo.lastName,
          email: newApplication.personalInfo.email,
          provider: newApplication.authentication.provider,
          providerId: newApplication.authentication.providerId
        },
        testStatus: {
          attempts: 0,
          maxAttempts: offre.test?.maxAttempts || null,
          canRetakeTest: true,
          hasCompletedTest: false
        },
        nextStep: offre.test ? 'form' : 'complete'
      }
    });

  } catch (error) {
    console.error('[handleGoogleAuth] Erreur lors de l\'authentification Google:', error);
    res.status(500).json({ success: false, message: "Erreur lors de l'authentification Google" });
  }
};

// MODIFIÉ: Gestion Firebase Auth avec vérification de la date limite
export const handleFirebaseAuth = async (req, res) => {
  try {
    const { idToken, uuid, userType, selectedUserId } = req.body;
    console.log(`[handleFirebaseAuth] Reçu UUID: ${uuid}`);

    if (!uuid) {
      return res.status(400).json({
        success: false,
        message: "UUID de l'offre manquant"
      });
    }

    const offre = await OffreStageEmploi.findOne({
      publicTestLink: uuid,
      publicTestEnabled: true,
      statut: 'active'
    });

    if (!offre) {
      console.log(`[handleFirebaseAuth] Offre non trouvée pour UUID: ${uuid}.`);
      return res.status(404).json({
        success: false,
        message: "Offre non trouvée"
      });
    }

    // NOUVEAU: Vérification de la date limite de candidature
    const now = new Date();
    const dateLimiteCandidature = new Date(offre.date_limite_candidature);
    if (now > dateLimiteCandidature) {
      console.log(`[handleFirebaseAuth] Date limite de candidature dépassée pour UUID: ${uuid}`);
      return res.status(410).json({ 
        success: false, 
        message: "La date limite de candidature pour cette offre est dépassée" 
      });
    }

    let userInfo;

    if (userType === 'predefined' && selectedUserId) {
      const testUsers = firebaseAuthService.getTestUsers();
      userInfo = testUsers.find(user => user.uid === selectedUserId);
      
      if (!userInfo) {
        return res.status(400).json({
          success: false,
          message: "Utilisateur de test non trouvé"
        });
      }
    } else if (userType === 'temporary') {
      userInfo = await firebaseAuthService.createTestUser();
    } else if (idToken) {
      userInfo = await firebaseAuthService.verifyToken(idToken);
    } else {
      return res.status(400).json({
        success: false,
        message: "Données d'authentification manquantes"
      });
    }

    const existingApplication = await PublicApplication.findOne({
      offre_id: offre._id,
      'authentication.providerId': userInfo.uid,
      'authentication.provider': { $in: ['firebase', 'firebase-dev'] }
    });

    // AMÉLIORÉ: Vérification des tentatives pour utilisateur existant
    if (existingApplication) {
      const testAttempts = existingApplication.testAttempts || 0;
      const maxAttempts = offre.test?.maxAttempts || null;
      
      let canRetakeTest = true;
      if (maxAttempts && testAttempts >= maxAttempts) {
        canRetakeTest = false;
      }

      return res.status(200).json({
        success: true,
        message: "Utilisateur déjà authentifié",
        data: {
          applicationId: existingApplication._id,
          user: {
            firstName: existingApplication.personalInfo.firstName,
            lastName: existingApplication.personalInfo.lastName,
            email: existingApplication.personalInfo.email,
            provider: existingApplication.authentication.provider,
            providerId: existingApplication.authentication.providerId
          },
          testStatus: {
            attempts: testAttempts,
            maxAttempts: maxAttempts,
            canRetakeTest: canRetakeTest,
            hasCompletedTest: !!existingApplication.testResult?.completedAt
          },
          nextStep: offre.test ? (canRetakeTest ? 'test' : 'complete') : 'complete'
        }
      });
    }

    // AMÉLIORÉ: Nouvel utilisateur avec initialisation des tentatives
    const newApplication = new PublicApplication({
      offre_id: offre._id,
      personalInfo: {
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email
      },
      applicationType: offre.type_offre,
      authentication: {
        provider: userInfo.isTemporary ? 'firebase-dev' : 'firebase',
        providerId: userInfo.uid,
        verifiedEmail: userInfo.email,
        verificationDate: new Date(),
        providerData: {
          displayName: userInfo.displayName,
          isTemporary: userInfo.isTemporary || false,
          isDevelopment: process.env.NODE_ENV === 'development'
        }
      },
      // NOUVEAU: Initialisation des données de test
      testAttempts: 0,
      securityViolations: [],
      sessionData: {
        publicTestLink: uuid,
        accessedAt: new Date(),
        completedSteps: [{
          step: 'auth',
          completedAt: new Date()
        }],
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    await newApplication.save();

    res.status(201).json({
      success: true,
      message: `Authentification Firebase réussie${userInfo.isTemporary ? ' (utilisateur temporaire)' : ''}`,
      data: {
        applicationId: newApplication._id,
        user: {
          firstName: newApplication.personalInfo.firstName,
          lastName: newApplication.personalInfo.lastName,
          email: newApplication.personalInfo.email,
          provider: newApplication.authentication.provider,
          providerId: newApplication.authentication.providerId
        },
        testStatus: {
          attempts: 0,
          maxAttempts: offre.test?.maxAttempts || null,
          canRetakeTest: true,
          hasCompletedTest: false
        },
        nextStep: offre.test ? 'form' : 'complete',
        temporaryUser: userInfo.isTemporary || false
      }
    });

  } catch (error) {
    console.error('[handleFirebaseAuth] Erreur lors de l\'authentification Firebase:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'authentification Firebase"
    });
  }
};

// Fonction pour obtenir les utilisateurs de test (développement)
export const getTestUsers = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        message: "Fonctionnalité disponible uniquement en développement"
      });
    }

    const testUsers = firebaseAuthService.getTestUsers();
    const status = firebaseAuthService.getStatus();

    res.status(200).json({
      success: true,
      data: {
        users: testUsers,
        count: testUsers.length,
        firebaseStatus: status
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs de test:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des utilisateurs de test"
    });
  }
};

// CORRIGÉ: Soumission des résultats avec correction du calcul du score
export const submitTestResults = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { applicationId, answers, timeSpent, startedAt, securityData } = req.body;
    console.log(`[submitTestResults] Reçu UUID: ${uuid}`);
    console.log(`[submitTestResults] Données reçues:`, {
      applicationId,
      answersCount: answers?.length,
      timeSpent,
      startedAt,
      securityData: securityData ? 'présent' : 'absent'
    });

    const offre = await OffreStageEmploi.findOne({
      publicTestLink: uuid,
      publicTestEnabled: true,
      statut: 'active'
    });

    if (!offre) {
      console.log(`[submitTestResults] Offre non trouvée pour UUID: ${uuid}.`);
      return res.status(404).json({
        success: false,
        message: "Lien de test invalide ou expiré"
      });
    }

    // NOUVEAU: Vérification de la date limite de candidature
    const now = new Date();
    const dateLimiteCandidature = new Date(offre.date_limite_candidature);
    if (now > dateLimiteCandidature) {
      console.log(`[submitTestResults] Date limite de candidature dépassée pour UUID: ${uuid}`);
      return res.status(410).json({
        success: false,
        message: "La date limite de candidature pour cette offre est dépassée. Impossible de soumettre le test."
      });
    }

    const test = offre.test;
    
    if (!test) {
      return res.status(400).json({
        success: false,
        message: "Aucun test associé à cette offre"
      });
    }

    const application = await PublicApplication.findById(applicationId);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Candidature non trouvée"
      });
    }

    // AMÉLIORÉ: Vérification des tentatives maximales
    const currentAttempts = application.testAttempts || 0;
    if (test.maxAttempts && currentAttempts >= test.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: `Nombre maximum de tentatives atteint (${test.maxAttempts})`
      });
    }

    let score = 0;
    const totalPoints = test.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const detailedAnswers = [];

    console.log(`[submitTestResults] Début du calcul du score. Total points possibles: ${totalPoints}`);

    // CORRIGÉ: Calcul du score avec conversion de type pour la comparaison
    answers.forEach((userAnswer, index) => {
      const question = test.questions[userAnswer.questionIndex];
      if (question) {
        // CORRECTION PRINCIPALE: Conversion de question.correctAnswer en Number pour la comparaison
        const correctAnswerIndex = Number(question.correctAnswer);
        const userSelectedAnswer = userAnswer.selectedAnswer;
        const isCorrect = userSelectedAnswer === correctAnswerIndex;
        
        console.log(`[submitTestResults] Question ${userAnswer.questionIndex}:`, {
          userSelectedAnswer,
          correctAnswerIndex,
          correctAnswerOriginal: question.correctAnswer,
          isCorrect,
          points: question.points || 1
        });
        
        if (isCorrect) {
          score += question.points || 1;
        }
        
        detailedAnswers.push({
          questionIndex: userAnswer.questionIndex,
          selectedAnswer: userAnswer.selectedAnswer,
          isCorrect: isCorrect,
          timeSpent: userAnswer.timeSpent || 0
        });
      } else {
        console.warn(`[submitTestResults] Question non trouvée pour l'index: ${userAnswer.questionIndex}`);
      }
    });

    const finalScore = Math.round((score / totalPoints) * 100);
    const passed = finalScore >= (test.passingScore || 60);

    console.log(`[submitTestResults] Calcul terminé:`, {
      scoreObtenu: score,
      totalPoints,
      finalScore,
      passingScore: test.passingScore || 60,
      passed,
      correctAnswers: detailedAnswers.filter(a => a.isCorrect).length
    });

    // NOUVEAU: Gestion des données de sécurité
    const violations = securityData?.violations || [];
    const violationCount = securityData?.violationCount || 0;
    const testLocked = securityData?.testLocked || false;

    // AMÉLIORÉ: Mise à jour de l'application avec données de sécurité
    application.testResult = {
      testId: offre._id,
      score: finalScore,
      passed: passed,
      answers: detailedAnswers,
      startedAt: new Date(startedAt),
      completedAt: new Date(),
      timeSpent: timeSpent,
      status: 'completed',
      // NOUVEAU: Données de sécurité
      securityData: {
        violations: violations,
        violationCount: violationCount,
        testLocked: testLocked,
        suspiciousActivity: securityData?.suspiciousActivity || false
      }
    };

    // NOUVEAU: Incrémenter le compteur de tentatives
    application.testAttempts = currentAttempts + 1;

    // NOUVEAU: Ajouter les violations de sécurité à l'historique
    if (violations.length > 0) {
      application.securityViolations = application.securityViolations || [];
      application.securityViolations.push(...violations.map(v => ({
        ...v,
        attemptNumber: application.testAttempts,
        submittedAt: new Date()
      })));
    }

    application.sessionData.completedSteps.push({
      step: 'test',
      completedAt: new Date()
    });

    await application.save();

    console.log(`[submitTestResults] Résultats sauvegardés avec succès pour l'application ${applicationId}`);

    res.status(200).json({
      success: true,
      message: "Résultats du test soumis avec succès",
      data: {
        score: finalScore,
        passed: passed,
        passingScore: test.passingScore || 60,
        totalQuestions: test.questions.length,
        correctAnswers: detailedAnswers.filter(a => a.isCorrect).length,
        // NOUVEAU: Informations sur les tentatives et la sécurité
        attemptInfo: {
          currentAttempt: application.testAttempts,
          maxAttempts: test.maxAttempts,
          canRetakeTest: !test.maxAttempts || application.testAttempts < test.maxAttempts
        },
        securityInfo: {
          violationCount: violationCount,
          testLocked: testLocked,
          hasViolations: violations.length > 0
        },
        nextStep: 'complete'
      }
    });

  } catch (error) {
    console.error('[submitTestResults] Erreur lors de la soumission des résultats:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la soumission des résultats du test"
    });
  }
};

// MODIFIÉ: Soumission de candidature avec vérification de la date limite
export const submitPublicApplication = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { applicationId, personalInfo, coverLetter } = req.body;
    console.log(`[submitPublicApplication] Reçu UUID: ${uuid}`);

    const offre = await OffreStageEmploi.findOne({
      publicTestLink: uuid,
      publicTestEnabled: true,
      statut: 'active'
    });

    if (!offre) {
      console.log(`[submitPublicApplication] Offre non trouvée pour UUID: ${uuid}.`);
      return res.status(404).json({
        success: false,
        message: "Offre non trouvée"
      });
    }

    // NOUVEAU: Vérification de la date limite de candidature
    const now = new Date();
    const dateLimiteCandidature = new Date(offre.date_limite_candidature);
    if (now > dateLimiteCandidature) {
      console.log(`[submitPublicApplication] Date limite de candidature dépassée pour UUID: ${uuid}`);
      return res.status(410).json({
        success: false,
        message: "La date limite de candidature pour cette offre est dépassée. Impossible de soumettre la candidature."
      });
    }

    const application = await PublicApplication.findById(applicationId);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Candidature non trouvée"
      });
    }

    if (personalInfo) {
      application.personalInfo = {
        ...application.personalInfo,
        ...personalInfo
      };
    }

    if (coverLetter) {
      application.documents.coverLetter = coverLetter;
    }

    if (req.file) {
      application.documents.cv = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date()
      };
    }

    application.sessionData.completedSteps.push({
      step: 'form',
      completedAt: new Date()
    });

    application.submittedAt = new Date();

    await application.save();

    await OffreStageEmploi.findByIdAndUpdate(
      offre._id,
      { $inc: { publicApplicationsCount: 1 } }
    );

    res.status(200).json({
      success: true,
      message: "Candidature soumise avec succès",
      data: {
        applicationId: application._id,
        submittedAt: application.submittedAt,
        nextStep: offre.test ? 'test' : 'complete'
      }
    });

  } catch (error) {
    console.error('Erreur lors de la soumission de la candidature:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la soumission de la candidature"
    });
  }
};

// Fonction pour obtenir les détails d'une candidature publique
export const getPublicApplicationDetails = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await PublicApplication.findById(applicationId)
      .populate('offre_id', 'titre type_offre entreprise_id date_limite_candidature')
      .populate({
        path: 'offre_id',
        populate: {
          path: 'entreprise_id',
          select: 'nom logo'
        }
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Candidature non trouvée"
      });
    }

    // NOUVEAU: Vérification si l'offre est encore valide
    const now = new Date();
    const dateLimiteCandidature = new Date(application.offre_id.date_limite_candidature);
    const offerExpired = now > dateLimiteCandidature;

    res.status(200).json({
      success: true,
      data: {
        application: {
          _id: application._id,
          personalInfo: application.personalInfo,
          applicationType: application.applicationType,
          status: application.status,
          submittedAt: application.submittedAt,
          testResult: application.testResult,
          // NOUVEAU: Informations sur les tentatives et la sécurité
          testAttempts: application.testAttempts || 0,
          securityViolations: application.securityViolations || [],
          documents: {
            hasCV: !!application.documents.cv,
            hasCoverLetter: !!application.documents.coverLetter
          }
        },
        offer: {
          titre: application.offre_id.titre,
          type_offre: application.offre_id.type_offre,
          date_limite_candidature: application.offre_id.date_limite_candidature,
          expired: offerExpired,
          entreprise: {
            nom: application.offre_id.entreprise_id.nom,
            logo: application.offre_id.entreprise_id.logo
          }
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des détails:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des détails de la candidature"
    });
  }
};

// Fonction pour télécharger un CV
export const downloadCV = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await PublicApplication.findById(applicationId);
    
    if (!application || !application.documents.cv) {
      return res.status(404).json({
        success: false,
        message: "CV non trouvé"
      });
    }

    const cvPath = path.join(process.cwd(), 'uploads', 'public-cvs', application.documents.cv.filename);
    
    if (!fs.existsSync(cvPath)) {
      return res.status(404).json({
        success: false,
        message: "Fichier CV non trouvé sur le serveur"
      });
    }

    res.setHeader('Content-Type', application.documents.cv.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${application.documents.cv.originalName}"`);
    
    const fileStream = fs.createReadStream(cvPath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Erreur lors du téléchargement du CV:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du téléchargement du CV"
    });
  }
};

// Fonctions Apple Auth (conservées pour la compatibilité)
export const handleAppleAuth = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      message: "Apple Sign-In sera disponible en production"
    });
  } catch (error) {
    console.error('Erreur lors de l\'authentification Apple:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'authentification Apple"
    });
  }
};

// Middleware de validation Apple (conservé pour la compatibilité)
export const validateAppleAuthMiddleware = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    next();
  } else {
    res.status(501).json({
      success: false,
      message: "Apple Sign-In disponible uniquement en production"
    });
  }
};

// Fonctions utilitaires Apple (conservées pour la compatibilité)
export const getApplePublicKeys = async () => {
  try {
    const response = await fetch('https://appleid.apple.com/auth/keys');
    const data = await response.json();
    return data.keys;
  } catch (error) {
    console.error('Erreur lors de la récupération des clés Apple:', error);
    throw new Error('Impossible de récupérer les clés publiques Apple');
  }
};

export const jwkToPem = async (jwk) => {
  try {
    const { n, e } = jwk;
    const nBuffer = Buffer.from(n, 'base64url');
    const eBuffer = Buffer.from(e, 'base64url');
    
    const publicKey = crypto.createPublicKey({
      key: {
        n: nBuffer,
        e: eBuffer
      },
      format: 'jwk'
    });
    
    return publicKey.export({ format: 'pem', type: 'spki' });
    
  } catch (error) {
    console.error('Erreur lors de la conversion JWK vers PEM:', error);
    throw new Error('Impossible de convertir la clé JWK');
  }
};

export const validateAppleState = (state, expectedTestUuid) => {
  return state === expectedTestUuid;
};

export const verifyAppleToken = async (idToken) => {
  try {
    const header = JSON.parse(Buffer.from(idToken.split('.')[0], 'base64').toString());
    const kid = header.kid;

    if (!kid) {
      throw new Error('Key ID manquant dans le token');
    }

    const appleKeys = await getApplePublicKeys();
    const key = appleKeys.find(k => k.kid === kid);

    if (!key) {
      throw new Error('Clé publique Apple non trouvée');
    }

    const publicKey = await jwkToPem(key);

    const decoded = jwt.verify(idToken, publicKey, {
      algorithms: ['RS256'],
      audience: process.env.APPLE_CLIENT_ID,
      issuer: 'https://appleid.apple.com'
    });

    return decoded;

  } catch (error) {
    console.error('Erreur lors de la vérification du token Apple:', error);
    return null;
  }
};

// Configuration Apple (conservée pour la compatibilité)
const appleAuthConfig = {
  clientId: process.env.APPLE_CLIENT_ID,
  teamId: process.env.APPLE_TEAM_ID,
  keyId: process.env.APPLE_KEY_ID,
  privateKey: process.env.APPLE_PRIVATE_KEY,
  
  validate() {
    const required = ['APPLE_CLIENT_ID', 'APPLE_TEAM_ID', 'APPLE_KEY_ID', 'APPLE_PRIVATE_KEY'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.warn(`Variables d'environnement Apple manquantes: ${missing.join(', ')}`);
      return false;
    }
    
    return true;
  }
};

// Fonction pour générer un client secret Apple (conservée pour la compatibilité)
export const generateAppleClientSecret = () => {
  try {
    if (!appleAuthConfig.validate()) {
      throw new Error('Configuration Apple incomplète');
    }

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: appleAuthConfig.teamId,
      iat: now,
      exp: now + 3600, // 1 heure
      aud: 'https://appleid.apple.com',
      sub: appleAuthConfig.clientId
    };

    const privateKey = appleAuthConfig.privateKey.replace(/\\n/g, '\n');
    
    return jwt.sign(payload, privateKey, {
      algorithm: 'ES256',
      header: {
        kid: appleAuthConfig.keyId,
        alg: 'ES256'
      }
    });
  } catch (error) {
    console.error('Erreur lors de la génération du client secret Apple:', error);
    throw error;
  }
};

