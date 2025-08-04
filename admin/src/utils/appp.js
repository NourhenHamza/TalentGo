// utils/api.js

const API_BASE_URL = 'http://localhost:4000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log("getAuthHeaders: Token récupéré du localStorage:", token ? "Présent" : "Absent");
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log("getAuthHeaders: En-tête Authorization ajouté");
  } else {
    console.warn("getAuthHeaders: Aucun token trouvé dans localStorage");
  }
  
  return headers;
};

const api = {
  // Fonction générique pour les requêtes GET
  get: async (endpoint, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;
    
    console.log("API GET:", url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
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
  post: async (endpoint, data) => {
    console.log("API POST:", `${API_BASE_URL}${endpoint}`, data);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
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
  postFormData: async (endpoint, formData) => {
    const token = localStorage.getItem('token');
    console.log("API postFormData:", `${API_BASE_URL}${endpoint}`);
    console.log("Token présent:", token ? "Oui" : "Non");
    
    // Afficher le contenu du FormData pour le debugging
    for (let [key, value] of formData.entries()) {
      console.log("FormData:", key, value instanceof File ? `File: ${value.name}` : value);
    }
    
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log("postFormData: En-tête Authorization ajouté");
    } else {
      console.warn("postFormData: Aucun token trouvé dans localStorage");
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: headers,
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

  // Fonction générique pour les requêtes DELETE
  delete: async (endpoint) => {
    console.log("API DELETE:", `${API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
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