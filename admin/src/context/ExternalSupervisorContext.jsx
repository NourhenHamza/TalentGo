import axios from "axios";
import { createContext, useContext, useState } from "react";
import { toast } from "react-toastify";

export const ExternalSupervisorContext = createContext();

export const useExternalSupervisorContext = () => useContext(ExternalSupervisorContext);

const ExternalSupervisorContextProvider = (props) => {
  const backendUrl = 'http://localhost:4000' ;

  // Tokens pour chaque rôle
  const [eToken, setEToken] = useState(localStorage.getItem("eToken") || ""); // Token Encadreur
  const [rToken, setRToken] = useState(localStorage.getItem("rToken") || ""); // Token Recruteur
  const [currentRole, setCurrentRole] = useState(localStorage.getItem("currentRole") || ""); // Rôle actuel

  // Données pour chaque rôle
  const [dashData, setDashData] = useState(false);
  const [profileData, setProfileData] = useState(false);

  // Fonction de login
 
const login = async ({ email, password, role }) => { // Prend 'role'
  try {
    const endpoint = "/api/workers/login"; // L'endpoint correct pour le backend

    const { data } = await axios.post(`${backendUrl}${endpoint}`, {
      email,
      password,
      role_interne: role // Envoie 'role_interne' au serveur
    });

    if (data.success) {
      // Gérer le stockage des tokens selon le rôle
      if (role === "Encadreur") {
        localStorage.setItem("eToken", data.token); // Assurez-vous que le serveur renvoie 'token'
        setEToken(data.token);
      } else { // Recruteur
        localStorage.setItem("rToken", data.refreshToken); // Assurez-vous que le serveur renvoie 'refreshToken'
        setRToken(data.refreshToken);
      }
      localStorage.setItem("currentRole", role);
      setCurrentRole(role);
      return true; // Indique le succès
    } else {
      toast.error(data.message || "Échec de la connexion");
      return false; // Indique l'échec
    }
  } catch (error) {
    console.error(error);
    toast.error(error.response?.data?.message || "Erreur de connexion");
    return false; // Indique l'échec
  }
};
 


  // Fonction de logout
  const logout = () => {
    if (currentRole === "Encadreur") {
      localStorage.removeItem("eToken");
      setEToken("");
    } else {
      localStorage.removeItem("rToken");
      setRToken("");
    }
    localStorage.removeItem("currentRole");
    setCurrentRole("");
    setDashData(false);
    setProfileData(false);
  };

  // Récupérer les données du dashboard selon le rôle
 const getDashData = async () => {
    if (!currentRole) return;

    try {
      // Si le dashboard est aussi sous /api/workers ou un chemin similaire
      const endpoint = currentRole === "Encadreur"
        ? "/api/workers/dashboard/encadreur" // Exemple, adaptez à votre route réelle
        : "/api/workers/dashboard/recruteur"; // Exemple, adaptez à votre route réelle

      const { data } = await axios.get(`${backendUrl}${endpoint}`, {
        headers: {
          // Utilisez le token approprié pour l'authentification
          Authorization: `Bearer ${currentRole === "Encadreur" ? eToken : rToken}`
        }
      });

      if (data.success) {
        setDashData(data.dashData);
        return data.dashData;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Erreur lors de la récupération des données");
      return false;
    }
  };

  // Récupérer les données du profil selon le rôle
  const getProfileData = async () => {
    if (!currentRole) return;

    try {
      const endpoint = currentRole === "Encadreur"
        ? "/api/workers/profile"
        : "/api/workers/recruiter/profile";

      const { data } = await axios.get(`${backendUrl}${endpoint}`, {
        headers: { 
          token: currentRole === "Encadreur" ? eToken : rToken 
        }
      });

      if (data.success) {
        setProfileData(data.profileData);
        return data.profileData;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Erreur lors de la récupération du profil");
      return false;
    }
  };

  // Mettre à jour le profil selon le rôle
  const updateProfile = async (updatedData) => {
    if (!currentRole) return;

    try {
      const endpoint = currentRole === "Encadreur"
        ? "/api/workers/profile"
        : "/api/workers/recruiter/profile";

      const { data } = await axios.put(`${backendUrl}${endpoint}`, updatedData, {
        headers: { 
          token: currentRole === "Encadreur" ? eToken : rToken 
        }
      });

      if (data.success) {
        toast.success("Profil mis à jour avec succès");
        await getProfileData(); // Rafraîchir les données du profil
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour du profil");
      return false;
    }
  };

  const value = {
    // Tokens et rôle
    eToken,
    rToken,
    currentRole,
    setEToken,
    setRToken,
    setCurrentRole,
    
    // Fonctions d'authentification
    login,
    logout,
    
    // Données
    dashData,
    profileData,
    setDashData,
    setProfileData,
    
    // Fonctions de récupération de données
    getDashData,
    getProfileData,
    updateProfile,
    
    backendUrl
  };

  return (
    <ExternalSupervisorContext.Provider value={value}>
      {props.children}
    </ExternalSupervisorContext.Provider>
  );
};

export default ExternalSupervisorContextProvider;