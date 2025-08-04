"use client"

import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  Briefcase,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  DollarSign,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
  Link,
  Loader2,
  MapPin,
  Plus,
  Search,
  Settings,
  Tag,
  Trash2,
  Users,
} from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CompanyContext } from "../../context/CompanyContext"

const CompanyOffersManagementPage = () => {
  const { cToken } = useContext(CompanyContext)
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOffer, setSelectedOffer] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterCategory, setFilterCategory] = useState("") // Nouveau filtre par catégorie
  const [showFilters, setShowFilters] = useState(false)
  const navigate = useNavigate()

  // Liste des catégories disponibles (basée sur le modèle OffreStageEmploi)
  const categories = [
    'Tech', 'DeepTech', 'HighTech', 'MedTech', 'HealthTech', 'BioTech', 'WellnessTech', 'PharmaTech', 'CareTech',
    'EdTech', 'LearnTech', 'TeachTech', 'FinTech', 'InsurTech', 'LegalTech', 'RegTech', 'WealthTech',
    'GreenTech', 'CleanTech', 'AgriTech', 'FoodTech', 'ClimateTech', 'RetailTech', 'EcomTech', 'MarTech',
    'AdTech', 'SalesTech', 'LoyaltyTech', 'HRTech', 'WorkTech', 'RecruitTech', 'MobilityTech', 'AutoTech',
    'LogiTech', 'TravelTech', 'AeroTech', 'ShipTech', 'PropTech', 'ConstrucTech', 'BuildTech', 'HomeTech',
    'NanoTech', 'RoboTech', 'NeuroTech', 'GameTech', 'MediaTech', 'MusicTech', 'SportTech', 'ArtTech',
    'EventTech', 'FashionTech', 'BeautyTech', 'DesignTech', 'LuxuryTech', 'CivicTech', 'GovTech', 'SpaceTech',
    'MilTech', 'EduGovTech'
  ]

  // Debug logging function
  const logDebugInfo = (action, data = {}) => {
    const timestamp = new Date().toISOString()
    const currentUrl = window.location.href
    const userAgent = navigator.userAgent

    console.log(`[${timestamp}] COMPANY_OFFERS_MANAGEMENT: ${action}`, {
      currentUrl,
      userAgent,
      cToken: cToken ? `${cToken.substring(0, 20)}...` : "null",
      ...data,
    })
  }

  // Token validation and analysis function
  const validateAndAnalyzeToken = () => {
    logDebugInfo("TOKEN_VALIDATION_START")

    if (!cToken) {
      console.log("ERROR: No cToken found in context")
      logDebugInfo("TOKEN_VALIDATION_ERROR", { error: "No cToken in context" })
      return { error: "Authentication token missing. Please log in again.", status: 401 }
    }

    try {
      const tokenParts = cToken.split(".")
      if (tokenParts.length !== 3) {
        console.log("ERROR: Invalid token format")
        logDebugInfo("TOKEN_VALIDATION_ERROR", { error: "Invalid token format" })
        return { error: "Invalid token format.", status: 400 }
      }

      const payload = JSON.parse(atob(tokenParts[1]))
      console.log("Token payload decoded:", payload)

      const entreprise_id = payload.id
      if (!entreprise_id) {
        console.log("ERROR: No entreprise_id found in token payload")
        logDebugInfo("TOKEN_VALIDATION_ERROR", { error: "No entreprise_id in payload" })
        return { error: "Company ID missing in token.", status: 400 }
      }

      const currentTime = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < currentTime) {
        console.log("ERROR: Token expired")
        logDebugInfo("TOKEN_VALIDATION_ERROR", { error: "Token expired", exp: payload.exp, currentTime })
        return { error: "Token expired. Please log in again.", status: 401 }
      }

      console.log("Token validation successful, entreprise_id:", entreprise_id)
      logDebugInfo("TOKEN_VALIDATION_SUCCESS", { entreprise_id, exp: payload.exp })
      return { entreprise_id, payload }
    } catch (error) {
      console.log("ERROR: Token decoding failed:", error.message)
      logDebugInfo("TOKEN_VALIDATION_ERROR", { error: error.message })
      return { error: "Error analyzing token.", status: 400 }
    }
  }

  // Function to create request headers
  const createRequestHeaders = () => {
    logDebugInfo("CREATE_REQUEST_HEADERS_START")

    const tokenValidation = validateAndAnalyzeToken()
    if (tokenValidation.error) {
      console.log("CREATE_REQUEST_HEADERS_ERROR: Token validation failed")
      return { error: tokenValidation.error, status: tokenValidation.status }
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cToken}`,
    }

    console.log("Request headers created successfully")
    logDebugInfo("CREATE_REQUEST_HEADERS_SUCCESS", { hasAuth: !!headers.Authorization })
    return { headers }
  }

  // Function to fetch company offers
  const fetchOffers = async () => {
    try {
      logDebugInfo("FETCH_OFFERS_START")
      setLoading(true)
      setError(null)

      const tokenValidation = validateAndAnalyzeToken()
      if (tokenValidation.error) {
        console.log("FETCH_OFFERS_ERROR: Token validation failed")
        setError(tokenValidation.error)
        setLoading(false)
        return
      }

      const { entreprise_id } = tokenValidation
      const headersResult = createRequestHeaders()
      if (headersResult.error) {
        console.log("FETCH_OFFERS_ERROR: Headers creation failed")
        setError(headersResult.error)
        setLoading(false)
        return
      }

      const url = `http://localhost:4000/api/offres/company/${entreprise_id}`
      console.log("FETCH_OFFERS: Making request to:", url)
      logDebugInfo("FETCH_OFFERS_REQUEST", { url, method: "GET" })

      const response = await fetch(url, {
        method: "GET",
        headers: headersResult.headers,
      })

      console.log("FETCH_OFFERS: Response status:", response.status)
      logDebugInfo("FETCH_OFFERS_RESPONSE", {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Network error" }))
        console.log("FETCH_OFFERS_ERROR: HTTP error:", errorData)
        logDebugInfo("FETCH_OFFERS_ERROR", {
          status: response.status,
          error: errorData,
        })

        if (response.status === 401) {
          setError("Session expired. Please log in again.")
        } else if (response.status === 404) {
          setError("No offers found for your company.")
        } else {
          setError(errorData.message || "Error loading offers")
        }
        setLoading(false)
        return
      }

      const data = await response.json()
      console.log("FETCH_OFFERS: Response data received:", data)
      logDebugInfo("FETCH_OFFERS_SUCCESS", {
        offersCount: data.data ? data.data.length : 0,
        success: data.success,
      })

      if (data.success && data.data) {
        setOffers(data.data)
        console.log("FETCH_OFFERS_SUCCESS: Offers loaded successfully, count:", data.data.length)
      } else {
        console.log("FETCH_OFFERS_ERROR: Invalid response format")
        setError("Invalid response format")
      }
    } catch (error) {
      console.error("FETCH_OFFERS_ERROR: Network or parsing error:", error)
      logDebugInfo("FETCH_OFFERS_ERROR", {
        error: error.message,
        stack: error.stack,
      })
      setError("Connection error. Check your internet connection.")
    } finally {
      setLoading(false)
    }
  }

  // Function to toggle publish status
  const togglePublishStatus = async (offerId, currentStatus) => {
    try {
      logDebugInfo("TOGGLE_PUBLISH_START", { offerId, currentStatus })
      setActionLoading(true)

      const headersResult = createRequestHeaders()
      if (headersResult.error) {
        console.log("TOGGLE_PUBLISH_ERROR: Headers creation failed")
        setError(headersResult.error)
        return
      }

      const url = `http://localhost:4000/api/offres/${offerId}/toggle-publish`
      console.log("TOGGLE_PUBLISH: Making request to:", url)

      const response = await fetch(url, {
        method: "PUT",
        headers: headersResult.headers,
      })

      console.log("TOGGLE_PUBLISH: Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Network error" }))
        console.log("TOGGLE_PUBLISH_ERROR: HTTP error:", errorData)
        setError(errorData.message || "Error changing status")
        return
      }

      const data = await response.json()
      console.log("TOGGLE_PUBLISH: Response data:", data)

      if (data.success) {
        setOffers((prevOffers) =>
          prevOffers.map((offer) => (offer._id === offerId ? { ...offer, ...data.data } : offer)),
        )

        alert(data.message)

        logDebugInfo("TOGGLE_PUBLISH_SUCCESS", {
          offerId,
          newStatus: data.data.isPublished,
          message: data.message,
        })
      } else {
        setError("Error changing status")
      }
    } catch (error) {
      console.error("TOGGLE_PUBLISH_ERROR: Network error:", error)
      logDebugInfo("TOGGLE_PUBLISH_ERROR", { error: error.message })
      setError("Connection error")
    } finally {
      setActionLoading(false)
    }
  }

  // Function to toggle publish for students status
  const togglePublishForStudentsStatus = async (offerId, currentStatus) => {
    try {
      logDebugInfo("TOGGLE_PUBLISH_STUDENTS_START", { offerId, currentStatus })
      setActionLoading(true)

      const headersResult = createRequestHeaders()
      if (headersResult.error) {
        console.log("TOGGLE_PUBLISH_STUDENTS_ERROR: Headers creation failed")
        setError(headersResult.error)
        return
      }

      const url = `http://localhost:4000/api/offres/${offerId}/toggle-publish-students`
      console.log("TOGGLE_PUBLISH_STUDENTS: Making request to:", url)

      const response = await fetch(url, {
        method: "PUT",
        headers: headersResult.headers,
      })

      console.log("TOGGLE_PUBLISH_STUDENTS: Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Network error" }))
        console.log("TOGGLE_PUBLISH_STUDENTS_ERROR: HTTP error:", errorData)
        setError(errorData.message || "Error changing student status")
        return
      }

      const data = await response.json()
      console.log("TOGGLE_PUBLISH_STUDENTS: Response data:", data)

      if (data.success) {
        setOffers((prevOffers) =>
          prevOffers.map((offer) => (offer._id === offerId ? { ...offer, ...data.data } : offer)),
        )

        alert(data.message)

        logDebugInfo("TOGGLE_PUBLISH_STUDENTS_SUCCESS", {
          offerId,
          newStatus: data.data.isPublishedForStudents,
          message: data.message,
        })
      } else {
        setError("Error changing student status")
      }
    } catch (error) {
      console.error("TOGGLE_PUBLISH_STUDENTS_ERROR: Network error:", error)
      logDebugInfo("TOGGLE_PUBLISH_STUDENTS_ERROR", { error: error.message })
      setError("Connection error")
    } finally {
      setActionLoading(false)
    }
  }

  // Function to generate public link
  const generatePublicLink = async (offerId) => {
    try {
      logDebugInfo("GENERATE_PUBLIC_LINK_START", { offerId })
      setActionLoading(true)

      const headersResult = createRequestHeaders()
      if (headersResult.error) {
        console.log("GENERATE_PUBLIC_LINK_ERROR: Headers creation failed")
        setError(headersResult.error)
        return
      }

      const url = `http://localhost:4000/api/offres/${offerId}/generate-public-link`
      console.log("GENERATE_PUBLIC_LINK: Making request to:", url)

      const response = await fetch(url, {
        method: "POST",
        headers: headersResult.headers,
      })

      console.log("GENERATE_PUBLIC_LINK: Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Network error" }))
        console.log("GENERATE_PUBLIC_LINK_ERROR: HTTP error:", errorData)
        setError(errorData.message || "Error generating link")
        return
      }

      const data = await response.json()
      console.log("GENERATE_PUBLIC_LINK: Response data:", data)

      if (data.success) {
        setOffers((prevOffers) =>
          prevOffers.map((offer) => (offer._id === offerId ? { ...offer, ...data.data.offer } : offer)),
        )

        if (navigator.clipboard && data.data.publicTestLink) {
          await navigator.clipboard.writeText(data.data.publicTestLink)
          alert(`${data.message}\nLink copied to clipboard: ${data.data.publicTestLink}`)
        } else {
          alert(`${data.message}\nLink: ${data.data.publicTestLink}`)
        }

        logDebugInfo("GENERATE_PUBLIC_LINK_SUCCESS", {
          offerId,
          publicLink: data.data.publicTestLink,
        })
      } else {
        setError("Error generating link")
      }
    } catch (error) {
      console.error("GENERATE_PUBLIC_LINK_ERROR: Network error:", error)
      logDebugInfo("GENERATE_PUBLIC_LINK_ERROR", { error: error.message })
      setError("Connection error")
    } finally {
      setActionLoading(false)
    }
  }

  // Function to delete offer
  const deleteOffer = async (offerId) => {
    try {
      logDebugInfo("DELETE_OFFER_START", { offerId })
      setActionLoading(true)

      const headersResult = createRequestHeaders()
      if (headersResult.error) {
        console.log("DELETE_OFFER_ERROR: Headers creation failed")
        setError(headersResult.error)
        return
      }

      const url = `http://localhost:4000/api/offres/${offerId}`
      console.log("DELETE_OFFER: Making request to:", url)

      const response = await fetch(url, {
        method: "DELETE",
        headers: headersResult.headers,
      })

      console.log("DELETE_OFFER: Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Network error" }))
        console.log("DELETE_OFFER_ERROR: HTTP error:", errorData)
        setError(errorData.message || "Error deleting offer")
        return
      }

      const data = await response.json()
      console.log("DELETE_OFFER: Response data:", data)

      if (data.success) {
        setOffers((prevOffers) => prevOffers.filter((offer) => offer._id !== offerId))
        setShowDeleteModal(false)
        setSelectedOffer(null)

        alert(data.message || "Offer deleted successfully")

        logDebugInfo("DELETE_OFFER_SUCCESS", { offerId })
      } else {
        setError("Error deleting offer")
      }
    } catch (error) {
      console.error("DELETE_OFFER_ERROR: Network error:", error)
      logDebugInfo("DELETE_OFFER_ERROR", { error: error.message })
      setError("Connection error")
    } finally {
      setActionLoading(false)
    }
  }

  useEffect(() => {
    logDebugInfo("COMPONENT_MOUNT")
    fetchOffers()
  }, [])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getOfferStatus = (offer) => {
    const now = new Date()
    const deadline = new Date(offer.date_limite_candidature)

    if (offer.statut !== "active") {
      return { status: "inactive", label: "Inactive", color: "text-gray-500" }
    }

    if (deadline < now) {
      return { status: "expired", label: "Expired", color: "text-red-500" }
    }

    if (offer.isPublished) {
      return { status: "published", label: "Published", color: "text-green-500" }
    }

    return { status: "draft", label: "Draft", color: "text-yellow-500" }
  }

  // Filter offers based on search and filter criteria (MODIFIÉ pour inclure la catégorie)
  const filteredOffers = offers.filter((offer) => {
    const matchesSearch =
      !searchTerm ||
      offer.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.localisation?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      !filterStatus ||
      (filterStatus === "published" && offer.isPublished) ||
      (filterStatus === "draft" && !offer.isPublished && offer.statut === "active") ||
      (filterStatus === "inactive" && offer.statut !== "active") ||
      (filterStatus === "expired" && new Date(offer.date_limite_candidature) < new Date())

    // Nouveau filtre par catégorie
    const matchesCategory = !filterCategory || offer.categorie === filterCategory

    return matchesSearch && matchesStatus && matchesCategory
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="inline-flex items-center">
          <Loader2 className="animate-spin h-6 w-6 mr-3 text-blue-600" />
          <span className="text-blue-600">Loading offers...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 relative bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="shape-blob shape-blob-1 absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-100/30 blur-xl"></div>
        <div className="shape-blob shape-blob-2 absolute bottom-0 left-0 w-96 h-96 rounded-full bg-blue-200/20 blur-xl"></div>
        <div className="shape-blob shape-blob-3 absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-indigo-100/20 blur-xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 text-transparent bg-clip-text">
                  Offers Management
                </h1>
                <p className="text-blue-600 mt-1">
                  Manage your job and internship offers: publish, manage student visibility, delete and generate public
                  links.
                </p>
              </div>
            </div>
            <motion.button
              onClick={() => navigate("/add-offer")}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Offer
            </motion.button>
          </div>
        </motion.header>

        {/* Search and Filters (MODIFIÉ pour inclure le filtre par catégorie) */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-blue-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-blue-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by title, description, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg flex items-center transition-all duration-300 shadow-md"
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
                <ChevronDown
                  className={`h-4 w-4 ml-2 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  className="mt-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Filtre par statut existant */}
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-2">Offer Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full p-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                      >
                        <option value="">All Statuses</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="inactive">Inactive</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>

                    {/* NOUVEAU: Filtre par catégorie */}
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-2 flex items-center">
                        <Tag className="h-4 w-4 mr-1" />
                        Category
                      </label>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full p-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                      >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            className="mb-6 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl p-4 shadow-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Statistics Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={cardVariants}
            className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl border border-blue-100"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-lg">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-blue-600 truncate">Total Offers</dt>
                    <dd className="text-2xl font-bold text-gray-900">{offers.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl border border-blue-100"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-green-600 truncate">Published</dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {offers.filter((offer) => offer.isPublished).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl border border-blue-100"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-yellow-600 truncate">Drafts</dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {offers.filter((offer) => !offer.isPublished && offer.statut === "active").length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl border border-blue-100"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-3 rounded-lg">
                    <Link className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-indigo-600 truncate">With Public Link</dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {offers.filter((offer) => offer.publicTestLink).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Offers List */}
        {filteredOffers.length === 0 ? (
          <motion.div
            className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Briefcase className="mx-auto h-12 w-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchTerm || filterStatus || filterCategory ? "No offers found" : "No offers yet"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus || filterCategory
                ? "Try adjusting your search criteria or filters."
                : "You haven't created any job or internship offers yet."}
            </p>
            {!searchTerm && !filterStatus && !filterCategory && (
              <motion.button
                onClick={() => navigate("/add-offer")}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-300 shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Offer
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
            {filteredOffers.map((offer) => {
              const status = getOfferStatus(offer)
              return (
                <motion.div
                  key={offer._id}
                  variants={cardVariants}
                  className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-6 border border-blue-100 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900 truncate">{offer.titre}</h3>
                        <div className="flex items-center space-x-2">
                          {/* NOUVEAU: Affichage de la catégorie */}
                          {offer.categorie && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <Tag className="h-3 w-3 mr-1" />
                              {offer.categorie}
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.color} bg-gray-100`}
                          >
                            {status.label}
                          </span>
                          {offer.isPublished && <CheckCircle className="h-5 w-5 text-green-500" />}
                          {offer.isPublishedForStudents && <Users className="h-5 w-5 text-blue-500" />}
                          {offer.publicTestLink && <Link className="h-5 w-5 text-indigo-500" />}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center text-sm text-gray-500 space-x-6 mb-3">
                        <div className="flex items-center">
                          <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          {offer.localisation || "Not specified"}
                        </div>
                        <div className="flex items-center">
                          <Users className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          {offer.nombre_postes} position{offer.nombre_postes > 1 ? "s" : ""}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          Expires {formatDate(offer.date_limite_candidature)}
                        </div>
                        {offer.hasRemuneration && (
                          <div className="flex items-center">
                            <DollarSign className="flex-shrink-0 mr-1.5 h-4 w-4" />
                            {offer.remuneration}
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">{offer.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                    <motion.button
                      onClick={() => togglePublishStatus(offer._id, offer.isPublished)}
                      disabled={actionLoading}
                      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                        offer.isPublished
                          ? "text-red-700 bg-red-100 hover:bg-red-200"
                          : "text-green-700 bg-green-100 hover:bg-green-200"
                      } disabled:opacity-50`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {offer.isPublished ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                      {offer.isPublished ? "Unpublish" : "Publish"}
                    </motion.button>

                    <motion.button
                      onClick={() => togglePublishForStudentsStatus(offer._id, offer.isPublishedForStudents)}
                      disabled={actionLoading}
                      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                        offer.isPublishedForStudents
                          ? "text-red-700 bg-red-100 hover:bg-red-200"
                          : "text-blue-700 bg-blue-100 hover:bg-blue-200"
                      } disabled:opacity-50`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      {offer.isPublishedForStudents ? "Hide from Students" : "Show to Students"}
                    </motion.button>

                    {offer.requiresTest && offer.test && (
                      <motion.button
                        onClick={() => generatePublicLink(offer._id)}
                        disabled={actionLoading}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-all duration-300 disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link className="h-4 w-4 mr-1" />
                        {offer.publicTestLink ? "Copy Link" : "Generate Link"}
                      </motion.button>
                    )}

                    {offer.publicTestLink && (
                      <motion.button
                        onClick={() => window.open(`/company/offers/${offer._id}/stats`, "_blank")}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Stats
                      </motion.button>
                    )}

                    <motion.button
                      onClick={() => {
                        setSelectedOffer(offer)
                        setShowDeleteModal(true)
                      }}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-red-700 bg-red-100 hover:bg-red-200 transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </motion.button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && selectedOffer && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
              >
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Confirm Deletion</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Are you sure you want to delete the offer "{selectedOffer.titre}"? This action cannot be undone.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <motion.button
                      onClick={() => deleteOffer(selectedOffer._id)}
                      disabled={actionLoading}
                      className="px-6 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {actionLoading ? "Deleting..." : "Delete"}
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        setShowDeleteModal(false)
                        setSelectedOffer(null)
                      }}
                      className="px-6 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Debug Information (Development only) */}
        {process.env.NODE_ENV === "development" && (
          <motion.div
            className="mt-8 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-blue-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <h4 className="text-sm font-medium text-gray-900 mb-2">Debug Information</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p>Token present: {cToken ? "Yes" : "No"}</p>
              <p>Total offers loaded: {offers.length}</p>
              <p>Filtered offers: {filteredOffers.length}</p>
              <p>Active filters: Status={filterStatus || "None"}, Category={filterCategory || "None"}, Search={searchTerm || "None"}</p>
              <p>Last update: {new Date().toLocaleTimeString()}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default CompanyOffersManagementPage

