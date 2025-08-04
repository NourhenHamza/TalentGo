"use client"

import { createContext, useState, useEffect, useContext } from "react"
import { toast } from "react-toastify"
import PropTypes from "prop-types"
import axios from "axios"
import { StudentContext } from "./StudentContext"

export const DashboardContext = createContext()

// Configuration de l'API (sans process.env)
const API_BASE_URL = "http://localhost:4000/api"

// Configuration d'axios avec intercepteurs
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const DashboardProvider = ({ children }) => {
  // Vérification de sécurité pour s'assurer que StudentContext est disponible
  const studentContext = useContext(StudentContext)
  
  // Vérification de sécurité - si le contexte n'est pas disponible, on retourne un état par défaut
  if (!studentContext) {
    console.warn("DashboardProvider: StudentContext not available, rendering with default state")
    return (
      <DashboardContext.Provider value={{
        dashboardData: null,
        isLoadingDashboard: true,
        refreshDashboard: () => Promise.resolve(null),
        confirmApplication: () => Promise.resolve(null),
        submitSubject: () => Promise.resolve(null),
        submitReport: () => Promise.resolve(null),
        getAvailableOffers: () => Promise.resolve([]),
      }}>
        {children}
      </DashboardContext.Provider>
    )
  }

  const { sToken, handleLogout } = studentContext
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true)

  // Intercepteur pour ajouter le token aux requêtes
  apiClient.interceptors.request.use(
    (config) => {
      if (sToken) {
        config.headers.Authorization = `Bearer ${sToken}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Intercepteur pour gérer les erreurs de réponse
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expiré ou invalide
        if (handleLogout) {
          handleLogout() // Utiliser la fonction de déconnexion du StudentContext
          toast.error("Session expirée. Veuillez vous reconnecter.")
        }
      }
      return Promise.reject(error)
    }
  )

  // Chargement des données du tableau de bord
  const loadDashboardData = async () => {
    if (!sToken) {
      setIsLoadingDashboard(false);
      return null;
    }

    setIsLoadingDashboard(true)
    try {
      const response = await apiClient.get("/dashboard/student")
      
      if (response.data.success) {
        setDashboardData(response.data.data)
        return response.data.data
      } else {
        console.error("Failed to load dashboard data:", response.data.message)
        return null
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      
      // PAS de fallback vers des données mockées - afficher l'erreur
      toast.error("Impossible de charger les données du tableau de bord")
      return null
    } finally {
      setIsLoadingDashboard(false)
    }
  }

  // Rafraîchissement des données du tableau de bord
  const refreshDashboard = async () => {
    if (sToken) {
      return await loadDashboardData()
    }
    return null
  }

  // Mise à jour d'une candidature (confirmation par l'étudiant)
  const confirmApplication = async (applicationId) => {
    try {
      const response = await apiClient.put(`/dashboard/student/applications/${applicationId}/confirm`)
      
      if (response.data.success) {
        toast.success("Candidature confirmée avec succès!")
        // Rafraîchir les données du tableau de bord
        await refreshDashboard()
        return response.data.data
      }
      return null
    } catch (error) {
      console.error("Error confirming application:", error)
      toast.error("Erreur lors de la confirmation de la candidature")
      return null
    }
  }

  // Soumission d'un nouveau sujet avec logique de statut corrigée
  const submitSubject = async (subjectData) => {
    try {
      const response = await apiClient.post('/dashboard/student/subjects', subjectData)
      
      if (response.data.success) {
        toast.success("Sujet soumis avec succès!")
        await refreshDashboard()
        return response.data.data
      }
      return null
    } catch (error) {
      console.error("Error submitting subject:", error)
      toast.error("Erreur lors de la soumission du sujet")
      return null
    }
  }

  // Soumission d'un rapport
  const submitReport = async (reportData) => {
    try {
      const response = await apiClient.post('/dashboard/student/reports', reportData)
      
      if (response.data.success) {
        toast.success("Rapport soumis avec succès!")
        await refreshDashboard()
        return response.data.data
      }
      return null
    } catch (error) {
      console.error("Error submitting report:", error)
      toast.error("Erreur lors de la soumission du rapport")
      return null
    }
  }

  // Récupération des offres disponibles
  const getAvailableOffers = async () => {
    try {
      const response = await apiClient.get('/dashboard/offers')
      
      if (response.data.success) {
        return response.data.data
      }
      return []
    } catch (error) {
      console.error("Error fetching offers:", error)
      return []
    }
  }

  // Charger les données du tableau de bord au montage du composant si le token est présent
  useEffect(() => {
    if (sToken) {
      loadDashboardData();
    } else {
      setIsLoadingDashboard(false);
    }
  }, [sToken]); // Dépend du sToken du StudentContext

  const contextValue = {
    dashboardData,
    isLoadingDashboard,
    refreshDashboard,
    confirmApplication,
    submitSubject,
    submitReport,
    getAvailableOffers,
  }

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  )
}

DashboardProvider.propTypes = {
  children: PropTypes.node.isRequired
}
