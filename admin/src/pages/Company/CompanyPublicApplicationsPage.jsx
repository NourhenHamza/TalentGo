"use client"

import { AnimatePresence, motion } from "framer-motion"
import { jwtDecode } from "jwt-decode"
import {
  CheckCircle,
  ChevronDown,
  Clock,
  Download,
  Eye,
  Filter,
  Loader2,
  Mail,
  Phone,
  Search,
  TrendingUp,
  Users,
} from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { toast } from "react-toastify"
import PublicApplicationDetailsModal from "../../Components/PublicApplicationDetailsModal"
import { CompanyContext } from "../../context/CompanyContext"

const CompanyPublicApplicationsPage = () => {
  const { cToken, currentCompany, isLoading: contextLoading, backendUrl } = useContext(CompanyContext)

  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    offer: "",
    authProvider: "",
    sortBy: "submittedAt",
    sortOrder: "desc",
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalApplications: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    averageTestScore: null,
    testPassRate: null,
  })
  const [offers, setOffers] = useState([])

  // ✅ AJOUT: Configuration backend URL (inspiré de CompanyApplicationDetailsModal)
  const BACKEND_URL = backendUrl || 'http://localhost:4000';

  // ✅ AJOUT: Fonction pour obtenir l'URL du CV (inspiré de CompanyApplicationDetailsModal)
  const getCVUrl = (filename) => {
    if (!filename) return null;
    return `${BACKEND_URL}/api/offres/uploads/public-cvs/${filename}`;
  };

  // ✅ AJOUT: Fonction pour visualiser le CV (inspiré de CompanyApplicationDetailsModal)
  const handleCVView = (filename) => {
    if (!filename) {
      toast.error("Nom de fichier CV manquant");
      return;
    }

    const cvUrl = getCVUrl(filename);
    console.log(`[handleCVView] Ouverture du CV: ${cvUrl}`);
    
    try {
      const newWindow = window.open(cvUrl, '_blank');
      if (!newWindow) {
        toast.error("Impossible d'ouvrir le CV. Veuillez autoriser les pop-ups.");
      } else {
        toast.success("CV ouvert dans un nouvel onglet");
      }
    } catch (error) {
      console.error('[handleCVView] Erreur:', error);
      toast.error("Erreur lors de l'ouverture du CV");
    }
  };

  // Debug logging utility function
  const logDebugInfo = (action, data = {}) => {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] [FRONTEND_DEBUG] ${action}`, {
      ...data,
      currentUrl: window.location.href,
      userAgent: navigator.userAgent,
    })
  }

  // Function to validate and analyze cToken
  const validateAndAnalyzeToken = () => {
    logDebugInfo("TOKEN_VALIDATION_START")

    // Check token presence in context
    if (!cToken) {
      logDebugInfo("TOKEN_VALIDATION_ERROR", {
        error: "No cToken in context",
        contextKeys: Object.keys({ cToken, currentCompany, isLoading: contextLoading, backendUrl }),
      })
      return { isValid: false, error: "No cToken in context" }
    }

    // Check token presence in localStorage
    const localStorageToken = localStorage.getItem("cToken")
    logDebugInfo("TOKEN_LOCALSTORAGE_CHECK", {
      hasTokenInLocalStorage: !!localStorageToken,
      tokenMatches: localStorageToken === cToken,
      localStorageKeys: Object.keys(localStorage),
    })

    // Analyze token format
    if (typeof cToken !== "string" || !cToken.includes(".")) {
      logDebugInfo("TOKEN_VALIDATION_ERROR", {
        error: "Invalid token format",
        tokenType: typeof cToken,
        tokenLength: cToken?.length,
        tokenPreview: cToken?.substring(0, 20),
      })
      return { isValid: false, error: "Invalid token format" }
    }

    try {
      // Decode token without signature verification
      const decoded = jwtDecode(cToken)
      logDebugInfo("TOKEN_DECODE_SUCCESS", {
        payload: {
          id: decoded.id,
          exp: decoded.exp,
          iat: decoded.iat,
          expiresAt: new Date(decoded.exp * 1000).toISOString(),
        },
        isExpired: decoded.exp < Date.now() / 1000,
      })

      // Check for company ID presence
      const companyId = decoded.id || decoded._id
      if (!companyId) {
        logDebugInfo("TOKEN_VALIDATION_ERROR", {
          error: "No company ID in token",
          decodedKeys: Object.keys(decoded),
        })
        return { isValid: false, error: "No company ID in token" }
      }

      // Check expiration
      if (decoded.exp < Date.now() / 1000) {
        logDebugInfo("TOKEN_VALIDATION_ERROR", {
          error: "Token expired",
          expiredSince: new Date(decoded.exp * 1000).toISOString(),
        })
        return { isValid: false, error: "Token expired" }
      }

      logDebugInfo("TOKEN_VALIDATION_SUCCESS", { companyId })
      return { isValid: true, companyId, decoded }
    } catch (error) {
      logDebugInfo("TOKEN_DECODE_ERROR", {
        error: error.message,
        tokenPreview: cToken.substring(0, 50) + "...",
      })
      return { isValid: false, error: `Token decode error: ${error.message}` }
    }
  }

  // Function to create request headers with logs
  const createRequestHeaders = () => {
    logDebugInfo("CREATE_REQUEST_HEADERS_START")

    const tokenValidation = validateAndAnalyzeToken()
    if (!tokenValidation.isValid) {
      logDebugInfo("CREATE_REQUEST_HEADERS_ERROR", {
        error: tokenValidation.error,
      })
      return null
    }

    const headers = {
      Authorization: `Bearer ${cToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    }

    logDebugInfo("CREATE_REQUEST_HEADERS_SUCCESS", {
      hasAuthorization: !!headers.Authorization,
      authorizationPreview: headers.Authorization.substring(0, 30) + "...",
      contentType: headers["Content-Type"],
    })

    return headers
  }

  useEffect(() => {
    logDebugInfo("COMPONENT_MOUNT", {
      hasCToken: !!cToken,
      hasBackendUrl: !!backendUrl,
      contextLoading,
      currentCompany: currentCompany?.nom || "not loaded",
    })

    if (cToken && backendUrl) {
      fetchApplications()
      fetchOffers()
    } else {
      logDebugInfo("COMPONENT_MOUNT_SKIP", {
        reason: "Missing cToken or backendUrl",
        cToken: !!cToken,
        backendUrl: !!backendUrl,
      })
    }
  }, [filters, pagination.currentPage, cToken, backendUrl])

  // Function to fetch applications with detailed logs
  const fetchApplications = async () => {
    logDebugInfo("FETCH_APPLICATIONS_START")
    if (!cToken || !backendUrl) {
      logDebugInfo("FETCH_APPLICATIONS_ERROR", {
        error: "Missing cToken or backendUrl",
        hasCToken: !!cToken,
        hasBackendUrl: !!backendUrl,
      })
      toast.error("Authentication missing. Please log in again.")
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Validate token before request
      const tokenValidation = validateAndAnalyzeToken()
      if (!tokenValidation.isValid) {
        logDebugInfo("FETCH_APPLICATIONS_TOKEN_ERROR", {
          error: tokenValidation.error,
        })
        toast.error("Invalid token. Please log in again.")
        localStorage.removeItem("cToken")
        setLoading(false)
        return
      }

      // Create request headers
      const headers = createRequestHeaders()
      if (!headers) {
        logDebugInfo("FETCH_APPLICATIONS_HEADERS_ERROR")
        toast.error("Header configuration error. Please log in again.")
        setLoading(false)
        return
      }

      // Build request URL
      const queryParams = new URLSearchParams({
        ...filters,
        page: pagination.currentPage,
        limit: 20,
      })
      const requestUrl = `${backendUrl}/api/offres/public-applications?${queryParams}`

      logDebugInfo("FETCH_APPLICATIONS_REQUEST_START", {
        url: requestUrl,
        method: "GET",
        headers: {
          hasAuthorization: !!headers.Authorization,
          contentType: headers["Content-Type"],
        },
        queryParams: Object.fromEntries(queryParams),
        companyId: tokenValidation.companyId,
      })

      // Make request
      const response = await fetch(requestUrl, {
        method: "GET",
        headers,
      })

      logDebugInfo("FETCH_APPLICATIONS_RESPONSE_RECEIVED", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      })

      // Process response
      const data = await response.json()
      logDebugInfo("FETCH_APPLICATIONS_RESPONSE_DATA", {
        success: data.success,
        message: data.message,
        hasData: !!data.applications,
        applicationsCount: data.applications?.length || 0,
        statsIncluded: !!data.stats,
        paginationIncluded: !!data.pagination,
      })

      if (response.status === 401) {
        logDebugInfo("FETCH_APPLICATIONS_UNAUTHORIZED", {
          message: data.message,
        })
        toast.error("Session expired or invalid token. Please log in again.")
        localStorage.removeItem("cToken")
        setLoading(false)
        return
      }

      if (response.ok && data.success) {
        logDebugInfo("FETCH_APPLICATIONS_SUCCESS", {
          applicationsReceived: data.applications.length,
          totalApplications: data.pagination.totalApplications,
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
        })

        setApplications(data.applications)
        setPagination(data.pagination)
        setStats(data.stats)
      } else {
        logDebugInfo("FETCH_APPLICATIONS_ERROR", {
          status: response.status,
          message: data.message,
          error: data.error,
        })
        toast.error(data.message || "Error loading applications")
      }
    } catch (error) {
      logDebugInfo("FETCH_APPLICATIONS_EXCEPTION", {
        error: error.message,
        stack: error.stack,
        name: error.name,
      })
      console.error("Error loading applications:", error)
      toast.error("Error loading applications")
    } finally {
      setLoading(false)
      logDebugInfo("FETCH_APPLICATIONS_END")
    }
  }

  // Function to fetch offers with detailed logs
  const fetchOffers = async () => {
    logDebugInfo("FETCH_OFFERS_START")
    if (!cToken || !backendUrl) {
      logDebugInfo("FETCH_OFFERS_ERROR", {
        error: "Missing cToken or backendUrl",
        hasCToken: !!cToken,
        hasBackendUrl: !!backendUrl,
      })
      toast.error("Authentication missing. Please log in again.")
      return
    }

    try {
      // Validate token
      const tokenValidation = validateAndAnalyzeToken()
      if (!tokenValidation.isValid) {
        logDebugInfo("FETCH_OFFERS_TOKEN_ERROR", {
          error: tokenValidation.error,
        })
        toast.error("Session expired or invalid token. Please log in again.")
        localStorage.removeItem("cToken")
        return
      }

      // Create headers
      const headers = createRequestHeaders()
      if (!headers) {
        logDebugInfo("FETCH_OFFERS_HEADERS_ERROR")
        toast.error("Header configuration error. Please log in again.")
        return
      }

      const requestUrl = `${backendUrl}/api/offres/company/${tokenValidation.companyId}`

      logDebugInfo("FETCH_OFFERS_REQUEST_START", {
        url: requestUrl,
        method: "GET",
        companyId: tokenValidation.companyId,
      })

      const response = await fetch(requestUrl, {
        method: "GET",
        headers,
      })

      logDebugInfo("FETCH_OFFERS_RESPONSE_RECEIVED", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      })

      const data = await response.json()
      logDebugInfo("FETCH_OFFERS_RESPONSE_DATA", {
        success: data.success,
        message: data.message,
        offersCount: data.data?.length || 0,
      })

      if (response.status === 401) {
        logDebugInfo("FETCH_OFFERS_UNAUTHORIZED", {
          message: data.message,
        })
        toast.error("Session expired. Please log in again.")
        localStorage.removeItem("cToken")
        return
      }

      if (response.ok && data.success) {
        const offersWithPublicTests = data.data.filter((offer) => offer.publicTestLink && offer.publicTestEnabled)

        logDebugInfo("FETCH_OFFERS_SUCCESS", {
          totalOffers: data.data.length,
          offersWithPublicTests: offersWithPublicTests.length,
        })

        setOffers(offersWithPublicTests)
      } else {
        logDebugInfo("FETCH_OFFERS_ERROR", {
          status: response.status,
          message: data.message,
          error: data.error,
        })
        toast.error(data.message || "Error loading offers")
      }
    } catch (error) {
      logDebugInfo("FETCH_OFFERS_EXCEPTION", {
        error: error.message,
        stack: error.stack,
        name: error.name,
      })
      console.error("Error loading offers:", error)
      toast.error("Error loading offers")
    }
  }

  // Function to update application status with logs
  const updateApplicationStatus = async (applicationId, newStatus, notes = "") => {
    logDebugInfo("UPDATE_APPLICATION_STATUS_START", {
      applicationId,
      newStatus,
      hasNotes: !!notes,
    })

    if (!cToken || !backendUrl) {
      logDebugInfo("UPDATE_APPLICATION_STATUS_ERROR", {
        error: "Missing cToken or backendUrl",
      })
      return
    }

    try {
      // Validate token
      const tokenValidation = validateAndAnalyzeToken()
      if (!tokenValidation.isValid) {
        logDebugInfo("UPDATE_APPLICATION_STATUS_TOKEN_ERROR", {
          error: tokenValidation.error,
        })
        toast.error("Session expired or invalid token. Please log in again.")
        return
      }

      // Create headers
      const headers = createRequestHeaders()
      if (!headers) {
        logDebugInfo("UPDATE_APPLICATION_STATUS_HEADERS_ERROR")
        toast.error("Header configuration error. Please log in again.")
        return
      }

      const requestUrl = `${backendUrl}/api/offres/public-applications/${applicationId}/status`
      const requestBody = {
        status: newStatus,
        notes,
      }

      logDebugInfo("UPDATE_APPLICATION_STATUS_REQUEST_START", {
        url: requestUrl,
        method: "PUT",
        body: requestBody,
      })

      const response = await fetch(requestUrl, {
        method: "PUT",
        headers,
        body: JSON.stringify(requestBody),
      })

      logDebugInfo("UPDATE_APPLICATION_STATUS_RESPONSE_RECEIVED", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      })

      const data = await response.json()
      logDebugInfo("UPDATE_APPLICATION_STATUS_RESPONSE_DATA", {
        success: data.success,
        message: data.message,
      })

      if (response.ok && data.success) {
        logDebugInfo("UPDATE_APPLICATION_STATUS_SUCCESS")
        toast.success("Status updated successfully")
        fetchApplications()
        setShowDetailsModal(false)
      } else {
        logDebugInfo("UPDATE_APPLICATION_STATUS_ERROR", {
          status: response.status,
          message: data.message,
          error: data.error,
        })
        toast.error(data.message || "Error updating status")
      }
    } catch (error) {
      logDebugInfo("UPDATE_APPLICATION_STATUS_EXCEPTION", {
        error: error.message,
        stack: error.stack,
        name: error.name,
      })
      console.error("Error updating status:", error)
      toast.error("Error updating status")
    }
  }

  // ✅ MODIFICATION: Function to download CV with logs (inspiré de CompanyApplicationDetailsModal)
  const downloadCV = async (applicationId, fileName) => {
    logDebugInfo("DOWNLOAD_CV_START", {
      applicationId,
      fileName,
    })

    if (!cToken || !backendUrl) {
      logDebugInfo("DOWNLOAD_CV_ERROR", {
        error: "Missing cToken or backendUrl",
      })
      return
    }

    try {
      // Validate token
      const tokenValidation = validateAndAnalyzeToken()
      if (!tokenValidation.isValid) {
        logDebugInfo("DOWNLOAD_CV_TOKEN_ERROR", {
          error: tokenValidation.error,
        })
        toast.error("Session expired or invalid token. Please log in again.")
        return
      }

      // Trouver l'application pour obtenir le nom de fichier CV
      const application = applications.find(app => app._id === applicationId);
      if (!application || !application.documents || !application.documents.cv || !application.documents.cv.filename) {
        toast.error("Informations de CV manquantes");
        return;
      }

      const cvFilename = application.documents.cv.filename;
      const cvUrl = getCVUrl(cvFilename);

      logDebugInfo("DOWNLOAD_CV_REQUEST_START", {
        url: cvUrl,
        method: "GET",
        filename: cvFilename,
      })

      // Utiliser la même logique que CompanyApplicationDetailsModal
      const response = await fetch(cvUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${cToken}`,
        },
      })

      logDebugInfo("DOWNLOAD_CV_RESPONSE_RECEIVED", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        contentType: response.headers.get("Content-Type"),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = fileName || application.documents.cv.originalName || "cv.pdf"
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        logDebugInfo("DOWNLOAD_CV_SUCCESS", {
          fileName: a.download,
          blobSize: blob.size,
        })
        
        toast.success("CV téléchargé avec succès")
      } else {
        logDebugInfo("DOWNLOAD_CV_ERROR", {
          status: response.status,
          statusText: response.statusText,
        })
        toast.error("Erreur lors du téléchargement du CV")
      }
    } catch (error) {
      logDebugInfo("DOWNLOAD_CV_EXCEPTION", {
        error: error.message,
        stack: error.stack,
        name: error.name,
      })
      console.error("Error downloading:", error)
      toast.error("Erreur lors du téléchargement du CV")
    }
  }

  // Function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Function to get auth provider icon
  const getAuthProviderIcon = (provider) => {
    switch (provider) {
      case "google":
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )
      case "apple":
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
        )
      default:
        return <Users className="h-4 w-4" />
    }
  }

  // Statistics Cards Component
  const StatsCards = () => {
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

    return (
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={cardVariants}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-blue-100"
        >
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-blue-100"
        >
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-blue-100"
        >
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Accepted</p>
              <p className="text-2xl font-bold text-gray-900">{stats.acceptedApplications}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-blue-100"
        >
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-indigo-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.averageTestScore ? `${Math.round(stats.averageTestScore)}%` : "N/A"}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // Filters Section Component
  const FiltersSection = () => (
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
              placeholder="Search by name, email, offer..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
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
              className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full p-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">Offer</label>
                <select
                  value={filters.offer}
                  onChange={(e) => setFilters((prev) => ({ ...prev, offer: e.target.value }))}
                  className="w-full p-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                >
                  <option value="">All Offers</option>
                  {offers.map((offer) => (
                    <option key={offer._id} value={offer._id}>
                      {offer.titre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">Authentication</label>
                <select
                  value={filters.authProvider}
                  onChange={(e) => setFilters((prev) => ({ ...prev, authProvider: e.target.value }))}
                  className="w-full p-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                >
                  <option value="">All Providers</option>
                  <option value="google">Google</option>
                  <option value="apple">Apple</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )

  // Application Card Component
  const ApplicationCard = ({ application }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case "pending":
          return "bg-yellow-100 text-yellow-800"
        case "reviewed":
          return "bg-blue-100 text-blue-800"
        case "accepted":
          return "bg-green-100 text-green-800"
        case "rejected":
          return "bg-red-100 text-red-800"
        default:
          return "bg-gray-100 text-gray-800"
      }
    }

    const getStatusText = (status) => {
      switch (status) {
        case "pending":
          return "Pending"
        case "reviewed":
          return "Reviewed"
        case "accepted":
          return "Accepted"
        case "rejected":
          return "Rejected"
        default:
          return status
      }
    }

    // ✅ AJOUT: Vérifier si l'application a un CV
    const hasCV = application.documents && application.documents.cv && application.documents.cv.filename;

    return (
      <motion.div
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-blue-100"
        whileHover={{ y: -2 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-lg font-bold">
              {application.personalInfo.firstName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {application.personalInfo.firstName} {application.personalInfo.lastName}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{application.personalInfo.email}</span>
                {getAuthProviderIcon(application.authentication.provider)}
              </div>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
            {getStatusText(application.status)}
          </span>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Application for:</h4>
          <p className="text-blue-600 font-semibold">{application.offre_details?.titre || "N/A"}</p>
          <p className="text-sm text-gray-500">
            {application.applicationType} • {application.offre_details?.localisation || "N/A"}
          </p>
        </div>

        {application.testResult && (
          <div className="mb-4 p-3 bg-gray-50/80 backdrop-blur-sm rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Test Result:</span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-bold ${application.testResult.passed ? "text-green-600" : "text-red-600"}`}
                >
                  {application.testResult.score}%
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    application.testResult.passed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {application.testResult.passed ? "PASSED" : "FAILED"}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>Submitted on {formatDate(application.submittedAt)}</span>
          {application.personalInfo.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              <span>{application.personalInfo.phone}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <motion.button
            onClick={() => {
              setSelectedApplication(application)
              setShowDetailsModal(true)
            }}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Eye className="h-4 w-4 inline mr-1" />
            View Details
          </motion.button>
          
          {/* ✅ MODIFICATION: Boutons CV améliorés (inspiré de CompanyApplicationDetailsModal) */}
          {hasCV ? (
            <>
              <motion.button
                onClick={() => handleCVView(application.documents.cv.filename)}
                className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 text-sm transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title="Visualiser le CV"
              >
                <Eye className="h-4 w-4" />
              </motion.button>
              <motion.button
                onClick={() =>
                  downloadCV(
                    application._id,
                    `CV_${application.personalInfo.firstName}_${application.personalInfo.lastName}.pdf`,
                  )
                }
                className="px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 text-sm transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title="Télécharger le CV"
              >
                <Download className="h-4 w-4" />
              </motion.button>
            </>
          ) : (
            <div className="px-4 py-2 text-gray-400 text-sm">
              Pas de CV
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  // Pagination Component
  const Pagination = () => (
    <motion.div
      className="flex items-center justify-between bg-white/80 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg border border-blue-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center text-sm text-gray-700">
        <span>
          Showing {(pagination.currentPage - 1) * 20 + 1} to{" "}
          {Math.min(pagination.currentPage * 20, pagination.totalApplications)} of {pagination.totalApplications}{" "}
          applications
        </span>
      </div>
      <div className="flex items-center gap-2">
        <motion.button
          onClick={() => setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }))}
          disabled={!pagination.hasPrevPage}
          className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Previous
        </motion.button>
        <span className="px-4 py-2 text-sm text-gray-700">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <motion.button
          onClick={() => setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }))}
          disabled={!pagination.hasNextPage}
          className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Next
        </motion.button>
      </div>
    </motion.div>
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  // Loading and error state handling
  if (contextLoading) {
    logDebugInfo("RENDER_CONTEXT_LOADING")
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="inline-flex items-center">
          <Loader2 className="animate-spin h-6 w-6 mr-3 text-blue-600" />
          <span className="text-blue-600">Loading company context...</span>
        </div>
      </div>
    )
  }

  if (!cToken) {
    logDebugInfo("RENDER_NO_TOKEN")
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to view applications.</p>
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">Debug: Token missing in context. Check your connection.</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    logDebugInfo("RENDER_LOADING")
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="inline-flex items-center">
          <Loader2 className="animate-spin h-6 w-6 mr-3 text-blue-600" />
          <span className="text-blue-600">Loading applications...</span>
        </div>
      </div>
    )
  }

  logDebugInfo("RENDER_MAIN_CONTENT", {
    applicationsCount: applications.length,
    offersCount: offers.length,
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
  })

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
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 text-transparent bg-clip-text">
                Public Applications
              </h1>
              <p className="text-blue-600 mt-1">
                Manage applications received through public links of your technical tests.
              </p>
            </div>
          </div>
          {process.env.NODE_ENV === "development" && (
            <div className="mt-2 p-2 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded text-xs text-blue-800">
              Debug: {applications.length} applications loaded, Token present: {!!cToken}
            </div>
          )}
        </motion.header>

        <StatsCards />
        <FiltersSection />

        {applications.length === 0 ? (
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center border border-blue-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Applications Found</h3>
            <p className="text-gray-600">
              {filters.search || filters.status || filters.offer || filters.authProvider
                ? "No applications match your search criteria."
                : "You haven't received any applications through public links yet."}
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {applications.map((application) => (
                <ApplicationCard key={application._id} application={application} />
              ))}
            </motion.div>
            {pagination.totalPages > 1 && <Pagination />}
          </>
        )}

        {showDetailsModal && selectedApplication && (
          <PublicApplicationDetailsModal
            isOpen={showDetailsModal}
            application={selectedApplication}
            onClose={() => setShowDetailsModal(false)}
            onUpdateStatus={updateApplicationStatus}
            onDownloadCV={downloadCV}
          />
        )}
      </div>
    </div>
  )
}

export default CompanyPublicApplicationsPage

