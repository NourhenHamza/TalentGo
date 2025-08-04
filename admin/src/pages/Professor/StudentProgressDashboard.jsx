"use client"
import axios from "axios";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Filter,
  LineChart,
  RefreshCw,
  Search,
  User
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

// --- Composants UI pour un code plus propre ---

const LoadingCard = () => (
  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-blue-100">
    <div className="animate-pulse flex space-x-4">
      <div className="flex-1 space-y-4 py-1">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  </div>
);

const ErrorDisplay = ({ message }) => (
  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-center my-4">
    <AlertCircle className="h-6 w-6 mr-3" />
    <p>{message}</p>
  </div>
);

const EmptyState = ({ message }) => (
  <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl text-center shadow border border-blue-100">
    <p className="text-blue-800">{message}</p>
  </div>
);

// --- Fonction helper pour gérer l'affichage des données ---
const getDisplayValue = (item, field, fallbackPrefix = "ID") => {
  if (typeof item === 'object' && item !== null && item[field]) {
    return item[field];
  }
  if (typeof item === 'string' || (typeof item === 'object' && item !== null)) {
    return `${fallbackPrefix}: ${item.toString()}`;
  }
  return `${fallbackPrefix}: Non défini`;
};

// --- Fonction pour récupérer le titre du projet ---
const getProjectTitle = (subjectId) => {
  if (!subjectId) {
    return 'Projet non assigné';
  }
  
  // Si subjectId est un objet avec une propriété title
  if (typeof subjectId === 'object' && subjectId.title) {
    return subjectId.title;
  }
  
  // Si subjectId est juste un string (ObjectId)
  if (typeof subjectId === 'string') {
    return 'Projet assigné';
  }
  
  return 'Projet non assigné';
};

// --- Composant Principal ---
const StudentProgressDashboard = () => {
  // --- États ---
  const [progressData, setProgressData] = useState({ currentWeek: [], history: [] });
  const [currentWeekNumber, setCurrentWeekNumber] = useState(0);
  
  const [loading, setLoading] = useState({ page: true, history: false });
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ week: "all" });
  const [showFilters, setShowFilters] = useState(false);

  // --- Instance Axios ---
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: 'http://localhost:4000/api',
      headers: { 'Content-Type': 'application/json' }
    });
    const token = typeof window !== 'undefined' ? localStorage.getItem('dToken') : null;
    if (token) {
      instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return instance;
  }, []);

  // --- Récupération des données ---
  const fetchAllData = useCallback(async (isRefresh = false) => {
    // Gestion du loading selon le type de chargement
    if (isRefresh) {
      setLoading(prev => ({ ...prev, history: true }));
    } else {
      setLoading({ page: true, history: false });
    }
    
    setError(null);
    
    try {
      console.log('[DEBUG] Début de la récupération des données...');
      
      const [currentRes, historyRes] = await Promise.all([
        api.get('/progress/current'),
        api.get(`/progress/history?week=${filters.week}`)
      ]);

      console.log('[DEBUG] Données reçues current:', currentRes.data);
      console.log('[DEBUG] Données reçues history:', historyRes.data);

      setProgressData({
        currentWeek: currentRes.data.data || [],
        history: historyRes.data.data || [],
      });
      setCurrentWeekNumber(currentRes.data.currentWeek || 0);

    } catch (err) {
      console.error("Erreur lors de la récupération des données:", err);
      setError(err.response?.data?.message || "Impossible de charger les données. Veuillez vérifier votre connexion.");
    } finally {
      setLoading({ page: false, history: false });
    }
  }, [api, filters.week]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // --- Filtrage côté client ---
  const filteredData = useMemo(() => {
    const search = searchTerm.toLowerCase();
    
    const filterLogic = (p) => {
      if (!p || !p.progress) return false;

      const studentName = getDisplayValue(p.studentId, 'name', 'Étudiant').toLowerCase();
      const projectTitle = getProjectTitle(p.subjectId).toLowerCase();

      return studentName.includes(search) || 
             projectTitle.includes(search) || 
             p.progress.toLowerCase().includes(search);
    };

    return {
      currentWeek: progressData.currentWeek.filter(filterLogic),
      history: progressData.history.filter(filterLogic),
    };
  }, [searchTerm, progressData]);

  // --- Gestionnaires d'événements ---
  const openDraftUrl = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert("Aucun fichier de brouillon disponible.");
    }
  };

  const handleRefresh = () => {
    fetchAllData(true);
  };

  // --- Gestion des filtres ---
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  // --- Rendu conditionnel pour le chargement initial ---
  if (loading.page) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                <LineChart className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 text-transparent bg-clip-text">
                Tableau de Bord de Progression
              </h1>
            </div>
          </div>
          <LoadingCard />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 relative bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen">
      {/* Background decoratif */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-100/30 blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-blue-200/20 blur-xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                <LineChart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 text-transparent bg-clip-text">
                  Tableau de Bord de Progression
                </h1>
                <p className="text-blue-600 mt-1">
                  Suivez la progression hebdomadaire de vos étudiants.
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white border border-blue-200 rounded-lg transition-colors"
              disabled={loading.history}
            >
              <RefreshCw className={`h-4 w-4 text-blue-600 ${loading.history ? 'animate-spin' : ''}`} />
              <span className="text-blue-600">Actualiser</span>
            </button>
          </div>
        </header>

        {/* Affichage des erreurs */}
        {error && <ErrorDisplay message={error} />}

        {/* Barre de recherche et filtres */}
        <div className="mb-8 bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-blue-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-blue-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher par étudiant, projet ou contenu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm transition-colors"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filtres
              {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
            </button>
          </div>

          {/* Panneau de filtres */}
          {showFilters && (
            <div className="mt-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200">
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-blue-700 mb-2">Semaine</label>
                  <select
                    value={filters.week}
                    onChange={(e) => handleFilterChange('week', e.target.value)}
                    className="px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="all">Toutes les semaines</option>
                    {Array.from({ length: 52 }, (_, i) => i + 1).map(week => (
                      <option key={week} value={week}>Semaine {week}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progression de la semaine en cours */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-blue-800 flex items-center mb-6">
            <Calendar className="h-6 w-6 mr-3 text-blue-600" />
            Progression de la semaine en cours (Semaine {currentWeekNumber})
          </h2>
          
          {filteredData.currentWeek.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.currentWeek.map(progress => (
                <div key={progress._id} className="bg-white/70 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        <h3 className="font-semibold">
                          {getDisplayValue(progress.studentId, 'name', 'Étudiant')}
                        </h3>
                      </div>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                        Semaine {progress.week}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-4">
                      <p className="text-sm text-blue-700 font-medium mb-1">Projet</p>
                      <p className="text-gray-800 font-medium">
                        {getProjectTitle(progress.subjectId)}
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-blue-700 font-medium mb-2">Progression</p>
                      <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                        <p className="text-gray-800 text-sm whitespace-pre-wrap">
                          {progress.progress}
                        </p>
                      </div>
                    </div>
                    
                    {progress.fileUrl && (
                      <div className="mb-4">
                        <button
                          onClick={() => openDraftUrl(progress.fileUrl)}
                          className="flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Voir le brouillon
                        </button>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Soumis le {new Date(progress.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Aucune progression trouvée pour cette semaine ou correspondant à votre recherche." />
          )}
        </div>

        {/* Historique des progressions */}
        <div>
          <h2 className="text-2xl font-semibold text-blue-800 flex items-center mb-6">
            <Clock className="h-6 w-6 mr-3 text-blue-600" />
            Historique des progressions
          </h2>
          
          {loading.history ? (
            <LoadingCard />
          ) : filteredData.history.length > 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-blue-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Étudiant</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Projet</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Semaine</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Progression</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100">
                    {filteredData.history.map((progress) => (
                      <tr key={progress._id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-medium text-gray-800">
                            {getDisplayValue(progress.studentId, 'name', 'Étudiant')}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-800">
                            {getProjectTitle(progress.subjectId)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            Semaine {progress.week}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-800 max-w-xs truncate" title={progress.progress}>
                            {progress.progress}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-600">
                            {new Date(progress.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState message="Aucun historique trouvé ou correspondant à vos filtres." />
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProgressDashboard;

