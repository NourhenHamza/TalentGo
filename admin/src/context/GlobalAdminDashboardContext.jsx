import axios from 'axios';
import PropTypes from 'prop-types';
import { createContext, useMemo, useState, useEffect, useContext } from "react";
import { toast } from 'react-toastify';
import { GlobalAdminContext } from './GlobalAdminContext';

export const GlobalAdminDashboardContext = createContext();

const GlobalAdminDashboardContextProvider = ({ children }) => {
  // Vérifier si le contexte parent est disponible
  const globalAdminContext = useContext(GlobalAdminContext);
  
  // Vérification de sécurité pour le contexte parent
  if (!globalAdminContext) {
    console.error('❌ GlobalAdminDashboardContext must be used within GlobalAdminContextProvider');
    // Retourner un contexte par défaut pour éviter le crash
    return (
      <GlobalAdminDashboardContext.Provider value={{
        dashboardData: null,
        isLoadingDashboard: false,
        pendingRequests: [],
        approvedEntities: { universities: [], companies: [] },
        completedStudents: [],
        globalStatistics: null,
        recentActivities: [],
        loadDashboardData: () => Promise.resolve(null),
        loadPendingRequests: () => Promise.resolve([]),
        loadApprovedEntities: () => Promise.resolve({ universities: [], companies: [] }),
        loadCompletedStudents: () => Promise.resolve([]),
        loadGlobalStatistics: () => Promise.resolve(null),
        refreshAllData: () => Promise.resolve(),
        clearDashboardData: () => {},
        approveUniversityRequest: () => Promise.resolve(null),
        rejectUniversityRequest: () => Promise.resolve(null),
        approveCompanyRequest: () => Promise.resolve(null),
        rejectCompanyRequest: () => Promise.resolve(null)
      }}>
        {children}
      </GlobalAdminDashboardContext.Provider>
    );
  }

  // Destructurer le contexte parent avec des valeurs par défaut
  const { 
    bToken = '', 
    backendUrl = 'http://localhost:4000', 
    isTokenValid = () => false, 
    getValidToken = () => null 
  } = globalAdminContext;

  // États pour les données du tableau de bord
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedEntities, setApprovedEntities] = useState({ universities: [], companies: [] });
  const [completedStudents, setCompletedStudents] = useState([]);
  const [globalStatistics, setGlobalStatistics] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);

  // Configuration d'axios avec intercepteurs
  const apiClient = axios.create({
    baseURL: `${backendUrl}/api`,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Intercepteur pour ajouter le token aux requêtes
  apiClient.interceptors.request.use(
    (config) => {
      const validToken = getValidToken();
      if (validToken) {
        config.headers.Authorization = `Bearer ${validToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Intercepteur pour gérer les erreurs de réponse
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expiré ou invalide
        toast.error("Session expirée. Veuillez vous reconnecter.");
      } else if (error.response?.status === 403) {
        toast.error("Accès non autorisé.");
      } else if (error.response?.status === 404) {
        console.error("API endpoint not found:", error.config?.url);
        toast.error("Service non disponible. Vérifiez la configuration du serveur.");
      }
      return Promise.reject(error);
    }
  );

  // Fonction pour charger les données du tableau de bord
  const loadDashboardData = async () => {
    if (!bToken || !isTokenValid()) {
      console.log('❌ No valid token for dashboard data');
      return null;
    }

    setIsLoadingDashboard(true);
    try {
      // Utiliser la nouvelle base URL
      const response = await apiClient.get('/dashboardglobaladmin/dashboard');
      
      if (response.data.success) {
        const data = response.data.data;
        setDashboardData(data);
        
        // Mettre à jour les états individuels avec vérifications
        if (data.requests) {
          const universities = Array.isArray(data.requests.universities) ? data.requests.universities : [];
          const companies = Array.isArray(data.requests.companies) ? data.requests.companies : [];
          
          setPendingRequests([
            ...universities.map(uni => ({ ...uni, type: 'university' })),
            ...companies.map(comp => ({ ...comp, type: 'company' }))
          ]);
        }
        
        if (data.approved) {
          setApprovedEntities(data.approved);
        }
        
        if (data.students) {
          setCompletedStudents(Array.isArray(data.students.completed) ? data.students.completed : []);
        }
        
        if (data.statistics) {
          setGlobalStatistics(data.statistics);
        }
        
        if (data.activities) {
          setRecentActivities(Array.isArray(data.activities) ? data.activities : []);
        }
        
        return data;
      } else {
        console.error("Failed to load dashboard data:", response.data.message);
        toast.error("Erreur lors du chargement des données");
        return null;
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      if (error.response?.status === 404) {
        toast.error("API non trouvée. Vérifiez que le serveur est configuré avec /api/dashboardglobaladmin");
      } else {
        toast.error("Impossible de charger les données du tableau de bord");
      }
      return null;
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  // Fonction pour charger les demandes en attente
  const loadPendingRequests = async () => {
    if (!bToken || !isTokenValid()) return [];

    try {
      const response = await apiClient.get('/dashboardglobaladmin/requests/pending');
      
      if (response.data.success) {
        const universities = Array.isArray(response.data.data.universities) ? response.data.data.universities : [];
        const companies = Array.isArray(response.data.data.companies) ? response.data.data.companies : [];
        
        const requests = [
          ...universities.map(uni => ({ ...uni, type: 'university' })),
          ...companies.map(comp => ({ ...comp, type: 'company' }))
        ];
        setPendingRequests(requests);
        return requests;
      }
      return [];
    } catch (error) {
      console.error("Error loading pending requests:", error);
      toast.error("Erreur lors du chargement des demandes");
      return [];
    }
  };

  // Fonction pour charger les entités approuvées
  const loadApprovedEntities = async () => {
    if (!bToken || !isTokenValid()) return { universities: [], companies: [] };

    try {
      const response = await apiClient.get('/dashboardglobaladmin/approved');
      
      if (response.data.success) {
        setApprovedEntities(response.data.data);
        return response.data.data;
      }
      return { universities: [], companies: [] };
    } catch (error) {
      console.error("Error loading approved entities:", error);
      toast.error("Erreur lors du chargement des entités approuvées");
      return { universities: [], companies: [] };
    }
  };

  // Fonction pour charger les étudiants ayant complété leur candidature
  const loadCompletedStudents = async () => {
    if (!bToken || !isTokenValid()) return [];

    try {
      const response = await apiClient.get('/dashboardglobaladmin/students/completed');
      
      if (response.data.success) {
        const students = Array.isArray(response.data.data.students) ? response.data.data.students : [];
        setCompletedStudents(students);
        return students;
      }
      return [];
    } catch (error) {
      console.error("Error loading completed students:", error);
      toast.error("Erreur lors du chargement des étudiants");
      return [];
    }
  };

  // Fonction pour charger les statistiques globales
  const loadGlobalStatistics = async () => {
    if (!bToken || !isTokenValid()) return null;

    try {
      const response = await apiClient.get('/dashboardglobaladmin/statistics');
      
      if (response.data.success) {
        setGlobalStatistics(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error loading global statistics:", error);
      toast.error("Erreur lors du chargement des statistiques");
      return null;
    }
  };

  // Fonction pour approuver une demande d'université
  const approveUniversityRequest = async (universityId) => {
    try {
      const response = await apiClient.put(`/dashboardglobaladmin/universities/${universityId}/approve`);
      
      if (response.data.success) {
        toast.success("Université approuvée avec succès");
        // Rafraîchir les données
        await Promise.all([
          loadPendingRequests(),
          loadApprovedEntities(),
          loadDashboardData()
        ]);
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error approving university:", error);
      toast.error("Erreur lors de l'approbation de l'université");
      return null;
    }
  };

  // Fonction pour rejeter une demande d'université
  const rejectUniversityRequest = async (universityId, reason) => {
    try {
      const response = await apiClient.put(`/dashboardglobaladmin/universities/${universityId}/reject`, {
        reason
      });
      
      if (response.data.success) {
        toast.success("Université rejetée");
        // Rafraîchir les données
        await Promise.all([
          loadPendingRequests(),
          loadDashboardData()
        ]);
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error rejecting university:", error);
      toast.error("Erreur lors du rejet de l'université");
      return null;
    }
  };

  // Fonction pour approuver une demande d'entreprise
  const approveCompanyRequest = async (companyId) => {
    try {
      const response = await apiClient.put(`/dashboardglobaladmin/companies/${companyId}/approve`);
      
      if (response.data.success) {
        toast.success("Entreprise approuvée avec succès");
        // Rafraîchir les données
        await Promise.all([
          loadPendingRequests(),
          loadApprovedEntities(),
          loadDashboardData()
        ]);
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error approving company:", error);
      toast.error("Erreur lors de l'approbation de l'entreprise");
      return null;
    }
  };

  // Fonction pour rejeter une demande d'entreprise
  const rejectCompanyRequest = async (companyId, reason) => {
    try {
      const response = await apiClient.put(`/dashboardglobaladmin/companies/${companyId}/reject`, {
        reason
      });
      
      if (response.data.success) {
        toast.success("Entreprise rejetée");
        // Rafraîchir les données
        await Promise.all([
          loadPendingRequests(),
          loadDashboardData()
        ]);
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error rejecting company:", error);
      toast.error("Erreur lors du rejet de l'entreprise");
      return null;
    }
  };

  // Fonction pour rafraîchir toutes les données
  const refreshAllData = async () => {
    if (!bToken || !isTokenValid()) return;

    setIsLoadingDashboard(true);
    try {
      await Promise.all([
        loadDashboardData(),
        loadPendingRequests(),
        loadApprovedEntities(),
        loadCompletedStudents(),
        loadGlobalStatistics()
      ]);
      toast.success("Données mises à jour");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  // Fonction pour réinitialiser les données du tableau de bord
  const clearDashboardData = () => {
    setDashboardData(null);
    setPendingRequests([]);
    setApprovedEntities({ universities: [], companies: [] });
    setCompletedStudents([]);
    setGlobalStatistics(null);
    setRecentActivities([]);
  };

  // Charger les données au montage si le token est valide
  useEffect(() => {
    if (bToken && isTokenValid()) {
      refreshAllData();
    } else {
      clearDashboardData();
    }
  }, [bToken]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // États des données
    dashboardData,
    isLoadingDashboard,
    pendingRequests,
    approvedEntities,
    completedStudents,
    globalStatistics,
    recentActivities,
    
    // Fonctions de chargement des données
    loadDashboardData,
    loadPendingRequests,
    loadApprovedEntities,
    loadCompletedStudents,
    loadGlobalStatistics,
    refreshAllData,
    clearDashboardData,
    
    // Fonctions de gestion des demandes
    approveUniversityRequest,
    rejectUniversityRequest,
    approveCompanyRequest,
    rejectCompanyRequest
  }), [
    dashboardData, 
    isLoadingDashboard, 
    pendingRequests, 
    approvedEntities, 
    completedStudents, 
    globalStatistics,
    recentActivities
  ]);

  return (
    <GlobalAdminDashboardContext.Provider value={value}>
      {children}
    </GlobalAdminDashboardContext.Provider>
  );
};

GlobalAdminDashboardContextProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default GlobalAdminDashboardContextProvider;
