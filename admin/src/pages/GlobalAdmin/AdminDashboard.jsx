import {
  Activity,
  BarChart3,
  Building2,
  School,
  UserCheck,
  UserX,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Loader2,
  FileText,
  GraduationCap,
  Award
} from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import * as THREE from "three";
import { GlobalAdminDashboardContext } from "../../context/GlobalAdminDashboardContext";

// Composants utilitaires
const Card = ({ className = "", children, ...props }) => (
  <div className={`rounded-xl overflow-hidden border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 bg-white ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({ className = "", children, ...props }) => (
  <div className={`p-5 pb-2 ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({ className = "", children, ...props }) => (
  <h3 className={`text-lg font-semibold text-blue-800 ${className}`} {...props}>
    {children}
  </h3>
);

const CardDescription = ({ className = "", children, ...props }) => (
  <p className={`text-sm text-gray-500 ${className}`} {...props}>
    {children}
  </p>
);

const CardContent = ({ className = "", children, ...props }) => (
  <div className={`p-5 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

// Composant pour les statistiques principales
const StatCard = ({ title, value, subtitle, icon: Icon, color = "blue", trend = null }) => (
  <Card className="h-full transform hover:-translate-y-1">
    <CardHeader>
      <CardTitle className="flex items-center">
        <Icon className={`mr-2 h-5 w-5 text-${color}-500`} />
        {title}
      </CardTitle>
      <CardDescription>{subtitle}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-3xl font-bold text-${color}-700`}>{value}</p>
          {trend && (
            <p className={`text-sm text-${color}-500 mt-1 flex items-center`}>
              <Activity className="inline h-4 w-4 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`bg-${color}-100 p-3 rounded-full`}>
          <Icon className={`h-8 w-8 text-${color}-600`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Composant pour les demandes en attente
const PendingRequestsCard = ({ requests, onApprove, onReject, isLoading }) => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = async (request) => {
    if (request.type === 'university') {
      await onApprove.university(request._id);
    } else {
      await onApprove.company(request._id);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) {
      toast.error("Veuillez fournir une raison pour le rejet");
      return;
    }

    if (selectedRequest.type === 'university') {
      await onReject.university(selectedRequest._id, rejectReason);
    } else {
      await onReject.company(selectedRequest._id, rejectReason);
    }

    setShowRejectModal(false);
    setSelectedRequest(null);
    setRejectReason("");
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-amber-500" />
              Demandes en attente
            </span>
            <span className="text-sm bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
              {requests.length}
            </span>
          </CardTitle>
          <CardDescription>Demandes nécessitant votre approbation</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>Aucune demande en attente</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {requests.map((request) => (
                <div key={request._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {request.type === 'university' ? (
                          <School className="h-5 w-5 text-blue-500 mr-2" />
                        ) : (
                          <Building2 className="h-5 w-5 text-green-500 mr-2" />
                        )}
                        <h4 className="font-medium text-gray-900">
                          {request.type === 'university' ? request.name : request.nom}
                        </h4>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          request.type === 'university' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {request.type === 'university' ? 'Université' : 'Entreprise'}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {request.type === 'university' ? request.location : request.ville}
                        </p>
                        <p className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {request.type === 'university' ? request.contactEmail : request.email}
                        </p>
                        {request.type === 'company' && request.secteur_activite && (
                          <p className="flex items-center">
                            <Building2 className="h-4 w-4 mr-1" />
                            {request.secteur_activite}
                          </p>
                        )}
                        <p className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Soumis le {new Date(request.submittedAt || request.requestDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>

                      {request.description && (
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                          {request.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleApprove(request)}
                        className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approuver
                      </button>
                      <button
                        onClick={() => openRejectModal(request)}
                        className="flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Rejeter
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de rejet */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Rejeter la demande</h3>
            <p className="text-gray-600 mb-4">
              Vous êtes sur le point de rejeter la demande de{" "}
              <strong>
                {selectedRequest?.type === 'university' ? selectedRequest?.name : selectedRequest?.nom}
              </strong>
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Raison du rejet..."
              className="w-full p-3 border border-gray-300 rounded-md resize-none h-24"
              required
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                  setRejectReason("");
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Composant pour les étudiants ayant complété leur candidature
const CompletedStudentsCard = ({ students, isLoading }) => {
  const [showAllStudents, setShowAllStudents] = useState(false);
  const displayedStudents = showAllStudents ? students : students.slice(0, 5);

  const getCompletionStatusBadge = (status) => {
    const statusConfig = {
      project_started: { bg: "bg-green-100", text: "text-green-700", label: "Projet démarré" },
      supervisor_assigned: { bg: "bg-blue-100", text: "text-blue-700", label: "Superviseur assigné" },
      subject_approved: { bg: "bg-purple-100", text: "text-purple-700", label: "Sujet approuvé" },
      subject_pending: { bg: "bg-amber-100", text: "text-amber-700", label: "Sujet en attente" },
      application_confirmed: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Candidature confirmée" },
      application_accepted: { bg: "bg-cyan-100", text: "text-cyan-700", label: "Candidature acceptée" }
    };

    const config = statusConfig[status] || { bg: "bg-gray-100", text: "text-gray-700", label: status };
    
    return (
      <span className={`px-2 py-1 ${config.bg} ${config.text} text-xs font-medium rounded-full`}>
        {config.label}
      </span>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <GraduationCap className="mr-2 h-5 w-5 text-green-500" />
            Étudiants avec candidature complétée
          </span>
          <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
            {students.length}
          </span>
        </CardTitle>
        <CardDescription>Étudiants ayant une candidature acceptée et confirmée</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Aucun étudiant avec candidature complétée</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {displayedStudents.map((studentData) => (
                <div key={studentData._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Users className="h-5 w-5 text-blue-500 mr-2" />
                        <h4 className="font-medium text-gray-900">{studentData.student.name}</h4>
                        {getCompletionStatusBadge(studentData.completionStatus)}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {studentData.student.email}
                        </p>
                        <p className="flex items-center">
                          <School className="h-4 w-4 mr-1" />
                          {studentData.university.name} - {studentData.student.specialization} ({studentData.student.currentClass})
                        </p>
                        <p className="flex items-center">
                          <Building2 className="h-4 w-4 mr-1" />
                          {studentData.company.nom} - {studentData.company.ville}
                        </p>
                        <p className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Confirmé le {new Date(studentData.application.confirmedAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>

                      {studentData.subject && (
                        <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-100">
                          <p className="text-sm font-medium text-blue-800">
                            Sujet: {studentData.subject.title}
                          </p>
                          <p className="text-xs text-blue-600">
                            Statut: {studentData.subject.status}
                          </p>
                        </div>
                      )}

                      {studentData.supervisor && (
                        <div className="mt-2 p-2 bg-green-50 rounded border border-green-100">
                          <p className="text-sm font-medium text-green-800">
                            Superviseur: {studentData.supervisor.name}
                          </p>
                          <p className="text-xs text-green-600">
                            {studentData.supervisor.department}
                          </p>
                        </div>
                      )}

                      {studentData.application.feedback && (
                        <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-100">
                          <p className="text-sm font-medium text-amber-800">Feedback entreprise:</p>
                          <p className="text-xs text-amber-700 line-clamp-2">
                            {studentData.application.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {students.length > 5 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowAllStudents(!showAllStudents)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center mx-auto"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {showAllStudents ? 'Voir moins' : `Voir tous (${students.length})`}
                </button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Composant principal du tableau de bord
const AdminDashboard = () => {
  const {
    dashboardData,
    isLoadingDashboard,
    pendingRequests,
    completedStudents,
    globalStatistics,
    recentActivities,
    refreshAllData,
    approveUniversityRequest,
    rejectUniversityRequest,
    approveCompanyRequest,
    rejectCompanyRequest
  } = useContext(GlobalAdminDashboardContext);

  const canvasRef = useRef(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Effet 3D d'arrière-plan
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 300 / 200, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });

    renderer.setSize(300, 200);

    // Create simple geometric shapes
    const group = new THREE.Group();
    scene.add(group);

    // University icon shape
    const uniGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 6);
    const uniMaterial = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
    const university = new THREE.Mesh(uniGeometry, uniMaterial);
    university.position.set(-1, 0, 0);
    group.add(university);

    // Company building shape
    const companyGeometry = new THREE.BoxGeometry(1, 0.8, 1);
    const companyMaterial = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const company = new THREE.Mesh(companyGeometry, companyMaterial);
    company.position.set(1, 0, 0);
    group.add(company);

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);
      group.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      scene.remove(group);
      uniMaterial.dispose();
      companyMaterial.dispose();
      uniGeometry.dispose();
      companyGeometry.dispose();
      renderer.dispose();
    };
  }, []);

  // Fonction de rafraîchissement
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAllData();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Gestionnaires d'approbation et de rejet
  const handleApprove = {
    university: approveUniversityRequest,
    company: approveCompanyRequest
  };

  const handleReject = {
    university: rejectUniversityRequest,
    company: rejectCompanyRequest
  };

  // Calcul des statistiques à partir des données
  const stats = globalStatistics ? {
    universities: globalStatistics.totals.universities,
    companies: globalStatistics.totals.companies,
    pendingRequests: globalStatistics.pending.requests,
    students: globalStatistics.totals.students
  } : {
    universities: 0,
    companies: 0,
    pendingRequests: pendingRequests.length,
    students: 0
  };

  return (
    <div className="p-6 relative bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-100/30 blur-xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-blue-200/20 blur-xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* En-tête */}
        <header className="mb-8 opacity-0 animate-fade-in" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-blue-800 mb-2">
                Tableau de bord administrateur global
              </h1>
              <p className="text-blue-600">
                Gestion des accès plateforme pour universités et entreprises
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
              title="Actualiser les données"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </header>

        {/* Cartes de statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="opacity-0 animate-fade-in" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
            <StatCard
              title="Universités"
              value={stats.universities}
              subtitle="Institutions approuvées"
              icon={School}
              color="blue"
              trend={globalStatistics?.monthly.newUniversities ? `+${globalStatistics.monthly.newUniversities} ce mois` : null}
            />
          </div>

          <div className="opacity-0 animate-fade-in" style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}>
            <StatCard
              title="Entreprises"
              value={stats.companies}
              subtitle="Partenaires approuvés"
              icon={Building2}
              color="green"
              trend={globalStatistics?.monthly.newCompanies ? `+${globalStatistics.monthly.newCompanies} ce mois` : null}
            />
          </div>

          <div className="opacity-0 animate-fade-in" style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}>
            <StatCard
              title="Demandes en attente"
              value={stats.pendingRequests}
              subtitle="Nécessitent approbation"
              icon={UserCheck}
              color="amber"
              trend={`${globalStatistics?.pending.universities || 0} universités, ${globalStatistics?.pending.companies || 0} entreprises`}
            />
          </div>

          <div className="opacity-0 animate-fade-in" style={{ animationDelay: "1s", animationFillMode: "forwards" }}>
            <StatCard
              title="Étudiants"
              value={stats.students}
              subtitle="Inscrits sur la plateforme"
              icon={Users}
              color="purple"
              trend={globalStatistics?.monthly.newStudents ? `+${globalStatistics.monthly.newStudents} ce mois` : null}
            />
          </div>
        </div>

        {/* Section principale avec demandes et étudiants */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Demandes en attente */}
          <div className="opacity-0 animate-fade-in" style={{ animationDelay: "1.2s", animationFillMode: "forwards" }}>
            <PendingRequestsCard
              requests={pendingRequests}
              onApprove={handleApprove}
              onReject={handleReject}
              isLoading={isLoadingDashboard}
            />
          </div>

          {/* Étudiants avec candidature complétée */}
          <div className="opacity-0 animate-fade-in" style={{ animationDelay: "1.4s", animationFillMode: "forwards" }}>
            <CompletedStudentsCard
              students={completedStudents}
              isLoading={isLoadingDashboard}
            />
          </div>
        </div>

        {/* Section analytique */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visualisation 3D */}
          <div className="opacity-0 animate-fade-in" style={{ animationDelay: "1.6s", animationFillMode: "forwards" }}>
            <Card className="h-full transform hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
                  Analytique des accès
                </CardTitle>
                <CardDescription>Visualisation des accès plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center p-4">
                  <canvas 
                    ref={canvasRef} 
                    className="w-full h-48 rounded-md border border-blue-50"
                    width={300}
                    height={200}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistiques d'approbation */}
          <div className="lg:col-span-2 opacity-0 animate-fade-in" style={{ animationDelay: "1.8s", animationFillMode: "forwards" }}>
            <Card className="h-full transform hover:-translate-y-1">
              <CardHeader>
                <CardTitle>Statut d'approbation</CardTitle>
                <CardDescription>Métriques de traitement des demandes d'accès</CardDescription>
              </CardHeader>
              <CardContent>
                {globalStatistics?.approval ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-700">Taux d'approbation</span>
                      <div className="w-2/3 bg-blue-100 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000" 
                          style={{ width: `${globalStatistics.approval.rate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-blue-700">{globalStatistics.approval.rate}%</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-700">Temps de réponse moyen</span>
                      <div className="w-2/3 bg-blue-100 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000" 
                          style={{ width: "65%" }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-blue-700">{globalStatistics.approval.averageResponseTime} jours</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-900">{globalStatistics.approval.approved}</div>
                        <div className="text-xs text-green-600">Approuvées (30j)</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-900">{globalStatistics.approval.rejected}</div>
                        <div className="text-xs text-red-600">Rejetées (30j)</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Activités récentes */}
        {recentActivities && recentActivities.length > 0 && (
          <div className="mt-8 opacity-0 animate-fade-in" style={{ animationDelay: "2s", animationFillMode: "forwards" }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-blue-500" />
                  Changements d'accès récents
                </CardTitle>
                <CardDescription>Dernières {recentActivities.length} actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entité</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentActivities.map((activity) => (
                        <tr key={activity._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {activity.entityName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                            {activity.entityType === 'university' ? 'Université' : 'Entreprise'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              activity.action === 'approved' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {activity.action === 'approved' ? 'Approuvé' : 'Rejeté'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(activity.date).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {activity.admin}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
