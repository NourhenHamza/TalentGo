import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const ProjectStatusChart = () => {
  const [statusData, setStatusData] = useState({
    statusDistribution: {},
    monthlyData: {},
    specialityData: {},
    totalProjects: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChart, setActiveChart] = useState('monthly'); // 'monthly', 'distribution', 'speciality'

  // Couleurs pour les différents statuts
  const statusColors = {
    suggested: '#fbbf24', // jaune
    pending: '#f59e0b',   // orange
    approved: '#10b981',  // vert
    rejected: '#ef4444'   // rouge
  };

  // Récupérer les données de statut des projets
  useEffect(() => {
    const fetchStatusData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer le token et l'ID de l'université
        const token = localStorage.getItem('aToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        let universityId;
        try {
          const decoded = jwtDecode(token);
          universityId = decoded.id;
          if (!universityId) {
            throw new Error('University ID not found in token');
          }
        } catch (decodeError) {
          throw new Error('Invalid token format');
        }

        // Appel API pour récupérer les données de statut
        const response = await fetch(`http://localhost:4000/api/university-dashboard/dashboard/projects/status-analytics?universityId=${universityId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log('Project status analytics data:', data);
        setStatusData(data);
      } catch (err) {
        console.error('Error fetching project status data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStatusData();
  }, []);

  // Formater les données mensuelles pour le graphique en courbe
  const formatMonthlyData = () => {
    const months = Object.keys(statusData.monthlyData || {});
    return months.map(month => ({
      month,
      ...statusData.monthlyData[month]
    }));
  };

  // Formater les données de distribution pour le graphique en barres
  const formatDistributionData = () => {
    return Object.entries(statusData.statusDistribution || {}).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      fill: statusColors[status]
    }));
  };

  // Formater les données de spécialité pour le graphique en secteurs
  const formatSpecialityData = () => {
    const specialities = Object.keys(statusData.specialityData || {});
    return specialities.map(speciality => {
      const total = Object.values(statusData.specialityData[speciality]).reduce((sum, count) => sum + count, 0);
      return {
        name: speciality,
        value: total,
        fill: `hsl(${Math.random() * 360}, 70%, 50%)`
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 text-sm p-4 border border-red-200 rounded-lg bg-red-50">
          Erreur lors du chargement des données: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Boutons de navigation */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setActiveChart('monthly')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            activeChart === 'monthly' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Évolution mensuelle
        </button>
        <button
          onClick={() => setActiveChart('distribution')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            activeChart === 'distribution' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Distribution des statuts
        </button>
        <button
          onClick={() => setActiveChart('speciality')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            activeChart === 'speciality' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Par spécialité
        </button>
      </div>

      {/* Graphiques */}
      <div className="h-64">
        {activeChart === 'monthly' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formatMonthlyData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="suggested" 
                stroke={statusColors.suggested} 
                strokeWidth={2}
                name="Suggérés"
              />
              <Line 
                type="monotone" 
                dataKey="pending" 
                stroke={statusColors.pending} 
                strokeWidth={2}
                name="En attente"
              />
              <Line 
                type="monotone" 
                dataKey="approved" 
                stroke={statusColors.approved} 
                strokeWidth={2}
                name="Approuvés"
              />
              <Line 
                type="monotone" 
                dataKey="rejected" 
                stroke={statusColors.rejected} 
                strokeWidth={2}
                name="Rejetés"
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeChart === 'distribution' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formatDistributionData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeChart === 'speciality' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formatSpecialityData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {formatSpecialityData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Statistiques résumées */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-2 bg-yellow-50 rounded-lg">
          <div className="text-lg font-semibold text-yellow-700">
            {statusData.statusDistribution?.suggested || 0}
          </div>
          <div className="text-xs text-yellow-600">Suggérés</div>
        </div>
        <div className="p-2 bg-orange-50 rounded-lg">
          <div className="text-lg font-semibold text-orange-700">
            {statusData.statusDistribution?.pending || 0}
          </div>
          <div className="text-xs text-orange-600">En attente</div>
        </div>
        <div className="p-2 bg-green-50 rounded-lg">
          <div className="text-lg font-semibold text-green-700">
            {statusData.statusDistribution?.approved || 0}
          </div>
          <div className="text-xs text-green-600">Approuvés</div>
        </div>
        <div className="p-2 bg-red-50 rounded-lg">
          <div className="text-lg font-semibold text-red-700">
            {statusData.statusDistribution?.rejected || 0}
          </div>
          <div className="text-xs text-red-600">Rejetés</div>
        </div>
      </div>
    </div>
  );
};

export default ProjectStatusChart;

