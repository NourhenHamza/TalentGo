"use client"

import { AnimatePresence, motion } from "framer-motion"
import {
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  ExternalLink,
  Filter,
  Grid,
  List,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  Tag,
  TrendingUp,
  Users,
  X,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "react-toastify"

const PublicOffersPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Main states
  const [offers, setOffers] = useState([])
  const [filters, setFilters] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filtering and search states
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("categorie") || "")
  const [selectedType, setSelectedType] = useState(searchParams.get("type_offre") || "")
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get("localisation") || "")
  const [selectedRemuneration, setSelectedRemuneration] = useState(searchParams.get("hasRemuneration") || "")
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "createdAt")
  const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || "desc")

  // Pagination states
  const [currentPage, setCurrentPage] = useState(Number.parseInt(searchParams.get("page")) || 1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Interface states
  const [viewMode, setViewMode] = useState("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Initial loading
  useEffect(() => {
    loadFilters()
    loadOffers()
  }, [])

  // Update offers when parameters change
  useEffect(() => {
    loadOffers()
    updateURL()
  }, [
    currentPage,
    searchTerm,
    selectedCategory,
    selectedType,
    selectedLocation,
    selectedRemuneration,
    sortBy,
    sortOrder,
  ])

  // Search with suggestions
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const debounceTimer = setTimeout(() => {
        searchWithSuggestions(searchTerm)
      }, 300)
      return () => clearTimeout(debounceTimer)
    } else {
      setSearchSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchTerm])

  const loadFilters = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/public-offers/filters")
      const data = await response.json()
      if (data.success) {
        setFilters(data.data)
      }
    } catch (error) {
      console.error("Error loading filters:", error)
    }
  }

  const loadOffers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        sortBy,
        sortOrder,
      })
      if (searchTerm) params.append("search", searchTerm)
      if (selectedCategory) params.append("categorie", selectedCategory)
      if (selectedType) params.append("type_offre", selectedType)
      if (selectedLocation) params.append("localisation", selectedLocation)
      if (selectedRemuneration) params.append("hasRemuneration", selectedRemuneration)

      const response = await fetch(`http://localhost:4000/api/public-offers?${params}`)
      const data = await response.json()
      if (data.success) {
        setOffers(data.data.offers)
        setTotalPages(data.data.pagination.totalPages)
        setTotalCount(data.data.pagination.totalCount)
      } else {
        setError(data.message)
      }
    } catch (error) {
      console.error("Error loading offers:", error)
      setError("Error loading offers")
    } finally {
      setLoading(false)
    }
  }

  const searchWithSuggestions = async (term) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/public-offers/search?q=${encodeURIComponent(term)}&limit=5`,
      )
      const data = await response.json()
      if (data.success) {
        setSearchSuggestions(data.data.suggestions)
        setShowSuggestions(data.data.suggestions.length > 0)
      }
    } catch (error) {
      console.error("Error searching suggestions:", error)
    }
  }

  const updateURL = () => {
    const params = new URLSearchParams()
    if (currentPage > 1) params.set("page", currentPage.toString())
    if (searchTerm) params.set("search", searchTerm)
    if (selectedCategory) params.set("categorie", selectedCategory)
    if (selectedType) params.set("type_offre", selectedType)
    if (selectedLocation) params.set("localisation", selectedLocation)
    if (selectedRemuneration) params.set("hasRemuneration", selectedRemuneration)
    if (sortBy !== "createdAt") params.set("sortBy", sortBy)
    if (sortOrder !== "desc") params.set("sortOrder", sortOrder)
    setSearchParams(params)
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    setCurrentPage(1)
    setShowSuggestions(false)
  }

  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1)
    switch (filterType) {
      case "category":
        setSelectedCategory(value)
        break
      case "type":
        setSelectedType(value)
        break
      case "location":
        setSelectedLocation(value)
        break
      case "remuneration":
        setSelectedRemuneration(value)
        break
      default:
        break
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("")
    setSelectedType("")
    setSelectedLocation("")
    setSelectedRemuneration("")
    setCurrentPage(1)
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
    setCurrentPage(1)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (searchTerm) count++
    if (selectedCategory) count++
    if (selectedType) count++
    if (selectedLocation) count++
    if (selectedRemuneration) count++
    return count
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-white flex items-center justify-center">
        <motion.div
          className="text-center p-8 bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md border border-white/20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-red-500 mb-4">
            <X className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <motion.button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 hover:from-blue-700 hover:via-violet-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-white relative overflow-hidden">
      {/* Enhanced background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-blue-200/30 to-violet-200/30 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-gradient-to-tr from-violet-200/20 to-blue-200/20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-gradient-to-r from-blue-100/30 to-violet-100/30 blur-2xl"></div>
        <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-gradient-to-l from-violet-300/20 to-blue-300/20 blur-xl"></div>
      </div>

      {/* Modern Header */}
      <motion.div
        className="relative z-10 bg-white/60 backdrop-blur-xl shadow-xl border-b border-white/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4">
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="p-3 bg-gradient-to-r from-blue-500 to-violet-500 rounded-2xl shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-700 via-violet-700 to-purple-700 text-transparent bg-clip-text">
                    Dream Jobs
                  </h1>
                  <p className="text-xl text-blue-600/80 font-medium">Find Your Perfect Opportunity</p>
                </div>
              </motion.div>
              <motion.div
                className="flex items-center gap-6 text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-violet-100 rounded-full">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-700">{totalCount} Active Positions</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-100 to-purple-100 rounded-full">
                  <Building2 className="h-4 w-4 text-violet-600" />
                  <span className="font-semibold text-violet-700">50+ Companies</span>
                </div>
              </motion.div>
            </div>

            {/* Enhanced Search bar */}
            <motion.div
              className="relative w-full lg:w-96"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-violet-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search your dream job..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch(searchTerm)}
                  className="w-full pl-12 pr-4 py-4 border-0 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:outline-none bg-white/70 backdrop-blur-xl shadow-xl text-gray-700 placeholder-gray-500"
                />
                <motion.button
                  onClick={() => handleSearch(searchTerm)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-xl hover:from-blue-600 hover:to-violet-600 transition-all duration-300 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Search className="h-4 w-4" />
                </motion.button>
              </div>
              {/* Search suggestions */}
              <AnimatePresence>
                {showSuggestions && searchSuggestions.length > 0 && (
                  <motion.div
                    className="absolute top-full left-0 right-0 bg-white/90 backdrop-blur-sm border border-blue-200 rounded-lg shadow-lg mt-1 z-10"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Filters sidebar */}
          <AnimatePresence>
            {(showFilters || (typeof window !== "undefined" && window.innerWidth >= 1024)) && (
              <motion.div
                className="lg:w-80"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sticky top-6 border border-white/20">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-violet-700 text-transparent bg-clip-text flex items-center gap-2">
                      <Filter className="h-5 w-5 text-violet-600" />
                      Filters
                    </h3>
                    {getActiveFiltersCount() > 0 && (
                      <motion.button
                        onClick={clearFilters}
                        className="text-sm text-violet-600 hover:text-violet-700 font-semibold px-3 py-1 bg-violet-100 rounded-full hover:bg-violet-200 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Clear ({getActiveFiltersCount()})
                      </motion.button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Category filter */}
                    <div>
                      <label className="block text-sm font-semibold text-blue-700 mb-3">Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => handleFilterChange("category", e.target.value)}
                        className="w-full border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:outline-none bg-white/70 backdrop-blur-sm shadow-lg text-gray-700"
                      >
                        <option value="">All Categories</option>
                        {filters.categories?.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label} ({cat.count})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Offer type filter */}
                    <div>
                      <label className="block text-sm font-semibold text-blue-700 mb-3">Offer Type</label>
                      <select
                        value={selectedType}
                        onChange={(e) => handleFilterChange("type", e.target.value)}
                        className="w-full border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:outline-none bg-white/70 backdrop-blur-sm shadow-lg text-gray-700"
                      >
                        <option value="">All Types</option>
                        {filters.typeOffres?.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label} ({type.count})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Location filter */}
                    <div>
                      <label className="block text-sm font-semibold text-blue-700 mb-3">Location</label>
                      <select
                        value={selectedLocation}
                        onChange={(e) => handleFilterChange("location", e.target.value)}
                        className="w-full border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:outline-none bg-white/70 backdrop-blur-sm shadow-lg text-gray-700"
                      >
                        <option value="">All Locations</option>
                        {filters.localisations?.map((location) => (
                          <option key={location} value={location}>
                            {location}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Remuneration filter */}
                    <div>
                      <label className="block text-sm font-semibold text-blue-700 mb-3">Remuneration</label>
                      <select
                        value={selectedRemuneration}
                        onChange={(e) => handleFilterChange("remuneration", e.target.value)}
                        className="w-full border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:outline-none bg-white/70 backdrop-blur-sm shadow-lg text-gray-700"
                      >
                        <option value="">All Offers</option>
                        {filters.remuneration?.map((rem) => (
                          <option key={rem.value} value={rem.value}>
                            {rem.label} ({rem.count})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main content */}
          <div className="flex-1">
            {/* Enhanced Toolbar */}
            <motion.div
              className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-2xl p-6 mb-8 border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 px-4 py-3 border-0 rounded-xl hover:bg-violet-50 transition-colors bg-white/70 backdrop-blur-sm shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Filter className="h-4 w-4 text-violet-600" />
                    <span className="font-semibold text-gray-700">Filters</span>
                    {getActiveFiltersCount() > 0 && (
                      <span className="bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs rounded-full px-2 py-1 font-bold">
                        {getActiveFiltersCount()}
                      </span>
                    )}
                  </motion.button>

                  <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-xl p-1 shadow-lg">
                    <motion.button
                      onClick={() => setViewMode("grid")}
                      className={`p-3 rounded-lg transition-all duration-300 ${
                        viewMode === "grid"
                          ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Grid className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => setViewMode("list")}
                      className={`p-3 rounded-lg transition-all duration-300 ${
                        viewMode === "list"
                          ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <List className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-violet-100 rounded-full">
                    <span className="text-sm font-bold bg-gradient-to-r from-blue-700 to-violet-700 text-transparent bg-clip-text">
                      {totalCount} opportunities found
                    </span>
                  </div>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split("-")
                      setSortBy(field)
                      setSortOrder(order)
                    }}
                    className="border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none bg-white/70 backdrop-blur-sm shadow-lg text-gray-700"
                  >
                    <option value="createdAt-desc">Most Recent</option>
                    <option value="createdAt-asc">Oldest</option>
                    <option value="titre-asc">Title A-Z</option>
                    <option value="titre-desc">Title Z-A</option>
                    <option value="date_limite_candidature-asc">Deadline</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Offers list */}
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-violet-600 mx-auto mb-4" />
                  <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-violet-600 text-transparent bg-clip-text">
                    Loading amazing opportunities...
                  </span>
                </div>
              </div>
            ) : offers.length === 0 ? (
              <motion.div
                className="text-center py-16 bg-white/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Search className="h-16 w-16 text-violet-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Opportunities Found</h3>
                <p className="text-gray-600 mb-6 text-lg">
                  Try adjusting your search criteria or explore different filters.
                </p>
                <motion.button
                  onClick={clearFilters}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 hover:from-blue-700 hover:via-violet-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 shadow-xl font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Clear All Filters
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-6"}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {offers.map((offer) => (
                  <OfferCard key={offer._id} offer={offer} viewMode={viewMode} />
                ))}
              </motion.div>
            )}

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <motion.div
                className="mt-12 flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-white/20">
                  <motion.button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-3 border-0 rounded-xl hover:bg-violet-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronLeft className="h-5 w-5 text-violet-600" />
                  </motion.button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                    return (
                      <motion.button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-3 border-0 rounded-xl transition-all duration-300 font-semibold ${
                          currentPage === page
                            ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg"
                            : "hover:bg-violet-50 text-gray-700"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {page}
                      </motion.button>
                    )
                  })}
                  <motion.button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-3 border-0 rounded-xl hover:bg-violet-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronRight className="h-5 w-5 text-violet-600" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced Offer Card Component
const OfferCard = ({ offer, viewMode }) => {
  const navigate = useNavigate()

  const handleApply = () => {
    if (offer.publicTestEnabled && offer.publicTestLink) {
      navigate(`/publictest/${offer.publicTestLink}`)
    } else {
      toast.info("Contact the company directly to apply for this offer.")
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  if (viewMode === "list") {
    return (
      <motion.div
        className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 hover:shadow-3xl transition-all duration-500 group"
        variants={cardVariants}
        whileHover={{ y: -2, scale: 1.01 }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-start gap-4">
              {offer.entreprise?.logo && (
                <div className="relative">
                  <img
                    src={offer.entreprise.logo || "/placeholder.svg?height=56&width=56&text=Logo"}
                    alt={offer.entreprise.nom}
                    className="w-14 h-14 object-contain rounded-2xl border-2 border-white shadow-lg flex-shrink-0"
                  />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-white"></div>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-violet-700 transition-colors">
                  {offer.titre}
                </h3>
                <p className="text-violet-600 font-semibold mb-3 text-lg">{offer.entreprise?.nom}</p>
                <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">{offer.description}</p>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-100 to-violet-100 rounded-full">
                    <Tag className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-700">{offer.categorie}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-violet-100 to-purple-100 rounded-full">
                    <Building2 className="h-4 w-4 text-violet-600" />
                    <span className="font-semibold text-violet-700">{offer.type_offre}</span>
                  </div>
                  {offer.localisation && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                      <MapPin className="h-4 w-4 text-purple-600" />
                      <span className="font-semibold text-purple-700">{offer.localisation}</span>
                    </div>
                  )}
                  {offer.hasRemuneration && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                      <span className="font-semibold text-emerald-700">Paid</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-4">
            <div className="text-sm text-gray-600 text-right space-y-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 rounded-full">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span className="font-semibold text-orange-700">
                  Until {new Date(offer.date_limite_candidature).toLocaleDateString("en-US")}
                </span>
              </div>
              {offer.nombre_postes > 1 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-100 rounded-full">
                  <Users className="h-4 w-4 text-indigo-600" />
                  <span className="font-semibold text-indigo-700">{offer.nombre_postes} positions</span>
                </div>
              )}
            </div>
            <motion.button
              onClick={handleApply}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 hover:from-blue-700 hover:via-violet-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 flex items-center gap-2 font-semibold shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Apply Now
              <ExternalLink className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 overflow-hidden group"
      variants={cardVariants}
      whileHover={{ y: -6, scale: 1.02 }}
    >
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          {offer.entreprise?.logo && (
            <div className="relative">
              <img
                src={offer.entreprise.logo || "/placeholder.svg?height=48&width=48&text=Logo"}
                alt={offer.entreprise.nom}
                className="w-12 h-12 object-contain rounded-xl border-2 border-white shadow-lg flex-shrink-0"
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-white"></div>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-violet-700 transition-colors">
              {offer.titre}
            </h3>
            <p className="text-violet-600 font-semibold">{offer.entreprise?.nom}</p>
          </div>
        </div>

        <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">{offer.description}</p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3 py-1 bg-gradient-to-r from-blue-100 to-violet-100 rounded-full">
              <span className="text-xs font-bold text-blue-700">{offer.categorie}</span>
            </div>
            <div className="px-3 py-1 bg-gradient-to-r from-violet-100 to-purple-100 rounded-full">
              <span className="text-xs font-bold text-violet-700">{offer.type_offre}</span>
            </div>
          </div>

          {offer.localisation && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-purple-500" />
              <span className="font-medium">{offer.localisation}</span>
            </div>
          )}

          {offer.hasRemuneration && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span className="font-medium text-emerald-600">Paid position</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 rounded-full">
            <Calendar className="h-4 w-4 text-orange-600" />
            <span className="font-semibold text-orange-700">
              Until {new Date(offer.date_limite_candidature).toLocaleDateString("en-US")}
            </span>
          </div>
          {offer.nombre_postes > 1 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-100 rounded-full">
              <Users className="h-4 w-4 text-indigo-600" />
              <span className="font-semibold text-indigo-700">{offer.nombre_postes} positions</span>
            </div>
          )}
        </div>

        <motion.button
          onClick={handleApply}
          className="w-full px-4 py-4 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 hover:from-blue-700 hover:via-violet-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Apply Now
          <ExternalLink className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  )
}

export default PublicOffersPage
