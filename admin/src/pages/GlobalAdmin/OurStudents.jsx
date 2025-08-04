import React, { useState, useEffect, useContext } from 'react';
import { GlobalAdminContext } from "../../context/GlobalAdminContext"
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  GraduationCap, 
  Building, 
  Star, 
  Calendar,
  User,
  Mail,
  MapPin,
  Trophy,
  FileText,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  TrendingUp
} from 'lucide-react';

const OurStudents = () => {
  const { bToken, backendUrl } = useContext(GlobalAdminContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [universityFilter, setUniversityFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Fetch applications data
  const fetchApplications = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        search: searchTerm,
        university: universityFilter,
        company: companyFilter
      });

      const response = await fetch(`${backendUrl}/api/globaladmin/completed-applications?${params}`, {
        headers: {
          'Authorization': `Bearer ${bToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setApplications(data.data);
        setPagination(data.pagination);
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erreur lors du chargement des candidatures');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/globaladmin/completed-applications/stats`, {
        headers: {
          'Authorization': `Bearer ${bToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Export data
  const exportData = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/globaladmin/completed-applications/export`, {
        headers: {
          'Authorization': `Bearer ${bToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        // Convert to CSV and download
        const csvContent = convertToCSV(data.data);
        downloadCSV(csvContent, 'candidatures_completees.csv');
      }
    } catch (err) {
      console.error('Error exporting data:', err);
    }
  };

  const convertToCSV = (data) => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => 
          JSON.stringify(row[header] || '', (key, value) => value === null ? '' : value)
        ).join(',')
      )
    ];
    
    return csvRows.join('\n');
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle search and filters
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      fetchApplications(1);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setUniversityFilter('');
    setCompanyFilter('');
    setCurrentPage(1);
    fetchApplications(1);
  };

  // Grade color coding
  const getGradeColor = (grade) => {
    if (grade >= 18) return 'text-green-600 bg-green-50';
    if (grade >= 16) return 'text-blue-600 bg-blue-50';
    if (grade >= 14) return 'text-yellow-600 bg-yellow-50';
    if (grade >= 12) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  // Effects
  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchApplications(1);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, universityFilter, companyFilter]);

  if (loading && !applications.length) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">Chargement des candidatures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-900 mb-2">
                Candidatures Complétées
              </h1>
              <p className="text-blue-600">
                Gestion des candidatures finalisées pour les offres PFE et emploi
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                Statistiques
              </button>
              <button
                onClick={exportData}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-5 w-5 mr-2" />
                Exporter
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {showStats && stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
                <div className="flex items-center">
                  <Trophy className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total Candidatures</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {stats.totalCount?.[0]?.count || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Note Moyenne</p>
                    <p className="text-2xl font-bold text-green-900">
                      {stats.gradeStats?.[0]?.averageGrade?.toFixed(1) || 0}/100
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
                <div className="flex items-center">
                  <GraduationCap className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Universités</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {stats.byUniversity?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
                <div className="flex items-center">
                  <Building className="h-8 w-8 text-orange-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Entreprises</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {stats.byCompany?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 mb-6">
          <div className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, email, CIN, entreprise..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleSearch}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="h-5 w-5 mr-2" />
                  Filtres
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-blue-600 hover:text-blue-800"
                >
                  Effacer
                </button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Université
                    </label>
                    <input
                      type="text"
                      placeholder="Filtrer par université..."
                      value={universityFilter}
                      onChange={(e) => setUniversityFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entreprise
                    </label>
                    <input
                      type="text"
                      placeholder="Filtrer par entreprise..."
                      value={companyFilter}
                      onChange={(e) => setCompanyFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-lg shadow-sm border border-blue-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50 border-b border-blue-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-blue-900">Étudiant</th>
                  <th className="text-left p-4 font-semibold text-blue-900">Université</th>
                  <th className="text-left p-4 font-semibold text-blue-900">Entreprise</th>
                  <th className="text-left p-4 font-semibold text-blue-900">Offre</th>
                  <th className="text-left p-4 font-semibold text-blue-900">Note</th>
                  <th className="text-left p-4 font-semibold text-blue-900">Date</th>
                  <th className="text-left p-4 font-semibold text-blue-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-blue-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{app.student?.name}</div>
                          <div className="text-sm text-gray-500">{app.student?.email}</div>
                          <div className="text-xs text-gray-400">CIN: {app.student?.cin}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <GraduationCap className="h-5 w-5 text-blue-600 mr-2" />
                        <div>
                          <div className="font-medium text-gray-900">{app.student?.university}</div>
                          <div className="text-sm text-gray-500">{app.student?.specialization}</div>
                          <div className="text-xs text-gray-400">{app.student?.currentClass}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <Building className="h-5 w-5 text-gray-600 mr-2" />
                        <div>
                          <div className="font-medium text-gray-900">{app.company?.name}</div>
                          <div className="text-sm text-gray-500">{app.company?.city}, {app.company?.country}</div>
                          {app.company?.sector && (
                            <div className="text-xs text-gray-400">{app.company?.sector}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-gray-900">{app.offer?.title}</div>
                        <div className="text-sm text-gray-500">{app.offer?.type}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(app.finalGrade)}`}>
                        <Star className="h-4 w-4 mr-1" />
                        {app.finalGrade}/100
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(app.appliedAt).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => {
                          setSelectedApplication(app);
                          setShowModal(true);
                        }}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Affichage de {((pagination.currentPage - 1) * 10) + 1} à {Math.min(pagination.currentPage * 10, pagination.totalCount)} sur {pagination.totalCount} candidatures
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setCurrentPage(currentPage - 1);
                    fetchApplications(currentPage - 1);
                  }}
                  disabled={!pagination.hasPrev}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </button>
                <span className="flex items-center px-3 py-2 text-sm font-medium text-gray-700">
                  Page {pagination.currentPage} sur {pagination.totalPages}
                </span>
                <button
                  onClick={() => {
                    setCurrentPage(currentPage + 1);
                    fetchApplications(currentPage + 1);
                  }}
                  disabled={!pagination.hasNext}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* No Data Message */}
        {!loading && applications.length === 0 && !error && (
          <div className="mt-8 text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune candidature trouvée
            </h3>
            <p className="text-gray-600">
              Aucune candidature complétée ne correspond à vos critères de recherche.
            </p>
          </div>
        )}
      </div>

      {/* Modal for Application Details */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Détails de la candidature
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student Information */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Informations Étudiant
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nom complet</label>
                      <p className="text-gray-900">{selectedApplication.student?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900 flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {selectedApplication.student?.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">CIN</label>
                      <p className="text-gray-900">{selectedApplication.student?.cin}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Niveau d'études</label>
                      <p className="text-gray-900">{selectedApplication.student?.studyLevel}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Spécialisation</label>
                      <p className="text-gray-900">{selectedApplication.student?.specialization}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Classe actuelle</label>
                      <p className="text-gray-900">{selectedApplication.student?.currentClass}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Année académique</label>
                      <p className="text-gray-900">{selectedApplication.student?.academicYear}</p>
                    </div>
                  </div>
                </div>

                {/* University Information */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Université
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nom de l'université</label>
                      <p className="text-gray-900">{selectedApplication.student?.university}</p>
                    </div>
                  </div>
                </div>

                {/* Company Information */}
                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    Entreprise
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nom de l'entreprise</label>
                      <p className="text-gray-900">{selectedApplication.company?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Localisation</label>
                      <p className="text-gray-900 flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        {selectedApplication.company?.city}, {selectedApplication.company?.country}
                      </p>
                    </div>
                    {selectedApplication.company?.sector && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Secteur d'activité</label>
                        <p className="text-gray-900">{selectedApplication.company?.sector}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Offer Information */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Offre
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Titre de l'offre</label>
                      <p className="text-gray-900">{selectedApplication.offer?.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Type d'offre</label>
                      <p className="text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {selectedApplication.offer?.type}
                        </span>
                      </p>
                    </div>
                    {selectedApplication.offer?.description && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Description</label>
                        <p className="text-gray-900 text-sm">{selectedApplication.offer?.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Grade and Review Section */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Évaluation Finale
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Note finale</label>
                    <div className={`mt-2 inline-flex items-center px-4 py-2 rounded-full text-lg font-bold ${getGradeColor(selectedApplication.finalGrade)}`}>
                      <Star className="h-5 w-5 mr-2" />
                      {selectedApplication.finalGrade}/100
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Dates importantes</label>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-gray-900 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-medium">Candidature:</span>
                        <span className="ml-2">{new Date(selectedApplication.appliedAt).toLocaleDateString('fr-FR')}</span>
                      </p>
                      {selectedApplication.reviewedAt && (
                        <p className="text-sm text-gray-900 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium">Révision:</span>
                          <span className="ml-2">{new Date(selectedApplication.reviewedAt).toLocaleDateString('fr-FR')}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {selectedApplication.review && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-600">Avis de l'entreprise</label>
                    <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-gray-900">{selectedApplication.review}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Test Results Section */}
              {selectedApplication.testResult && selectedApplication.testResult.testId && (
                <div className="mt-6 bg-yellow-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Résultats du Test
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Score</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedApplication.testResult.score}/100
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Résultat</label>
                      <p className={`text-lg font-semibold ${selectedApplication.testResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedApplication.testResult.passed ? 'Réussi' : 'Échoué'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Date de completion</label>
                      <p className="text-sm text-gray-900">
                        {selectedApplication.testResult.completedAt ? 
                          new Date(selectedApplication.testResult.completedAt).toLocaleDateString('fr-FR') : 
                          'Non spécifiée'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OurStudents;