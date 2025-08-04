// components/AuthenticationStep.jsx
// Composant d'étape d'authentification - VERSION SIMPLIFIÉE

import { ArrowLeft, Shield } from 'lucide-react';
import { useState } from 'react';
import AppleAuthButton from './AppleAuthButton';
import FirebaseAuthButton from './FirebaseAuthButton';
import GoogleAuthButton from './GoogleAuthButton';

const AuthenticationStep = ({ onAuthSuccess, onBack, testUuid, offerData }) => {
  const [authError, setAuthError] = useState(null);

  const handleAuthSuccess = (userData) => {
    setAuthError(null);
    onAuthSuccess(userData);
  };

  const handleAuthError = (error) => {
    setAuthError(error);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* En-tête */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Authentification sécurisée
            </h2>
            <p className="text-gray-600">
              Connectez-vous pour postuler à l'offre
            </p>
          </div>

          {/* Informations sur l'offre */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium text-blue-800 mb-1">
              {offerData?.titre}
            </h3>
            <p className="text-sm text-blue-600">
              {offerData?.entreprise?.nom}
            </p>
          </div>

          {/* Message d'erreur */}
          {authError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">{authError}</p>
            </div>
          )}

          {/* Boutons d'authentification - SEULEMENT GOOGLE VISIBLE */}
          <div className="space-y-4 mb-6">
            {/* Google - SEUL BOUTON VISIBLE */}
            <GoogleAuthButton
              onSuccess={handleAuthSuccess}
              onError={handleAuthError}
              testUuid={testUuid}
            />

            {/* Apple - maintenu mais invisible */}
            <div style={{ display: 'none' }}>
              <AppleAuthButton
                onSuccess={handleAuthSuccess}
                onError={handleAuthError}
                testUuid={testUuid}
              />
            </div>

            {/* Firebase - maintenu mais invisible */}
            <div style={{ display: 'none' }}>
              <FirebaseAuthButton
                onSuccess={handleAuthSuccess}
                onError={handleAuthError}
                testUuid={testUuid}
              />
            </div>
          </div>

          {/* Informations sur l'authentification */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-gray-800 mb-2">
              Pourquoi s'authentifier ?
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Vérification de votre identité</li>
              <li>• Protection contre les candidatures frauduleuses</li>
              <li>• Pré-remplissage automatique de vos informations</li>
              <li>• Suivi sécurisé de votre candidature</li>
            </ul>
          </div>

          {/* Informations de sécurité */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Sécurité et confidentialité
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Vos données sont protégées et chiffrées</li>
              <li>• Nous ne stockons que les informations nécessaires</li>
              <li>• Votre email sera vérifié automatiquement</li>
              <li>• Une seule candidature par offre est autorisée</li>
            </ul>
          </div>

          {/* Bouton retour */}
          <div className="text-center">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mx-auto"
            >
              <ArrowLeft size={16} />
              Retour aux informations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationStep;