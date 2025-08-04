"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowRight, CheckCircle, Clock, FileText, Loader2, Maximize, Shield, X, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../admin/src/utils/api";

const TestModal = ({ isOpen, onClose, testData, onTestCompleted }) => {
  // Core states
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Test flow states
  const [showInstructions, setShowInstructions] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testResult, setTestResult] = useState(null);
  
  // Question states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  // Security states
  const [violations, setViolations] = useState([]);
  const [warningCount, setWarningCount] = useState(0);
  const [testLocked, setTestLocked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const [suspiciousActivity, setSuspiciousActivity] = useState(false);
  
  // Refs
  const testContainerRef = useRef(null);
  const timerRef = useRef(null);
  const fullscreenRef = useRef(null);
  const devToolsDetectionRef = useRef(null);

  // Initialize test data
  useEffect(() => {
    if (isOpen && testData) {
      console.log("TestModal useEffect triggered with:", { isOpen, testData });
      initializeTest();
    }
    return () => {
      clearTimers();
      exitFullscreen();
      clearDevToolsDetection();
    };
  }, [isOpen, testData]);

  const initializeTest = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Initializing test with data:", testData);
      
      // Reset all test states first
      setShowInstructions(true);
      setTestStarted(false);
      setTestSubmitted(false);
      setTestResult(null);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setViolations([]);
      setWarningCount(0);
      setTestLocked(false);
      setIsFullscreen(false);
      setDevToolsOpen(false);
      setSuspiciousActivity(false);
      
      // FIXED: Better handling of test data
      if (testData && testData.questions && testData.questions.length > 0) {
        // Test data is complete, use it directly
        setTest(testData);
        setTimeRemaining((testData.testDuration || 30) * 60);
        console.log("Test initialized with complete data:", testData);
      } else if (testData && testData._id) {
        // Test data is incomplete, fetch from API
        console.log("Fetching test data from API for ID:", testData._id);
        const response = await api.get(`/tests/${testData._id}`);
        if (response.success && response.test) {
          setTest(response.test);
          setTimeRemaining((response.test.testDuration || 30) * 60);
          console.log("Test fetched from API:", response.test);
        } else {
          throw new Error("Failed to fetch test data from API");
        }
      } else {
        throw new Error("Test data is invalid or missing");
      }
      
    } catch (error) {
      console.error("Error initializing test:", error);
      setError(error.message || "Failed to load test");
      toast.error("Failed to load test: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Enhanced Security monitoring
  useEffect(() => {
    if (!testStarted || testSubmitted || testLocked) return;

    const security = test?.security || {};

    // Tab switch detection
    const handleVisibilityChange = () => {
      if (document.hidden && security.preventTabSwitch) {
        handleSecurityViolation("tab_switch", "Switched tab or window");
      }
    };

    // Enhanced keyboard shortcut prevention
    const handleKeyDown = (e) => {
      if (security.preventCopy) {
        // Prevent copy, paste, cut, find, print, save, inspect element
        const forbiddenKeys = [
          "c", "v", "x", "f", "p", "s", "i", "j", "u", "r", "a"
        ];
        
        if ((e.ctrlKey || e.altKey || e.metaKey) && forbiddenKeys.includes(e.key.toLowerCase())) {
          e.preventDefault();
          handleSecurityViolation("shortcut", `Attempted to use ${e.key.toUpperCase()} shortcut`);
        }
      }

      if (security.preventDevTools) {
        // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (e.key === "F12" || 
            (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
            (e.ctrlKey && e.key === "U")) {
          e.preventDefault();
          handleSecurityViolation("devtools", "Attempted to open developer tools");
        }
      }

      // Prevent escape key if in fullscreen
      if (e.key === "Escape" && security.fullscreenMode && isFullscreen) {
        e.preventDefault();
        handleSecurityViolation("escape", "Attempted to exit fullscreen");
      }
    };

    // Right-click prevention
    const handleContextMenu = (e) => {
      if (security.preventCopy) {
        e.preventDefault();
        handleSecurityViolation("right_click", "Right-clicked");
      }
    };

    // Text selection prevention
    const handleSelectStart = (e) => {
      if (security.preventCopy) {
        e.preventDefault();
        handleSecurityViolation("text_select", "Attempted to select text");
      }
    };

    // Drag prevention
    const handleDragStart = (e) => {
      if (security.preventCopy) {
        e.preventDefault();
        handleSecurityViolation("drag", "Attempted to drag content");
      }
    };

    // Fullscreen exit detection
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.mozFullScreenElement || 
        document.msFullscreenElement
      );
      
      setIsFullscreen(isCurrentlyFullscreen);
      
      if (security.fullscreenMode && !isCurrentlyFullscreen && testStarted && !testSubmitted) {
        handleSecurityViolation("fullscreen_exit", "Exited fullscreen mode");
        handleSubmitTest(); // Terminate test immediately
      }
    };

    // Blur detection (losing focus)
    const handleBlur = () => {
      if (security.preventTabSwitch) {
        handleSecurityViolation("focus_loss", "Lost focus from test window");
      }
    };

    // Mouse leave detection
    const handleMouseLeave = () => {
      if (security.preventTabSwitch) {
        setSuspiciousActivity(true);
        setTimeout(() => setSuspiciousActivity(false), 3000);
      }
    };

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [testStarted, testSubmitted, testLocked, test, isFullscreen]);

  // Developer tools detection
  useEffect(() => {
    if (!testStarted || testSubmitted || testLocked || !test?.security?.preventDevTools) return;

    const detectDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      
      if (widthThreshold || heightThreshold) {
        if (!devToolsOpen) {
          setDevToolsOpen(true);
          handleSecurityViolation("devtools_open", "Developer tools detected");
        }
      } else {
        setDevToolsOpen(false);
      }
    };

    devToolsDetectionRef.current = setInterval(detectDevTools, 1000);
    
    return () => clearInterval(devToolsDetectionRef.current);
  }, [testStarted, testSubmitted, testLocked, test, devToolsOpen]);

  // Timer management
  useEffect(() => {
    if (testStarted && !testSubmitted && !testLocked && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitTest(); // Terminate test automatically on time limit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [testStarted, testSubmitted, testLocked, timeRemaining]);

  const clearTimers = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const clearDevToolsDetection = () => {
    if (devToolsDetectionRef.current) {
      clearInterval(devToolsDetectionRef.current);
    }
  };

  const enterFullscreen = async () => {
    // Request fullscreen on the entire document for total fullscreen
    const element = document.documentElement;

    if (!element) return;

    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (error) {
      console.error("Failed to enter fullscreen:", error);
      handleSecurityViolation("fullscreen_failed", "Failed to enter fullscreen mode");
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    setIsFullscreen(false);
  };

  const handleSecurityViolation = (type, description) => {
    if (testLocked) return;

    const violation = { type, description, timestamp: new Date().toISOString() };
    setViolations(prev => [...prev, violation]);
    
    // Specific handling for severe violations that terminate immediately
    const severeViolations = ["fullscreen_exit", "devtools_open", "time_limit_exceeded"];
    if (severeViolations.includes(type)) {
      setTestLocked(true);
      toast.error(`Test terminated: ${description}`);
      setTimeout(() => handleSubmitTest(), 1000); // Submit after a short delay
      return; // Stop further processing for this violation
    }

    // Increment warning count for other violations
    setWarningCount(prev => {
      const newWarningCount = prev + 1;
      if (newWarningCount >= 2) { // Terminate after 2 warnings for other violations
        setTestLocked(true);
        toast.error("Test locked due to multiple violations");
        setTimeout(() => handleSubmitTest(), 1000); // Submit after a short delay
      } else {
        toast.warning(`Security Warning: ${description}. ${2 - newWarningCount} warning(s) remaining.`);
      }
      return newWarningCount;
    });
  };

  const startTest = async () => {
    console.log("Starting test...");
    
    // Enable fullscreen if required
    if (test?.security?.fullscreenMode) {
      await enterFullscreen();
    }
    
    setShowInstructions(false);
    setTestStarted(true);
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    if (testLocked) return;
    setAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0 && test?.security?.allowBackNavigation) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // CORRIGÉ: Enhanced test submission with corrected score calculation and ObjectId fix
  const handleSubmitTest = async () => {
    if (testSubmitted || loading) return;

    try {
      setLoading(true);
      
      // Convert answers object to array format expected by backend
      const answersArray = [];
      let correctAnswers = 0;
      
      console.log("Starting score calculation for TestModal...");
      
      // CORRECTION PRINCIPALE: Process each question with type conversion
      for (let i = 0; i < test.questions.length; i++) {
        const selectedAnswer = answers[i] !== undefined ? answers[i] : -1;
        
        // CORRECTION: Convert question.correctAnswer to Number for comparison
        const correctAnswerIndex = Number(test.questions[i].correctAnswer);
        const isCorrect = selectedAnswer >= 0 && selectedAnswer === correctAnswerIndex;
        
        console.log(`TestModal - Question ${i}:`, {
          selectedAnswer,
          correctAnswerIndex,
          correctAnswerOriginal: test.questions[i].correctAnswer,
          isCorrect
        });
        
        if (isCorrect) correctAnswers++;
        
        answersArray.push({
          questionIndex: i,
          selectedAnswer: selectedAnswer
        });
      }
      
      // Calculate score
      const score = Math.round((correctAnswers / test.questions.length) * 100);
      const passed = score >= (test.passingScore || 60);
      
      console.log("TestModal score calculation completed:", {
        correctAnswers,
        totalQuestions: test.questions.length,
        score,
        passingScore: test.passingScore || 60,
        passed
      });
      
      const submissionData = {
        testId: test._id,
        answers: answersArray,
        score: score,
        totalQuestions: test.questions.length,
        correctAnswers: correctAnswers,
        timeSpent: (test.testDuration || 30) * 60 - timeRemaining,
        violations: violations.map(v => ({
          violation: v.type,
          timestamp: v.timestamp,
          description: v.description
        })),
        securityData: {
          violationCount: violations.length,
          testLocked: testLocked,
          suspiciousActivity: suspiciousActivity
        }
      };

      console.log("Submitting test data:", submissionData);

      // CORRIGÉ: Create a mock result without generating ObjectId incompatible IDs
      const mockResult = {
        // CORRECTION: Ne pas générer d'_id côté client, laisser le backend le faire
        testId: test._id, // ✅ Utilise l'ID existant du test (déjà un ObjectId valide)
        score: score,
        passed: passed,
        correctAnswers: correctAnswers,
        totalQuestions: test.questions.length,
        timeSpent: (test.testDuration || 30) * 60 - timeRemaining,
        violations: violations,
        completedAt: new Date().toISOString()
      };

      setTestResult(mockResult);
      setTestSubmitted(true);
      
      // Exit fullscreen after submission
      if (test?.security?.fullscreenMode) {
        exitFullscreen();
      }
      
      // CORRIGÉ: Passer les données compatibles avec ObjectId
      if (onTestCompleted) {
        onTestCompleted({
          testId: test._id, // ✅ Utilise l'ID existant du test (ObjectId valide)
          // CORRECTION: Ne pas passer de resultId généré côté client
          score: score,
          passed: passed,
          violations: violations.length
        });
      }

      // TODO: Replace with actual API call when backend is ready
      /*
      const response = await api.post("/tests/submit", submissionData);

      if (response.success && response.result) {
        setTestResult(response.result);
        setTestSubmitted(true);
        
        // Exit fullscreen after submission
        if (test?.security?.fullscreenMode) {
          exitFullscreen();
        }
        
        if (onTestCompleted) {
          onTestCompleted({
            testId: test._id,
            resultId: response.result._id, // ✅ Utilise l'ID généré par le backend
            score: response.result.score,
            passed: response.result.passed,
            violations: violations.length
          });
        }
      } else {
        throw new Error("Failed to submit test");
      }
      */
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error("Failed to submit test");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = () => {
    if (!test || !test.questions || test.questions.length === 0) return 0;
    return Math.round((Object.keys(answers).length / test.questions.length) * 100);
  };

  const handleClose = () => {
    if (testStarted && !testSubmitted) {
      const confirmClose = window.confirm("Are you sure you want to close the test? Your progress will be lost.");
      if (!confirmClose) return;
    }
    
    if (test?.security?.fullscreenMode) {
      exitFullscreen();
    }
    
    onClose();
  };

  console.log("TestModal rendering with:", { 
    isOpen, 
    testData: testData ? "exists" : "null", 
    test: test ? "exists" : "null",
    loading,
    error,
    showInstructions,
    testStarted,
    testSubmitted,
    isFullscreen
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] ${
            isFullscreen ? "z-[9999]" : ""
          }`}
          onClick={(e) => {
            if (e.target === e.currentTarget && (!testStarted || testSubmitted)) {
              handleClose();
            }
          }}
        >
          <motion.div
            ref={testContainerRef}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={`bg-white rounded-lg shadow-xl overflow-hidden flex flex-col ${
              isFullscreen 
                ? "w-full h-full rounded-none" 
                : "w-full max-w-4xl max-h-[90vh]"
            }`}
            style={{
              userSelect: test?.security?.preventCopy ? "none" : "auto",
              WebkitUserSelect: test?.security?.preventCopy ? "none" : "auto",
              MozUserSelect: test?.security?.preventCopy ? "none" : "auto",
              msUserSelect: test?.security?.preventCopy ? "none" : "auto"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-lg">
                  {test?.testName || testData?.testName || "Test"}
                </h2>
                {test?.security && (
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-blue-200" />
                    <span className="text-xs text-blue-200">Secure</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {testStarted && !testSubmitted && (
                  <>
                    {(warningCount > 0 || suspiciousActivity) && (
                      <div className="flex items-center gap-1 bg-red-500 px-2 py-1 rounded text-xs">
                        <AlertCircle size={14} />
                        <span>{warningCount} violations</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 bg-blue-500 px-3 py-1 rounded">
                      <Clock size={16} />
                      <span className="font-mono">{formatTime(timeRemaining)}</span>
                    </div>
                  </>
                )}
                
                {test?.security?.fullscreenMode && testStarted && !testSubmitted && (
                  <button
                    onClick={isFullscreen ? exitFullscreen : enterFullscreen}
                    className="p-1 hover:bg-blue-500 rounded"
                  >
                    <Maximize size={16} />
                  </button>
                )}
                
                {(!testStarted || testSubmitted) && (
                  <button 
                    onClick={handleClose} 
                    className="text-white hover:text-blue-200 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              {loading && !test ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                  <span className="ml-3 text-gray-600">Loading test...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button 
                    onClick={handleClose} 
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : showInstructions && test ? (
                <TestInstructions test={test} onStart={startTest} onClose={handleClose} />
              ) : testSubmitted && testResult ? (
                <TestResults 
                  result={testResult} 
                  test={test} 
                  onClose={handleClose}
                  violations={violations}
                />
              ) : testStarted && test ? (
                <TestQuestion
                  test={test}
                  currentQuestionIndex={currentQuestionIndex}
                  answers={answers}
                  onAnswerSelect={handleAnswerSelect}
                  onNext={goToNextQuestion}
                  onPrevious={goToPreviousQuestion}
                  onSubmit={handleSubmitTest}
                  onQuestionJump={setCurrentQuestionIndex}
                  progress={getProgressPercentage()}
                  warningCount={warningCount}
                  testLocked={testLocked}
                  loading={loading}
                  violations={violations}
                  isFullscreen={isFullscreen}
                />
              ) : (
                <div className="text-center py-8">
                  <Loader2 className="animate-spin h-8 w-8 text-blue-500 mx-auto" />
                  <p className="text-gray-600 mt-4">Preparing test...</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const TestInstructions = ({ test, onStart, onClose }) => {
  console.log("TestInstructions rendering with test:", test);
  
  const security = test?.security || {};
  const securityFeatures = [
    { key: "preventCopy", label: "Copy/Paste prevention", enabled: security.preventCopy },
    { key: "preventTabSwitch", label: "Tab switching prevention", enabled: security.preventTabSwitch },
    { key: "fullscreenMode", label: "Fullscreen mode required", enabled: security.fullscreenMode },
    { key: "preventDevTools", label: "Developer tools blocked", enabled: security.preventDevTools },
    { key: "timeLimit", label: "Time limit enforced", enabled: security.timeLimit }
  ].filter(feature => feature.enabled);
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <FileText className="mx-auto h-12 w-12 text-blue-500 mb-4" />
        <h3 className="text-xl font-bold text-gray-800">Test Instructions</h3>
        <p className="text-gray-600 mt-2">{test.instructions}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {test.questions?.length || 0}
          </div>
          <div className="text-sm text-gray-600">Questions</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {test.testDuration || 0}
          </div>
          <div className="text-sm text-gray-600">Minutes</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {test.passingScore || 60}%
          </div>
          <div className="text-sm text-gray-600">To pass</div>
        </div>
      </div>

      {securityFeatures.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-5 w-5 text-red-600" />
            <h4 className="font-semibold text-red-800">Enabled security measures</h4>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {securityFeatures.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                {feature.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Important rules:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Read each question carefully</li>
          <li>• Respect the time limit</li>
          <li>• Avoid suspicious behavior</li>
          <li>• The test will end automatically if rules are violated</li>
          {!security.allowBackNavigation && (
            <li>• You cannot return to previous questions</li>
          )}
        </ul>
      </div>

      {test.description && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-700">{test.description}</p>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button 
          onClick={onClose} 
          className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={onStart} 
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          Start test
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

const TestQuestion = ({
  test,
  currentQuestionIndex,
  answers,
  onAnswerSelect,
  onNext,
  onPrevious,
  onSubmit,
  onQuestionJump,
  warningCount,
  testLocked,
  loading,
  violations,
  isFullscreen
}) => {
  const currentQuestion = test.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === test.questions.length - 1;
  const answeredCount = Object.keys(answers).length;
  const security = test?.security || {};

  if (testLocked) {
    return (
      <div className="text-center py-8">
        <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-600 mb-2">Test Terminated</h3>
        <p className="text-gray-600 mb-4">
          The test was automatically terminated due to security violations.
        </p>
        {violations.length > 0 && (
          <div className="bg-red-50 p-3 rounded-lg text-left max-w-md mx-auto">
            <h4 className="font-medium text-red-800 mb-2">Detected violations:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {violations.map((violation, index) => (
                <li key={index}>• {violation.description}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress and warnings */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">
          Question {currentQuestionIndex + 1} of {test.questions.length}
        </span>
        <div className="flex items-center gap-4">
          {warningCount > 0 && (
            <span className="text-red-600 flex items-center gap-1">
              <AlertCircle size={14} /> 
              {warningCount} warning{warningCount !== 1 ? "s" : ""}
            </span>
          )}
          <span className="text-blue-600">
            {answeredCount}/{test.questions.length} answered
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(answeredCount / test.questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswerSelect(currentQuestionIndex, index)}
              className={`w-full text-left p-4 border rounded-lg transition-all duration-200 ${
                answers[currentQuestionIndex] === index 
                  ? "border-blue-500 bg-blue-50 shadow-sm" 
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  answers[currentQuestionIndex] === index 
                    ? "border-blue-500 bg-blue-500" 
                    : "border-gray-300"
                }`}>
                  {answers[currentQuestionIndex] === index && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-gray-700">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <button
          onClick={onPrevious}
          disabled={currentQuestionIndex === 0 || !security.allowBackNavigation}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Back
        </button>

        {isLastQuestion ? (
          <button
            onClick={onSubmit}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                Submitting...
              </>
            ) : (
              "Submit Test"
            )}
          </button>
        ) : (
          <button 
            onClick={onNext} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue →
          </button>
        )}
      </div>

      {/* Question navigation - only show if back navigation is allowed */}
      {security.allowBackNavigation && (
        <div className="border-t pt-4">
          <p className="text-sm text-gray-600 mb-3">Quick navigation:</p>
          <div className="flex flex-wrap gap-2">
            {test.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => onQuestionJump(index)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? "bg-blue-600 text-white"
                    : answers[index] !== undefined
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Security status indicator */}
      {(violations.length > 0 || warningCount > 0) && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-800">Security violations detected</span>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {violations.slice(-3).map((violation, index) => (
              <li key={index}>• {violation.description}</li>
            ))}
          </ul>
          <p className="text-xs text-red-600 mt-2">
            {warningCount >= 2 ? "Warning: Test will be locked after next violation" : 
             `${2 - warningCount} warning${2 - warningCount !== 1 ? "s" : ""} remaining`}
          </p>
        </div>
      )}
    </div>
  );
};

const TestResults = ({ result, test, onClose, violations = [] }) => {
  const isPassed = result.passed;
  const correctAnswers = result.correctAnswers || Math.round((result.score / 100) * test.questions.length);

  return (
    <div className="text-center space-y-6">
      <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${
        isPassed ? "bg-green-100" : "bg-red-100"
      }`}>
        {isPassed ? (
          <CheckCircle className="h-10 w-10 text-green-600" />
        ) : (
          <XCircle className="h-10 w-10 text-red-600" />
        )}
      </div>

      <div>
        <h3 className={`text-2xl font-bold mb-2 ${
          isPassed ? "text-green-600" : "text-red-600"
        }`}>
          {isPassed ? "Test Passed!" : "Test Failed"}
        </h3>
        <p className="text-gray-600">
          {isPassed 
            ? "Congratulations! You passed the test."
            : "You did not reach the minimum required score."
          }
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-gray-800">{result.score}%</div>
          <div className="text-sm text-gray-600">Your score</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-gray-800">
            {correctAnswers}/{test.questions.length}
          </div>
          <div className="text-sm text-gray-600">Correct answers</div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-700">
          Minimum passing score: {test.passingScore}%
        </p>
      </div>

      {violations.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-800">Security violations:</span>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {violations.map((violation, index) => (
              <li key={index}>• {violation.description}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={onClose}
        className={`px-8 py-3 rounded-lg text-white font-medium transition-colors ${
          isPassed ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
        }`}
      >
        {isPassed ? "Continue" : "Close"}
      </button>
    </div>
  );
};

export default TestModal;