"use client"

import { createContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import PropTypes from "prop-types"
import axios from "axios"

export const StudentContext = createContext()

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

export const StudentProvider = ({ children }) => {
  const [sToken, setSToken] = useState("")
  const [studentData, setStudentData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Intercepteur pour ajouter le token aux requêtes
  apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token") || sToken // Utiliser "token" au lieu de "sToken"
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
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
        handleLogout()
        toast.error("Session expirée. Veuillez vous reconnecter.")
      }
      return Promise.reject(error)
    }
  )

  // Initialisation de l'authentification au chargement
  useEffect(() => {
    const initializeAuth = async () => {
      // Vérifier d'abord le token dans localStorage avec la clé "token"
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const response = await verifyToken(token)
          if (response.valid) {
            setSToken(token)
            setStudentData(response.student)
            // Synchroniser loggedInUser dans localStorage
            localStorage.setItem("loggedInUser", JSON.stringify(response.student))
          } else {
            // Nettoyer le localStorage si le token n'est pas valide
            localStorage.removeItem("token")
            localStorage.removeItem("loggedInUser")
          }
        } catch (error) {
          console.error("Token verification failed:", error)
          localStorage.removeItem("token")
          localStorage.removeItem("loggedInUser")
        }
      }
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  // Vérification du token (peut être remplacée par un appel API réel)
  const verifyToken = async (token) => {
    try {
      // Décoder le JWT pour extraire les informations de base
      const payload = JSON.parse(atob(token.split('.')[1]))
      
      // Vérifier si le token n'est pas expiré
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return { valid: false }
      }

      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return {
        valid: true,
        student: {
          id: payload.id || "STU-2023-001",
          name: "John Doe", // Dans un vrai système, ces données viendraient de l'API
          email: "john.doe@university.edu",
          specialization: "Computer Science",
          currentClass: "M2",
          university: payload.university,
          role: payload.role,
          image: "/placeholder.svg?height=48&width=48"
        }
      }
    } catch (error) {
      console.error("Error verifying token:", error)
      return { valid: false }
    }
  }

  // Connexion de l'étudiant
  const login = async (email, password) => {
    try {
      setIsLoading(true)
      
      // Appel API de connexion réel
      const response = await apiClient.post('/auth/student/login', {
        email,
        password
      })
      
      if (response.data.success) {
        const { token, student } = response.data.data
        
        setSToken(token)
        setStudentData(student)
        localStorage.setItem("token", token) // Utiliser "token" au lieu de "sToken"
        localStorage.setItem("loggedInUser", JSON.stringify(student))
        
        toast.success("Connexion réussie!")
        return true
      } else {
        toast.error(response.data.message || "Échec de la connexion")
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      
      // Fallback vers le mock login si l'API n'est pas disponible
      if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
        console.log("API not available, using mock login")
        return await mockLogin(email, password)
      }
      
      const errorMessage = error.response?.data?.message || "Une erreur s'est produite lors de la connexion"
      toast.error(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Mock login pour le développement/test
  const mockLogin = async (email, password) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === "student@university.edu" && password === "password123") {
          const token = "stu_" + Math.random().toString(36).substring(2, 15)
          const student = {
            id: "STU-2023-001",
            name: "John Doe",
            email: "student@university.edu",
            specialization: "Computer Science",
            currentClass: "M2",
            image: "/placeholder.svg?height=48&width=48"
          }
          
          setSToken(token)
          setStudentData(student)
          localStorage.setItem("token", token) // Utiliser "token" au lieu de "sToken"
          localStorage.setItem("loggedInUser", JSON.stringify(student))
          
          toast.success("Connexion réussie (mode test)!")
          resolve(true)
        } else {
          toast.error("Email ou mot de passe invalide")
          resolve(false)
        }
      }, 1000)
    })
  }

  // Déconnexion
  const logout = () => {
    handleLogout()
    toast.success("Déconnexion réussie")
    navigate("/student-login")
  }

  // Gestion de la déconnexion (interne)
  const handleLogout = () => {
    setSToken("")
    setStudentData(null)
    localStorage.removeItem("token") // Utiliser "token" au lieu de "sToken"
    localStorage.removeItem("loggedInUser")
  }

  // Mise à jour des données de l'étudiant
  const updateStudentData = (newData) => {
    const updatedData = { ...studentData, ...newData }
    setStudentData(updatedData)
    localStorage.setItem("loggedInUser", JSON.stringify(updatedData))
  }

  const contextValue = {
    // État
    sToken,
    studentData,
    isLoading,
    
    // Actions d'authentification
    login,
    logout,
    handleLogout, // Exposer pour DashboardContext
    
    // Actions de données
    updateStudentData,
    
    // Client API pour les composants enfants
    apiClient
  }

  return (
    <StudentContext.Provider value={contextValue}>
      {children}
    </StudentContext.Provider>
  )
}

StudentProvider.propTypes = {
  children: PropTypes.node.isRequired
}
