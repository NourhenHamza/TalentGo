// components/FirebaseAuthButton.jsx
// Composant d'authentification Firebase pour le développement - VERSION CORRIGÉE

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const FirebaseAuthButton = ({ onSuccess, onError, disabled = false, testUuid }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showTestUsers, setShowTestUsers] = useState(false);
  const [testUsers, setTestUsers] = useState([]);

  // Vérifier si nous sommes en mode développement
  // CORRECTION: Utilisation de import.meta.env au lieu de process.env
  const isDevelopment = import.meta.env.MODE === 'development' || 
                       import.meta.env.DEV === true ||
                       window.location.hostname === 'localhost';

  // Charger les utilisateurs de test disponibles
  useEffect(() => {
    if (isDevelopment) {
      fetchTestUsers();
    }
  }, [isDevelopment]);

  const fetchTestUsers = async () => {
    try {
      // Construire l'URL de l'API dynamiquement
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
      const testUsersUrl = `${apiBaseUrl}/api/public-test/dev/test-users`;
      
      const response = await fetch(testUsersUrl);
      const data = await response.json();
      
      if (response.ok) {
        setTestUsers(data.data.users);
      } else {
        console.warn('Impossible de charger les utilisateurs de test:', data.message);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs de test:', error);
    }
  };

  // Authentification avec un utilisateur de test prédéfini
  const handleTestUserAuth = async (userIndex) => {
    setIsLoading(true);
    try {
      // Construire l'URL de l'API dynamiquement
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
      const firebaseAuthUrl = `${apiBaseUrl}/api/public-test/auth/firebase`;
      
      const response = await fetch(firebaseAuthUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          testUuid: testUuid,
          devMode: {
            useTestUser: true,
            userIndex: userIndex
          }
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Connecté en tant que ${data.data.user.firstName} ${data.data.user.lastName}`);
        onSuccess && onSuccess(data.data.user);
      } else {
        if (response.status === 409) {
          toast.error('Cet utilisateur a déjà postulé pour cette offre');
        } else {
          onError && onError(data.message || 'Erreur d\'authentification');
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'authentification:', error);
      onError && onError('Erreur lors de l\'authentification');
    } finally {
      setIsLoading(false);
      setShowTestUsers(false);
    }
  };

  // Créer un nouvel utilisateur temporaire
  const handleCreateTempUser = async () => {
    setIsLoading(true);
    try {
      // Construire l'URL de l'API dynamiquement
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
      const firebaseAuthUrl = `${apiBaseUrl}/api/public-test/auth/firebase`;
      
      const response = await fetch(firebaseAuthUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          testUuid: testUuid
          // Pas de idToken ni devMode = création d'un utilisateur temporaire
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Utilisateur temporaire créé: ${data.data.user.firstName} ${data.data.user.lastName}`);
        onSuccess && onSuccess(data.data.user);
      } else {
        onError && onError(data.message || 'Erreur lors de la création de l\'utilisateur');
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      onError && onError('Erreur lors de la création de l\'utilisateur');
    } finally {
      setIsLoading(false);
    }
  };

  // Authentification Firebase réelle (si configuré)
  const handleFirebaseAuth = async () => {
    setIsLoading(true);
    try {
      // Ici, vous pourriez intégrer le SDK Firebase côté client
      // Pour l'instant, on utilise la création d'utilisateur temporaire
      await handleCreateTempUser();
    } catch (error) {
      console.error('Erreur Firebase:', error);
      onError && onError('Erreur d\'authentification Firebase');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isDevelopment) {
    return null; // Ne pas afficher en production
  }

  return (
    <div className="w-full space-y-3">
      {/* Bouton principal Firebase */}
      <button
        onClick={handleFirebaseAuth}
        disabled={disabled || isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.017 0L12.017 0.00699999C5.777 0.00699999 0.726 5.057 0.726 11.297C0.726 17.537 5.777 22.587 12.017 22.587C18.257 22.587 23.307 17.537 23.307 11.297C23.307 5.057 18.257 0.00699999 12.017 0.00699999ZM19.737 14.457C19.737 14.457 18.897 15.297 17.577 15.297C16.257 15.297 15.417 14.457 15.417 14.457L15.417 11.297L12.017 11.297L12.017 14.457C12.017 14.457 11.177 15.297 9.857 15.297C8.537 15.297 7.697 14.457 7.697 14.457L7.697 8.137C7.697 8.137 8.537 7.297 9.857 7.297C11.177 7.297 12.017 8.137 12.017 8.137L12.017 11.297L15.417 11.297L15.417 8.137C15.417 8.137 16.257 7.297 17.577 7.297C18.897 7.297 19.737 8.137 19.737 8.137L19.737 14.457Z"/>
          </svg>
        )}
        <span className="font-medium">
          {isLoading ? 'Connexion...' : 'Créer un utilisateur de test'}
        </span>
      </button>

      {/* Bouton pour afficher les utilisateurs de test */}
      <button
        onClick={() => setShowTestUsers(!showTestUsers)}
        disabled={disabled || isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
        <span className="text-sm font-medium">
          Utiliser un utilisateur prédéfini ({testUsers.length})
        </span>
        <svg 
          className={`w-4 h-4 transition-transform ${showTestUsers ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Liste des utilisateurs de test */}
      {showTestUsers && (
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
          <p className="text-xs text-gray-600 font-medium mb-2">
            Sélectionnez un utilisateur de test :
          </p>
          {testUsers.length > 0 ? (
            testUsers.map((user, index) => (
              <button
                key={user.uid}
                onClick={() => handleTestUserAuth(index)}
                disabled={isLoading}
                className="w-full text-left p-2 bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                    {user.firstName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">Aucun utilisateur de test disponible</p>
              <p className="text-xs text-gray-400 mt-1">Vérifiez que le backend est démarré</p>
            </div>
          )}
        </div>
      )}

      {/* Indicateur de mode développement */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Mode Développement
        </span>
      </div>

      {/* Informations de développement */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>🔧 Authentification Firebase pour les tests</p>
        <p>📧 Emails fictifs avec domaine @dev-test.local</p>
        <p>🔄 Utilisateurs temporaires créés automatiquement</p>
      </div>

      {/* Informations de débogage en mode développement */}
      {(import.meta.env.MODE === 'development' || import.meta.env.DEV) && (
        <div className="mt-2">
          <details className="cursor-pointer">
            <summary className="text-xs text-gray-500">🔧 Informations de débogage</summary>
            <div className="mt-1 p-2 bg-gray-50 rounded text-xs">
              <p><strong>Mode développement:</strong> {isDevelopment ? '✅ Activé' : '❌ Désactivé'}</p>
              <p><strong>Utilisateurs de test:</strong> {testUsers.length} disponibles</p>
              <p><strong>API URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}</p>
              <p><strong>Test UUID:</strong> {testUuid || 'Non fourni'}</p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default FirebaseAuthButton;

