// components/ApplyModal.jsx - Fixed Version with Proper TestModal Integration
"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  Play,
  Upload,
  X,
  XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../admin/src/utils/api";
import TestModal from "./TestModal";


const ApplyModal = ({ isOpen, onClose, offer, onApplicationSuccess }) => {
  // Existing states
  const [primaryCV, setPrimaryCV] = useState(null);
  const [selectedCVType, setSelectedCVType] = useState("primary");
  const [newCVFile, setNewCVFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [cvUploadLoading, setCvUploadLoading] = useState(false);
  const [primaryCVLoading, setPrimaryCVLoading] = useState(false);
  
  // Test-related states
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testRequired, setTestRequired] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [applicationStep, setApplicationStep] = useState(1);
  const [testData, setTestData] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchPrimaryCV();
      checkTestRequirement();
      // Reset states
      setCoverLetter("");
      setTestCompleted(false);
      setApplicationStep(1);
      setTestError(null);
      setTestModalOpen(false);
      setTestResult(null);
    }
  }, [isOpen, offer]);

  // FIXED: Improved checkTestRequirement function
  const checkTestRequirement = async () => {
    if (!offer?._id) return;
    
    try {
      setTestLoading(true);
      setTestError(null);
      console.log("Checking test requirement for offer:", offer._id);
      
      // FIXED: Better handling of test data from offer
      if (offer.requiresTest && offer.test) {
        const testForOffer = offer.test;
        
        // Validate that the test has the required fields
        if (testForOffer.testName && testForOffer.questions && testForOffer.questions.length > 0) {
          setTestRequired(true);
          
          // FIXED: Ensure all required fields are present with defaults
          const completeTestData = {
            _id: testForOffer._id || `test_${offer._id}`,
            testName: testForOffer.testName,
            description: testForOffer.description || "Skills assessment test",
            testDuration: testForOffer.testDuration || 30,
            passingScore: testForOffer.passingScore || 60,
            maxAttempts: testForOffer.maxAttempts || 1,
            instructions: testForOffer.instructions || "Lisez attentivement chaque question et sélectionnez la meilleure réponse.",
            security: {
              preventCopy: testForOffer.security?.preventCopy !== undefined ? testForOffer.security.preventCopy : true,
              timeLimit: testForOffer.security?.timeLimit !== undefined ? testForOffer.security.timeLimit : true,
              showResults: testForOffer.security?.showResults !== undefined ? testForOffer.security.showResults : true,
              allowBackNavigation: testForOffer.security?.allowBackNavigation !== undefined ? testForOffer.security.allowBackNavigation : false,
              preventTabSwitch: testForOffer.security?.preventTabSwitch !== undefined ? testForOffer.security.preventTabSwitch : true,
              fullscreenMode: testForOffer.security?.fullscreenMode !== undefined ? testForOffer.security.fullscreenMode : true,
              preventDevTools: testForOffer.security?.preventDevTools !== undefined ? testForOffer.security.preventDevTools : true
            },
            questions: testForOffer.questions.map(q => ({
              question: q.question,
              options: q.options || [],
              correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
              type: q.type || "multiple_choice",
              isActive: q.isActive !== undefined ? q.isActive : true,
              availableFrom: q.availableFrom || new Date().toISOString()
            }))
          };
          
          setTestData(completeTestData);
          
          // Check if the test has already been completed by the student
          // This part might need backend logic to store student attempts
          // For now, we'll assume no previous attempts
          setTestCompleted(false);
          setTestResult(null);
          
          console.log("Test data loaded and validated:", completeTestData);
        } else {
          console.log("Test data is incomplete or invalid:", testForOffer);
          setTestRequired(false);
          setTestData(null);
          setTestError("Test data is incomplete. You can continue your application without the test.");
        }
      } else {
        setTestRequired(false);
        setTestData(null);
        console.log("No test required for this offer.");
      }
    } catch (error) {
      console.error("Error checking test requirement:", error);
      setTestError("Error checking test requirements. You can continue your application without the test.");
      setTestRequired(false);
      setTestData(null);
    } finally {
      setTestLoading(false);
    }
  };

  const fetchPrimaryCV = async () => {
    try {
      setPrimaryCVLoading(true);
      console.log('🚀 Début fetchPrimaryCV...');
      const response = await api.get('/cvs/primary-cv');
      console.log('✅ Réponse reçue:', response);
      
      if (response.success && response.cv) {
        setPrimaryCV(response.cv);
        console.log('📄 CV primaire chargé:', response.cv);
      } else {
        console.log('⚠️ Aucun CV primaire trouvé');
        setPrimaryCV(null);
      }
    } catch (error) {
      console.error("❌ Error loading primary CV:", error);
      setPrimaryCV(null);
    } finally {
      setPrimaryCVLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "application/pdf" && file.size <= 5 * 1024 * 1024) {
        setNewCVFile(file);
        setSelectedCVType("new");
      } else {
        setNewCVFile(null);
        toast.error("Veuillez sélectionner un fichier PDF de moins de 5 MB.");
      }
    }
  };

  const handleUploadNewCV = async () => {
    if (!newCVFile) {
      toast.error("Veuillez sélectionner un CV à télécharger.");
      return null;
    }

    setCvUploadLoading(true);
    try {
      console.log("🚀 Starting CV upload...");
      console.log("📄 File to upload:", {
        name: newCVFile.name,
        size: newCVFile.size,
        type: newCVFile.type
      });

      const formData = new FormData();
      formData.append("cv", newCVFile);
      
      console.log("📦 FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await api.postFormData("/cvs/upload", formData, false);
      
      console.log("✅ Upload CV response:", response);
      toast.success("Nouveau CV téléchargé avec succès!");
      
      const uploadedCV = response.data?.cv || response.cv;
      const uploadedCVId = uploadedCV?._id;
      
      if (uploadedCVId) {
        setNewCVFile(null);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        return uploadedCVId;
      } else {
        console.error("❌ Unexpected response structure:", response);
        throw new Error("ID du CV téléchargé non trouvé dans la réponse");
      }
    } catch (error) {
      console.error("❌ Error uploading CV:", error);
      
      if (error.response) {
        console.error("❌ Response error:", error.response.data);
        console.error("❌ Status:", error.response.status);
        
        if (error.response.status === 401) {
          toast.error("Session expirée. Veuillez vous reconnecter.");
        } else if (error.response.status === 400) {
          toast.error(error.response.data?.message || "Fichier invalide ou manquant.");
        } else if (error.response.status === 413) {
          toast.error("Fichier trop volumineux. Maximum 5MB.");
        } else {
          toast.error(error.response.data?.message || "Erreur lors du téléchargement.");
        }
      } else if (error.request) {
        console.error("❌ Network error:", error.request);
        toast.error("Erreur réseau. Vérifiez votre connexion.");
      } else {
        console.error("❌ Error:", error.message);
        toast.error(error.message || "Échec du téléchargement du CV.");
      }
      
      return null;
    } finally {
      setCvUploadLoading(false);
    }
  };

  // FIXED: Improved handleTestCompleted function
  const handleTestCompleted = (result) => {
    console.log('Test completed with result:', result);
    setTestResult(result);
    setTestCompleted(true);
    setTestModalOpen(false);
    
    if (result.passed) {
      toast.success("Test réussi ! Vous pouvez maintenant finaliser votre candidature.");
    } else {
      toast.success("Test terminé ! Vous pouvez maintenant finaliser votre candidature.");
    }
    
    // Always advance to step 3 regardless of test result
    setApplicationStep(3);
  };

  const handleNextStep = () => {
    if (applicationStep === 1) {
      if (!canProceedToTest()) {
        toast.error("Veuillez sélectionner un CV avant de continuer.");
        return;
      }
      
      if (testRequired && !testError) {
        setApplicationStep(2);
      } else {
        setApplicationStep(3);
      }
    } else if (applicationStep === 2) {
      if (testRequired && testCompleted) {
        setApplicationStep(3);
      } else if (!testRequired) {
        setApplicationStep(3);
      } else {
        toast.error("Vous devez compléter le test avant de continuer.");
      }
    }
  };

  // FIXED: Improved handleStartTest function
  const handleStartTest = () => {
    console.log('Starting test with data:', testData);
    
    if (!testData) {
      toast.error("Données du test non disponibles.");
      return;
    }

    // Validate test data before opening modal
    if (!testData.questions || testData.questions.length === 0) {
      toast.error("Le test ne contient aucune question.");
      return;
    }

    // Validate that questions have the required structure
    const invalidQuestions = testData.questions.filter(q => 
      !q.question || !q.options || q.options.length < 2 || q.correctAnswer === undefined
    );

    if (invalidQuestions.length > 0) {
      toast.error("Certaines questions du test sont incomplètes.");
      return;
    }

    console.log('Opening test modal with validated data:', {
      testModalOpen: true,
      testData: testData,
      questionsCount: testData.questions.length
    });

    setTestModalOpen(true);
  };

  const handleTestModalClose = () => {
    console.log('Closing test modal');
    setTestModalOpen(false);
  };

  const handleSubmitApplication = async () => {
    setLoading(true);
    let finalCVId = null;

    try {
      if (!offer || !offer._id) {
        toast.error("Informations de l'offre manquantes.");
        return;
      }

      if (testRequired && !testError && !testCompleted) {
        toast.error("Vous devez compléter le test avant de soumettre votre candidature.");
        return;
      }

      if (selectedCVType === "primary" && primaryCV) {
        finalCVId = primaryCV._id;
      } else if (selectedCVType === "new" && newCVFile) {
        console.log("Uploading new CV...");
        finalCVId = await handleUploadNewCV();
        if (!finalCVId) {
          return;
        }
      }

      if (!finalCVId) {
        toast.error("Veuillez sélectionner un CV ou télécharger un nouveau CV.");
        return;
      }

      const applicationData = {
        offreId: offer._id,
        cvId: finalCVId,
        coverLetter: coverLetter.trim() || "",
        testResult: testResult ? {
          testId: testResult.testId,
          resultId: testResult.resultId,
          score: testResult.score,
          passed: testResult.passed
        } : null
      };

      console.log("Submitting application:", applicationData);

      const response = await api.post("/applications", applicationData);
      console.log("Application Response:", response);

      toast.success(response.data?.message || response.message || "Candidature soumise avec succès!");
      
      if (onApplicationSuccess) {
        onApplicationSuccess(response.data?.application || response.application);
      }
      
      onClose();
    } catch (error) {
      console.error("Error during submission:", error);
      
      const errorMessage = error.response?.data?.message || error.message;
      const errorStatus = error.response?.status || error.status;
      
      if (errorStatus === 409) {
        toast.error("Vous avez déjà postulé pour cette offre.");
      } else if (errorStatus === 404) {
        toast.error("Offre ou CV non trouvé. Veuillez vérifier vos données.");
      } else if (errorStatus === 401) {
        toast.error("Vous devez être connecté pour postuler.");
      } else {
        toast.error(errorMessage || "Erreur lors de la soumission de la candidature.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCVDisplay = (cv) => {
    if (!cv) return "No CV";
    const displayName = cv.originalName || cv.filename || "Primary CV";
    const uploadDate = cv.uploadedAt ? new Date(cv.uploadedAt).toLocaleDateString('fr-FR') : "";
    return uploadDate ? `${displayName} (${uploadDate})` : displayName;
  };

  const canProceedToTest = () => {
    if (selectedCVType === "primary" && primaryCV) return true;
    if (selectedCVType === "new" && newCVFile) return true;
    return false;
  };

  const canSubmit = () => {
    if (!canProceedToTest()) return false;
    if (testRequired && !testError && !testCompleted) return false;
    return true;
  };

  const getStepStatus = (step) => {
    if (step < applicationStep) return 'completed';
    if (step === applicationStep) return 'current';
    return 'pending';
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: "CV & Lettre", icon: FileText },
      ...(testRequired && !testError ? [{ number: 2, title: "Test", icon: Award }] : []),
      { number: testRequired && !testError ? 3 : 2, title: "Confirmation", icon: CheckCircle }
    ];

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => {
          const status = getStepStatus(step.number);
          const Icon = step.icon;
          
          return (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                status === 'current' ? 'bg-blue-500 border-blue-500 text-white' :
                'bg-gray-100 border-gray-300 text-gray-400'
              }`}>
                {status === 'completed' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                status === 'completed' ? 'text-green-600' :
                status === 'current' ? 'text-blue-600' :
                'text-gray-400'
              }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="apply-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl relative max-h-[95vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={onClose} 
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 z-10"
                disabled={loading || cvUploadLoading}
              >
                <X size={24} />
              </button>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Apply for : {offer?.titre || "Offre"}
                </h2>
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="font-semibold">{offer?.entreprise_id?.nom || "Company"}</span>
                  {offer?.localisation && (
                    <>
                      <span>•</span>
                      <span>{offer.localisation}</span>
                    </>
                  )}
                </div>
              </div>

              {testLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin h-6 w-6 text-blue-500 mr-2" />
                  <span className="text-slate-500">Checking test requirements...</span>
                </div>
              )}

              {testError && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                    <div>
                      <p className="text-sm text-yellow-700">
                        <strong>Warning :</strong> {testError}
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        You can continue your application without the test.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!testLoading && renderStepIndicator()}

              {/* Step 1: CV & Cover Letter */}
              {!testLoading && applicationStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-lg font-semibold text-slate-700 mb-3">
                      Select your CV *
                    </label>
                    
                    {primaryCVLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="animate-spin h-6 w-6 text-blue-500 mr-2" />
                        <span className="text-slate-500">Loading your primary CV...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {primaryCV && (
                          <div className="mb-4">
                            <div 
                              className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                                selectedCVType === "primary" 
                                  ? "bg-blue-100 border-blue-300 shadow-md" 
                                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
                              }`}
                              onClick={() => {
                                setSelectedCVType("primary");
                                setNewCVFile(null);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <FileText className={`h-5 w-5 mr-3 ${
                                    selectedCVType === "primary" ? "text-blue-600" : "text-slate-500"
                                  }`} />
                                  <div>
                                    <p className={`font-medium ${
                                      selectedCVType === "primary" ? "text-blue-800" : "text-slate-700"
                                    }`}>
                                      Primary CV : {formatCVDisplay(primaryCV)}
                                    </p>
                                    <p className={`text-sm ${
                                      selectedCVType === "primary" ? "text-blue-600" : "text-slate-500"
                                    }`}>
                                      CV used during your registration
                                    </p>
                                  </div>
                                </div>
                                {selectedCVType === "primary" && (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {primaryCV && (
                          <div className="flex items-center">
                            <div className="flex-grow border-t border-slate-200"></div>
                            <span className="px-3 text-sm text-slate-500 bg-white">OR</span>
                            <div className="flex-grow border-t border-slate-200"></div>
                          </div>
                        )}

                        <div>
                          <h3 className="text-md font-medium text-slate-600 mb-3">
                            {primaryCV ? "Upload a new CV:" : "Upload your CV:"}
                          </h3>
                          
                          <div className="flex items-center space-x-3">
                            <label className={`flex-grow flex items-center px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                              selectedCVType === "new" || newCVFile
                                ? "bg-blue-100 border-blue-300 text-blue-700"
                                : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-300"
                            }`}>
                              <Upload size={20} className="mr-2" />
                              {newCVFile ? newCVFile.name : "Choose a PDF file (max 5MB)"}
                              <input 
                                type="file" 
                                accept=".pdf" 
                                onChange={handleFileChange} 
                                className="hidden"
                                disabled={cvUploadLoading || loading}
                              />
                            </label>
                            
                            {newCVFile && (
                              <button
                                onClick={() => {
                                  setNewCVFile(null);
                                  if (primaryCV) {
                                    setSelectedCVType("primary");
                                  }
                                }}
                                className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
                                title="Cancel selection"
                                disabled={loading}
                              >
                                <X size={20} />
                              </button>
                            )}
                          </div>
                          
                          {newCVFile && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-sm text-green-700 flex items-center">
                                <CheckCircle size={16} className="text-green-500 mr-2" />
                                Selected file: {newCVFile.name} ({(newCVFile.size / 1024 / 1024).toFixed(2)} MB)
                              </p>
                            </div>
                          )}
                        </div>

                        {!primaryCV && !newCVFile && (
                          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-center">
                              <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
                              <p className="text-sm text-amber-700">
                                You must upload a CV to apply.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-slate-700 mb-3">
                      Cover Letter (optional)
                    </label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Explain your motivation for this position..."
                      rows={6}
                      maxLength={1000}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                      disabled={loading}
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      {coverLetter.length}/1000 characters
                    </p>
                  </div>

                  {testRequired && testData && !testError && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center">
                        <Award className="h-5 w-5 text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm text-blue-700">
                            <strong>Test requis :</strong> {testData.testName}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            {testData.description} • Minimum score: {testData.passingScore}% • Duration: {testData.testDuration} min
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Test */}
              {!testLoading && applicationStep === 2 && testRequired && !testError && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center py-8"
                >
                  <div className="max-w-2xl mx-auto">
                    <div className="bg-blue-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                      <Award className="h-12 w-12 text-blue-600" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">
                      {testData?.testName || "Required Skills Test"}
                    </h3>
                    
                    <p className="text-slate-600 mb-6">
                      {testData?.description || "This position requires passing a skills test. You must complete the test to finalize your application."}
                    </p>

                    {testCompleted ? (
                      <div className="mb-6">
                        {testResult?.passed ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                            <h4 className="text-lg font-semibold text-green-800 mb-2">
                              Test passed!
                            </h4>
                            <p className="text-green-700 mb-4">
                              Congratulations! You passed the skills test.
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Score:</span> {testResult.score}%
                              </div>
                              <div>
                                <span className="font-medium">Status:</span> Passed
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                            <h4 className="text-lg font-semibold text-red-800 mb-2">
                              Test completed
                            </h4>
                            <p className="text-red-700 mb-4">
                              You scored {testResult.score}% on the test. You can still continue with your application.
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Score:</span> {testResult.score}%
                              </div>
                              <div>
                                <span className="font-medium">Status:</span> Completed
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
                        <Clock className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                        <h4 className="font-semibold text-slate-800 mb-2">
                          Ready to start the test?
                        </h4>
                        <p className="text-slate-600 text-sm mb-4">
                          Make sure you're in a quiet environment and have enough time to complete the test.
                        </p>
                        {testData && (
                          <div className="grid grid-cols-3 gap-4 text-sm mb-4 text-slate-600">
                            <div>
                              <span className="font-medium">Questions:</span> {testData.questions?.length || 0}
                            </div>
                            <div>
                              <span className="font-medium">Duration:</span> {testData.testDuration} min
                            </div>
                            <div>
                              <span className="font-medium">Required score:</span> {testData.passingScore}%
                            </div>
                          </div>
                        )}
                        <button
                          onClick={handleStartTest}
                          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={testLoading || !testData || !testData.questions || testData.questions.length === 0 || testCompleted}
                        >
                          <Play className="h-5 w-5 mr-2" />
                          Start Test
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Confirmation */}
              {!testLoading && applicationStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center py-4">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                      Ready to submit your application
                    </h3>
                    <p className="text-slate-600">
                      Review your information before final submission
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                    <h4 className="font-semibold text-slate-800">Application Summary</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-600">Selected CV:</span>
                        <span className="font-medium text-slate-800">
                          {selectedCVType === "primary" ? formatCVDisplay(primaryCV) : newCVFile?.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-600">Cover Letter:</span>
                        <span className="font-medium text-slate-800">
                          {coverLetter.trim() ? `${coverLetter.length} characters` : "Not provided"}
                        </span>
                      </div>
                      
                      {testRequired && (
                        <div className="flex items-center justify-between py-2 border-b border-slate-200">
                          <span className="text-slate-600">Skills Test:</span>
                          <span className={`font-medium flex items-center ${
                            testResult?.passed ? 'text-green-600' : testResult ? 'text-orange-600' : 'text-gray-600'
                          }`}>
                            {testResult ? (
                              <>
                                {testResult.passed ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Passed ({testResult.score}%)
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Completed ({testResult.score}%)
                                  </>
                                )}
                              </>
                            ) : (
                              "Not completed"
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {testRequired && testResult && !testResult.passed && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                        <p className="text-sm text-orange-700">
                          The test was completed but the passing score was not reached. You can still submit your application.
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                <button
                  onClick={() => {
                    if (applicationStep > 1) {
                      setApplicationStep(applicationStep - 1);
                    } else {
                      onClose();
                    }
                  }}
                  className="px-6 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                  disabled={loading || cvUploadLoading}
                >
                  {applicationStep > 1 ? "Back" : "Cancel"}
                </button>
                
                {applicationStep < (testRequired ? 3 : 2) ? (
                  <button
                    onClick={handleNextStep}
                    disabled={!canProceedToTest()}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitApplication}
                    disabled={loading || cvUploadLoading || !canSubmit()}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    {(loading || cvUploadLoading) && <Loader2 className="animate-spin h-4 w-4" />}
                    {cvUploadLoading ? "Uploading..." : loading ? "Submitting..." : "Submit Application"}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* FIXED: Pass the corrected testData to TestModal */}
      <TestModal
        isOpen={testModalOpen}
        onClose={handleTestModalClose}
        testData={testData}
        onTestCompleted={handleTestCompleted}
      />
    </>
  );
};

export default ApplyModal;

