// utils/api.js

const API_BASE_URL = 'http://localhost:4000/api';


// Fonction pour obtenir les en-têtes d'authentification pour l'étudiant
const getStudentAuthHeaders = ( ) => {
  const token = localStorage.getItem('token');
  console.log("getStudentAuthHeaders: Token récupéré du localStorage:", token ? "Présent" : "Absent");
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log("getStudentAuthHeaders: En-tête Authorization ajouté");
  } else {
    console.warn("getStudentAuthHeaders: Aucun token étudiant trouvé dans localStorage");
  }
  
  return headers;
};

// NOUVEAU: Fonction pour obtenir les en-têtes d'authentification pour l'entreprise (simulée)
const getCompanyAuthHeaders = () => {
  // Try different possible token key names
  const token = localStorage.getItem('cToken') || 
                localStorage.getItem('companyToken') || 
                localStorage.getItem('token');
  
  const companyId = localStorage.getItem('companyIdForDev') || 
                   localStorage.getItem('companyId');
  
  if (!token) {
    console.log('No company token found in localStorage');
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'ctoken': token,
    'Content-Type': 'application/json'
  };
};


const api = {
  // Fonction générique pour les requêtes GET
  // Ajout d'un paramètre 'isCompany' pour choisir les headers
  
  get: async (endpoint, params = {}, isCompany = false) => { // <<< MODIFIÉ
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;
    
    console.log("API GET:", url, " (isCompany:", isCompany, ")");
    
    const headers = isCompany ? getCompanyAuthHeaders() : getStudentAuthHeaders(); // <<< MODIFIÉ

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API GET Error:", response.status, errorData);
      throw new Error(errorData.message || `Erreur lors de la récupération de ${endpoint}`);
    }
    
    return response.json();
  },

  // Fonction générique pour les requêtes POST (JSON)
  // Ajout d'un paramètre 'isCompany' pour choisir les headers
  post: async (endpoint, data, isCompany = false) => { // <<< MODIFIÉ
    console.log("API POST:", `${API_BASE_URL}${endpoint}`, " (isCompany:", isCompany, ")", data);
    
    const headers = isCompany ? getCompanyAuthHeaders() : getStudentAuthHeaders(); // <<< MODIFIÉ

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API POST Error:", response.status, errorData);
      throw new Error(errorData.message || `Erreur lors de la soumission à ${endpoint}`);
    }
    
    return response.json();
  },

  // Fonction pour les requêtes POST avec FormData (pour les uploads de fichiers)
  // Ajout d'un paramètre 'isCompany' pour choisir les headers
  postFormData: async (endpoint, formData, isCompany = false) => { // <<< MODIFIÉ
    console.log("API postFormData:", `${API_BASE_URL}${endpoint}`, " (isCompany:", isCompany, ")");
    
    // Afficher le contenu du FormData pour le debugging
    for (let [key, value] of formData.entries()) {
      console.log("FormData:", key, value instanceof File ? `File: ${value.name}` : value);
    }
    
    const headers = {}; // Pas de Content-Type pour FormData, le navigateur le gère

    if (isCompany) { // Logique pour l'entreprise
      const cToken = localStorage.getItem('cToken');
      const companyId = localStorage.getItem('companyIdForDev');
      if (cToken && companyId) {
        headers['X-Company-Id'] = companyId;
        console.log("postFormData (Company): En-tête X-Company-Id ajouté");
        // Si real JWT for company, add:
        // headers['Authorization'] = `Bearer ${cToken}`;
      } else {
        console.warn("postFormData (Company): cToken ou companyIdForDev manquant.");
      }
    } else { // Logique pour l'étudiant
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log("postFormData (Student): En-tête Authorization ajouté");
      } else {
        console.warn("postFormData (Student): Aucun token trouvé dans localStorage");
      }
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: headers, // <<< UTILISE LES HEADERS DÉFINIS CI-DESSUS
      body: formData,
      credentials: 'include',
    });
    
    console.log("postFormData Response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API postFormData Error:", response.status, errorData);
      
      // Gestion spéciale des erreurs d'authentification
      if (response.status === 401) {
        console.warn("Token expiré ou invalide, redirection vers login recommandée");
        // Vous pourriez supprimer le token invalide ici
        // localStorage.removeItem('token');
      }
      
      throw new Error(errorData.message || `Erreur lors de l'upload à ${endpoint}`);
    }
    
    return response.json();
  },

  // NOUVEAU: Fonction générique pour les requêtes PUT
  // Ajout d'un paramètre 'isCompany' pour choisir les headers
  put: async (endpoint, data, isCompany = false) => { // <<< NOUVELLE MÉTHODE
    console.log("API PUT:", `${API_BASE_URL}${endpoint}`, " (isCompany:", isCompany, ")", data);

    const headers = isCompany ? getCompanyAuthHeaders() : getStudentAuthHeaders();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API PUT Error:", response.status, errorData);
      throw new Error(errorData.message || `Erreur lors de la mise à jour de ${endpoint}`);
    }

    return response.json();
  },

  // Fonction générique pour les requêtes DELETE
  // Ajout d'un paramètre 'isCompany' pour choisir les headers
  delete: async (endpoint, isCompany = false) => { // <<< MODIFIÉ
    console.log("API DELETE:", `${API_BASE_URL}${endpoint}`, " (isCompany:", isCompany, ")");
    
    const headers = isCompany ? getCompanyAuthHeaders() : getStudentAuthHeaders(); // <<< MODIFIÉ

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: headers,
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API DELETE Error:", response.status, errorData);
      throw new Error(errorData.message || `Erreur lors de la suppression de ${endpoint}`);
    }
    
    return response.json();
  },
};

export default api;
