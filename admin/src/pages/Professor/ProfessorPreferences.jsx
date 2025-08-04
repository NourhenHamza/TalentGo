"use client"

import { useState, useEffect } from "react"
import ProfessorLayout from "../../components/ProfessorLayout"

const ProfessorPreferences = () => {
  const [preferences, setPreferences] = useState([]) // Tableau des préférences
  const [newPreference, setNewPreference] = useState("") // Nouvelle préférence à ajouter
  const [maxStudents, setMaxStudents] = useState(5)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("") // "success" ou "error"
  const [saving, setSaving] = useState(false)

  // Récupérer les données du professeur à l'initialisation
  useEffect(() => {
    const fetchProfessorData = async () => {
      try {
        const token = localStorage.getItem("dToken") // Utilise 'dToken' au lieu de 'token'

        if (!token) {
          setMessage("Token manquant. Veuillez vous reconnecter.")
          setMessageType("error")
          return
        }

        const response = await fetch("http://localhost:4000/api/professor/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Envoie le token sous le format Bearer
          },
        })

        const data = await response.json()

        if (data.success) {
          setPreferences(data.data.preferences || [])
          setMaxStudents(data.data.professorData.maxStudents || 5)
        } else {
          setMessage(data.message || "Erreur inconnue")
          setMessageType("error")
        }
      } catch (error) {
        console.error("Erreur:", error)
        setMessage("Erreur lors de la récupération des données.")
        setMessageType("error")
      } finally {
        setLoading(false)
      }
    }

    fetchProfessorData()
  }, [])

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    setSaving(true)

    try {
      const token = localStorage.getItem("dToken") // Récupère le bon token
      const response = await fetch("http://localhost:4000/api/professor/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Envoie le token dans l'en-tête Authorization
        },
        body: JSON.stringify({ preferences, maxStudents }),
      })

      const data = await response.json()
      if (data.success) {
        setMessage("Préférences mises à jour avec succès !")
        setMessageType("success")
      } else {
        setMessage("Erreur lors de la mise à jour.")
        setMessageType("error")
      }
    } catch (error) {
      console.error("Erreur:", error)
      setMessage("Erreur serveur.")
      setMessageType("error")
    } finally {
      setSaving(false)
    }
  }

  // Ajouter une nouvelle préférence
  const handleAddPreference = () => {
    if (newPreference.trim() && !preferences.includes(newPreference.trim())) {
      setPreferences((prev) => [...prev, newPreference.trim()])
      setNewPreference("") // Réinitialiser le champ de saisie
    }
  }

  // Supprimer une préférence
  const handleRemovePreference = (preferenceToRemove) => {
    setPreferences(preferences.filter((pref) => pref !== preferenceToRemove))
  }

  // Gérer la touche Entrée pour ajouter une préférence
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddPreference()
    }
  }

  return (
    <div className="main-content"> {/* Add this wrapper */}
    <div className="min-h-screen py-16 px-6 sm:px-10 lg:px-16 relative overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute opacity-20 rounded-full bg-blue-400 animate-float`}
            style={{
              width: `${50 + i * 20}px`,
              height: `${50 + i * 20}px`,
              top: `${10 + i * 15}%`,
              left: i % 2 === 0 ? `${5 + i * 10}%` : `${80 - i * 10}%`,
              animationDelay: `${i * 0.5}s`,
              zIndex: 0,
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-4 animate-scale-in">
            <svg className="h-16 w-16 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-3">
            Préférences <span className="text-blue-500">Professeur</span>
          </h1>
          <div className="w-32 h-1.5 bg-blue-500 mx-auto my-5 rounded-full animate-width-expand"></div>
          <p className="mt-4 text-lg md:text-xl text-blue-700 max-w-2xl mx-auto animate-fade-in-delayed">
            Personnalisez vos domaines d'expertise et votre capacité d'encadrement
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full mb-6 animate-spin"></div>
            <p className="text-blue-800 font-medium text-lg">Chargement de vos préférences...</p>
          </div>
        ) : (
          <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-blue-200 animate-slide-up transform transition-all hover:shadow-xl">
            <div  className="blue-gradient-bg px-8 py-6">
              <h2 className="text-2xl font-semibold text-white flex items-center">
                <svg className="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                Configurer vos préférences d'encadrement
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-8">
              <div className="mb-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <label className="block text-lg font-semibold text-blue-800 mb-4 flex items-center">
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Domaines d'expertise
                </label>
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 mb-4">
                  <div className="flex flex-wrap gap-2 mb-4 min-h-[50px]">
                    {preferences.length > 0 ? (
                      preferences.map((pref, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-100 text-blue-800 border border-blue-200 shadow-sm animate-scale-in"
                          style={{ animationDelay: `${0.1 * index}s` }}
                        >
                          <span className="mr-2">{pref}</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePreference(pref)}
                            className="text-blue-500 hover:text-blue-700 focus:outline-none transition-colors"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-blue-600 italic animate-fade-in">
                        Aucune préférence ajoutée. Veuillez ajouter vos domaines d'expertise.
                      </p>
                    )}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={newPreference}
                      onChange={(e) => setNewPreference(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ajouter un domaine d'expertise (ex: Intelligence Artificielle)"
                      className="flex-1 block w-full rounded-l-lg border border-blue-200 focus:ring-blue-500 focus:border-blue-500 py-3 px-4 transition-shadow"
                    />
                    <button
                      type="button"
                      onClick={handleAddPreference}
                      className="inline-flex items-center px-4 rounded-r-lg border border-l-0 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mb-8 animate-slide-up" style={{ animationDelay: "0.4s" }}>
                <label className="block text-lg font-semibold text-blue-800 mb-4 flex items-center">
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  Nombre maximum d'étudiants
                </label>
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(Number(e.target.value))}
                    className="w-full rounded-lg border border-blue-200 focus:ring-blue-500 focus:border-blue-500 py-3 px-4 transition-shadow"
                  />
                  <p className="mt-2 text-sm text-blue-600">
                    Définissez le nombre maximum d'étudiants que vous pouvez encadrer simultanément.
                  </p>
                </div>
              </div>

              {message && (
                <div
                  className={`p-4 mb-6 rounded-lg animate-fade-in ${
                    messageType === "success"
                      ? "bg-green-50 border border-green-200 text-green-700"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="flex justify-end animate-slide-up" style={{ animationDelay: "0.6s" }}>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex justify-center items-center py-3 px-6 border border-transparent shadow-lg text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {saving ? (
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
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                        />
                      </svg>
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </form>
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
                .animate-float-1 { animation: float-1 8s ease-in-out infinite; }
                .animate-float-2 { animation: float-2 9s ease-in-out infinite; }
                .animate-float-3 { animation: float-3 10s ease-in-out infinite; }
                .animate-float-4 { animation: float-4 11s ease-in-out infinite; }
                .animate-float-5 { animation: float-5 12s ease-in-out infinite; }
                .animate-float-6 { animation: float-6 13s ease-in-out infinite; }
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
    </div>
  )
}

export default ProfessorPreferences

