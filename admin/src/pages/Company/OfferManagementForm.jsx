"use client"

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Link,
  Plus,
  Shield,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react"
import { useEffect, useState } from "react"

const categories = [
  "Tech",
  "DeepTech",
  "HighTech",
  "MedTech",
  "HealthTech",
  "BioTech",
  "WellnessTech",
  "PharmaTech",
  "CareTech",
  "EdTech",
  "LearnTech",
  "TeachTech",
  "FinTech",
  "InsurTech",
  "LegalTech",
  "RegTech",
  "WealthTech",
  "GreenTech",
  "CleanTech",
  "AgriTech",
  "FoodTech",
  "ClimateTech",
  "RetailTech",
  "EcomTech",
  "MarTech",
  "AdTech",
  "SalesTech",
  "LoyaltyTech",
  "HRTech",
  "WorkTech",
  "RecruitTech",
  "MobilityTech",
  "AutoTech",
  "LogiTech",
  "TravelTech",
  "AeroTech",
  "ShipTech",
  "PropTech",
  "ConstrucTech",
  "BuildTech",
  "HomeTech",
  "NanoTech",
  "RoboTech",
  "NeuroTech",
  "GameTech",
  "MediaTech",
  "MusicTech",
  "SportTech",
  "ArtTech",
  "EventTech",
  "FashionTech",
  "BeautyTech",
  "DesignTech",
  "LuxuryTech",
  "CivicTech",
  "GovTech",
  "SpaceTech",
  "MilTech",
  "EduGovTech",
]

const TestCreationCard = ({ onTestDataChange, testData, isVisible }) => {
  const [questions, setQuestions] = useState(
    testData?.questions || [
      {
        question: "",
        options: ["", ""],
        correctAnswer: 0,
        type: "multiple_choice", // Toujours choix multiple
        isActive: true,
        availableFrom: new Date().toISOString(),
        points: 1,
        explanation: "",
      },
    ],
  )

  const [testInfo, setTestInfo] = useState({
    testName: testData?.testName || "",
    description: testData?.description || "",
    testDuration: testData?.testDuration || 30,
    passingScore: testData?.passingScore || 60,
    maxAttempts: testData?.maxAttempts || 1,
    instructions: testData?.instructions || "Lisez attentivement chaque question et sélectionnez la meilleure réponse.",
    security: {
      preventCopy: testData?.security?.preventCopy !== undefined ? testData.security.preventCopy : true,
      timeLimit: testData?.security?.timeLimit !== undefined ? testData.security.timeLimit : true,
      showResults: testData?.security?.showResults !== undefined ? testData.security.showResults : true,
      allowBackNavigation:
        testData?.security?.allowBackNavigation !== undefined ? testData.security.allowBackNavigation : false,
      preventTabSwitch: testData?.security?.preventTabSwitch !== undefined ? testData.security.preventTabSwitch : true,
      fullscreenMode: testData?.security?.fullscreenMode !== undefined ? testData.security.fullscreenMode : true,
      preventDevTools: testData?.security?.preventDevTools !== undefined ? testData.security.preventDevTools : true,
    },
  })

  const [activeTab, setActiveTab] = useState("basic")
  const [previewMode, setPreviewMode] = useState(false)

  const updateTestData = (newTestInfo, newQuestions) => {
    const completeTestData = {
      ...newTestInfo,
      questions: newQuestions.map((q) => ({
        ...q,
        isActive: q.isActive !== undefined ? q.isActive : true,
        availableFrom: q.availableFrom || new Date().toISOString(),
        type: "multiple_choice", // Forcer le type à choix multiple
      })),
    }

    if (JSON.stringify(completeTestData) !== JSON.stringify(testData)) {
      onTestDataChange(completeTestData)
    }
  }

  useEffect(() => {
    if (isVisible && testInfo.testName?.trim() && questions.length > 0) {
      const timeoutId = setTimeout(() => {
        updateTestData(testInfo, questions)
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }, [testInfo, questions, isVisible])

  const handleTestInfoChange = (field, value) => {
    setTestInfo((prev) => ({ ...prev, [field]: value }))
  }

  const handleSecurityChange = (field, value) => {
    setTestInfo((prev) => ({
      ...prev,
      security: { ...prev.security, [field]: value },
    }))
  }

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value }
    // S'assurer que le type reste toujours "multiple_choice"
    if (field === 'type') {
      updatedQuestions[index].type = "multiple_choice"
    }
    setQuestions(updatedQuestions)
  }

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].options[optionIndex] = value
    setQuestions(updatedQuestions)
  }

  const addOption = (questionIndex) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].options.push("")
    setQuestions(updatedQuestions)
  }

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions]
    const question = updatedQuestions[questionIndex]

    if (question.options.length > 2) {
      question.options.splice(optionIndex, 1)

      if (question.correctAnswer === optionIndex) {
        question.correctAnswer = 0
      } else if (question.correctAnswer > optionIndex) {
        question.correctAnswer = question.correctAnswer - 1
      }

      setQuestions(updatedQuestions)
    }
  }

  const addQuestion = () => {
    const newQuestion = {
      question: "",
      options: ["", ""],
      correctAnswer: 0,
      type: "multiple_choice", // Toujours choix multiple
      isActive: true,
      availableFrom: new Date().toISOString(),
      points: 1,
      explanation: "",
    }
    setQuestions((prev) => [...prev, newQuestion])
  }

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const duplicateQuestion = (index) => {
    const questionToCopy = {
      ...questions[index],
      options: [...questions[index].options],
      type: "multiple_choice", // S'assurer que le type reste choix multiple
    }
    questionToCopy.question = questionToCopy.question + " (Copy)"
    setQuestions((prev) => {
      const updated = [...prev]
      updated.splice(index + 1, 0, questionToCopy)
      return updated
    })
  }

  const calculateTotalPoints = () => {
    return questions.reduce((total, question) => total + (question.points || 1), 0)
  }

  const getOptionLabel = (index) => {
    return String.fromCharCode(65 + index)
  }

  const isQuestionValid = (question) => {
    return (
      question.question.trim() !== "" &&
      question.options.length >= 2 &&
      question.options.every((option) => option.trim() !== "")
    )
  }

  const isTestComplete = () => {
    if (!testInfo.testName?.trim()) return false
    if (questions.length === 0) return false

    const hasValidQuestions = questions.some(
      (question) =>
        question.question?.trim() && question.options.length >= 2 && question.options.every((option) => option?.trim()),
    )

    return hasValidQuestions
  }

  const securityOptions = [
    {
      key: "preventCopy",
      label: "Empêcher la copie",
      description: "Désactiver la sélection de texte et la fonctionnalité de copie",
    },
    {
      key: "timeLimit",
      label: "Limite de temps stricte",
      description: "Soumission automatique à la fin du temps imparti",
    },
    {
      key: "showResults",
      label: "Afficher les résultats",
      description: "Afficher les résultats immédiatement après la fin du test",
    },
    {
      key: "allowBackNavigation",
      label: "Autoriser la navigation arrière",
      description: "Permettre aux étudiants de revenir aux questions précédentes",
    },
    {
      key: "preventTabSwitch",
      label: "Empêcher le changement d'onglet",
      description: "Avertir quand l'utilisateur essaie de changer d'onglet",
    },
    {
      key: "fullscreenMode",
      label: "Mode plein écran",
      description: "Forcer le test à s'exécuter en mode plein écran",
    },
    {
      key: "preventDevTools",
      label: "Empêcher les outils de développement",
      description: "Désactiver le clic droit et l'accès aux outils de développement",
    },
  ]

  if (!isVisible) return null

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/30 to-white border-2 border-blue-100 rounded-2xl shadow-xl p-8 mt-8 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent flex items-center">
          <FileText className="mr-3 text-blue-600" size={28} />
          Créer un test pour cette offre
        </h3>
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {previewMode ? <EyeOff size={18} /> : <Eye size={18} />}
          <span className="ml-2 font-medium">{previewMode ? "Modifier" : "Aperçu"}</span>
        </button>
      </div>

      {previewMode ? (
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-xl border border-blue-200 shadow-md">
            <h4 className="text-xl font-bold text-blue-800 mb-3">{testInfo.testName || "Test sans titre"}</h4>
            <p className="text-blue-700 mb-4">{testInfo.description}</p>
            <div className="flex items-center text-sm text-blue-600 space-x-6">
              <span className="flex items-center bg-white px-3 py-1 rounded-full shadow-sm">
                <Clock size={16} className="mr-2" />
                {testInfo.testDuration} min
              </span>
              <span className="bg-white px-3 py-1 rounded-full shadow-sm">{questions.length} questions</span>
              <span className="bg-white px-3 py-1 rounded-full shadow-sm">{calculateTotalPoints()} points</span>
            </div>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => (
              <div
                key={index}
                className="bg-white border-2 border-blue-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <h5 className="font-bold text-blue-800 text-lg">
                    Question {index + 1} ({question.points} point{question.points !== 1 ? "s" : ""})
                  </h5>
                  {!isQuestionValid(question) && (
                    <span className="text-red-500 text-xs bg-red-100 px-3 py-1 rounded-full font-medium">
                      Incomplète
                    </span>
                  )}
                </div>
                <p className="text-gray-700 mb-4 text-lg">{question.question || "Pas de texte de question"}</p>
                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`flex items-center p-4 rounded-xl transition-all duration-300 ${
                        question.correctAnswer === optionIndex
                          ? "bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 shadow-md"
                          : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <input type="radio" name={`preview-${index}`} disabled className="mr-3" />
                      <span className="text-sm font-bold text-blue-600 mr-3 min-w-[24px] bg-white rounded-full w-6 h-6 flex items-center justify-center">
                        {getOptionLabel(optionIndex)}
                      </span>
                      <span
                        className={
                          question.correctAnswer === optionIndex ? "text-green-800 font-semibold" : "text-gray-700"
                        }
                      >
                        {option || `Option ${getOptionLabel(optionIndex)}`}
                      </span>
                      {question.correctAnswer === optionIndex && (
                        <span className="ml-auto text-green-600 text-sm font-bold bg-green-200 px-2 py-1 rounded-full">
                          ✓ Correct
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {question.explanation && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Explication:</strong> {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Tab Navigation */}
          <div className="flex border-b-2 border-blue-100 mb-8 bg-white rounded-t-xl p-1">
            <button
              type="button"
              onClick={() => setActiveTab("basic")}
              className={`px-6 py-3 border-b-3 font-bold text-sm rounded-t-lg transition-all duration-300 ${
                activeTab === "basic"
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-500 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              Informations de base
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("questions")}
              className={`px-6 py-3 border-b-3 font-bold text-sm rounded-t-lg transition-all duration-300 ${
                activeTab === "questions"
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-500 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              Questions ({questions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`px-6 py-3 border-b-3 font-bold text-sm rounded-t-lg transition-all duration-300 ${
                activeTab === "security"
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-500 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              Sécurité
            </button>
          </div>

          {/* Basic Info Tab */}
          {activeTab === "basic" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-blue-800 mb-3">
                    Nom du test <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={testInfo.testName}
                    onChange={(e) => handleTestInfoChange("testName", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm"
                    placeholder="Ex: Évaluation technique"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-blue-800 mb-3">
                    Durée (minutes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={testInfo.testDuration}
                    onChange={(e) => handleTestInfoChange("testDuration", Number.parseInt(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-blue-800 mb-3">Description du test</label>
                <textarea
                  value={testInfo.description}
                  onChange={(e) => handleTestInfoChange("description", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm"
                  rows={3}
                  placeholder="Brève description du test et de ses objectifs"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-blue-800 mb-3">Instructions</label>
                <textarea
                  value={testInfo.instructions}
                  onChange={(e) => handleTestInfoChange("instructions", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm"
                  rows={3}
                  placeholder="Instructions pour les étudiants passant le test"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-blue-800 mb-3">Score de passage (%)</label>
                  <input
                    type="number"
                    value={testInfo.passingScore}
                    onChange={(e) => handleTestInfoChange("passingScore", Number.parseInt(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-blue-800 mb-3">Tentatives maximales</label>
                  <input
                    type="number"
                    value={testInfo.maxAttempts}
                    onChange={(e) => handleTestInfoChange("maxAttempts", Number.parseInt(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm"
                    min="1"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-xl border border-blue-200 shadow-md">
                <h4 className="text-lg font-bold text-blue-800 mb-4">Résumé du test</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <span className="text-blue-600 font-medium">Questions:</span>
                    <span className="ml-2 font-bold text-blue-800">{questions.length}</span>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <span className="text-blue-600 font-medium">Points totaux:</span>
                    <span className="ml-2 font-bold text-blue-800">{calculateTotalPoints()}</span>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <span className="text-blue-600 font-medium">Durée:</span>
                    <span className="ml-2 font-bold text-blue-800">{testInfo.testDuration} min</span>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <span className="text-blue-600 font-medium">Score de passage:</span>
                    <span className="ml-2 font-bold text-blue-800">{testInfo.passingScore}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Questions Tab */}
          {activeTab === "questions" && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-xl font-bold text-blue-800">Questions</h4>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Plus size={18} className="mr-2" />
                  Ajouter une question
                </button>
              </div>

              <div className="space-y-8">
                {questions.map((question, questionIndex) => (
                  <div
                    key={questionIndex}
                    className="bg-gradient-to-br from-white to-blue-50/30 border-2 border-blue-100 rounded-2xl p-8 shadow-lg"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center">
                        <h5 className="font-bold text-blue-800 text-lg">Question {questionIndex + 1}</h5>
                        {!isQuestionValid(question) && (
                          <span className="ml-3 text-red-500 text-xs bg-red-100 px-3 py-1 rounded-full font-medium">
                            Incomplète
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={() => duplicateQuestion(questionIndex)}
                          className="text-blue-500 hover:text-blue-700 text-sm font-medium bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition-all duration-300"
                        >
                          Dupliquer
                        </button>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(questionIndex)}
                            className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-all duration-300"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-blue-800 mb-3">
                          Texte de la question <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={question.question}
                          onChange={(e) => handleQuestionChange(questionIndex, "question", e.target.value)}
                          className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm"
                          rows={2}
                          placeholder="Entrez votre question ici..."
                          required
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <label className="block text-sm font-bold text-blue-800">
                            Options de réponse <span className="text-red-500">*</span>
                          </label>
                          <span className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
                            {question.options.length} options (min: 2, max: 8)
                          </span>
                        </div>
                        <div className="space-y-3">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-blue-200 shadow-sm"
                            >
                              <input
                                type="radio"
                                name={`correct-${questionIndex}`}
                                checked={question.correctAnswer === optionIndex}
                                onChange={() => handleQuestionChange(questionIndex, "correctAnswer", optionIndex)}
                                className="text-blue-500 flex-shrink-0 w-5 h-5"
                                title="Marquer comme bonne réponse"
                              />
                              <span className="text-sm font-bold text-blue-600 min-w-[28px] bg-blue-100 rounded-full w-7 h-7 flex items-center justify-center">
                                {getOptionLabel(optionIndex)}
                              </span>
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                                className="flex-1 px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                                placeholder={`Option ${getOptionLabel(optionIndex)}`}
                                required
                              />
                              {question.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeOption(questionIndex, optionIndex)}
                                  className="text-red-500 hover:text-red-700 flex-shrink-0 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-all duration-300"
                                  title="Supprimer l'option"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        {question.options.length < 8 && (
                          <button
                            type="button"
                            onClick={() => addOption(questionIndex)}
                            className="mt-4 flex items-center text-blue-500 hover:text-blue-700 text-sm font-medium bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-all duration-300"
                          >
                            <Plus size={16} className="mr-2" />
                            Ajouter une option
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-blue-800 mb-3">Points</label>
                          <input
                            type="number"
                            value={question.points}
                            onChange={(e) =>
                              handleQuestionChange(questionIndex, "points", Number.parseInt(e.target.value) || 1)
                            }
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm"
                            min="1"
                            max="10"
                          />
                        </div>
                        {/* SUPPRIMÉ: Le sélecteur de type de question */}
                        <div className="flex items-center">
                          <label className="flex items-center text-sm font-bold text-blue-800 bg-white p-3 rounded-xl border border-blue-200 shadow-sm">
                            <input
                              type="checkbox"
                              checked={question.isActive !== false}
                              onChange={(e) => handleQuestionChange(questionIndex, "isActive", e.target.checked)}
                              className="mr-3 w-5 h-5 text-blue-500"
                            />
                            Question active
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-blue-800 mb-3">Explication (Optionnel)</label>
                        <input
                          type="text"
                          value={question.explanation}
                          onChange={(e) => handleQuestionChange(questionIndex, "explanation", e.target.value)}
                          className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm"
                          placeholder="Expliquez la bonne réponse..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center">
                  <Shield className="text-yellow-600 mr-3" size={24} />
                  <h4 className="text-xl font-bold text-yellow-800">Paramètres de sécurité</h4>
                </div>
                <p className="text-sm text-yellow-700 mt-3">
                  Configurez les mesures de sécurité pour maintenir l'intégrité du test. Ces options sont pratiques à
                  implémenter.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {securityOptions.map(({ key, label, description }) => (
                  <div
                    key={key}
                    className="bg-white border-2 border-blue-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={testInfo.security[key]}
                        onChange={(e) => handleSecurityChange(key, e.target.checked)}
                        className="mt-1 text-blue-500 w-5 h-5"
                      />
                      <div className="ml-4">
                        <div className="font-bold text-blue-800 text-lg">{label}</div>
                        <div className="text-sm text-blue-600 mt-1">{description}</div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-xl border border-blue-200 shadow-md">
                <h4 className="text-lg font-bold text-blue-800 mb-4">Fonctionnalités de sécurité actives</h4>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(testInfo.security)
                    .filter(([key, value]) => value === true)
                    .map(([key]) => (
                      <span
                        key={key}
                        className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-sm rounded-full font-medium shadow-sm"
                      >
                        {securityOptions.find((opt) => opt.key === key)?.label || key}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const PublicTestStatsCard = ({ publicTestStats, showStats, setShowStats }) => {
  if (!publicTestStats) return null

  return (
    <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-white border-2 border-blue-200 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-lg font-bold text-blue-800">Statistiques du test public</h5>
        <button
          type="button"
          onClick={() => setShowStats(!showStats)}
          className="text-blue-600 hover:text-blue-800 bg-blue-100 p-2 rounded-lg hover:bg-blue-200 transition-all duration-300"
        >
          {showStats ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-blue-500" />
              <span className="text-blue-700 font-medium">Candidatures</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">{publicTestStats.totalApplications || 0}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-green-500" />
              <span className="text-blue-700 font-medium">Score moyen</span>
            </div>
            <span className="text-2xl font-bold text-green-600">
              {publicTestStats.averageTestScore ? `${Math.round(publicTestStats.averageTestScore)}%` : "N/A"}
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-purple-500" />
              <span className="text-blue-700 font-medium">Taux de réussite</span>
            </div>
            <span className="text-2xl font-bold text-purple-600">
              {publicTestStats.testPassRate ? `${Math.round(publicTestStats.testPassRate * 100)}%` : "N/A"}
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-orange-500" />
              <span className="text-blue-700 font-medium">En attente</span>
            </div>
            <span className="text-2xl font-bold text-orange-600">{publicTestStats.pendingApplications || 0}</span>
          </div>
        </div>
      )}
    </div>
  )
}

const PublicTestLinkSection = ({
  formData,
  isEditing,
  offerId,
  testData,
  publicTestLink,
  publicTestEnabled,
  publicTestGeneratedAt,
  publicApplicationsCount,
  publicTestStats,
  generatingLink,
  showStats,
  setShowStats,
  handleGeneratePublicLink,
  handleDisablePublicLink,
  handleEnablePublicLink,
  copyToClipboard,
  openPublicLink,
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isTestCompleteForLinkGeneration = () => {
    // Pour une offre existante (offerToEdit), on se base sur les données déjà sauvegardées
    if (isEditing && offerId) {
      return testData && testData.testName && testData.questions && testData.questions.length > 0
    }
    // Pour une offre nouvellement créée (createdOffer), on se base sur le testData du formulaire
    return (
      testData &&
      testData.testName &&
      testData.questions &&
      testData.questions.length > 0 &&
      testData.questions.every((q) => q.question && q.options && q.options.length >= 2 && q.correctAnswer !== undefined)
    )
  }

  if (!formData.requiresTest || !isTestCompleteForLinkGeneration()) {
    return null
  }

  return (
    <div className="mt-8 p-8 bg-gradient-to-br from-green-50 via-blue-50 to-white border-2 border-green-200 rounded-2xl shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link className="text-green-600" size={24} />
        <h4 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Test Technique Public
        </h4>
      </div>

      {!publicTestLink ? (
        <div className="space-y-6">
          <p className="text-green-700 text-lg">
            Générez un lien public pour permettre à toute personne d'accéder à ce test et de soumettre une candidature.
            Le lien sera unique et sécurisé.
          </p>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleGeneratePublicLink}
              disabled={generatingLink || !isEditing}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-bold"
            >
              <Link size={20} />
              {generatingLink ? "Génération..." : "Générer le lien public"}
            </button>

            {!isEditing && (
              <span className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">
                Sauvegardez d'abord l'offre pour générer le lien
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 bg-white rounded-2xl border-2 border-blue-100 shadow-lg">
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-blue-800 mb-3">
                Lien public {publicTestEnabled ? "actif" : "désactivé"} :
              </p>
              <div className="flex items-center gap-3">
                <code className="text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg break-all flex-1 border border-blue-200">
                  {publicTestLink}
                </code>
                <div
                  className={`w-4 h-4 rounded-full ${publicTestEnabled ? "bg-green-500" : "bg-red-500"} shadow-lg`}
                  title={publicTestEnabled ? "Actif" : "Désactivé"}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 ml-6">
              <button
                type="button"
                onClick={() => copyToClipboard(publicTestLink)}
                className="p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                title="Copier le lien"
              >
                <Copy size={18} />
              </button>

              <button
                type="button"
                onClick={openPublicLink}
                className="p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                title="Ouvrir dans un nouvel onglet"
              >
                <ExternalLink size={18} />
              </button>

              {publicTestEnabled ? (
                <button
                  type="button"
                  onClick={handleDisablePublicLink}
                  className="p-3 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                  title="Désactiver le lien"
                >
                  <EyeOff size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleEnablePublicLink}
                  className="p-3 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                  title="Réactiver le lien"
                >
                  <Eye size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-md">
              <span className="text-blue-700 font-medium">Candidatures reçues :</span>
              <span className="ml-2 font-bold text-blue-600 text-lg">{publicApplicationsCount}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-md">
              <span className="text-blue-700 font-medium">Généré le :</span>
              <span className="ml-2 font-bold text-blue-800">{formatDate(publicTestGeneratedAt)}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-md">
              <span className="text-blue-700 font-medium">Statut :</span>
              <span className={`ml-2 font-bold ${publicTestEnabled ? "text-green-600" : "text-red-600"}`}>
                {publicTestEnabled ? "Actif" : "Désactivé"}
              </span>
            </div>
          </div>

          <PublicTestStatsCard publicTestStats={publicTestStats} showStats={showStats} setShowStats={setShowStats} />

          {publicApplicationsCount > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl shadow-md">
              <p className="text-blue-700 mb-3 font-medium">
                Vous avez reçu {publicApplicationsCount} candidature(s) via ce lien public.
              </p>
              <button
                type="button"
                onClick={() => {
                  // Navigation vers la page de gestion des candidatures publiques
                  window.location.href = "/company/public-applications"
                }}
                className="text-blue-600 hover:text-blue-800 font-bold bg-white px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-300 shadow-sm"
              >
                Voir les candidatures publiques →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const OfferForm = ({ offerToEdit = null }) => {
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    type_offre: "Stage",
    categorie: "Tech",
    duree: "",
    localisation: "",
    competences_requises: "",
    date_limite_candidature: "",
    nombre_postes: 1,
    remuneration: "",
    hasRemuneration: false,
    requiresTest: false,
  })

  const [loading, setLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [testData, setTestData] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  // États pour la gestion des liens publics
  const [publicTestLink, setPublicTestLink] = useState(null)
  const [publicTestEnabled, setPublicTestEnabled] = useState(false)
  const [publicTestGeneratedAt, setPublicTestGeneratedAt] = useState(null)
  const [publicApplicationsCount, setPublicApplicationsCount] = useState(0)
  const [generatingLink, setGeneratingLink] = useState(false)
  const [publicTestStats, setPublicTestStats] = useState(null)
  const [showStats, setShowStats] = useState(false)

  // États pour les messages de succès/erreur après création
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [createdOffer, setCreatedOffer] = useState(null)

  // Mock toast function since we can't import react-toastify
  const toast = {
    error: (message) => {
      setSubmitError(message)
      setSubmitSuccess(false)
    },
    success: (message) => {
      setSubmitSuccess(true)
      setSubmitError("")
    },
  }

  useEffect(() => {
    if (offerToEdit) {
      setIsEditMode(true)
      setFormData({
        titre: offerToEdit.titre || "",
        description: offerToEdit.description || "",
        type_offre: offerToEdit.type_offre || "Stage",
        categorie: offerToEdit.categorie || "Tech",
        duree: offerToEdit.duree || "",
        localisation: offerToEdit.localisation || "",
        competences_requises: Array.isArray(offerToEdit.competences_requises)
          ? offerToEdit.competences_requises.join(", ")
          : "",
        date_limite_candidature: offerToEdit.date_limite_candidature
          ? new Date(offerToEdit.date_limite_candidature).toISOString().split("T")[0]
          : "",
        nombre_postes: offerToEdit.nombre_postes || 1,
        remuneration: offerToEdit.remuneration || "",
        hasRemuneration: offerToEdit.hasRemuneration || (offerToEdit.remuneration ? true : false),
        requiresTest: offerToEdit.requiresTest || false,
      })

      if (offerToEdit.test) {
        setTestData(offerToEdit.test)
      }

      // Charger les données du lien public si on est en mode édition
      if (offerToEdit._id && offerToEdit.requiresTest) {
        loadPublicTestData(offerToEdit._id)
      }
    }
  }, [offerToEdit])

  // Fonction pour charger les données du test public
  const loadPublicTestData = async (offerId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/offres/${offerId}/public-stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("cToken") || localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const offer = data.data.offer

        if (offer.publicTestLink) {
          // Le lien est déjà au format complet depuis le backend
          setPublicTestLink(offer.publicTestLink)
          setPublicTestEnabled(offer.publicTestEnabled)
          setPublicTestGeneratedAt(offer.publicTestGeneratedAt)
          setPublicApplicationsCount(offer.publicApplicationsCount || 0)
        }

        setPublicTestStats(data.data.stats)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données du test public:", error)
    }
  }

  // Fonction pour générer un lien public
  const handleGeneratePublicLink = async () => {
    // Si l'offre est en mode édition, on utilise offerToEdit, sinon createdOffer
    const currentOffer = isEditMode ? offerToEdit : createdOffer
    if (!currentOffer || !currentOffer._id) {
      toast.error("Veuillez d'abord sauvegarder l'offre avant de générer le lien public")
      return
    }

    // Vérifier si l'offre a un test associé et qu'il est valide
    if (
      !currentOffer.requiresTest ||
      !currentOffer.test ||
      !currentOffer.test.testName ||
      !currentOffer.test.questions ||
      currentOffer.test.questions.length === 0
    ) {
      toast.error(
        "L'offre ne contient pas de test technique valide. Veuillez configurer le test dans l'offre avant de générer le lien.",
      )
      return
    }

    setGeneratingLink(true)
    try {
      const response = await fetch(`http://localhost:4000/api/offres/${currentOffer._id}/generate-public-link`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("cToken") || localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      })

      // Vérifier si la réponse est OK avant de tenter de parser le JSON
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Erreur de réponse:", response.status, errorText)
        toast.error(`Erreur ${response.status}: ${errorText || "Erreur lors de la génération du lien"}`)
        return
      }

      // Vérifier le type de contenu
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text()
        console.error("Réponse non-JSON reçue:", responseText)
        toast.error("Erreur: Réponse invalide du serveur")
        return
      }

      const data = await response.json()
      if (data.success) {
        // Le lien est déjà au bon format depuis le backend
        setPublicTestLink(data.data.publicTestLink)
        setPublicTestEnabled(true)
        setPublicTestGeneratedAt(data.data.generatedAt)
        setPublicApplicationsCount(0)
        toast.success("Lien public généré avec succès !")
      } else {
        toast.error(data.message || "Erreur lors de la génération du lien")
      }
    } catch (error) {
      console.error("Erreur lors de la génération du lien public:", error)
      if (error.name === "SyntaxError" && error.message.includes("JSON")) {
        toast.error("Erreur de communication avec le serveur. Veuillez réessayer.")
      } else {
        toast.error("Erreur lors de la génération du lien")
      }
    } finally {
      setGeneratingLink(false)
    }
  }

  // Fonction pour désactiver le lien public
  const handleDisablePublicLink = async () => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir désactiver ce lien public ? Les candidats ne pourront plus y accéder.")
    ) {
      return
    }

    try {
      const response = await fetch(`http://localhost:4000/api/offres/${createdOffer._id}/disable-public-link`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("cToken") || localStorage.getItem("token")}`,
        },
      })

      const data = await response.json()
      if (response.ok) {
        setPublicTestEnabled(false)
        toast.success("Lien public désactivé")
      } else {
        toast.error(data.message || "Erreur lors de la désactivation")
      }
    } catch (error) {
      console.error("Erreur lors de la désactivation:", error)
      toast.error("Erreur lors de la désactivation")
    }
  }

  // Fonction pour réactiver le lien public
  const handleEnablePublicLink = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/offres/${createdOffer._id}/enable-public-link`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("cToken") || localStorage.getItem("token")}`,
        },
      })

      const data = await response.json()
      if (response.ok) {
        setPublicTestEnabled(true)
        toast.success("Lien public réactivé")
      } else {
        toast.error(data.message || "Erreur lors de la réactivation")
      }
    } catch (error) {
      console.error("Erreur lors de la réactivation:", error)
      toast.error("Erreur lors de la réactivation")
    }
  }

  // Fonction pour copier le lien dans le presse-papiers
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Lien copié dans le presse-papiers")
    } catch (error) {
      console.error("Erreur lors de la copie:", error)
      toast.error("Erreur lors de la copie")
    }
  }

  // Fonction pour ouvrir le lien dans un nouvel onglet
  const openPublicLink = () => {
    if (publicTestLink) {
      window.open(publicTestLink, "_blank")
    }
  }

  // Fonction pour vérifier si le test est complet
  const isTestComplete = () => {
    return (
      testData &&
      testData.testName &&
      testData.questions &&
      testData.questions.length > 0 &&
      testData.questions.every((q) => q.question && q.options && q.options.length >= 2 && q.correctAnswer !== undefined)
    )
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleTestDataChange = (newTestData) => {
    setTestData(newTestData)
  }

  const validateForm = () => {
    const {
      titre,
      description,
      type_offre,
      categorie,
      date_limite_candidature,
      nombre_postes,
      remuneration,
      hasRemuneration,
    } = formData

    if (
      !titre.trim() ||
      !categorie.trim() ||
      !description.trim() ||
      !type_offre.trim() ||
      !date_limite_candidature.trim() ||
      nombre_postes < 1
    ) {
      toast.error("Veuillez remplir tous les champs obligatoires et vérifier les valeurs.")
      return false
    }

    if (new Date(date_limite_candidature) < new Date()) {
      toast.error("La date limite de candidature doit être dans le futur.")
      return false
    }

    if (hasRemuneration && !remuneration.trim()) {
      toast.error("Veuillez entrer les détails de la rémunération ou décocher l'option de rémunération.")
      return false
    }

    if (formData.requiresTest) {
      if (!testData) {
        toast.error(
          "La configuration du test est manquante. Veuillez configurer le test ou décocher 'Nécessite un test'.",
        )
        return false
      }

      if (!testData.testName?.trim()) {
        toast.error("Veuillez entrer un nom de test.")
        return false
      }

      if (!testData.questions || testData.questions.length === 0) {
        toast.error("Veuillez ajouter au moins une question au test.")
        return false
      }

      const incompleteQuestions = testData.questions.filter(
        (q) => !q.question?.trim() || q.options.length < 2 || q.options.some((opt) => !opt?.trim()),
      )

      if (incompleteQuestions.length > 0) {
        toast.error(
          `Veuillez compléter toutes les questions du test. ${incompleteQuestions.length} question(s) nécessitent d'être complétées.`,
        )
        return false
      }
    }

    return true
  }

  const getAuthToken = () => {
    const token = localStorage.getItem("cToken") || localStorage.getItem("token") || localStorage.getItem("authToken")

    if (!token) {
      toast.error("Authentification requise. Veuillez vous reconnecter.")
      return null
    }

    let cleanToken = token.trim()

    if (cleanToken.startsWith("Bearer ")) {
      cleanToken = cleanToken.substring(7).trim()
    }

    if (!cleanToken || cleanToken === "null" || cleanToken === "undefined") {
      toast.error("Format de token invalide. Veuillez vous reconnecter.")
      localStorage.removeItem("cToken")
      localStorage.removeItem("token")
      localStorage.removeItem("authToken")
      return null
    }

    console.log("Token récupéré et nettoyé:", cleanToken.substring(0, 20) + "...")
    return cleanToken
  }

  const getCompanyIdFromToken = (token) => {
    try {
      const base64Url = token.split(".")[1]
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      )

      const decoded = JSON.parse(jsonPayload)
      console.log("Token décodé:", { id: decoded.id, role: decoded.role, email: decoded.email })

      return decoded.id
    } catch (error) {
      console.error("Erreur lors du décodage du token:", error)
      toast.error("Format de token invalide. Veuillez vous reconnecter.")
      return null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSubmitError("")
    setSubmitSuccess(false)

    if (formData.requiresTest && !isEditMode && !isTestComplete()) {
      toast.error("La configuration du test est incomplète. Veuillez compléter la configuration du test.")
      setLoading(false)
      return
    }

    if (!validateForm()) {
      setLoading(false)
      return
    }

    const token = getAuthToken()
    if (!token) {
      setLoading(false)
      return
    }

    const companyId = getCompanyIdFromToken(token)
    if (!companyId) {
      setLoading(false)
      return
    }

    try {
      const dataToSend = {
        entreprise_id: companyId,
        ...formData,
        competences_requises: formData.competences_requises
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill !== ""),
        date_limite_candidature: new Date(formData.date_limite_candidature).toISOString(),
        nombre_postes: Number.parseInt(formData.nombre_postes, 10),
        remuneration: formData.hasRemuneration ? formData.remuneration : "",
        test: formData.requiresTest ? testData : null,
      }

      console.log("Données à envoyer:", dataToSend)

      const API_BASE_URL = "http://localhost:4000"
      const url = isEditMode ? `${API_BASE_URL}/api/offres/${offerToEdit._id}` : `${API_BASE_URL}/api/offres`
      const method = isEditMode ? "PUT" : "POST"

      console.log("Requête vers:", url)
      console.log("Avec token (20 premiers caractères):", token.substring(0, 20) + "...")

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ctoken: token,
          token: token,
        },
        body: JSON.stringify(dataToSend),
      })

      console.log("Statut de la réponse:", response.status)

      let data
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json()
        console.log("Données de réponse:", data)
      } else {
        const textResponse = await response.text()
        console.error("Réponse non-JSON:", textResponse)
        throw new Error(`Erreur serveur: ${response.status} ${response.statusText}`)
      }

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Échec de l'authentification. Veuillez vous reconnecter.")
          localStorage.removeItem("cToken")
          localStorage.removeItem("token")
          localStorage.removeItem("authToken")
          return
        }

        if (response.status === 404) {
          toast.error("Point de terminaison API introuvable. Veuillez vérifier la configuration de votre serveur.")
          return
        }

        throw new Error(data.message || `Erreur serveur: ${response.status}`)
      }

      toast.success(isEditMode ? "Offre mise à jour avec succès !" : "Votre offre a été publiée avec succès !")

      // Stocker l'offre créée pour la génération de lien
      setCreatedOffer(data.data)

      if (!isEditMode) {
        setFormData({
          titre: "",
          description: "",
          type_offre: "Stage",
          categorie: "Tech",
          duree: "",
          localisation: "",
          competences_requises: "",
          date_limite_candidature: "",
          nombre_postes: 1,
          remuneration: "",
          hasRemuneration: false,
          requiresTest: false,
        })
        setTestData(null)
      }
    } catch (err) {
      console.error("Erreur lors de la soumission de l'offre:", err)

      if (err.message.includes("Failed to fetch")) {
        toast.error("Impossible de se connecter au serveur. Veuillez vérifier si le backend fonctionne.")
      } else if (err.message.includes("NetworkError")) {
        toast.error("Erreur réseau. Veuillez vérifier votre connexion.")
      } else {
        toast.error(err.message || "Une erreur inattendue s'est produite.")
      }
    } finally {
      setLoading(false)
    }
  }

  const togglePreview = () => {
    setShowPreview(!showPreview)
  }

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
          <div className="mb-8">
            <button
              onClick={togglePreview}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              ← Retour au formulaire
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-2xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-6">
              Aperçu de l'offre
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-blue-600">{formData.titre || "Titre du poste"}</h3>
                <p className="text-blue-700 text-lg">
                  {formData.localisation || "Localisation"} • {formData.type_offre}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                  <strong className="text-blue-800">Type d'offre:</strong>{" "}
                  <span className="text-blue-600">{formData.type_offre}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                  <strong className="text-blue-800">Catégorie:</strong>{" "}
                  <span className="text-blue-600">{formData.categorie}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                  <strong className="text-blue-800">Durée:</strong>{" "}
                  <span className="text-blue-600">{formData.duree || "Non spécifiée"}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                  <strong className="text-blue-800">Nombre de postes:</strong>{" "}
                  <span className="text-blue-600">{formData.nombre_postes}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm col-span-2">
                  <strong className="text-blue-800">Rémunération:</strong>{" "}
                  <span className="text-blue-600">
                    {formData.hasRemuneration ? formData.remuneration : "Non spécifiée"}
                  </span>
                </div>
              </div>

              {formData.description && (
                <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
                  <strong className="text-blue-800 text-lg">Description:</strong>
                  <p className="mt-2 text-gray-700 leading-relaxed">{formData.description}</p>
                </div>
              )}

              {formData.competences_requises && (
                <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
                  <strong className="text-blue-800 text-lg">Compétences requises:</strong>
                  <p className="mt-2 text-gray-700">{formData.competences_requises}</p>
                </div>
              )}

              {formData.requiresTest && testData && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6 shadow-md">
                  <strong className="text-blue-800 text-lg">Test d'évaluation:</strong>
                  <div className="mt-3 space-y-2">
                    <p>
                      <strong className="text-blue-700">Nom du test:</strong>{" "}
                      <span className="text-blue-600">{testData.testName}</span>
                    </p>
                    <p>
                      <strong className="text-blue-700">Durée:</strong>{" "}
                      <span className="text-blue-600">{testData.testDuration} minutes</span>
                    </p>
                    <p>
                      <strong className="text-blue-700">Questions:</strong>{" "}
                      <span className="text-blue-600">{testData.questions?.length || 0}</span>
                    </p>
                    <p>
                      <strong className="text-blue-700">Score de passage:</strong>{" "}
                      <span className="text-blue-600">{testData.passingScore}%</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-8">
          {isEditMode ? "Modifier l'offre" : "Créer une nouvelle offre"}
        </h1>

        {/* Messages de succès/erreur */}
        {submitSuccess && (
          <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-2xl shadow-lg">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
              <span className="text-green-800 font-bold text-lg">Offre créée avec succès !</span>
            </div>
          </div>
        )}

        {submitError && (
          <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-2xl shadow-lg">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
              <span className="text-red-800 font-medium">{submitError}</span>
            </div>
          </div>
        )}

        {/* Bouton de génération de lien (affiché après succès) */}
        {submitSuccess && createdOffer && createdOffer.requiresTest && !publicTestLink && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link className="h-6 w-6 text-blue-600 mr-3" />
                <span className="text-blue-800 font-bold text-lg">Votre offre avec test technique est prête !</span>
              </div>
              <button
                onClick={handleGeneratePublicLink}
                disabled={generatingLink}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
              >
                {generatingLink ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Génération...
                  </>
                ) : (
                  <>
                    <Link className="h-5 w-5 mr-2" />
                    Générer le lien public
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Affichage du lien généré */}
        {publicTestLink && (
          <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                <span className="text-green-800 font-bold text-lg">Lien public généré avec succès !</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border-2 border-green-200 mb-4 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 break-all font-mono bg-gray-50 p-2 rounded">
                  {publicTestLink}
                </span>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => copyToClipboard(publicTestLink)}
                    className="p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                    title="Copier le lien"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                  <button
                    onClick={openPublicLink}
                    className="p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                    title="Ouvrir le lien"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-green-700 font-medium">
              Partagez ce lien avec les candidats pour qu'ils puissent passer le test technique et postuler à votre
              offre.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-blue-800 mb-3">
                Titre de l'offre <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm"
                type="text"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                placeholder="Ex: Stage Développeur Web Junior"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-blue-800 mb-3">
                Description de l'offre <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                placeholder="Décrivez les missions, responsabilités et environnement de travail..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-blue-800 mb-3">
                  Type d'offre <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm"
                  name="type_offre"
                  value={formData.type_offre}
                  onChange={handleChange}
                  required
                >
                  <option value="Stage">Stage</option>
                  <option value="Emploi">Emploi</option>
                  <option value="Alternance">Alternance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-blue-800 mb-3">
                  Catégorie <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm"
                  name="categorie"
                  value={formData.categorie}
                  onChange={handleChange}
                  required
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-blue-800 mb-3">Localisation</label>
                <input
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm"
                  type="text"
                  name="localisation"
                  value={formData.localisation}
                  onChange={handleChange}
                  placeholder="Ex: Paris, Télétravail, Lyon"
                />
              </div>
              <div>
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="hasRemuneration"
                    name="hasRemuneration"
                    checked={formData.hasRemuneration}
                    onChange={handleChange}
                    className="mr-3 w-5 h-5 text-blue-500"
                  />
                  <label htmlFor="hasRemuneration" className="text-sm font-bold text-blue-800">
                    Rémunération (Optionnel)
                  </label>
                </div>
                {formData.hasRemuneration && (
                  <input
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm"
                    type="text"
                    name="remuneration"
                    value={formData.remuneration}
                    onChange={handleChange}
                    placeholder="Ex: 800€/mois, Selon profil, 35k€/an"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t-2 border-blue-100">
            <div>
              <label className="block text-sm font-bold text-blue-800 mb-3">
                Compétences requises (séparées par des virgules)
              </label>
              <textarea
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm"
                name="competences_requises"
                value={formData.competences_requises}
                onChange={handleChange}
                rows={3}
                placeholder="Ex: JavaScript, React, Node.js, MongoDB, Agile"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-blue-800 mb-3">
                  Date limite de candidature <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm"
                  type="date"
                  name="date_limite_candidature"
                  value={formData.date_limite_candidature}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-blue-800 mb-3">
                  Nombre de postes <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm"
                  type="number"
                  name="nombre_postes"
                  value={formData.nombre_postes}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Assessment Test Option */}
          <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-blue-800 mb-6">Test d'évaluation</h2>

            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="requiresTest"
                name="requiresTest"
                checked={formData.requiresTest}
                onChange={handleChange}
                className="mr-4 w-5 h-5 text-blue-500"
              />
              <label htmlFor="requiresTest" className="text-lg font-medium text-blue-800">
                Exiger que les candidats passent un test d'évaluation
              </label>
            </div>

            {formData.requiresTest && (
              <div className="text-blue-700 mb-4 bg-blue-50 p-4 rounded-xl border border-blue-200">
                Les tests d'évaluation aident à évaluer les compétences et connaissances des candidats avant les
                entretiens.
              </div>
            )}
          </div>

          {/* Test Creation Card */}
          <TestCreationCard
            onTestDataChange={handleTestDataChange}
            testData={testData}
            isVisible={formData.requiresTest}
          />

          {/* Public Test Link Section */}
          {((isEditMode && offerToEdit) || (submitSuccess && createdOffer)) && (
            <PublicTestLinkSection
              formData={formData}
              isEditing={isEditMode}
              offerId={isEditMode ? offerToEdit?._id : createdOffer?._id}
              testData={isEditMode ? offerToEdit?.test : createdOffer?.test}
              publicTestLink={publicTestLink}
              publicTestEnabled={publicTestEnabled}
              publicTestGeneratedAt={publicTestGeneratedAt}
              publicApplicationsCount={publicApplicationsCount}
              publicTestStats={publicTestStats}
              generatingLink={generatingLink}
              showStats={showStats}
              setShowStats={setShowStats}
              handleGeneratePublicLink={handleGeneratePublicLink}
              handleDisablePublicLink={handleDisablePublicLink}
              handleEnablePublicLink={handleEnablePublicLink}
              copyToClipboard={copyToClipboard}
              openPublicLink={openPublicLink}
            />
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8">
            <button
              type="button"
              onClick={togglePreview}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-4 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              Aperçu de l'offre
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-bold"
            >
              {loading ? "Traitement..." : isEditMode ? "Mettre à jour l'offre" : "Créer l'offre d'emploi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default OfferForm

