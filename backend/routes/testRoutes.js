import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest,
  getTestsByCompany,
  getTestsByOffer,
  submitTestResult,
  getTestResults
} from '../controllers/testController.js';
import authCompany from '../middlewars/authCompany.js';
import authUser from '../middlewars/authUser.js';
import Test from '../models/Test.js'; // ADD THIS IMPORT
import OffreStageEmploi from '../models/OffreStageEmploi.js';

const router = express.Router();

// ==================== COMPANY ROUTES (Protected with authCompany) ====================
// Test CRUD operations for companies
router.post('/', authCompany, createTest);
router.get('/company/all', authCompany, getAllTests);
router.get('/company/:companyId', authCompany, getTestsByCompany);
router.get('/company/offer/:offerId', authCompany, getTestsByOffer);
router.put('/:id', authCompany, updateTest);
router.delete('/:id', authCompany, deleteTest);

// Test submission and results for companies
router.post('/:id/submit', authCompany, submitTestResult);
router.get('/:id/results', authCompany, getTestResults);

// ==================== STUDENT ROUTES (Protected with authUser) ====================

// GET /api/tests/offer/:offerId - Get tests for a specific offer (STUDENT ACCESS)
router.get('/offer/:offerId', authUser, async (req, res) => {
  try {
    const { offerId } = req.params;
    const studentId = req.user.id;
    
    console.log('Student accessing tests for offer:', offerId);
    console.log('Student ID:', studentId);

    // Validate offerId format
    if (!offerId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid offer ID format'
      });
    }

    // First, check if the offer exists
    const offer = await OffreStageEmploi.findById(offerId);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    // Find tests associated with this offer
    const tests = await Test.find({ 
      offre_id: offerId, 
      isActive: true 
    })
    .populate('entreprise_id', 'nom email')
    .populate('offre_id', 'titre description');

    console.log('Found tests:', tests.length);

    if (!tests || tests.length === 0) {
      return res.json({
        success: true,
        tests: [],
        message: 'No tests found for this offer'
      });
    }

    // For each test, check if the current student has any results
    const testsWithStatus = tests.map(test => {
      const studentResults = test.getStudentResults(studentId);
      const lastAttempt = studentResults.length > 0 ? studentResults[studentResults.length - 1] : null;
      const canTakeTest = test.canStudentTakeTest(studentId);
      
      return {
        _id: test._id,
        testName: test.testName,
        description: test.description,
        testDuration: test.testDuration,
        passingScore: test.passingScore,
        maxAttempts: test.maxAttempts,
        instructions: test.instructions,
        totalQuestions: test.questions.length,
        lastAttempt: lastAttempt ? {
          _id: lastAttempt._id,
          score: lastAttempt.score,
          completedAt: lastAttempt.completedAt,
          passed: lastAttempt.score >= test.passingScore
        } : null,
        passed: lastAttempt ? lastAttempt.score >= test.passingScore : false,
        canTake: canTakeTest.canTake,
        canTakeReason: canTakeTest.reason,
        attemptsUsed: studentResults.length,
        entreprise: test.entreprise_id ? {
          nom: test.entreprise_id.nom,
          email: test.entreprise_id.email
        } : null
      };
    });

    res.json({
      success: true,
      tests: testsWithStatus,
      offerTitle: offer.titre
    });

  } catch (error) {
    console.error('Error fetching tests for offer:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des tests',
      error: error.message
    });
  }
});

// GET /api/tests/:testId - Get test details for a student
router.get('/:testId', authUser, async (req, res) => {
  try {
    const { testId } = req.params;
    const studentId = req.user.id;

    console.log('Student accessing test:', testId);
    console.log('Student ID:', studentId);

    // Validate testId format
    if (!testId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid test ID format'
      });
    }

    // Find the test and populate related data
    const test = await Test.findById(testId)
      .populate('entreprise_id', 'nom email')
      .populate('offre_id', 'titre description');

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test non trouvé"
      });
    }

    // Check if student can take the test
    const canTakeTest = test.canStudentTakeTest(studentId);
    if (!canTakeTest.canTake) {
      return res.status(403).json({
        success: false,
        message: canTakeTest.reason
      });
    }

    // Return test data without correct answers
    const testData = {
      _id: test._id,
      testName: test.testName,
      description: test.description,
      testDuration: test.testDuration,
      questions: test.questions.map(q => ({
        question: q.question,
        options: q.options,
        points: q.points
        // Don't include correctAnswer
      })),
      security: test.security,
      instructions: test.instructions,
      passingScore: test.passingScore,
      totalPoints: test.totalPoints,
      maxAttempts: test.maxAttempts,
      availableFrom: test.availableFrom,
      availableUntil: test.availableUntil,
      entreprise: test.entreprise_id ? {
        nom: test.entreprise_id.nom,
        email: test.entreprise_id.email
      } : null,
      offre: test.offre_id ? {
        titre: test.offre_id.titre,
        description: test.offre_id.description
      } : null
    };

    res.json({
      success: true,
      test: testData,
      studentAttempts: test.getStudentResults(studentId).length
    });

  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération du test"
    });
  }
});

// POST /api/tests/submit - Submit test answers
router.post('/submit', [
  authUser,
  body('testId').isMongoId().withMessage('ID de test invalide'),
  body('answers').isArray().withMessage('Les réponses doivent être un tableau'),
  body('score').isNumeric().withMessage('Score invalide'),
  body('totalQuestions').isNumeric().withMessage('Nombre de questions invalide'),
  body('correctAnswers').isNumeric().withMessage('Nombre de bonnes réponses invalide'),
  body('timeSpent').isNumeric().withMessage('Temps passé invalide')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: errors.array()
      });
    }

    const { 
      testId, 
      answers, 
      score, 
      totalQuestions, 
      correctAnswers, 
      timeSpent,
      violations = [],
      isAutoSubmit = false
    } = req.body;
    
    const studentId = req.user.id;

    // Find the test
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test non trouvé"
      });
    }

    // Verify student can still take the test
    const canTakeTest = test.canStudentTakeTest(studentId);
    if (!canTakeTest.canTake) {
      return res.status(403).json({
        success: false,
        message: canTakeTest.reason
      });
    }

    // Validate answers against actual test questions
    const validatedAnswers = [];
    let actualCorrectAnswers = 0;

    for (let i = 0; i < test.questions.length; i++) {
      const question = test.questions[i];
      const answer = answers.find(a => a.questionIndex === i);
      
      const isCorrect = answer && 
        answer.selectedAnswer >= 0 && 
        answer.selectedAnswer === question.correctAnswer;
      
      if (isCorrect) actualCorrectAnswers++;

      validatedAnswers.push({
        questionIndex: i,
        selectedAnswer: answer ? answer.selectedAnswer : -1,
        isCorrect
      });
    }

    // Calculate actual score
    const actualScore = Math.round((actualCorrectAnswers / test.questions.length) * 100);

    // Create test result
    const testResult = {
      student_id: studentId,
      score: actualScore,
      totalQuestions: test.questions.length,
      correctAnswers: actualCorrectAnswers,
      timeSpent: Math.max(0, timeSpent),
      answers: validatedAnswers,
      completedAt: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress,
      violations: violations.map(v => ({
        violation: v.violation,
        timestamp: new Date(v.timestamp)
      })),
      isAutoSubmit
    };

    // Add result to test
    await test.addResult(testResult);

    // Get the newly added result ID
    const addedResult = test.results[test.results.length - 1];

    res.json({
      success: true,
      message: "Test soumis avec succès",
      resultId: addedResult._id,
      result: {
        score: actualScore,
        correctAnswers: actualCorrectAnswers,
        totalQuestions: test.questions.length,
        passed: actualScore >= test.passingScore,
        timeSpent,
        violations: violations.length
      }
    });

  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la soumission du test"
    });
  }
});

// GET /api/tests/results/:testId - Get student's results for a specific test
router.get('/results/:testId', authUser, async (req, res) => {
  try {
    const { testId } = req.params;
    const studentId = req.user.id;

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test non trouvé"
      });
    }

    const studentResults = test.getStudentResults(studentId);

    res.json({
      success: true,
      results: studentResults.map(result => ({
        _id: result._id,
        score: result.score,
        correctAnswers: result.correctAnswers,
        totalQuestions: result.totalQuestions,
        timeSpent: result.timeSpent,
        completedAt: result.completedAt,
        passed: result.score >= test.passingScore,
        violations: result.violations ? result.violations.length : 0
      }))
    });

  } catch (error) {
    console.error('Error fetching test results:', error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des résultats"
    });
  }
});

// GET /api/tests/:testId/results - Get student's test results for a specific test (alternative endpoint)
router.get('/:testId/results', authUser, async (req, res) => {
  try {
    const { testId } = req.params;
    const studentId = req.user.id;

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test non trouvé'
      });
    }

    const studentResults = test.getStudentResults(studentId);

    res.json({
      success: true,
      results: studentResults.map(result => ({
        _id: result._id,
        score: result.score,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        timeSpent: result.timeSpent,
        completedAt: result.completedAt,
        passed: result.score >= test.passingScore
      }))
    });

  } catch (error) {
    console.error('Error fetching test results:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des résultats',
      error: error.message
    });
  }
});

// POST /api/tests/validate-access - Validate if student can access a test
router.post('/validate-access', [
  authUser,
  body('testId').isMongoId().withMessage('ID de test invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: errors.array()
      });
    }

    const { testId } = req.body;
    const studentId = req.user.id;

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test non trouvé"
      });
    }

    const canTakeTest = test.canStudentTakeTest(studentId);
    const studentResults = test.getStudentResults(studentId);

    res.json({
      success: true,
      canTake: canTakeTest.canTake,
      reason: canTakeTest.reason,
      attemptsUsed: studentResults.length,
      maxAttempts: test.maxAttempts,
      lastScore: studentResults.length > 0 ? studentResults[studentResults.length - 1].score : null,
      hasPassed: studentResults.some(result => result.score >= test.passingScore)
    });

  } catch (error) {
    console.error('Error validating test access:', error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la validation d'accès"
    });
  }
});


export default router;