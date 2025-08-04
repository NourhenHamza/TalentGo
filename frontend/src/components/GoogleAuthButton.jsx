// components/GoogleAuthButton.jsx
// VERSION COMPLÈTE ET CORRIGÉE

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const GoogleAuthButton = ({ onSuccess, onError, disabled = false, testUuid }) => {
  const [isGoogleReady, setIsGoogleReady] = useState(false);

  // Gérer la réponse de Google et appeler le backend
  const handleGoogleResponse = async (response) => {
    if (!response.credential) {
      toast.error('Aucun jeton reçu de Google.');
      onError?.('Aucun jeton reçu de Google.');
      return;
    }

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const authUrl = `${apiBaseUrl}/api/public-test/auth/google`;

      const authResponse = await fetch(authUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: response.credential,
          uuid: testUuid,
        } ),
      });

      const data = await authResponse.json();

      if (authResponse.ok) {
        toast.success('Authentification Google réussie !');
        
        // Log crucial pour vérifier la structure des données du backend
        console.log('Données reçues du backend et envoyées à onSuccess:', data.data);
        
        onSuccess?.(data.data);
      } else {
        toast.error(data.message || `Erreur serveur: ${authResponse.status}`);
        onError?.(data.message || "Erreur d'authentification Google");
      }
    } catch (error) {
      console.error("Erreur lors de l'authentification avec le backend:", error);
      toast.error('Une erreur de communication est survenue.');
      onError?.("Erreur lors de l'authentification Google");
    }
  };

  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!googleClientId || googleClientId === 'votre-google-client-id') {
      console.error("VITE_GOOGLE_CLIENT_ID n'est pas configuré.");
      return;
    }

    if (document.getElementById('google-sdk-script')) {
      if (window.google) setIsGoogleReady(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-sdk-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = ( ) => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleResponse,
          auto_select: false,
        });
        setIsGoogleReady(true);
      }
    };
    script.onerror = () => {
      toast.error("Impossible de charger l'authentification Google.");
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (isGoogleReady) {
      const buttonContainer = document.getElementById('google-signin-container');
      if (buttonContainer) {
        buttonContainer.innerHTML = '';
        window.google.accounts.id.renderButton(buttonContainer, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
          shape: 'rectangular',
        });
      }
    }
  }, [isGoogleReady]);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!googleClientId || googleClientId === 'votre-google-client-id') {
    return (
      <div className="w-full p-4 bg-gray-100 border border-gray-200 rounded-lg text-center">
        <p className="text-sm font-semibold text-gray-700">Google Sign-In non configuré.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {!isGoogleReady && (
        <div className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg bg-gray-50">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
          <span className="font-medium">Chargement...</span>
        </div>
      )}
      <div id="google-signin-container" style={{ display: isGoogleReady ? 'block' : 'none' }}></div>
    </div>
  );
};

export default GoogleAuthButton;
