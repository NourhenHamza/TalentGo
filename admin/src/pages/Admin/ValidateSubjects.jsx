"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"

const ValidateSubjects = () => {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [feedback, setFeedback] = useState("")
  const [filter, setFilter] = useState("suggested")
  const [searchTerm, setSearchTerm] = useState("")
  const [animateList, setAnimateList] = useState(false)

  const API_URL = "http://localhost:4000/api/subjects"

  useEffect(() => {
    fetchSubjects()
  }, [filter])

  const fetchSubjects = async () => {
    try {
      setLoading(true)
      const url = new URL(`${API_URL}/admin/subjects`)

      if (filter) url.searchParams.append("status", filter)
      if (searchTerm) url.searchParams.append("search", searchTerm)

      const response = await axios.get(url.toString(), {
        headers: {
          aToken: localStorage.getItem("aToken"),
        },
      })

      if (response.data.success) {
        setSubjects(response.data.data)
        // Déclencher l'animation après le chargement des données
        setTimeout(() => setAnimateList(true), 100)
      } else {
        toast.error(response.data.message || "Erreur lors de la récupération des sujets")
      }
    } catch (error) {
      console.error("Fetch error:", error)
      const errorMessage = error.response?.data?.message || "Erreur lors de la récupération des sujets"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      setActionLoading(true)

      const response = await axios.put(
        `${API_URL}/admin/subjects/${id}/approve`,
        { feedback }, // Envoie bien le feedback dans le body
        {
          headers: {
            "Content-Type": "application/json",
            aToken: localStorage.getItem("aToken"), // Assure-toi que l'admin est bien authentifié
          },
        },
      )

      if (response.data.success) {
        toast.success("Sujet approuvé avec succès")
        fetchSubjects() // Rafraîchir la liste
        setSelectedSubject(null)
        setFeedback("")
      } else {
        toast.error(response.data.message || "Erreur lors de l'approbation du sujet")
      }
    } catch (error) {
      console.error("Approval error:", error)
      toast.error("Erreur lors de l'approbation du sujet")
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (id) => {
    if (!feedback.trim()) {
      toast.error("Le feedback est obligatoire pour rejeter un sujet.")
      return
    }

    try {
      setActionLoading(true)

      const response = await axios.put(
        `${API_URL}/admin/subjects/${id}/reject`,
        { feedback }, // Envoi du feedback
        {
          headers: {
            "Content-Type": "application/json",
            aToken: localStorage.getItem("aToken"),
          },
        },
      )

      if (response.data.success) {
        toast.success("Sujet rejeté avec succès")
        fetchSubjects()
        setSelectedSubject(null)
        setFeedback("")
      } else {
        toast.error(response.data.message || "Erreur lors du rejet du sujet")
      }
    } catch (error) {
      console.error("Rejection error:", error)
      toast.error("Erreur lors du rejet du sujet")
    } finally {
      setActionLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchSubjects()
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "suggested":
        return (
          <div className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200 inline-flex items-center animate-scale-in">
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            En attente
          </div>
        )
      case "approved":
        return (
          <div className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 border border-green-200 inline-flex items-center animate-scale-in">
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Approuvé
          </div>
        )
      case "rejected":
        return (
          <div className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800 border border-red-200 inline-flex items-center animate-scale-in">
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Rejeté
          </div>
        )
      default:
        return (
          <div className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200 inline-flex items-center animate-scale-in">
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {status}
          </div>
        )
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("fr-FR")
  }

  const getGenderDisplay = (gender) => {
    switch (gender) {
      case "male":
        return "Homme"
      case "female":
        return "Femme"
      default:
        return gender || "N/A"
    }
  }

  return (
    <div className="validation-container">
      {/* Éléments décoratifs */}
      <div className="absolute top-0 left-3 w-full h-full overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute opacity-20 rounded-full bg-blue-500"
            style={{
              width: `${50 + i * 20}px`,
              height: `${50 + i * 20}px`,
              top: `${10 + i * 15}%`,
              left: i % 2 === 0 ? `${5 + i * 10}%` : `${80 - i * 10}%`,
              animation: `float-${i + 1} ${8 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
              zIndex: 0,
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-4 animate-scale-in">
            <svg className="h-16 w-16 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-3">
            Validation des <span className="text-blue-500">Projets</span>
          </h1>
          <div className="w-32 h-1.5 bg-blue-500 mx-auto my-5 rounded-full animate-width-expand"></div>
          <p className="mt-4 text-lg md:text-xl text-blue-700 max-w-2xl mx-auto animate-fade-in-delayed">
            Approuvez ou rejetez les propositions de projets de fin d'études
          </p>
        </div>

        {selectedSubject ? (
          <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-blue-100 animate-fade-in">
            <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-8 py-6 flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-white flex items-center">
                <svg className="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Détails du projet
              </h2>
              <button
                onClick={() => {
                  setSelectedSubject(null)
                  setFeedback("")
                }}
                className="p-2 rounded-full text-white hover:bg-white/10 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            </div>

            <div className="p-8">
              <div
                className="flex justify-between items-start mb-6 animate-slide-up"
                style={{ animationDelay: "0.2s" }}
              >
                <h3 className="text-2xl font-bold text-blue-900">{selectedSubject.title}</h3>
                {getStatusBadge(selectedSubject.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div
                  className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm animate-slide-up"
                  style={{ animationDelay: "0.3s" }}
                >
                  <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Informations du projet
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Entreprise</p>
                      <p className="text-gray-800 flex items-center">
                        <svg
                          className="h-4 w-4 mr-1 text-blue-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        {selectedSubject.company}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-600">Technologies</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedSubject.technologies?.length > 0 ? (
                          selectedSubject.technologies.map((tech, index) => (
                            <div
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 animate-scale-in"
                              style={{ animationDelay: `${0.4 + index * 0.05}s` }}
                            >
                              {tech}
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-500 italic">Aucune technologie spécifiée</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-600">Date de proposition</p>
                      <p className="text-gray-800 flex items-center">
                        <svg
                          className="h-4 w-4 mr-1 text-blue-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {formatDate(selectedSubject.createdAt)}
                      </p>
                    </div>
                    {selectedSubject.supervisor && (
                      <div>
                        <p className="text-sm font-medium text-blue-600">Superviseur assigné</p>
                        <p className="text-gray-800 flex items-center">
                          <svg
                            className="h-4 w-4 mr-1 text-blue-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          {selectedSubject.supervisor.name}
                        </p>
                        {selectedSubject.supervisor.email && (
                          <p className="text-gray-600 text-sm ml-5">{selectedSubject.supervisor.email}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm animate-slide-up"
                  style={{ animationDelay: "0.4s" }}
                >
                  <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    Informations de l'étudiant
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Nom complet</p>
                      <p className="text-gray-800">{selectedSubject.proposedBy?.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-600">Email</p>
                      <p className="text-gray-800 flex items-center">
                        <svg
                          className="h-4 w-4 mr-1 text-blue-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        {selectedSubject.proposedBy?.email || "N/A"}
                      </p>
                    </div>
                    {selectedSubject.proposedBy?.cin && (
                      <div>
                        <p className="text-sm font-medium text-blue-600">CIN</p>
                        <p className="text-gray-800">{selectedSubject.proposedBy.cin}</p>
                      </div>
                    )}
                    {selectedSubject.proposedBy?.dateOfBirth && (
                      <div>
                        <p className="text-sm font-medium text-blue-600">Date de naissance</p>
                        <p className="text-gray-800">{formatDate(selectedSubject.proposedBy.dateOfBirth)}</p>
                      </div>
                    )}
                    {selectedSubject.proposedBy?.gender && (
                      <div>
                        <p className="text-sm font-medium text-blue-600">Genre</p>
                        <p className="text-gray-800">{getGenderDisplay(selectedSubject.proposedBy.gender)}</p>
                      </div>
                    )}
                    {selectedSubject.proposedBy?.profile?.phone && (
                      <div>
                        <p className="text-sm font-medium text-blue-600">Téléphone</p>
                        <p className="text-gray-800">{selectedSubject.proposedBy.profile.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Nouvelle section pour les informations académiques */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div
                  className="bg-green-50 p-6 rounded-xl border border-green-100 shadow-sm animate-slide-up"
                  style={{ animationDelay: "0.5s" }}
                >
                  <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 14l9-5-9-5-9 5 9 5z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                      />
                    </svg>
                    Informations académiques
                  </h4>
                  <div className="space-y-3">
                    {selectedSubject.proposedBy?.studyLevel && (
                      <div>
                        <p className="text-sm font-medium text-green-600">Niveau d'études</p>
                        <p className="text-gray-800">{selectedSubject.proposedBy.studyLevel}</p>
                      </div>
                    )}
                    {selectedSubject.proposedBy?.specialization && (
                      <div>
                        <p className="text-sm font-medium text-green-600">Spécialisation</p>
                        <p className="text-gray-800">{selectedSubject.proposedBy.specialization}</p>
                      </div>
                    )}
                    {selectedSubject.proposedBy?.currentClass && (
                      <div>
                        <p className="text-sm font-medium text-green-600">Classe actuelle</p>
                        <p className="text-gray-800">{selectedSubject.proposedBy.currentClass}</p>
                      </div>
                    )}
                    {selectedSubject.proposedBy?.academicYear && (
                      <div>
                        <p className="text-sm font-medium text-green-600">Année académique</p>
                        <p className="text-gray-800">{selectedSubject.proposedBy.academicYear}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="bg-purple-50 p-6 rounded-xl border border-purple-100 shadow-sm animate-slide-up"
                  style={{ animationDelay: "0.6s" }}
                >
                  <h4 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    Université
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Nom de l'université</p>
                      <p className="text-gray-800">
                        {selectedSubject.proposedBy?.university?.name || 
                         selectedSubject.university?.name || 
                         selectedSubject.proposedBy?.profile?.university || "N/A"}
                      </p>
                    </div>
                    {(selectedSubject.proposedBy?.university?.code || selectedSubject.university?.code) && (
                      <div>
                        <p className="text-sm font-medium text-purple-600">Code université</p>
                        <p className="text-gray-800">
                          {selectedSubject.proposedBy?.university?.code || selectedSubject.university?.code}
                        </p>
                      </div>
                    )}
                    {(selectedSubject.proposedBy?.university?.city || selectedSubject.university?.city) && (
                      <div>
                        <p className="text-sm font-medium text-purple-600">Ville</p>
                        <p className="text-gray-800">
                          {selectedSubject.proposedBy?.university?.city || selectedSubject.university?.city}
                        </p>
                      </div>
                    )}
                    {(selectedSubject.proposedBy?.university?.country || selectedSubject.university?.country) && (
                      <div>
                        <p className="text-sm font-medium text-purple-600">Pays</p>
                        <p className="text-gray-800">
                          {selectedSubject.proposedBy?.university?.country || selectedSubject.university?.country}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div
                className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm mb-8 animate-slide-up"
                style={{ animationDelay: "0.7s" }}
              >
                <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  Description du projet
                </h4>
                <p className="text-gray-700 whitespace-pre-line">{selectedSubject.description}</p>
              </div>

              {selectedSubject.feedback && (
                <div
                  className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 shadow-sm mb-8 animate-slide-up"
                  style={{ animationDelay: "0.8s" }}
                >
                  <h4 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    Feedback précédent
                  </h4>
                  <p className="text-gray-700 italic border-l-4 border-yellow-200 pl-4 py-2">
                    {selectedSubject.feedback}
                  </p>
                </div>
              )}

              {selectedSubject.status === "suggested" && (
                <>
                  <div className="mb-8 animate-slide-up" style={{ animationDelay: "0.9s" }}>
                    <label className="block text-lg font-semibold text-blue-800 mb-4 flex items-center">
                      <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                      Feedback
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-shadow"
                      rows="4"
                      placeholder="Entrez votre feedback pour l'étudiant..."
                    ></textarea>
                  </div>

                  <div
                    className="flex flex-col sm:flex-row gap-4 justify-end animate-slide-up"
                    style={{ animationDelay: "1.0s" }}
                  >
                    <button
                      onClick={() => handleApprove(selectedSubject._id)}
                      disabled={actionLoading}
                      className={`px-6 py-3 ${actionLoading ? "bg-green-400" : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"} text-white rounded-lg shadow-lg transition-colors flex items-center justify-center font-medium`}
                    >
                      {actionLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Traitement...
                        </>
                      ) : (
                        <>
                          <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Approuver le sujet
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(selectedSubject._id)}
                      disabled={actionLoading || !feedback.trim()}
                      className={`px-6 py-3 ${actionLoading || !feedback.trim() ? "bg-red-400 cursor-not-allowed" : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"} text-white rounded-lg shadow-lg transition-colors flex items-center justify-center font-medium`}
                    >
                      {actionLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Traitement...
                        </>
                      ) : (
                        <>
                          <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          Rejeter le sujet
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-blue-100 animate-fade-in">
            <div className="blue-gradient-header px-8 py-6">
              <h2 className="text-2xl font-semibold text-white flex items-center">
                <svg className="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filtrer les projets
              </h2>
            </div>

            <div className="p-8">
              <div
                className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 animate-slide-up"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <button
                    onClick={() => setFilter("suggested")}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center ${filter === "suggested" ? "bg-blue-600 text-white shadow-md" : "bg-blue-100 text-blue-800 hover:bg-blue-200"}`}
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    En attente
                  </button>
                  <button
                    onClick={() => setFilter("approved")}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center ${filter === "approved" ? "bg-blue-600 text-white shadow-md" : "bg-blue-100 text-blue-800 hover:bg-blue-200"}`}
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Approuvés
                  </button>
                  <button
                    onClick={() => setFilter("rejected")}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center ${filter === "rejected" ? "bg-blue-600 text-white shadow-md" : "bg-blue-100 text-blue-800 hover:bg-blue-200"}`}
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Rejetés
                  </button>
                  <button
                    onClick={() => setFilter("")}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center ${filter === "" ? "bg-blue-600 text-white shadow-md" : "bg-blue-100 text-blue-800 hover:bg-blue-200"}`}
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                    Tous
                  </button>
                </div>

                <form onSubmit={handleSearch} className="flex w-full md:w-auto">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher un sujet..."
                    className="w-full md:w-64 px-4 py-2 border border-blue-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </form>
              </div>

              {loading ? (
                <div className="flex justify-center p-12 animate-fade-in">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              ) : subjects.length === 0 ? (
                <div className="bg-blue-50 rounded-xl p-8 text-center animate-fade-in">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center animate-scale-in">
                    <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-blue-800 mb-2">Aucun sujet trouvé</h3>
                  <p className="text-blue-600">Aucun sujet ne correspond à ce filtre.</p>
                </div>
              ) : (
                <div
                  className="subject-grid"
                >
                  {subjects.map((subject, index) => (
                    <div
                      key={subject._id}
                      className="validation-card animate-card-entry"
                      style={{ animationDelay: `${0.1 * index}s` }}
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-semibold text-blue-900 line-clamp-1">{subject.title}</h3>
                          {getStatusBadge(subject.status)}
                        </div>
                        <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{subject.description}</p>
                        <div className="space-y-2 mb-4">
                          <p className="text-sm text-gray-500 flex items-center">
                            <svg
                              className="h-4 w-4 mr-1 text-blue-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            <span className="font-medium">Entreprise:</span> {subject.company}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <svg
                              className="h-4 w-4 mr-1 text-blue-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                              />
                            </svg>
                            <span className="font-medium">Étudiant:</span> {subject.proposedBy?.name || "N/A"}
                          </p>
                          {subject.proposedBy?.studyLevel && (
                            <p className="text-sm text-gray-500 flex items-center">
                              <svg
                                className="h-4 w-4 mr-1 text-blue-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 14l9-5-9-5-9 5 9 5z"
                                />
                              </svg>
                              <span className="font-medium">Niveau:</span> {subject.proposedBy.studyLevel}
                            </p>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-400">
                            {formatDate(subject.createdAt)}
                          </div>
                          <button
                            onClick={() => setSelectedSubject(subject)}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center"
                          >
                            Détails
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float-1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(3deg); }
        }
        @keyframes float-4 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-3deg); }
        }
        @keyframes float-5 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-6 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        .animate-fade-in { 
          opacity: 0;
          animation: fadeIn 0.8s ease-out forwards;
        }
        .animate-fade-in-delayed { 
          opacity: 0;
          animation: fadeIn 0.8s ease-out 0.5s forwards;
        }
        .animate-scale-in {
          transform: scale(0);
          animation: scaleIn 0.5s ease-out forwards;
        }
        .animate-slide-up {
          opacity: 0;
          transform: translateY(20px);
          animation: slideUp 0.5s ease-out forwards;
        }
        .animate-width-expand {
          width: 0;
          animation: widthExpand 1s ease-out 0.5s forwards;
        }
        .animate-cards-container {
          opacity: 1;
        }
        .animate-card {
          opacity: 0;
          transform: translateY(20px);
          animation: slideUp 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes widthExpand {
          from { width: 0; }
          to { width: 8rem; }
        }
      `}</style>
    </div>
  )
}

export default ValidateSubjects