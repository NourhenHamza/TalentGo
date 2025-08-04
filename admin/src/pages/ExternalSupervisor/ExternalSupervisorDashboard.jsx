import {
  BookOpen,
  Briefcase,
  Clock,
  FileText,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Star,
  Users
} from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { ExternalSupervisorContext } from "../../context/ExternalSupervisorContext";
 
const ExternalSupervisorDashboard = () => {
  const { currentRole, eToken, rToken, logout } = useContext(ExternalSupervisorContext);
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Données simulées pour le dashboard
  const [dashData] = useState({
    students: 8,
    projects: 12,
    evaluations: 24,
    meetings: 5,
    pendingTasks: 3,
    messages: 7
  });

  // Animation 3D
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

    const group = new THREE.Group();
    scene.add(group);

    // Création de formes géométriques
    const geometries = [
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.SphereGeometry(0.7, 16, 16),
      new THREE.ConeGeometry(0.7, 1, 16)
    ];

    const materials = [
      new THREE.MeshBasicMaterial({ color: 0x3b82f6 }),
      new THREE.MeshBasicMaterial({ color: 0x60a5fa }),
      new THREE.MeshBasicMaterial({ color: 0x93c5fd }),
    ];

    // Ajout de formes à la scène
    for (let i = 0; i < 6; i++) {
      const geometry = geometries[i % geometries.length];
      const shape = new THREE.Mesh(geometry, materials[i % materials.length]);
      shape.position.x = (Math.random() - 0.5) * 5;
      shape.position.y = (Math.random() - 0.5) * 5;
      shape.position.z = (Math.random() - 0.5) * 5;
      shape.rotation.x = Math.random() * Math.PI;
      shape.rotation.y = Math.random() * Math.PI;
      shape.scale.setScalar(0.5 + Math.random() * 0.5);
      group.add(shape);
    }

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);
      group.rotation.x += 0.003;
      group.rotation.y += 0.005;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      scene.remove(group);
      materials.forEach(material => material.dispose());
      geometries.forEach(geometry => geometry.dispose());
      renderer.dispose();
    };
  }, []);

  // Déconnexion
  const handleLogout = () => {
    logout();
    navigate("/external-supervisor-login");
  };

  // Dashboard pour Encadreur
  const SupervisorView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Étudiants encadrés */}
      <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-800 flex items-center">
              <Users className="mr-2 h-5 w-5 text-blue-500" />
              Étudiants encadrés
            </h3>
            <p className="text-gray-500 text-sm">Nombre d'étudiants sous votre supervision</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-blue-700 mt-4">{dashData.students}</p>
      </div>

      {/* Projets en cours */}
      <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-800 flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-blue-500" />
              Projets en cours
            </h3>
            <p className="text-gray-500 text-sm">Projets PFE que vous supervisez</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <BookOpen className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-blue-700 mt-4">{dashData.projects}</p>
      </div>

      {/* Évaluations à faire */}
      <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-800 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-blue-500" />
              Évaluations
            </h3>
            <p className="text-gray-500 text-sm">Rapports à évaluer</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-blue-700 mt-4">{dashData.evaluations}</p>
      </div>

      {/* Visualisation 3D */}
      <div className="lg:col-span-2 rounded-xl border border-blue-100 bg-white p-6 shadow-sm hover:shadow-md transition-all">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Activités des étudiants</h3>
        <div className="flex justify-center">
          <canvas 
            ref={canvasRef} 
            className="w-full h-64 rounded-md border border-blue-50"
            width={300}
            height={200}
          />
        </div>
      </div>

      {/* Tâches en attente */}
      <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-800 flex items-center">
              <Clock className="mr-2 h-5 w-5 text-blue-500" />
              Tâches en attente
            </h3>
            <p className="text-gray-500 text-sm">Actions requises</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-blue-700 mt-4">{dashData.pendingTasks}</p>
      </div>
    </div>
  );

  // Dashboard pour Recruteur
  const RecruiterView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Profils à évaluer */}
      <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-800 flex items-center">
              <GraduationCap className="mr-2 h-5 w-5 text-blue-500" />
              Profils étudiants
            </h3>
            <p className="text-gray-500 text-sm">Profils à évaluer</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <GraduationCap className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-blue-700 mt-4">{dashData.students + 15}</p>
      </div>

      {/* Opportunités */}
      <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-800 flex items-center">
              <Briefcase className="mr-2 h-5 w-5 text-blue-500" />
              Opportunités
            </h3>
            <p className="text-gray-500 text-sm">Postes à pourvoir</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <Briefcase className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-blue-700 mt-4">{dashData.projects}</p>
      </div>

      {/* Candidatures */}
      <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-800 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-blue-500" />
              Candidatures
            </h3>
            <p className="text-gray-500 text-sm">À traiter</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-blue-700 mt-4">{dashData.evaluations}</p>
      </div>

      {/* Visualisation 3D */}
      <div className="lg:col-span-2 rounded-xl border border-blue-100 bg-white p-6 shadow-sm hover:shadow-md transition-all">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Statistiques des candidats</h3>
        <div className="flex justify-center">
          <canvas 
            ref={canvasRef} 
            className="w-full h-64 rounded-md border border-blue-50"
            width={300}
            height={200}
          />
        </div>
      </div>

      {/* Entretiens */}
      <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-800 flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-blue-500" />
              Entretiens
            </h3>
            <p className="text-gray-500 text-sm">Planifiés cette semaine</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <MessageSquare className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-blue-700 mt-4">{dashData.meetings}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* En-tête */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-blue-800">
              {currentRole === "Encadreur" ? "Tableau de bord Encadrement" : "Tableau de bord Recrutement"}
            </h1>
            <p className="text-blue-600">
              {currentRole === "Encadreur" 
                ? "Gestion des projets et suivi des étudiants" 
                : "Gestion des candidatures et recrutement"}
            </p>
          </div>
           
        </div>

        {/* Contenu principal */}
        {currentRole === "Encadreur" ? <SupervisorView /> : <RecruiterView />}

        {/* Menu de navigation */}
        <div className="mt-8 bg-white rounded-xl border border-blue-100 p-4 shadow-sm">
          <div className="flex overflow-x-auto space-x-4">
            <button className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg whitespace-nowrap">
              <LayoutDashboard className="mr-2 h-5 w-5" />
              Tableau de bord
            </button>
            <button className="flex items-center px-4 py-2 hover:bg-blue-50 text-blue-700 rounded-lg whitespace-nowrap">
              <Users className="mr-2 h-5 w-5" />
              {currentRole === "Encadreur" ? "Étudiants" : "Candidats"}
            </button>
            <button className="flex items-center px-4 py-2 hover:bg-blue-50 text-blue-700 rounded-lg whitespace-nowrap">
              <BookOpen className="mr-2 h-5 w-5" />
              {currentRole === "Encadreur" ? "Projets" : "Offres"}
            </button>
            <button className="flex items-center px-4 py-2 hover:bg-blue-50 text-blue-700 rounded-lg whitespace-nowrap">
              <MessageSquare className="mr-2 h-5 w-5" />
              Messages
            </button>
            <button className="flex items-center px-4 py-2 hover:bg-blue-50 text-blue-700 rounded-lg whitespace-nowrap">
              <Star className="mr-2 h-5 w-5" />
              Favoris
            </button>
            <button className="flex items-center px-4 py-2 hover:bg-blue-50 text-blue-700 rounded-lg whitespace-nowrap">
              <Settings className="mr-2 h-5 w-5" />
              Paramètres
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalSupervisorDashboard;