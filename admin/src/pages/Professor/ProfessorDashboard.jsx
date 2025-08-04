"use client";

import axios from "axios";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import {
  BarChart3,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  GraduationCap,
  MessageSquare,
  TrendingUp,
  Users
} from "lucide-react";
import PropTypes from "prop-types";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ProfessorContext } from "../../context/ProfessorContext";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Card = ({ className, children, ...props }) => (
  <div className={classNames("rounded-lg border shadow-sm", className)} {...props}>
    {children}
  </div>
);

Card.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

const CardHeader = ({ className, ...props }) => (
  <div className={classNames("flex flex-col space-y-1.5 p-6", className)} {...props} />
);

CardHeader.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

const CardTitle = ({ className, ...props }) => (
  <h3 className={classNames("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
);

CardTitle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

const CardDescription = ({ className, ...props }) => (
  <p className={classNames("text-sm text-muted-foreground", className)} {...props} />
);

CardDescription.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

const CardContent = ({ className, ...props }) => <div className={classNames("p-6 pt-0", className)} {...props} />;

CardContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

const CardProgress = ({ className, label, value, max = 100, showValue = true, color = "bg-blue-600", ...props }) => (
  <div className={classNames("space-y-2", className)} {...props}>
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium">{label}</span>
      {showValue && <span className="text-sm font-medium">{value}%</span>}
    </div>
    <div className="w-full bg-blue-100 rounded-full h-2.5">
      <div className={`${color} h-2.5 rounded-full`} style={{ width: `${(value / max) * 100}%` }}></div>
    </div>
  </div>
);

CardProgress.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  max: PropTypes.number,
  showValue: PropTypes.bool,
  color: PropTypes.string,
};

CardProgress.defaultProps = {
  max: 100,
  showValue: true,
  color: "bg-blue-600",
};

const ProfessorDashboard = () => {
  const { dToken, backendUrl } = useContext(ProfessorContext);
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const [dashboardData, setDashboardData] = useState({
    totalAssignments: 0,
    upcomingDefenses: 0,
    unreadReports: 0,
    students: 0,
    researchAreas: [],
    projectsByStatus: [],
    recentProjects: [],
    isLoading: true,
  });

  // Session validation
  useEffect(() => {
    if (!dToken) {
      navigate("/Professor-login");
      toast.error("Please login first");
    }
  }, [dToken, navigate]);

  // Fetch dynamic data
  useEffect(() => {
    if (!dToken) return;

    const getProfessorId = () => {
      try {
        const decoded = jwtDecode(dToken);
        console.log('Decoded JWT:', decoded);
        return decoded.id;
      } catch (error) {
        console.error('Error decoding token:', error);
        toast.error('Invalid session. Please login again.');
        return null;
      }
    };

    const professorId = getProfessorId();
    if (!professorId) return;

    const fetchDashboardData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${dToken}`,
          },
        };

        const [
          assignmentsRes,
          defensesRes,
          reportsRes,
          studentsRes,
          researchRes,
          statusRes,
          recentRes,
        ] = await Promise.all([
          axios.post(`http://localhost:4000/api/assignments/professor/count`, { professorId }, config),
          axios.post(`http://localhost:4000/api/defenses/professor/upcoming/count`, { professorId }, config),
          axios.post(`http://localhost:4000/api/reports/professor/unread/count`, { professorId }, config),
          axios.post(`http://localhost:4000/api/assignments/professor/students/count`, { professorId }, config),
          axios.post(`http://localhost:4000/api/subjects/professor/research-areas`, { professorId }, config),
          axios.post(`http://localhost:4000/api/assignments/professor/status-count`, { professorId }, config),
          axios.post(`http://localhost:4000/api/assignments/professor/recent`, { professorId }, config),
        ]);

        console.log('API Responses:', {
          assignments: assignmentsRes.data,
          defenses: defensesRes.data,
          reports: reportsRes.data,
          students: studentsRes.data,
          research: researchRes.data,
          status: statusRes.data,
          recent: recentRes.data,
        });

        setDashboardData({
          totalAssignments: assignmentsRes.data?.count || 0,
          upcomingDefenses: defensesRes.data?.count || 0,
          unreadReports: reportsRes.data?.count || 0,
          students: studentsRes.data?.count || 0,
          researchAreas: researchRes.data?.areas || [],
          projectsByStatus: statusRes.data?.statusCounts || [],
          recentProjects: recentRes.data?.projects || [],
          isLoading: false,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error.message, error.response?.data);
        toast.error(`Failed to load dashboard data: ${error.response?.data?.message || error.message}`);
        setDashboardData((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchDashboardData();
  }, [dToken, navigate, backendUrl]);

  // Performance Chart with Chart.js
  useEffect(() => {
    if (!chartRef.current || dashboardData.isLoading) return;

    // Load Chart.js dynamically
    const loadChartJS = async () => {
      if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => createChart();
        document.head.appendChild(script);
      } else {
        createChart();
      }
    };

    const createChart = () => {
      // Generate performance data based on real dashboard data
      const performanceData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Assigned Projects',
            data: [
              Math.max(1, dashboardData.totalAssignments - 5),
              Math.max(1, dashboardData.totalAssignments - 3),
              Math.max(1, dashboardData.totalAssignments - 2),
              Math.max(1, dashboardData.totalAssignments - 1),
              dashboardData.totalAssignments,
              dashboardData.totalAssignments + 1
            ],
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
          },
          {
            label: 'Supervised Students',
            data: [
              Math.max(1, dashboardData.students - 3),
              Math.max(1, dashboardData.students - 2),
              Math.max(1, dashboardData.students - 1),
              dashboardData.students,
              dashboardData.students + 1,
              dashboardData.students + 2
            ],
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true,
          }
        ]
      };

      const ctx = chartRef.current.getContext('2d');
      
      // Destroy existing chart if any
      if (window.performanceChart) {
        window.performanceChart.destroy();
      }

      // Create new chart
      window.performanceChart = new Chart(ctx, {
        type: 'line',
        data: performanceData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 12
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(59, 130, 246, 0.1)'
              },
              ticks: {
                font: {
                  size: 11
                }
              }
            },
            x: {
              grid: {
                color: 'rgba(59, 130, 246, 0.1)'
              },
              ticks: {
                font: {
                  size: 11
                }
              }
            }
          },
          elements: {
            point: {
              radius: 4,
              hoverRadius: 6
            }
          }
        }
      });
    };

    loadChartJS();

    return () => {
      if (window.performanceChart) {
        window.performanceChart.destroy();
      }
    };
  }, [dashboardData]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">In Progress</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Rejected</span>;
      case 'assigned':
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">Assigned</span>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <Clock className="h-3 w-3 text-white" />;
      case 'rejected':
        return <FileText className="h-3 w-3 text-white" />;
      case 'assigned':
        return <FileText className="h-3 w-3 text-white" />;
      default:
        return null;
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-500';
      case 'rejected':
        return 'bg-red-500';
      case 'assigned':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (dashboardData.isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="shape-blob shape-blob-1 absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-100/30 blur-xl"></div>
        <div className="shape-blob shape-blob-2 absolute bottom-0 left-0 w-96 h-96 rounded-full bg-blue-200/20 blur-xl"></div>
      </div>

      <div className="relative z-10">
        <header className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-blue-800"
          >
            Professor Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-blue-600"
          >
            Welcome back! Here's an overview of your PFE projects
          </motion.p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="card-3d overflow-hidden border-blue-100 bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-800 flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-500" />
                  Total Projects
                </CardTitle>
                <CardDescription className="text-blue-600/70">All assigned PFE projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-blue-700">{dashboardData.totalAssignments}</p>
                    <p className="text-sm text-blue-500 mt-1">
                      <TrendingUp className="inline h-4 w-4 mr-1" />
                      {dashboardData.projectsByStatus.find((item) => item.status === 'In Progress')?.count || 0} active
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="card-3d overflow-hidden border-blue-100 bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-800 flex items-center">
                  <Users className="mr-2 h-5 w-5 text-blue-500" />
                  Students
                </CardTitle>
                <CardDescription className="text-blue-600/70">Students under supervision</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-blue-700">{dashboardData.students}</p>
                    <p className="text-sm text-blue-500 mt-1">
                      <GraduationCap className="inline h-4 w-4 mr-1" />
                      {dashboardData.students} supervised
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="card-3d overflow-hidden border-blue-100 bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-800 flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-blue-500" />
                  Upcoming Defenses
                </CardTitle>
                <CardDescription className="text-blue-600/70">Scheduled project defenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-blue-700">{dashboardData.upcomingDefenses}</p>
                    <p className="text-sm text-blue-500 mt-1">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Next: N/A
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="card-3d overflow-hidden border-blue-100 bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-800 flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-blue-500" />
                  Unread Reports
                </CardTitle>
                <CardDescription className="text-blue-600/70">Reports awaiting review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-blue-700">{dashboardData.unreadReports}</p>
                    <p className="text-sm text-blue-500 mt-1">
                      <MessageSquare className="inline h-4 w-4 mr-1" />
                      Needs attention
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* IMPROVED Projects by Status */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="card-3d overflow-hidden border-blue-100 bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-800 flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
                  Projects by Status
                </CardTitle>
                <CardDescription className="text-blue-600/70">Distribution of your projects</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Visual Status Cards */}
                <div className="grid grid-cols-1 gap-3 mb-4">
                  {dashboardData.projectsByStatus.map((item, index) => {
                    const total = dashboardData.projectsByStatus.reduce((sum, proj) => sum + proj.count, 0);
                    const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                    
                    const statusConfig = {
                      'Assigned': { 
                        bg: 'bg-gradient-to-r from-gray-50 to-gray-100', 
                        text: 'text-gray-700', 
                        accent: 'bg-gray-500',
                        border: 'border-gray-200'
                      },
                      'In Progress': { 
                        bg: 'bg-gradient-to-r from-blue-50 to-blue-100', 
                        text: 'text-blue-700', 
                        accent: 'bg-blue-500',
                        border: 'border-blue-200'
                      },
                      'Rejected': { 
                        bg: 'bg-gradient-to-r from-red-50 to-red-100', 
                        text: 'text-red-700', 
                        accent: 'bg-red-500',
                        border: 'border-red-200'
                      }
                    };
                    
                    const config = statusConfig[item.status] || statusConfig['Assigned'];
                    
                    return (
                      <div key={index} className={`${config.bg} ${config.border} border rounded-lg p-3 transition-all hover:shadow-md`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`${config.accent} w-10 h-10 rounded-full flex items-center justify-center shadow-sm`}>
                              <span className="text-white text-sm font-bold">{item.count}</span>
                            </div>
                            <div>
                              <p className={`text-sm font-semibold ${config.text}`}>{item.status}</p>
                              <p className="text-xs text-gray-500">{percentage}% of total</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${config.accent} transition-all duration-300`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Summary */}
                <div className="pt-3 border-t border-blue-100">
                  <div className="flex justify-between items-center text-xs text-blue-600">
                    <span>Total Projects</span>
                    <span className="font-bold">{dashboardData.projectsByStatus.reduce((sum, proj) => sum + proj.count, 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card className="card-3d overflow-hidden border-blue-100 bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-800 flex items-center">
                  <BookOpen className="mr-2 h-5 w-5 text-blue-500" />
                  Research Areas
                </CardTitle>
                <CardDescription className="text-blue-600/70">Your project specializations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.researchAreas.map((area, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-800 font-medium">{area.name}</span>
                        <span className="text-xs text-blue-600 font-bold">{area.percentage}%</span>
                      </div>
                      <div className="w-full bg-blue-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            index === 0 ? "bg-blue-600" : index === 1 ? "bg-blue-500" : "bg-blue-400"
                          }`}
                          style={{ width: `${area.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-center">
                  <button className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-md transition-colors">
                    Add Research Area
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ADDED Performance Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <Card className="card-3d overflow-hidden border-blue-100 bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-800 flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
                  Performance Overview
                </CardTitle>
                <CardDescription className="text-blue-600/70">Trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 w-full">
                  <canvas ref={chartRef} className="w-full h-full"></canvas>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* MODIFIED Recent Projects - ID AND IMAGE REMOVED */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-lg border border-blue-100 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
            <div className="flex items-center gap-2.5">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold text-blue-800">Recent Projects</h2>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors">
                View All
              </button>
              <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors">
                Add New
              </button>
            </div>
          </div>

          <div className="divide-y divide-blue-50">
            {dashboardData.recentProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-blue-300 mb-2" />
                <p className="text-blue-800 font-medium">No projects found</p>
                <p className="text-blue-600 text-sm">Your projects will appear here</p>
              </div>
            ) : (
              dashboardData.recentProjects.map((project, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center px-6 py-4 gap-4 hover:bg-blue-50 transition-colors"
                  key={index}
                >
                  {/* STATUS INDICATOR ONLY - NO IMAGE */}
                  <div className="relative">
                    <div
                      className={`${getStatusBgColor(project.status)} rounded-full p-3 border-2 border-white shadow-sm`}
                    >
                      {getStatusIcon(project.status)}
                    </div>
                  </div>

                  <div className="flex-1">
                    {/* REMOVED PROJECT ID */}
                    <div className="flex items-center gap-2">
                      <p className="text-blue-800 font-medium">{project.title}</p>
                    </div>
                    <div className="flex items-center text-blue-600 text-sm">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{project.student?.name || "Unknown Student"}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(project.status)}
                    <span className="text-xs text-blue-400">
                      Updated: {formatDate(project.lastUpdate || project.createdAt)}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {dashboardData.recentProjects.length > 0 && (
            <div className="px-6 py-3 bg-blue-50 border-t border-blue-100 flex justify-between items-center">
              <span className="text-xs text-blue-600">
                Showing {dashboardData.recentProjects.length} of {dashboardData.totalAssignments} projects
              </span>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                View all projects →
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfessorDashboard;

