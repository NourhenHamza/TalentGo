// models/Test.js
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "La question est requise"],
    trim: true
  },
  options: {
    type: [String],
    required: [true, "Les options sont requises"],
    validate: {
      validator: function(options) {
        return options.length >= 2;
      },
      message: "Au moins 2 options sont requises pour chaque question"
    }
  },
  correctAnswer: {
    type: Number,
    required: [true, "La réponse correcte est requise"],
    validate: {
      validator: function(answer) {
        return answer >= 0 && answer < this.options.length;
      },
      message: "L'index de la réponse correcte doit être valide"
    }
  },
  points: {
    type: Number,
    default: 1,
    min: [0, "Les points ne peuvent pas être négatifs"]
  },
  explanation: {
    type: String,
    trim: true,
    default: ""
  }
});

// UPDATED: Security settings schema to match frontend exactly
const securitySettingsSchema = new mongoose.Schema({
  preventCopy: {
    type: Boolean,
    default: true
  },
  timeLimit: {
    type: Boolean,
    default: true
  },
  showResults: {
    type: Boolean,
    default: true
  },
  allowBackNavigation: {
    type: Boolean,
    default: false
  },
  preventTabSwitch: {
    type: Boolean,
    default: false
  },
  fullscreenMode: {
    type: Boolean,
    default: false
  },
  preventDevTools: {
    type: Boolean,
    default: false
  }
});

const testResultSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model for students
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  timeSpent: {
    type: Number, // in minutes
    required: true
  },
  answers: [{
    questionIndex: Number,
    selectedAnswer: Number,
    isCorrect: Boolean
  }],
  completedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    trim: true
  }
});

const TestSchema = new mongoose.Schema({
  // Reference to the company that created the test
  entreprise_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, "La référence à l'entreprise est requise"]
  },
  
  // Reference to the offer this test is associated with
  offre_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OffreStageEmploi',
    required: [true, "La référence à l'offre est requise"]
  },
  
  // Test basic information
  testName: {
    type: String,
    required: [true, "Le nom du test est requis"],
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  testDuration: {
    type: Number, // Duration in minutes
    required: [true, "La durée du test est requise"],
    min: [1, "La durée doit être au moins 1 minute"]
  },
  
  // Questions array with embedded schema
  questions: {
    type: [questionSchema],
    required: [true, "Au moins une question est requise"],
    validate: {
      validator: function(questions) {
        return questions.length > 0;
      },
      message: "Le test doit contenir au moins une question"
    }
  },
  
  // UPDATED: Security settings to match frontend
  security: {
    type: securitySettingsSchema,
    default: () => ({
      preventCopy: true,
      timeLimit: true,
      showResults: true,
      allowBackNavigation: false,
      preventTabSwitch: false,
      fullscreenMode: false,
      preventDevTools: false
    })
  },
  
  // Test results from students who took the test
  results: [testResultSchema],
  
  // Test status and settings
  isActive: {
    type: Boolean,
    default: true
  },
  
  passingScore: {
    type: Number,
    default: 60, // Percentage
    min: [0, "Le score de passage ne peut pas être négatif"],
    max: [100, "Le score de passage ne peut pas dépasser 100%"]
  },
  
  maxAttempts: {
    type: Number,
    default: 1,
    min: [1, "Au moins une tentative doit être autorisée"]
  },
  
  // Instructions for the test
  instructions: {
    type: String,
    trim: true,
    default: "Lisez attentivement chaque question et sélectionnez la meilleure réponse."
  },
  
  // Date settings
  availableFrom: {
    type: Date,
    default: Date.now
  },
  
  availableUntil: {
    type: Date,
    validate: {
      validator: function(date) {
        return !date || date > this.availableFrom;
      },
      message: "La date de fin doit être postérieure à la date de début"
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to get company details
TestSchema.virtual('entrepriseDetails', {
  ref: 'Company',
  localField: 'entreprise_id',
  foreignField: '_id',
  justOne: true
});

// Virtual to get offer details
TestSchema.virtual('offreDetails', {
  ref: 'OffreStageEmploi',
  localField: 'offre_id',
  foreignField: '_id',
  justOne: true
});

// Virtual to calculate total points
TestSchema.virtual('totalPoints').get(function() {
  return this.questions.reduce((total, question) => total + (question.points || 1), 0);
});

// Virtual to get number of students who took the test
TestSchema.virtual('studentCount').get(function() {
  return this.results.length;
});

// Method to add a test result
TestSchema.methods.addResult = function(resultData) {
  this.results.push(resultData);
  return this.save();
};

// Method to get results for a specific student
TestSchema.methods.getStudentResults = function(studentId) {
  return this.results.filter(result => 
    result.student_id.toString() === studentId.toString()
  );
};

// Method to check if a student can take the test
TestSchema.methods.canStudentTakeTest = function(studentId) {
  const studentResults = this.getStudentResults(studentId);
  
  // Check if test is active
  if (!this.isActive) return { canTake: false, reason: "Le test n'est pas actif" };
  
  // Check availability dates
  const now = new Date();
  if (this.availableFrom && now < this.availableFrom) {
    return { canTake: false, reason: "Le test n'est pas encore disponible" };
  }
  if (this.availableUntil && now > this.availableUntil) {
    return { canTake: false, reason: "Le test n'est plus disponible" };
  }
  
  // Check max attempts
  if (studentResults.length >= this.maxAttempts) {
    return { canTake: false, reason: "Nombre maximum de tentatives atteint" };
  }
  
  return { canTake: true };
};

// UPDATED: Method to get security settings for test execution
TestSchema.methods.getSecuritySettings = function() {
  return {
    preventCopy: this.security.preventCopy,
    timeLimit: this.security.timeLimit,
    showResults: this.security.showResults,
    allowBackNavigation: this.security.allowBackNavigation,
    preventTabSwitch: this.security.preventTabSwitch,
    fullscreenMode: this.security.fullscreenMode,
    preventDevTools: this.security.preventDevTools
  };
};

// Static method to find tests for a specific offer
TestSchema.statics.findByOffer = function(offreId) {
  return this.find({ offre_id: offreId, isActive: true })
    .populate('entrepriseDetails')
    .populate('offreDetails');
};

// Static method to find tests created by a company
TestSchema.statics.findByCompany = function(companyId) {
  return this.find({ entreprise_id: companyId })
    .populate('offreDetails')
    .sort({ createdAt: -1 });
};

const Test = mongoose.model("Test", TestSchema);

export default Test;