"use client"

import { useEffect, useState, useRef, useContext } from "react"
import PropTypes from "prop-types"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import { StudentContext } from "../context/StudentContext" // Garder pour studentData et sToken
import { DashboardContext } from "../context/DashboardContext" // Nouveau contexte pour le dashboard
import {
  Award,
  BookOpen,
  Calendar,
  Clock,
  Download,
  FileText,
  MessageSquare,
  Users,
  CheckCircle,
  ExternalLink,
  Loader2,
  AlertCircle,
  User,
  Mail,
  Phone,
  TrendingUp,
  Target,
  FileCheck,
  GraduationCap,
  Building,
  MapPin,
  Star,
  RefreshCw,
  Plus,
  Eye
} from "lucide-react"
import * as THREE from "three"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

const Card = ({ className, children, ...props }) => (
  <div className={classNames("rounded-lg border shadow-sm bg-white/70 backdrop-blur-sm", className)} {...props}>
    {children}
  </div>
)

Card.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
}

const CardHeader = ({ className, ...props }) => (
  <div className={classNames("flex flex-col space-y-1.5 p-6", className)} {...props} />
)
CardHeader.propTypes = { className: PropTypes.string, children: PropTypes.node }

const CardTitle = ({ className, ...props }) => (
  <h3 className={classNames("text-lg font-semibold leading-none tracking-tight text-blue-900", className)} {...props} />
)
CardTitle.propTypes = { className: PropTypes.string, children: PropTypes.node }

const CardDescription = ({ className, ...props }) => (
  <p className={classNames("text-sm text-blue-700/80", className)} {...props} />
)
CardDescription.propTypes = { className: PropTypes.string, children: PropTypes.node }

const CardContent = ({ className, ...props }) => <div className={classNames("p-6 pt-0", className)} {...props} />
CardContent.propTypes = { className: PropTypes.string, children: PropTypes.node }

const CardFooter = ({ className, ...props }) => (
  <div className={classNames("flex items-center p-6 pt-0", className)} {...props} />
)
CardFooter.propTypes = { className: PropTypes.string, children: PropTypes.node }

const CardProgress = ({ className, label, value, max = 100, showValue = true, color = "bg-blue-600", ...props }) => (
  <div className={classNames("space-y-2", className)} {...props}>
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-blue-800">{label}</span>
      {showValue && <span className="text-sm font-medium text-blue-800">{value}%</span>}
    </div>
    <div className="w-full bg-blue-100 rounded-full h-2.5">
      <div className={`${color} h-2.5 rounded-full transition-all duration-300`} style={{ width: `${(value / max) * 100}%` }}></div>
    </div>
  </div>
)

CardProgress.propTypes = { 
  className: PropTypes.string, 
  label: PropTypes.string.isRequired, 
  value: PropTypes.number.isRequired, 
  max: PropTypes.number, 
  showValue: PropTypes.bool, 
  color: PropTypes.string 
}

// Composant pour les statistiques de candidatures
const ApplicationStats = ({ stats, applications, handleConfirmApplication, getStatusBadge }) => {
  if (!stats) return null

  const successRate = stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0

  return (
    <Card className="border-green-100">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-green-600"/> 
          Candidatures
        </CardTitle>
        <CardDescription>
          {stats.total} candidature{stats.total > 1 ? 's' : ''} soumise{stats.total > 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
            <div className="text-xs text-blue-600">Total</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-900">{stats.accepted}</div>
            <div className="text-xs text-green-600">Acceptées</div>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <div className="text-2xl font-bold text-amber-900">{stats.pending}</div>
            <div className="text-xs text-amber-600">En attente</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-900">{stats.rejected}</div>
            <div className="text-xs text-red-600">Rejetées</div>
          </div>
        </div>
        
        {stats.total > 0 && (
          <CardProgress 
            label="Taux de réussite" 
            value={successRate} 
            color="bg-green-600" 
          />
        )}

        {/* Liste des candidatures récentes */}
        {applications && applications.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Candidatures récentes</h4>
            <div className="space-y-2">
              {applications.slice(0, 3).map((app, index) => (
                <div key={app._id || index} className="flex items-center justify-between p-2 bg-white/50 rounded border">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">{app.offer?.title}</p>
                    <p className="text-xs text-blue-600">{app.offer?.company?.nom}</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(app.status)}
                    {app.status === 'accepted' && !app.confirmed && (
                      <button 
                        onClick={() => handleConfirmApplication(app._id)}
                        className="mt-1 text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                      >
                        Confirmer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

ApplicationStats.propTypes = {
  stats: PropTypes.object,
  applications: PropTypes.array,
  handleConfirmApplication: PropTypes.func.isRequired,
  getStatusBadge: PropTypes.func.isRequired
}

// Composant pour l'indicateur de progression du PFE
const ProgressIndicator = ({ progress }) => {
  if (!progress) return null

  const steps = [
    { key: 'applicationPhase', label: 'Candidatures', icon: FileText },
    { key: 'subjectProposed', label: 'Sujet proposé', icon: Target },
    { key: 'subjectApproved', label: 'Sujet approuvé', icon: CheckCircle },
    { key: 'supervisorAssigned', label: 'Superviseur assigné', icon: User },
    { key: 'projectStarted', label: 'Projet démarré', icon: TrendingUp },
    { key: 'reportsSubmitted', label: 'Rapports soumis', icon: FileCheck },
    { key: 'defenseScheduled', label: 'Soutenance planifiée', icon: Calendar },
    { key: 'projectCompleted', label: 'Projet terminé', icon: GraduationCap }
  ]

  const completedSteps = steps.filter(step => progress[step.key]).length
  const progressPercentage = Math.round((completedSteps / steps.length) * 100)

  return (
    <Card className="border-purple-100">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="h-5 w-5 mr-2 text-purple-600"/> 
          Progression du PFE
        </CardTitle>
        <CardDescription>
          {completedSteps} sur {steps.length} étapes complétées
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CardProgress 
          label="Progression globale" 
          value={progressPercentage} 
          color="bg-purple-600" 
        />
        <div className="mt-4 space-y-2">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isCompleted = progress[step.key]
            const isCurrent = !isCompleted && index > 0 && progress[steps[index - 1]?.key]
            
            return (
              <div key={step.key} className={classNames(
                "flex items-center text-sm p-2 rounded",
                isCompleted ? "bg-green-50 text-green-800" : 
                isCurrent ? "bg-blue-50 text-blue-800" : "text-gray-500"
              )}>
                <Icon className={classNames(
                  "h-4 w-4 mr-2",
                  isCompleted ? "text-green-600" : 
                  isCurrent ? "text-blue-600" : "text-gray-400"
                )} />
                {step.label}
                {isCompleted && <CheckCircle className="h-4 w-4 ml-auto text-green-600" />}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

ProgressIndicator.propTypes = {
  progress: PropTypes.object
}

// Composant principal du tableau de bord
const StudentDashboard = () => {
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Utilisation du contexte étudiant pour les données de base et l'authentification
  const {
    sToken,
    studentData,
    isLoading: isLoadingStudentContext,
  } = useContext(StudentContext)

  // Utilisation du nouveau contexte Dashboard pour les données du tableau de bord
  const {
    dashboardData,
    isLoadingDashboard,
    refreshDashboard,
    confirmApplication
  } = useContext(DashboardContext)

  // Redirection si non connecté
  useEffect(() => {
    if (!isLoadingStudentContext && !sToken) {
      navigate("/student-login")
      toast.error("Veuillez vous connecter d'abord")
    }
  }, [sToken, isLoadingStudentContext, navigate])

  // Effet 3D d'arrière-plan
  useEffect(() => {
    if (!canvasRef.current) return
    
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 300 / 200, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true })
    renderer.setSize(300, 200)
    
    const group = new THREE.Group()
    scene.add(group)

    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const materials = [
      new THREE.MeshBasicMaterial({ color: 0x3b82f6 }),
      new THREE.MeshBasicMaterial({ color: 0x60a5fa }),
      new THREE.MeshBasicMaterial({ color: 0x93c5fd }),
    ]

    for (let i = 0; i < 5; i++) {
      const cube = new THREE.Mesh(geometry, materials[i % materials.length])
      cube.position.x = (Math.random() - 0.5) * 5
      cube.position.y = (Math.random() - 0.5) * 5
      cube.position.z = (Math.random() - 0.5) * 5
      cube.rotation.x = Math.random() * Math.PI
      cube.rotation.y = Math.random() * Math.PI
      cube.scale.setScalar(0.5 + Math.random() * 0.5)
      group.add(cube)
    }

    camera.position.z = 5
    
    const animate = () => {
      requestAnimationFrame(animate)
      group.rotation.x += 0.003
      group.rotation.y += 0.005
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      scene.remove(group)
      materials.forEach((material) => material.dispose())
      geometry.dispose()
      renderer.dispose()
    }
  }, [])

  // Fonction de rafraîchissement
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshDashboard()
      toast.success("Données mises à jour")
    } catch (error) {
      toast.error("Erreur lors de la mise à jour")
    } finally {
      setIsRefreshing(false)
    }
  }

  // Fonction pour confirmer une candidature
  const handleConfirmApplication = async (applicationId) => {
    try {
      await confirmApplication(applicationId)
    } catch (error) {
      console.error("Error confirming application:", error)
    }
  }

  // Fonctions utilitaires
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      const options = { year: "numeric", month: "short", day: "numeric" }
      return new Date(dateString).toLocaleDateString("fr-FR", options)
    } catch { 
      return "Date invalide" 
    }
  }

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A"
    try {
      const options = { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
      return new Date(dateTimeString).toLocaleString("fr-FR", options)
    } catch { 
      return "Date invalide" 
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Approuvé" },
      completed: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Terminé" },
      accepted: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Accepté" },
      confirmed: { bg: "bg-green-100", text: "text-green-700", label: "Confirmé" },
      pending: { bg: "bg-blue-100", text: "text-blue-700", label: "En attente" },
      in_progress: { bg: "bg-blue-100", text: "text-blue-700", label: "En cours" },
      suggested: { bg: "bg-blue-100", text: "text-blue-700", label: "Proposé" },
      upcoming: { bg: "bg-amber-100", text: "text-amber-700", label: "À venir" },
      rejected: { bg: "bg-rose-100", text: "text-rose-700", label: "Rejeté" },
      overdue: { bg: "bg-rose-100", text: "text-rose-700", label: "En retard" },
      scheduled: { bg: "bg-green-100", text: "text-green-700", label: "Planifié" },
      validated: { bg: "bg-green-100", text: "text-green-700", label: "Validé" },
      submitted: { bg: "bg-blue-100", text: "text-blue-700", label: "Soumis" },
      assigned_to_professor: { bg: "bg-purple-100", text: "text-purple-700", label: "Assigné au professeur" }
    }
    
    const config = statusConfig[status?.toLowerCase()] || { bg: "bg-gray-100", text: "text-gray-700", label: status || "N/A" }
    
    return (
      <span className={`px-3 py-1 ${config.bg} ${config.text} text-xs font-medium rounded-full`}>
        {config.label}
      </span>
    )
  }

  const getFileIcon = (type) => {
    const iconConfig = {
      pdf: { icon: FileText, color: "text-red-500" },
      docx: { icon: FileText, color: "text-blue-500" },
      doc: { icon: FileText, color: "text-blue-500" },
      zip: { icon: FileText, color: "text-yellow-500" }
    }
    
    const config = iconConfig[type?.toLowerCase()] || { icon: FileText, color: "text-gray-500" }
    const Icon = config.icon
    
    return <Icon className={`h-5 w-5 ${config.color} flex-shrink-0`} />
  }

  // Calcul de la progression du projet
  const getProjectProgress = () => {
    if (!dashboardData?.project) return 0
    
    const status = dashboardData.project.status
    const progressMap = {
      suggested: 10,
      pending: 25,
      approved: 50,
      assigned_to_professor: 75,
      in_progress: 85,
      completed: 100
    }
    
    return progressMap[status] || 0
  }

  // Rendu conditionnel pour le chargement
  if (isLoadingStudentContext || isLoadingDashboard) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="ml-4 text-lg text-blue-800">Chargement du tableau de bord...</p>
      </div>
    )
  }

  // Rendu conditionnel pour les erreurs
  if (!dashboardData) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
        <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold text-amber-800">Aucune donnée disponible</h2>
        <p className="text-amber-700 text-center max-w-md mb-4">
          Impossible de récupérer les informations du tableau de bord pour le moment.
        </p>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Réessayer
        </button>
      </div>
    )
  }

  const { studentInfo, project, professor, applications, activities, grades, progress, reports, defense } = dashboardData

  return (
    <div className="p-6 relative bg-gradient-to-b from-blue-50 to-white min-h-screen">
      {/* Formes d'arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="shape-blob shape-blob-1 absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-100/30 blur-xl opacity-50 animate-pulse-slow"></div>
        <div className="shape-blob shape-blob-2 absolute bottom-0 left-0 w-96 h-96 rounded-full bg-blue-200/20 blur-xl opacity-50 animate-pulse-slow delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* En-tête */}
        <header className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-blue-900"
              >
                Tableau de bord étudiant
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-blue-700 mt-1"
              >
                Bienvenue, {studentInfo?.name || studentData?.name || "Étudiant"} ! Voici votre aperçu PFE.
              </motion.p>
              {studentInfo?.universityName && (
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <Building className="h-4 w-4 mr-1" />
                  {studentInfo.universityName} - {studentInfo.specialization} ({studentInfo.currentClass})
                </p>
              )}
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
              title="Actualiser les données"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Grille de contenu principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Colonne de gauche (Projet et Professeur) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Carte aperçu du projet */}
            {project ? (
              <Card className="border-blue-100">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                      <CardDescription className="mt-1">{project.description}</CardDescription>
                    </div>
                    {getStatusBadge(project.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-blue-800 mb-3">Détails du projet</h4>
                      <div className="space-y-4">
                        <CardProgress 
                          label="Progression globale" 
                          value={getProjectProgress()} 
                          color="bg-blue-600" 
                        />
                        <div className="flex justify-between text-sm">
                          <div>
                            <p className="text-blue-800 font-medium">Date de début</p>
                            <p className="text-blue-600">{formatDate(project.startDate)}</p>
                          </div>
                          {project.estimatedDuration && (
                            <div>
                              <p className="text-blue-800 font-medium">Durée estimée</p>
                              <p className="text-blue-600">{project.estimatedDuration} mois</p>
                            </div>
                          )}
                        </div>
                        {project.technologies?.length > 0 && (
                          <div>
                            <p className="text-sm text-blue-800 font-medium mb-2">Technologies</p>
                            <div className="flex flex-wrap gap-2">
                              {project.technologies.map((tech, index) => (
                                <span key={index} className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {project.company && (
                          <div>
                            <p className="text-sm text-blue-800 font-medium">Entreprise</p>
                            <p className="text-blue-600 flex items-center">
                              <Building className="h-4 w-4 mr-1" />
                              {project.company}
                              {project.companyDetails?.ville && ` - ${project.companyDetails.ville}`}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Détails du superviseur */}
                    {professor ? (
                      <div>
                        <h4 className="text-sm font-medium text-blue-800 mb-3">Superviseur assigné</h4>
                        <div className="flex items-start gap-4 p-4 bg-white/80 rounded-lg border border-blue-100">
                          <User className="w-12 h-12 text-blue-500 flex-shrink-0 mt-1" />
                          <div>
                            <h5 className="text-blue-900 font-medium">{professor.name}</h5>
                            {professor.email && (
                              <a href={`mailto:${professor.email}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                <Mail className="h-4 w-4"/> {professor.email}
                              </a>
                            )}
                            {professor.profile?.phone && (
                              <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                                <Phone className="h-4 w-4"/> {professor.profile.phone}
                              </p>
                            )}
                            {professor.department && (
                              <p className="text-sm text-blue-600 mt-1">
                                Département: {professor.department}
                              </p>
                            )}
                            {professor.specializations?.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-blue-700 font-medium">Spécialisations:</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {professor.specializations.map((spec, index) => (
                                    <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
                                      {spec}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : project.status === "approved" ? (
                      <div>
                        <h4 className="text-sm font-medium text-blue-800 mb-3">Assignation de superviseur</h4>
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                          <AlertCircle className="inline h-4 w-4 mr-1"/> 
                          Votre projet est approuvé. L'assignation du superviseur est en cours.
                        </div>
                      </div>
                    ) : null}
                  </div>
                  
                  {/* Section feedback */}
                  {project.feedback && (
                    <div className="mt-6 pt-4 border-t border-blue-100">
                      <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2"/> Dernier feedback
                      </h4>
                      <p className="text-sm text-blue-700 bg-blue-50 p-3 rounded-md border border-blue-100 whitespace-pre-wrap">
                        {project.feedback}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-amber-100 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-amber-900 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2"/> Aucun projet soumis
                  </CardTitle>
                  <CardDescription className="text-amber-800">
                    Vous n'avez pas encore soumis votre proposition de projet PFE.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-amber-700 mb-4">
                    Veuillez soumettre votre proposition de projet via le portail dédié.
                  </p>
                  <button className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors">
                    <Plus className="h-4 w-4 mr-2" />
                    Proposer un sujet
                  </button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Colonne de droite (Activités, Notes) */}
          <div className="space-y-6">
            {/* Indicateur de progression */}
            <ProgressIndicator progress={progress} />

            {/* Statistiques de candidatures */}
            <ApplicationStats 
              stats={applications?.stats} 
              applications={applications?.list} 
              handleConfirmApplication={handleConfirmApplication} 
              getStatusBadge={getStatusBadge} 
            />

            {/* Activités récentes - SEULEMENT si des données existent */}
            {activities && activities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-600"/> Activité récente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {activities.map((activity, index) => (
                      <li key={activity._id || index} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 mr-2 text-emerald-500 flex-shrink-0" />
                        <span className="text-blue-800 flex-grow">{activity.action}</span>
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {formatDateTime(activity.date)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Aperçu des notes - SEULEMENT si des notes existent */}
            {grades && (grades.proposal !== null || grades.progressReports?.length > 0 || grades.finalReport || grades.defense || grades.overall !== null) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2 text-blue-600"/> Aperçu des notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {grades.proposal !== null && (
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <span className="text-sm text-blue-700">Proposition</span>
                        <span className="text-lg font-bold text-blue-900">
                          {grades.proposal}/20
                        </span>
                      </div>
                    )}
                    
                    {grades.progressReports?.length > 0 && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-green-700">Rapports de progression</span>
                          <span className="text-lg font-bold text-green-900">
                            {grades.progressReports.length} soumis
                          </span>
                        </div>
                        <div className="space-y-1">
                          {grades.progressReports.map((report, index) => (
                            <div key={index} className="flex justify-between text-xs text-green-600">
                              <span>{report.type}</span>
                              <span>{report.grade}/20</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {grades.finalReport && (
                      <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-indigo-700">Rapport final</span>
                          <span className="text-lg font-bold text-indigo-900">
                            {grades.finalReport.grade}/20
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {grades.defense && (
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-emerald-700">Soutenance</span>
                          <div className="text-right">
                            <div className="text-lg font-bold text-emerald-900">
                              {grades.defense.grade}/20
                            </div>
                            <div className="text-xs text-emerald-600">
                              {grades.defense.mention}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {grades.overall !== null && (
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-purple-700">Moyenne générale</span>
                          <div className="flex items-center">
                            <span className="text-lg font-bold text-purple-900 mr-2">
                              {grades.overall.toFixed(1)}/20
                            </span>
                            <Star className="h-4 w-4 text-yellow-500" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rapports soumis - SEULEMENT si des rapports existent */}
            {reports && reports.list && reports.list.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600"/> Rapports soumis
                  </CardTitle>
                  <CardDescription>
                    {reports.count} rapport{reports.count > 1 ? 's' : ''} soumis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reports.list.slice(0, 3).map((report, index) => (
                      <div key={report._id || index} className="flex items-center justify-between p-2 bg-white/50 rounded border">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900">{report.title || `Rapport ${report.type || 'de progression'}`}</p>
                          <p className="text-xs text-blue-600">Soumis le {formatDate(report.submittedAt)}</p>
                          {report.grade && (
                            <p className="text-xs text-green-600">Note: {report.grade}/20</p>
                          )}
                        </div>
                        <div className="text-right">
                          {getStatusBadge(report.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                  {reports.count > 3 && (
                    <div className="mt-3 text-center">
                      <button className="text-sm text-blue-600 hover:underline flex items-center mx-auto">
                        <Eye className="h-4 w-4 mr-1" />
                        Voir tous les rapports
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Canvas 3D caché pour l'effet d'arrière-plan */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}

export default StudentDashboard
