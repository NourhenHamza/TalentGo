import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Loader2,
  MapPin,
  Maximize,
  Send,
  Shield,
  Timer,
  Upload,
  XCircle
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthenticationStep from '../components/AuthenticationStep';

const PublicTestPage = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  
  // Core states
  const [currentStep, setCurrentStep] = useState('loading');
  const [testData, setTestData] = useState(null);
  const [offerData, setOfferData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Authentication states
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    applicationType: 'Stage',
    coverLetter: ''
  });
  const [cvFile, setCvFile] = useState(null);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  
  // Test states - Enhanced with security features
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testStartTime, setTestStartTime] = useState(null);
  const [submittingTest, setSubmittingTest] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testLocked, setTestLocked] = useState(false);
  
  // Security states - NEW
  const [violations, setViolations] = useState([]);
  const [warningCount, setWarningCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const [suspiciousActivity, setSuspiciousActivity] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  
  // Results states
  const [testResults, setTestResults] = useState(null);
  
  // Refs for security monitoring
  const timerRef = useRef(null);
  const fullscreenRef = useRef(null);
  const devToolsDetectionRef = useRef(null);
  const testContainerRef = useRef(null);

  // Initialize test data
  useEffect(() => {
    if (!uuid) {
      setError("L'identifiant du test est manquant dans l'URL");
      setLoading(false);
      return;
    }
    fetchTestInfo();
  }, [uuid]);

  // Enhanced timer with security checks
  useEffect(() => {
    if (testStarted && !testSubmitted && !testLocked && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSecurityViolation("time_limit_exceeded", "Temps limite dépassé");
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [testStarted, testSubmitted, testLocked, timeRemaining]);

  // Enhanced Security monitoring - NEW
  useEffect(() => {
    if (!testStarted || testSubmitted || testLocked || !testData?.security) return;

    const security = testData.security;

    // Tab switch detection
    const handleVisibilityChange = () => {
      if (document.hidden && security.preventTabSwitch) {
        handleSecurityViolation("tab_switch", "Changement d'onglet détecté");
      }
    };

    // Enhanced keyboard shortcut prevention
    const handleKeyDown = (e) => {
      if (security.preventCopy) {
        const forbiddenKeys = ["c", "v", "x", "f", "p", "s", "i", "j", "u", "r", "a"];
        
        if ((e.ctrlKey || e.altKey || e.metaKey) && forbiddenKeys.includes(e.key.toLowerCase())) {
          e.preventDefault();
          handleSecurityViolation("shortcut", `Tentative d'utilisation du raccourci ${e.key.toUpperCase()}`);
        }
      }

      if (security.preventDevTools) {
        if (e.key === "F12" || 
            (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
            (e.ctrlKey && e.key === "U")) {
          e.preventDefault();
          handleSecurityViolation("devtools", "Tentative d'ouverture des outils de développement");
        }
      }

      if (e.key === "Escape" && security.fullscreenMode && isFullscreen) {
        e.preventDefault();
        handleSecurityViolation("escape", "Tentative de sortie du mode plein écran");
      }
    };

    // Right-click prevention
    const handleContextMenu = (e) => {
      if (security.preventCopy) {
        e.preventDefault();
        handleSecurityViolation("right_click", "Clic droit détecté");
      }
    };

    // Text selection prevention
    const handleSelectStart = (e) => {
      if (security.preventCopy) {
        e.preventDefault();
        handleSecurityViolation("text_select", "Tentative de sélection de texte");
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
        handleSecurityViolation("fullscreen_exit", "Sortie du mode plein écran");
        handleSubmitTest();
      }
    };

    // Blur detection
    const handleBlur = () => {
      if (security.preventTabSwitch) {
        handleSecurityViolation("focus_loss", "Perte de focus de la fenêtre de test");
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
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [testStarted, testSubmitted, testLocked, testData, isFullscreen]);

  // Developer tools detection - NEW
  useEffect(() => {
    if (!testStarted || testSubmitted || testLocked || !testData?.security?.preventDevTools) return;

    const detectDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      
      if (widthThreshold || heightThreshold) {
        if (!devToolsOpen) {
          setDevToolsOpen(true);
          handleSecurityViolation("devtools_open", "Outils de développement détectés");
        }
      } else {
        setDevToolsOpen(false);
      }
    };

    devToolsDetectionRef.current = setInterval(detectDevTools, 1000);
    
    return () => {
      if (devToolsDetectionRef.current) {
        clearInterval(devToolsDetectionRef.current);
      }
    };
  }, [testStarted, testSubmitted, testLocked, testData, devToolsOpen]);

  const fetchTestInfo = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/public-test/${uuid}`);
      const data = await response.json();

      if (response.ok) {
        if (!data.data.test) {
          setTestData(null);
          setOfferData(data.data.offer);
          setCurrentStep('form');
          toast.info("Cette offre ne contient pas de test. Vous pouvez soumettre votre candidature directement.");
        } else {
          setTestData(data.data.test);
          setOfferData(data.data.offer);
          setCurrentStep('info');
        }
      } else {
        setError(data.message || 'Lien de test invalide');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Security violation handler - NEW
  const handleSecurityViolation = (type, description) => {
    if (testLocked) return;

    const violation = { type, description, timestamp: new Date().toISOString() };
    setViolations(prev => [...prev, violation]);
    
    // Severe violations that terminate immediately
    const severeViolations = ["fullscreen_exit", "devtools_open", "time_limit_exceeded"];
    if (severeViolations.includes(type)) {
      setTestLocked(true);
      toast.error(`Test terminé: ${description}`);
      setTimeout(() => handleSubmitTest(), 1000);
      return;
    }

    // Increment warning count for other violations
    setWarningCount(prev => {
      const newWarningCount = prev + 1;
      if (newWarningCount >= 2) {
        setTestLocked(true);
        toast.error("Test verrouillé en raison de multiples violations");
        setTimeout(() => handleSubmitTest(), 1000);
      } else {
        toast.warning(`Avertissement de sécurité: ${description}. ${2 - newWarningCount} avertissement(s) restant(s).`);
      }
      return newWarningCount;
    });
  };

  // Fullscreen management - NEW
  const enterFullscreen = async () => {
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
      console.error("Échec de l'entrée en mode plein écran:", error);
      handleSecurityViolation("fullscreen_failed", "Échec de l'entrée en mode plein écran");
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

  const handleAuthSuccess = (userData) => {
    setAuthenticatedUser(userData.user); 
    setFormData(prev => ({
      ...prev,
      firstName: userData.user?.firstName || '',
      lastName: userData.user?.lastName || '',
      email: userData.user?.email || ''
    }));

    if (userData.applicationId) {
      setApplicationId(userData.applicationId);
    }
    
    setCurrentStep('form');
    toast.success('Authentification réussie !');
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    
    if (!cvFile) {
      toast.error('Veuillez télécharger votre CV');
      return;
    }

    if (!authenticatedUser) {
      toast.error('Erreur d\'authentification. Veuillez vous reconnecter.');
      setCurrentStep('auth');
      return;
    }

    setSubmittingForm(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      formDataToSend.append('cv', cvFile);
      formDataToSend.append('authProvider', authenticatedUser.provider);
      formDataToSend.append('authProviderId', authenticatedUser.providerId);
      formDataToSend.append('authVerifiedEmail', authenticatedUser.email);
      formDataToSend.append('authProviderData', JSON.stringify(authenticatedUser));

      if (applicationId) {
        formDataToSend.append('applicationId', applicationId);
      }

      const response = await fetch(`http://localhost:4000/api/public-test/${uuid}/apply`, {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        if (data.data && data.data.applicationId) {
          setApplicationId(data.data.applicationId);
          toast.success('Candidature soumise avec succès !');
          
          if (testData && data.data.nextStep === 'test') {
            setCurrentStep('test');
            setTimeRemaining(testData.testDuration * 60);
          } else {
            setCurrentStep('results');
            setTestResults(data.data.results || { passed: true, score: 100, correctAnswers: 0, totalQuestions: 0, passingScore: 0 });
          }
        } else {
          toast.error('Erreur: Réponse inattendue du serveur après soumission.');
        }
      } else {
        toast.error(data.message || 'Erreur lors de la soumission');
      }
    } catch (error) {
      toast.error('Erreur lors de la soumission de la candidature');
    } finally {
      setSubmittingForm(false);
    }
  };

  // Enhanced test start with security checks - UPDATED
  const handleStartTest = async () => {
    console.log("Démarrage du test avec sécurité...");
    
    // Check max attempts
    if (testData.maxAttempts && attemptCount >= testData.maxAttempts) {
      toast.error(`Nombre maximum de tentatives atteint (${testData.maxAttempts})`);
      return;
    }
    
    // Enable fullscreen if required
    if (testData?.security?.fullscreenMode) {
      await enterFullscreen();
    }
    
    setAttemptCount(prev => prev + 1);
    setTestStarted(true);
    setTestStartTime(new Date());
    setCurrentQuestion(0);
    setAnswers({});
    setViolations([]);
    setWarningCount(0);
    setTestLocked(false);
    setSuspiciousActivity(false);
  };

  const handleAnswerQuestion = (questionIndex, answerIndex) => {
    if (testLocked) return;
    
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: {
        questionIndex,
        selectedAnswer: answerIndex,
        timeSpent: 0
      }
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < testData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0 && testData?.security?.allowBackNavigation) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  // Enhanced test submission with security data - UPDATED
  const handleSubmitTest = async () => {
    if (submittingTest || testSubmitted) return;
    
    setSubmittingTest(true);
    setTestSubmitted(true);
    
    try {
      const timeSpent = testStartTime ? 
        Math.floor((new Date() - testStartTime) / 1000) : 
        (testData.testDuration * 60) - timeRemaining;

      const answersArray = Object.values(answers);

      // Include security data in submission
      const submissionData = {
        applicationId,
        answers: answersArray,
        timeSpent,
        startedAt: testStartTime,
        securityData: {
          violations: violations.map(v => ({
            violation: v.type,
            timestamp: v.timestamp,
            description: v.description
          })),
          violationCount: violations.length,
          testLocked: testLocked,
          suspiciousActivity: suspiciousActivity,
          attemptNumber: attemptCount
        }
      };

      const response = await fetch(`http://localhost:4000/api/public-test/${uuid}/submit-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      const data = await response.json();

      if (response.ok) {
        setTestResults(data.data);
        setCurrentStep('results');
        
        // Exit fullscreen after submission
        if (testData?.security?.fullscreenMode) {
          exitFullscreen();
        }
        
        toast.success('Test soumis avec succès !');
      } else {
        toast.error(data.message || 'Erreur lors de la soumission du test');
      }
    } catch (error) {
      toast.error('Erreur lors de la soumission du test');
    } finally {
      setSubmittingTest(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleBackToInfo = () => {
    setCurrentStep('info');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du test...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-lg">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Accès impossible</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => navigate('/')} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  // Info step - Enhanced with security information
  if (currentStep === 'info' && testData && offerData) {
    const security = testData.security || {};
    const securityFeatures = [
      { key: "preventCopy", label: "Prévention copie/coller", enabled: security.preventCopy },
      { key: "preventTabSwitch", label: "Prévention changement d'onglet", enabled: security.preventTabSwitch },
      { key: "fullscreenMode", label: "Mode plein écran requis", enabled: security.fullscreenMode },
      { key: "preventDevTools", label: "Outils de développement bloqués", enabled: security.preventDevTools },
      { key: "timeLimit", label: "Limite de temps stricte", enabled: security.timeLimit }
    ].filter(feature => feature.enabled);

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Offer information */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              {offerData.entreprise?.logo && (
                <img src={offerData.entreprise.logo} alt={offerData.entreprise.nom} className="w-16 h-16 object-contain rounded-lg border"/>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{offerData.titre}</h1>
                <p className="text-lg text-blue-600 font-medium">{offerData.entreprise?.nom}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-600"><Building2 size={16} /><span>{offerData.type_offre}</span></div>
              <div className="flex items-center gap-2 text-gray-600"><MapPin size={16} /><span>{offerData.localisation}</span></div>
              {offerData.hasRemuneration && (<div className="flex items-center gap-2 text-gray-600"><DollarSign size={16} /><span>{offerData.remuneration}</span></div>)}
            </div>
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold mb-2">Description du poste</h3>
              <p className="text-gray-700 whitespace-pre-line">{offerData.description}</p>
            </div>
            {offerData.competences_requises?.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Compétences requises</h3>
                <div className="flex flex-wrap gap-2">
                  {offerData.competences_requises.map((c, i) => (<span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{c}</span>))}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced test information with security details */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="text-blue-600" />
              Test Technique
              {securityFeatures.length > 0 && (
                <Shield className="text-red-600" size={20} />
              )}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">{testData.testName}</h3>
                <p className="text-gray-600 mb-4">{testData.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2"><Clock size={16} className="text-gray-500" /><span>Durée: {testData.testDuration} minutes</span></div>
                  <div className="flex items-center gap-2"><FileText size={16} className="text-gray-500" /><span>{testData.questions?.length || 0} questions</span></div>
                  <div className="flex items-center gap-2"><CheckCircle size={16} className="text-gray-500" /><span>Score minimum: {testData.passingScore}%</span></div>
                  {testData.maxAttempts && (
                    <div className="flex items-center gap-2"><AlertCircle size={16} className="text-orange-500" /><span>Tentatives max: {testData.maxAttempts}</span></div>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Instructions</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    {testData.instructions ? (
                      <p className="whitespace-pre-line">{testData.instructions}</p>
                    ) : (
                      <ul className="space-y-1">
                        <li>• Lisez attentivement chaque question</li>
                        <li>• Une seule réponse par question</li>
                        <li>• Respectez la limite de temps</li>
                        <li>• Évitez les comportements suspects</li>
                      </ul>
                    )}
                  </div>
                </div>

                {/* Security features display */}
                {securityFeatures.length > 0 && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="h-5 w-5 text-red-600" />
                      <h4 className="font-semibold text-red-800">Mesures de sécurité activées</h4>
                    </div>
                    <ul className="text-sm text-red-700 space-y-1">
                      {securityFeatures.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          {feature.label}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-red-600 mt-2">
                      Le test sera automatiquement terminé en cas de violation des règles.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-center">
              <button onClick={() => setCurrentStep('auth')} className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 mx-auto">
                Commencer le processus de candidature <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Auth step
  if (currentStep === 'auth') {
    return <AuthenticationStep onAuthSuccess={handleAuthSuccess} onBack={handleBackToInfo} testUuid={uuid} offerData={offerData} />;
  }

  // Form step
  if (currentStep === 'form') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><CheckCircle className="h-5 w-5 text-green-600" /></div>
                <div>
                  <p className="text-sm font-medium text-green-800">Authentifié via {authenticatedUser?.provider || 'Fournisseur inconnu'}</p>
                  <p className="text-xs text-green-600">{authenticatedUser?.email}</p>
                </div>
              </div>
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Formulaire de candidature</h2>
            <form onSubmit={handleSubmitForm} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                  <input type="text" value={formData.firstName} onChange={(e) => setFormData(prev => ({...prev, firstName: e.target.value}))} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                  <input type="text" value={formData.lastName} onChange={(e) => setFormData(prev => ({...prev, lastName: e.target.value}))} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input type="email" value={formData.email} disabled className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"/>
                <p className="text-xs text-gray-500 mt-1">Email vérifié via {authenticatedUser?.provider || 'Fournisseur inconnu'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de candidature *</label>
                <select value={formData.applicationType} onChange={(e) => setFormData(prev => ({...prev, applicationType: e.target.value}))} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Stage">Stage</option>
                  <option value="Emploi">Emploi</option>
                  <option value="Alternance">Alternance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CV * (PDF, DOC, DOCX - Max 5MB)</label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${cvFile ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'}`}>
                  <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCvFile(e.target.files[0])} required className="hidden" id="cv-upload"/>
                  <label htmlFor="cv-upload" className="cursor-pointer">
                    {cvFile ? (<div className="flex items-center justify-center gap-2"><CheckCircle className="h-6 w-6 text-green-600" /><span className="text-green-700 font-medium">{cvFile.name}</span></div>) : (<><Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" /><p className="text-sm text-gray-600">Cliquez pour télécharger votre CV</p></>)}
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lettre de motivation (optionnelle)</label>
                <textarea value={formData.coverLetter} onChange={(e) => setFormData(prev => ({...prev, coverLetter: e.target.value}))} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Expliquez votre motivation pour ce poste..."/>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setCurrentStep('auth')} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"><ArrowLeft size={16} className="inline mr-2" />Retour</button>
                <button type="submit" disabled={submittingForm || !cvFile} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">{submittingForm ? 'Soumission...' : 'Soumettre et passer le test'}<ArrowRight size={16} className="inline ml-2" /></button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced test step with security features
  if (currentStep === 'test' && testData) {
    // Test locked state
    if (testLocked) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-4">Test Terminé</h2>
            <p className="text-gray-600 mb-4">
              Le test a été automatiquement terminé en raison de violations de sécurité.
            </p>
            {violations.length > 0 && (
              <div className="bg-red-50 p-3 rounded-lg text-left mb-4">
                <h4 className="font-medium text-red-800 mb-2">Violations détectées:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {violations.map((violation, index) => (
                    <li key={index}>• {violation.description}</li>
                  ))}
                </ul>
              </div>
            )}
            <button onClick={() => navigate('/')} className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium">
              Retour à l'accueil
            </button>
          </div>
        </div>
      );
    }

    // Test start screen
    if (!testStarted) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
            <Timer className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Prêt à commencer le test ?</h2>
            <p className="text-gray-600 mb-4">
              Vous avez {testData.testDuration} minutes pour répondre à {testData.questions.length} questions. 
              Une fois commencé, le timer ne peut pas être mis en pause.
            </p>
            
            {/* Security warnings */}
            {testData.security && Object.values(testData.security).some(Boolean) && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-800">Règles importantes:</span>
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  {testData.security.preventCopy && <li>• Copie/coller interdit</li>}
                  {testData.security.preventTabSwitch && <li>• Changement d'onglet interdit</li>}
                  {testData.security.fullscreenMode && <li>• Mode plein écran obligatoire</li>}
                  {testData.security.preventDevTools && <li>• Outils de développement bloqués</li>}
                  {!testData.security.allowBackNavigation && <li>• Retour aux questions précédentes interdit</li>}
                </ul>
                <p className="text-xs text-red-600 mt-2">
                  Le test sera terminé automatiquement en cas de violation.
                </p>
              </div>
            )}
            
            {/* Attempt counter */}
            {testData.maxAttempts && (
              <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg mb-4">
                <p className="text-sm text-orange-700">
                  Tentative {attemptCount + 1} sur {testData.maxAttempts}
                </p>
              </div>
            )}
            
            <button 
              onClick={handleStartTest} 
              disabled={testData.maxAttempts && attemptCount >= testData.maxAttempts}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testData.maxAttempts && attemptCount >= testData.maxAttempts 
                ? 'Nombre maximum de tentatives atteint' 
                : 'Commencer le test'
              }
            </button>
          </div>
        </div>
      );
    }

    // Test in progress
    const currentQuestionData = testData.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / testData.questions.length) * 100;
    const security = testData.security || {};

    return (
      <div 
        className={`min-h-screen bg-gray-50 py-8 ${isFullscreen ? 'p-0' : ''}`}
        ref={testContainerRef}
        style={{
          userSelect: security.preventCopy ? "none" : "auto",
          WebkitUserSelect: security.preventCopy ? "none" : "auto",
          MozUserSelect: security.preventCopy ? "none" : "auto",
          msUserSelect: security.preventCopy ? "none" : "auto"
        }}
      >
        <div className={`mx-auto px-4 ${isFullscreen ? 'max-w-full h-full flex flex-col' : 'max-w-4xl'}`}>
          {/* Enhanced header with security indicators */}
          <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-600">Question {currentQuestion + 1} sur {testData.questions.length}</span>
                <div className="w-64 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}/>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Security warnings */}
                {(warningCount > 0 || suspiciousActivity) && (
                  <div className="flex items-center gap-1 bg-red-500 px-2 py-1 rounded text-xs text-white">
                    <AlertCircle size={14} />
                    <span>{warningCount} violations</span>
                  </div>
                )}
                
                {/* Timer */}
                <div className={`flex items-center gap-2 font-mono px-3 py-1 rounded ${timeRemaining < 300 ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-50'}`}>
                  <Timer size={16} />
                  <span>{formatTime(timeRemaining)}</span>
                </div>
                
                {/* Fullscreen toggle */}
                {security.fullscreenMode && (
                  <button
                    onClick={isFullscreen ? exitFullscreen : enterFullscreen}
                    className="p-1 hover:bg-gray-100 rounded"
                    title={isFullscreen ? "Sortir du plein écran" : "Entrer en plein écran"}
                  >
                    <Maximize size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Question content */}
          <div className={`bg-white rounded-lg shadow-lg p-6 mb-6 ${isFullscreen ? 'flex-1' : ''}`}>
            <h3 className="text-lg font-semibold text-gray-800 mb-6">{currentQuestionData.question}</h3>
            <div className="space-y-3">
              {currentQuestionData.options.map((option, index) => (
                <label 
                  key={index} 
                  className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                    answers[currentQuestion]?.selectedAnswer === index 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input 
                    type="radio" 
                    name={`question-${currentQuestion}`} 
                    value={index} 
                    checked={answers[currentQuestion]?.selectedAnswer === index} 
                    onChange={() => handleAnswerQuestion(currentQuestion, index)} 
                    className="sr-only"
                    disabled={testLocked}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <div className="flex justify-between">
              <button 
                onClick={handlePreviousQuestion} 
                disabled={currentQuestion === 0 || !security.allowBackNavigation || testLocked} 
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={16} className="inline mr-2" />Précédent
              </button>
              
              {currentQuestion === testData.questions.length - 1 ? (
                <button 
                  onClick={handleSubmitTest} 
                  disabled={submittingTest || !answers[currentQuestion] || testLocked} 
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {submittingTest ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4" />
                      Soumission...
                    </>
                  ) : (
                    <>
                      Terminer le test
                      <Send size={16} />
                    </>
                  )}
                </button>
              ) : (
                <button 
                  onClick={handleNextQuestion} 
                  disabled={!answers[currentQuestion] || testLocked} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Suivant<ArrowRight size={16} className="inline ml-2" />
                </button>
              )}
            </div>
          </div>

          {/* Security violations display */}
          {(violations.length > 0 || warningCount > 0) && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Violations de sécurité détectées</span>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {violations.slice(-3).map((violation, index) => (
                  <li key={index}>• {violation.description}</li>
                ))}
              </ul>
              <p className="text-xs text-red-600 mt-2">
                {warningCount >= 2 ? "Attention: Le test sera verrouillé à la prochaine violation" : 
                 `${2 - warningCount} avertissement${2 - warningCount !== 1 ? "s" : ""} restant${2 - warningCount !== 1 ? "s" : ""}`}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Results step
  if (currentStep === 'results' && testResults) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className={`h-16 w-16 rounded-full mx-auto mb-4 flex items-center justify-center ${testResults.passed ? 'bg-green-100' : 'bg-red-100'}`}>
              <CheckCircle className={`h-8 w-8 ${testResults.passed ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Test terminé !</h2>
            <div className="mb-6">
              <div className={`text-4xl font-bold mb-2 ${testResults.passed ? 'text-green-600' : 'text-red-600'}`}>
                {testResults.score}%
              </div>
              <p className={`text-lg mb-4 ${testResults.passed ? 'text-green-700' : 'text-red-700'}`}>
                {testResults.passed ? 'Félicitations ! Vous avez réussi le test.' : 'Vous n\'avez pas atteint le score minimum requis.'}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
                <div>
                  <span className="font-medium">Bonnes réponses :</span>
                  <br />
                  {testResults.correctAnswers} / {testResults.totalQuestions}
                </div>
                <div>
                  <span className="font-medium">Score requis :</span>
                  <br />
                  {testResults.passingScore}%
                </div>
              </div>
            </div>

            {/* Security violations in results */}
            {violations.length > 0 && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-800">Violations de sécurité:</span>
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  {violations.map((violation, index) => (
                    <li key={index}>• {violation.description}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-blue-800">
                Votre candidature a été soumise avec succès. L'entreprise examinera votre profil et vous contactera si votre candidature est retenue.
              </p>
            </div>
            <button onClick={() => navigate('/')} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">État inconnu</h2>
        <p className="text-gray-600 mb-4">Une erreur inattendue s'est produite. Veuillez réessayer.</p>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

export default PublicTestPage;

