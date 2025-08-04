import { jwtDecode } from "jwt-decode";
import {
  Activity,
  BarChart3,
  BookOpen,
  Calendar,
  ClipboardList,
  TrendingUp,
  Users
} from "lucide-react";
import { Component, useEffect, useState } from "react";
import ProjectStatusChart from './ProjectStatusChart';

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-red-500 text-lg p-4 border border-red-200 rounded-lg bg-red-50">
            Rendering error: {this.state.error?.message || 'Unknown error'}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Dashboard = () => {
  const [dashData, setDashData] = useState({
    Professors: 0,
    Students: 0,
    Projects: 0,
    DefensesScheduled: 0,
    ProfessorsNew: 0,
    StudentsNew: 0,
    ProjectsNew: 0,
    DefensesUpcoming: 0,
    ProjectCompletion: 0,
    DefensePreparation: 0,
  });
  const [upcomingDefenses, setUpcomingDefenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get token from localStorage
        const token = localStorage.getItem('aToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Decode token to get universityId
        let universityId;
        try {
          const decoded = jwtDecode(token);
          universityId = decoded.id;
          console.log('Decoded token:', decoded);
          if (!universityId) {
            throw new Error('University ID not found in token');
          }
        } catch (decodeError) {
          throw new Error('Invalid token format');
        }

        // Fetch dashboard stats
        const statsResponse = await fetch(`http://localhost:4000/api/university-dashboard/dashboard?universityId=${universityId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!statsResponse.ok) {
          const errorData = await statsResponse.json();
          throw new Error(`HTTP error! status: ${statsResponse.status}, message: ${errorData.message || 'Unknown error'}`);
        }

        const statsData = await statsResponse.json();
        console.log('Dashboard stats response:', statsData);
        // Ensure all fields have default values
        setDashData({
          Professors: statsData.Professors || 0,
          Students: statsData.Students || 0,
          Projects: statsData.Projects || 0,
          DefensesScheduled: statsData.DefensesScheduled || 0,
          ProfessorsNew: statsData.ProfessorsNew || 0,
          StudentsNew: statsData.StudentsNew || 0,
          ProjectsNew: statsData.ProjectsNew || 0,
          DefensesUpcoming: statsData.DefensesUpcoming || 0,
          ProjectCompletion: statsData.ProjectCompletion || 0,
          DefensePreparation: statsData.DefensePreparation || 0,
        });

        // Fetch upcoming defenses
        const defensesResponse = await fetch(`http://localhost:4000/api/university-dashboard/dashboard/defenses/upcoming?universityId=${universityId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!defensesResponse.ok) {
          const errorData = await defensesResponse.json();
          throw new Error(`HTTP error! status: ${defensesResponse.status}, message: ${errorData.message || 'Unknown error'}`);
        }

        const defensesData = await defensesResponse.json();
        console.log('Upcoming defenses response:', defensesData);

        // Ensure defensesData is always an array
        if (Array.isArray(defensesData)) {
          setUpcomingDefenses(defensesData);
        } else if (defensesData.data && Array.isArray(defensesData.data)) {
          setUpcomingDefenses(defensesData.data);
        } else {
          setUpcomingDefenses([]);
          console.warn('Unexpected defenses data format:', defensesData);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
        setUpcomingDefenses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Log state changes
  useEffect(() => {
    console.log('Current dashData:', dashData);
    console.log('Current upcomingDefenses:', upcomingDefenses);
  }, [dashData, upcomingDefenses]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-lg p-4 border border-red-200 rounded-lg bg-red-50">
          Error loading dashboard: {error}
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-6 relative bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-100/30 blur-xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-blue-200/20 blur-xl animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-indigo-100/20 blur-xl animate-pulse" style={{ animationDelay: "2s" }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-blue-800 mb-2">
              PFE Management Dashboard
            </h1>
            <p className="text-blue-600">
              Overview of projects, students, and defenses
            </p>
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {renderStatCard({
              icon: <Users className="mr-2 h-5 w-5 text-blue-500" />,
              title: "Professors",
              description: "Total registered professors",
              value: dashData.Professors || 0,
              trend: `+${dashData.ProfessorsNew || 0} this week`,
              trendIcon: <TrendingUp className="inline h-4 w-4 mr-1" />,
              bgIcon: <Users className="h-8 w-8 text-blue-600" />,
              delay: "0.4s"
            })}

            {renderStatCard({
              icon: <BookOpen className="mr-2 h-5 w-5 text-blue-500" />,
              title: "Students",
              description: "Registered students",
              value: dashData.Students || 0,
              trend: `+${dashData.StudentsNew || 0} this semester`,
              trendIcon: <Activity className="inline h-4 w-4 mr-1" />,
              bgIcon: <BookOpen className="h-8 w-8 text-blue-600" />,
              delay: "0.6s"
            })}

            {renderStatCard({
              icon: <ClipboardList className="mr-2 h-5 w-5 text-blue-500" />,
              title: "Projects",
              description: "Active PFE projects",
              value: dashData.Projects || 0,
              trend: `+${dashData.ProjectsNew || 0} this month`,
              trendIcon: <TrendingUp className="inline h-4 w-4 mr-1" />,
              bgIcon: <ClipboardList className="h-8 w-8 text-blue-600" />,
              delay: "0.8s"
            })}

            {renderStatCard({
              icon: <Calendar className="mr-2 h-5 w-5 text-blue-500" />,
              title: "Defenses",
              description: "Scheduled defenses",
              value: dashData.DefensesScheduled || 0,
              trend: `${dashData.DefensesUpcoming || 0} upcoming this week`,
              trendIcon: <Activity className="inline h-4 w-4 mr-1" />,
              bgIcon: <Calendar className="h-8 w-8 text-blue-600" />,
              delay: "1s"
            })}
          </div>

          {/* Analytics Section */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Status Analytics */}
            <div>
              <div className="rounded-xl overflow-hidden border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 bg-white p-5 h-full transform hover:-translate-y-1">
                <div className="pb-2">
                  <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
                    Project Status Analytics
                  </h3>
                  <p className="text-sm text-gray-500">Évolution et distribution des statuts de projets</p>
                </div>
                <div className="mt-4">
                  <ProjectStatusChart />
                </div>
              </div>
            </div>

            {/* Defense Schedule Overview */}
            <div>
              <div className="rounded-xl overflow-hidden border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 bg-white h-full transform hover:-translate-y-1">
                <div className="p-5">
                  <div className="pb-2">
                    <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                      <Calendar className="mr-2 h-5 w-5 text-blue-500" />
                      Defense Schedule Overview
                    </h3>
                    <p className="text-sm text-gray-500">Upcoming defense sessions and project completion rates</p>
                  </div>
                  
                  <div className="mt-6 space-y-6">
                    {/* Progress Bars Section */}
                    <div className="space-y-4">
                      {renderProgressBar("Project Completion", dashData.ProjectCompletion || 0, 0)}
                      {renderProgressBar("Defense Preparation", dashData.DefensePreparation || 0, 0.3)}
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-700">{dashData.DefensesScheduled || 0}</div>
                        <div className="text-sm text-blue-600">Scheduled</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-700">{dashData.DefensesUpcoming || 0}</div>
                        <div className="text-sm text-green-600">This Week</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button className="flex-1 px-4 py-2 border border-blue-200 text-blue-700 rounded-md hover:bg-blue-50 transition-colors text-sm">
                        View Defense Calendar
                      </button>
                      <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:opacity-90 transition-opacity text-sm">
                        Schedule Defense
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Defenses Section */}
          <div className="mt-8">
            <div className="rounded-xl overflow-hidden border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 bg-white p-5">
              <div className="pb-2">
                <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-blue-500" />
                  Upcoming Defense Sessions
                </h3>
                <p className="text-sm text-gray-500">Next scheduled defenses</p>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supervisor</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {upcomingDefenses.length > 0 ? (
                      upcomingDefenses.map((defense, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{defense.studentName || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{defense.projectTitle || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{defense.supervisorName || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {defense.date ? new Date(defense.date).toLocaleString() : 'TBD'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${defense.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                defense.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                defense.status === 'completed' ? 'bg-green-100 text-green-800' :
                                defense.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'}`}>
                              {defense.status || 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                          No upcoming defenses scheduled
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {upcomingDefenses.length > 0 && (
                <div className="mt-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View All Defenses →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

// Helper component for stat cards
const renderStatCard = ({ icon, title, description, value, trend, trendIcon, bgIcon, delay }) => (
  <div style={{ opacity: 1, animation: 'none' }}>
    <div className="rounded-xl overflow-hidden border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 bg-white p-5 h-full transform hover:-translate-y-1">
      <div className="pb-2">
        <h3 className="text-lg font-semibold text-blue-800 flex items-center">
          {icon}
          {title}
        </h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-blue-700">{value || 0}</p>
            <p className="text-sm text-blue-500 mt-1">
              {trendIcon}
              {trend}
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            {bgIcon}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Helper component for progress bars
const renderProgressBar = (label, value, animationDelay) => (
  <div className="flex justify-between items-center">
    <span className="text-sm font-medium text-blue-700">{label}</span>
    <div className="w-2/3 bg-blue-100 rounded-full h-2.5">
      <div 
        className="bg-blue-600 h-2.5 rounded-full" 
        style={{ 
          width: `${value || 0}%`, 
          animation: `growWidth 2s ease-in-out ${animationDelay}s both` 
        }}
      ></div>
    </div>
    <span className="text-sm font-medium text-blue-700">{value || 0}%</span>
  </div>
);

export default Dashboard;

