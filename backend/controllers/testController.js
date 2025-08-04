// controllers/testController.js
import Test from '../models/Test.js';
import OffreStageEmploi from '../models/OffreStageEmploi.js'; // Adjust import path as needed
import Company from '../models/Company.js'; // Adjust import path as needed

// Create a new test
export const createTest = async (req, res) => {
  try {
    console.log('Creating test with data:', req.body);
    console.log('User from token:', req.user);

    const {
      entreprise_id,
      offre_id,
      testName,
      description,
      testDuration,
      instructions,
      passingScore,
      maxAttempts,
      availableFrom,
      availableUntil,
      isActive,
      questions,
      security
    } = req.body;

    // Validate required fields
    if (!entreprise_id || !offre_id || !testName || !questions || questions.length === 0) {
      return res.status(400).json({
        message: 'Missing required fields: entreprise_id, offre_id, testName, and questions are required'
      });
    }

    // Verify that the company exists
    const company = await Company.findById(entreprise_id);
    if (!company) {
      return res.status(404).json({
        message: 'Company not found'
      });
    }

    // Verify that the offer exists and belongs to the company
    const offer = await OffreStageEmploi.findById(offre_id);
    if (!offer) {
      return res.status(404).json({
        message: 'Offer not found'
      });
    }

    if (offer.entreprise_id.toString() !== entreprise_id.toString()) {
      return res.status(403).json({
        message: 'This offer does not belong to the specified company'
      });
    }

    // Validate questions format
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.question || !question.options || question.options.length < 2) {
        return res.status(400).json({
          message: `Question ${i + 1} is invalid: must have a question text and at least 2 options`
        });
      }
      
      if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
        return res.status(400).json({
          message: `Question ${i + 1} has an invalid correct answer index`
        });
      }
    }

    // UPDATED: Process security settings to match frontend structure
    const securitySettings = security ? {
      preventCopy: security.preventCopy !== undefined ? security.preventCopy : true,
      timeLimit: security.timeLimit !== undefined ? security.timeLimit : true,
      showResults: security.showResults !== undefined ? security.showResults : true,
      allowBackNavigation: security.allowBackNavigation !== undefined ? security.allowBackNavigation : false,
      preventTabSwitch: security.preventTabSwitch !== undefined ? security.preventTabSwitch : false,
      fullscreenMode: security.fullscreenMode !== undefined ? security.fullscreenMode : false,
      preventDevTools: security.preventDevTools !== undefined ? security.preventDevTools : false
    } : {
      preventCopy: true,
      timeLimit: true,
      showResults: true,
      allowBackNavigation: false,
      preventTabSwitch: false,
      fullscreenMode: false,
      preventDevTools: false
    };

    // Create the test
    const testData = {
      entreprise_id,
      offre_id,
      testName: testName.trim(),
      description: description ? description.trim() : '',
      testDuration: parseInt(testDuration) || 30,
      instructions: instructions || 'Lisez attentivement chaque question et sélectionnez la meilleure réponse.',
      passingScore: parseInt(passingScore) || 60,
      maxAttempts: parseInt(maxAttempts) || 1,
      availableFrom: availableFrom ? new Date(availableFrom) : new Date(),
      availableUntil: availableUntil ? new Date(availableUntil) : null,
      isActive: isActive !== false, // Default to true
      questions: questions.map(q => ({
        question: q.question.trim(),
        options: q.options.filter(opt => opt.trim() !== '').map(opt => opt.trim()),
        correctAnswer: parseInt(q.correctAnswer),
        points: parseInt(q.points) || 1,
        explanation: q.explanation ? q.explanation.trim() : ''
      })),
      security: securitySettings
    };

    const test = new Test(testData);
    const savedTest = await test.save();

    // Populate the references for the response
    await savedTest.populate([
      { path: 'entrepriseDetails', select: 'nom email' },
      { path: 'offreDetails', select: 'titre type_offre localisation' }
    ]);

    console.log('Test created successfully:', savedTest._id);
    console.log('Security settings applied:', savedTest.security);

    res.status(201).json({
      message: 'Test created successfully',
      test: savedTest
    });

  } catch (error) {
    console.error('Error creating test:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

// Get all tests (admin only or filtered by company)
export const getAllTests = async (req, res) => {
  try {
    const { page = 1, limit = 10, company, offer } = req.query;
    
    let query = {};
    
    // If not admin, filter by user's company
    if (req.user.role !== 'admin') {
      query.entreprise_id = req.user.id;
    }
    
    if (company) query.entreprise_id = company;
    if (offer) query.offre_id = offer;

    const tests = await Test.find(query)
      .populate('entrepriseDetails', 'nom email')
      .populate('offreDetails', 'titre type_offre localisation')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Test.countDocuments(query);

    res.json({
      tests,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });

  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({
      message: 'Error fetching tests',
      error: error.message
    });
  }
};

// Get tests by company
export const getTestsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    // Check if user has permission to view these tests
    if (req.user.role !== 'admin' && req.user.id !== companyId) {
      return res.status(403).json({
        message: 'Access denied: You can only view your own tests'
      });
    }

    const tests = await Test.findByCompany(companyId);

    res.json({
      tests,
      count: tests.length
    });

  } catch (error) {
    console.error('Error fetching company tests:', error);
    res.status(500).json({
      message: 'Error fetching company tests',
      error: error.message
    });
  }
};

// Get tests by offer
export const getTestsByOffer = async (req, res) => {
  try {
    const { offerId } = req.params;

    const tests = await Test.findByOffer(offerId);

    res.json({
      tests,
      count: tests.length
    });

  } catch (error) {
    console.error('Error fetching offer tests:', error);
    res.status(500).json({
      message: 'Error fetching offer tests',
      error: error.message
    });
  }
};

// Get test by ID
export const getTestById = async (req, res) => {
  try {
    const { id } = req.params;
    const { includeAnswers = 'false' } = req.query;

    const test = await Test.findById(id)
      .populate('entrepriseDetails', 'nom email')
      .populate('offreDetails', 'titre type_offre localisation');

    if (!test) {
      return res.status(404).json({
        message: 'Test not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && test.entreprise_id.toString() !== req.user.id) {
      // If it's a student/candidate, don't include correct answers
      if (includeAnswers === 'false') {
        const testForStudent = test.toObject();
        testForStudent.questions = testForStudent.questions.map(q => ({
          question: q.question,
          options: q.options,
          points: q.points,
          _id: q._id
        }));
        return res.json({ test: testForStudent });
      }
      
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    res.json({ test });

  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({
      message: 'Error fetching test',
      error: error.message
    });
  }
};

// Update test
export const updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const test = await Test.findById(id);
    if (!test) {
      return res.status(404).json({
        message: 'Test not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && test.entreprise_id.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Access denied: You can only update your own tests'
      });
    }

    // Validate questions if they're being updated
    if (updateData.questions) {
      for (let i = 0; i < updateData.questions.length; i++) {
        const question = updateData.questions[i];
        if (!question.question || !question.options || question.options.length < 2) {
          return res.status(400).json({
            message: `Question ${i + 1} is invalid: must have a question text and at least 2 options`
          });
        }
        
        if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
          return res.status(400).json({
            message: `Question ${i + 1} has an invalid correct answer index`
          });
        }
      }
    }

    const updatedTest = await Test.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'entrepriseDetails', select: 'nom email' },
      { path: 'offreDetails', select: 'titre type_offre localisation' }
    ]);

    res.json({
      message: 'Test updated successfully',
      test: updatedTest
    });

  } catch (error) {
    console.error('Error updating test:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      message: 'Error updating test',
      error: error.message
    });
  }
};

// Delete test
export const deleteTest = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await Test.findById(id);
    if (!test) {
      return res.status(404).json({
        message: 'Test not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && test.entreprise_id.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Access denied: You can only delete your own tests'
      });
    }

    // Check if test has results - you might want to prevent deletion if there are results
    if (test.results && test.results.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete test with existing results. Consider deactivating it instead.'
      });
    }

    await Test.findByIdAndDelete(id);

    res.json({
      message: 'Test deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting test:', error);
    res.status(500).json({
      message: 'Error deleting test',
      error: error.message
    });
  }
};

// Submit test result (for students)
export const submitTestResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, timeSpent } = req.body;

    const test = await Test.findById(id);
    if (!test) {
      return res.status(404).json({
        message: 'Test not found'
      });
    }

    // Check if student can take the test
    const canTake = test.canStudentTakeTest(req.user.id);
    if (!canTake.canTake) {
      return res.status(400).json({
        message: canTake.reason
      });
    }

    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    const resultAnswers = answers.map((answer, index) => {
      const question = test.questions[index];
      const isCorrect = answer === question.correctAnswer;
      
      if (isCorrect) {
        correctAnswers++;
        earnedPoints += question.points || 1;
      }
      
      totalPoints += question.points || 1;

      return {
        questionIndex: index,
        selectedAnswer: answer,
        isCorrect
      };
    });

    const score = Math.round((earnedPoints / totalPoints) * 100);

    // Create result object
    const resultData = {
      student_id: req.user.id,
      score,
      totalQuestions: test.questions.length,
      correctAnswers,
      timeSpent: parseInt(timeSpent) || 0,
      answers: resultAnswers,
      ipAddress: req.ip || req.connection.remoteAddress
    };

    // Add result to test
    await test.addResult(resultData);

    res.json({
      message: 'Test submitted successfully',
      result: {
        score,
        totalQuestions: test.questions.length,
        correctAnswers,
        passed: score >= test.passingScore,
        timeSpent
      }
    });

  } catch (error) {
    console.error('Error submitting test result:', error);
    res.status(500).json({
      message: 'Error submitting test result',
      error: error.message
    });
  }
};

// Get test results (for companies)
export const getTestResults = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await Test.findById(id)
      .populate('results.student_id', 'nom prenom email');

    if (!test) {
      return res.status(404).json({
        message: 'Test not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && test.entreprise_id.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Access denied: You can only view results for your own tests'
      });
    }

    const results = test.results.map(result => ({
      student: result.student_id,
      score: result.score,
      totalQuestions: result.totalQuestions,
      correctAnswers: result.correctAnswers,
      timeSpent: result.timeSpent,
      completedAt: result.completedAt,
      passed: result.score >= test.passingScore
    }));

    const stats = {
      totalAttempts: results.length,
      averageScore: results.length > 0 ? 
        Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length) : 0,
      passRate: results.length > 0 ? 
        Math.round((results.filter(r => r.passed).length / results.length) * 100) : 0,
      averageTime: results.length > 0 ?
        Math.round(results.reduce((sum, r) => sum + r.timeSpent, 0) / results.length) : 0
    };

    res.json({
      test: {
        id: test._id,
        testName: test.testName,
        passingScore: test.passingScore
      },
      results,
      stats
    });

  } catch (error) {
    console.error('Error fetching test results:', error);
    res.status(500).json({
      message: 'Error fetching test results',
      error: error.message
    });
  }
};


