// components/AppleAuthButton.jsx
// Composant d'authentification Apple corrigé pour React

import { useState } from 'react';
import { toast } from 'react-toastify';

const AppleAuthButton = ({ onSuccess, onError, disabled = false, testUuid }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Vérifier si nous sommes en mode développement
  // En React, on utilise import.meta.env au lieu de process.env
  const isDevelopment = import.meta.env.MODE === 'development' || 
                       import.meta.env.DEV === true ||
                       window.location.hostname === 'localhost';

  const handleAppleAuth = async () => {
    // En mode développement, rediriger vers Firebase
    if (isDevelopment) {
      toast.info("L'authentification Apple n'est pas disponible en mode développement. Utilisez Firebase ou Google.");
      onError && onError("L'authentification Apple n'est pas disponible en mode développement");
      return;
    }

    setIsLoading(true);
    try {
      // Configuration Apple Sign-In
      if (!window.AppleID) {
        throw new Error('Apple Sign-In SDK non chargé');
      }

      // Initialiser Apple Sign-In
      await window.AppleID.auth.init({
        clientId: import.meta.env.VITE_APPLE_CLIENT_ID || 'com.votre-app.service-id',
        scope: 'name email',
        redirectURI: window.location.origin,
        state: testUuid,
        usePopup: true
      });

      // Déclencher l'authentification
      const response = await window.AppleID.auth.signIn();
      
      if (response.authorization) {
        // Envoyer les données au backend
        const authResponse = await fetch('/api/public-test/auth/apple', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            authorization: response.authorization,
            testUuid: testUuid
          })
        });

        const data = await authResponse.json();

        if (authResponse.ok) {
          toast.success('Authentification Apple réussie !');
          onSuccess && onSuccess(data.data.user);
        } else {
          if (authResponse.status === 409) {
            toast.error('Vous avez déjà postulé pour cette offre');
          } else {
            onError && onError(data.message || 'Erreur d\'authentification Apple');
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'authentification Apple:', error);
      
      if (error.error === 'popup_closed_by_user') {
        toast.info('Authentification annulée');
      } else {
        toast.error('Erreur lors de l\'authentification Apple');
        onError && onError('Erreur lors de l\'authentification Apple');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // En mode développement, ne pas afficher le bouton Apple
  if (isDevelopment) {
    return (
      <div className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-2 text-yellow-800">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">
            Apple Sign-In disponible uniquement en production
          </span>
        </div>
        <p className="text-xs text-yellow-700 mt-1">
          Utilisez Firebase ou Google pour tester l'authentification en développement
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={handleAppleAuth}
      disabled={disabled || isLoading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
        </svg>
      )}
      <span className="font-medium">
        {isLoading ? 'Connexion...' : 'Continuer avec Apple'}
      </span>
    </button>
  );
};

export default AppleAuthButton;

