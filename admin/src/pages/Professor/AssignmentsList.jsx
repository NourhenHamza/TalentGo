import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AssignmentsList = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [animateList, setAnimateList] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      const token = localStorage.getItem('dToken');

      if (!token) {
        setError('Aucun token trouvé, veuillez vous connecter.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:4000/api/professor/assignments', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAssignments(response.data);
        // Déclencher l'animation après le chargement des données
        setTimeout(() => setAnimateList(true), 100);
      } catch (error) {
        console.error('Erreur lors de la récupération des assignments:', error);
        setError('Impossible de récupérer les assignments.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  // Fonction pour obtenir la classe CSS du badge de statut
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      default: return 'status-default';
    }
  
  };

  // Fonction pour obtenir le texte du statut en français
  const getStatusText = (status) => {
    switch(status) {
      case 'completed':
        return 'Terminé';
      case 'pending':
        return 'En cours';
      default:
        return status || 'Non précisé';
    }
  };

  // Fonction pour obtenir l'icône du statut
  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return (
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'pending':
        return (
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    
    <div className="py-16 px-6 sm:px-10 lg:px-16 relative overflow-hidden" style={{ marginLeft: '100px' }}>
      {/* Éléments décoratifs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="absolute opacity-20 rounded-full bg-blue-500"
            style={{
              width: `${50 + (i * 20)}px`,
              height: `${50 + (i * 20)}px`,
              top: `${10 + (i * 15)}%`,
              left: i % 2 === 0 ? `${5 + (i * 10)}%` : `${80 - (i * 10)}%`,
              animation: `float-${i + 1} ${8 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
              zIndex: 0
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-4 animate-scale-in">
            <svg className="h-16 w-16 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-3">
            Mes <span className="text-blue-500">Encadrements</span>
          </h1>
          <div className="w-32 h-1.5 bg-blue-500 mx-auto my-5 rounded-full animate-width-expand"></div>
          <p className="mt-4 text-lg md:text-xl text-blue-700 max-w-2xl mx-auto animate-fade-in-delayed">
            Suivez les projets de fin d'études que vous encadrez
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full mb-6 animate-spin"></div>
            <p className="text-blue-800 font-medium text-lg">Chargement des encadrements...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl shadow-lg max-w-2xl mx-auto animate-fade-in">
            <h3 className="text-xl font-semibold mb-2">Erreur</h3>
            <p>{error}</p>
          </div>
        ) : selectedAssignment ? (
          <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-blue-100 animate-fade-in" style={{ marginLeft: '100px' }}>
            <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-8 py-6 flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-white flex items-center">
                <svg className="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Détails de l'encadrement
              </h2>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="p-2 rounded-full text-white hover:bg-white/10 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm animate-slide-up" style={{ animationDelay: "0.2s" }}>
                  <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Informations du projet
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Titre du projet</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {selectedAssignment.subject?.title || 'Non disponible'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-600">Entreprise</p>
                      <p className="text-gray-800 flex items-center">
                        <svg className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {selectedAssignment.subject?.company || 'Non précisée'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-600">Statut</p>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(selectedAssignment.status)} border`}>
                        {getStatusIcon(selectedAssignment.status)}
                        {getStatusText(selectedAssignment.status)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-600">Date d'assignation</p>
                      <p className="text-gray-800 flex items-center">
                        <svg className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {selectedAssignment.createdAt
                          ? new Date(selectedAssignment.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })
                          : 'Date non disponible'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm animate-slide-up" style={{ animationDelay: "0.4s" }}>
                  <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Informations de l'étudiant
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Nom de l'étudiant</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {selectedAssignment.student?.name || 'Non disponible'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-600">Email</p>
                      <p className="text-gray-800 flex items-center">
                        <svg className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {selectedAssignment.student?.email || 'Non disponible'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedAssignment.subject?.technologies && selectedAssignment.subject.technologies.length > 0 && (
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm mb-8 animate-slide-up" style={{ animationDelay: "0.6s" }}>
                  <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Technologies utilisées
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAssignment.subject.technologies.map((tech, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200 shadow-sm animate-scale-in"
                        style={{ animationDelay: `${0.7 + (index * 0.05)}s` }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end animate-slide-up" style={{ animationDelay: "0.8s" }}>
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="inline-flex justify-center items-center py-3 px-6 border border-transparent shadow-lg text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  Retour à la liste
                </button>
              </div>
            </div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-blue-100 p-10 text-center max-w-2xl mx-auto animate-fade-in">
            <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center animate-scale-in">
              <svg className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-blue-900 mb-4">Aucun encadrement trouvé</h3>
            <p className="text-blue-700 text-lg mb-6">
              Vous n'avez pas encore d'étudiants assignés pour l'encadrement de projets de fin d'études.
            </p>
          </div>
        ) : (
          <div className={`assignment-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`}>
            {assignments.map((assignment, index) => (
              <div 
                key={assignment._id} 
                className="assignment-card animate-card"
                style={{ animationDelay: `${index * 0.1}s` }}

              >
                <div className="assignment-header px-6 py-4">
                  <h2 className="text-xl font-semibold text-white line-clamp-1">
                    {assignment.subject?.title || 'Matière non disponible'}
                  </h2>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-gray-700 mb-2 flex items-center">
                      <svg className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="font-medium">Étudiant:</span> {assignment.student?.name || 'Non précisé'}
                    </p>
                    <p className="text-gray-700 mb-2 flex items-center">
                      <svg className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">Email:</span> {assignment.student?.email || 'Non précisé'}
                    </p>
                    <p className="text-gray-700 flex items-center">
                      <svg className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">Assigné le:</span> {assignment.createdAt 
                        ? new Date(assignment.createdAt).toLocaleDateString() 
                        : 'Non précisé'}
                    </p>
                  </div>

                  {/* Technologies */}
                  {assignment.subject?.technologies && assignment.subject.technologies.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <svg className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        Technologies:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {assignment.subject.technologies.slice(0, 3).map((tech, index) => (
                          <span key={index} className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {tech}
                          </span>
                        ))}
                        {assignment.subject.technologies.length > 3 && (
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            +{assignment.subject.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className={`status-badge ${getStatusBadgeClass(assignment.status)}`}>
                      {getStatusIcon(assignment.status)}
                      {getStatusText(assignment.status)}
                    </div>
                    <button
                      onClick={() => setSelectedAssignment(assignment)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                    >
                      Voir détails
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      

      <style jsx>{`
        @keyframes float-1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(3deg); }
        }
        @keyframes float-4 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-3deg); }
        }
        @keyframes float-5 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-6 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        .animate-fade-in { 
          opacity: 0;
          animation: fadeIn 0.8s ease-out forwards;
        }
        .animate-fade-in-delayed { 
          opacity: 0;
          animation: fadeIn 0.8s ease-out 0.5s forwards;
        }
        .animate-scale-in {
          transform: scale(0);
          animation: scaleIn 0.5s ease-out forwards;
        }
        .animate-slide-up {
          opacity: 0;
          transform: translateY(20px);
          animation: slideUp 0.5s ease-out forwards;
        }
        .animate-width-expand {
          width: 0;
          animation: widthExpand 1s ease-out 0.5s forwards;
        }
        .animate-cards-container {
          opacity: 1;
        }
        .animate-card {
          opacity: 0;
          transform: translateY(20px);
          animation: slideUp 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes widthExpand {
          from { width: 0; }
          to { width: 8rem; }
        }
      `}</style>
    </div>
   
  );
};

export default AssignmentsList;
