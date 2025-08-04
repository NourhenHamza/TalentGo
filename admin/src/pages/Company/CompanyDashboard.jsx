import { jwtDecode } from "jwt-decode";
import {
  Activity,
  BarChart3,
  Clock,
  DollarSign,
  FileText,
  Handshake,
  TrendingUp,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const CompanyDashboard = () => {
  const [dashData, setDashData] = useState({
    employees: 0,
    applications: 0,
    partnerships: 0,
    revenue: 0,
    revenueDetails: [],
    projects: {
      active: 0,
      inactive: 0,
      closed: 0,
      total: 0
    },
    applicationsStatus: {
      pending: 0,
      reviewed: 0,
      accepted: 0,
      rejected: 0,
      completed: 0
    },
    chartData: [],
    recentActivities: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState([]);
  const [companyId, setCompanyId] = useState(null);

  // Function to get company ID from JWT token
  const getCompanyIdFromToken = () => {
    try {
      const token = localStorage.getItem('cToken');
      addDebugLog('🔑 Token retrieved from localStorage', { tokenExists: !!token });
      
      if (!token) {
        addDebugLog('❌ No token found in localStorage');
        return null;
      }

      const decoded = jwtDecode(token);
      addDebugLog('✅ Token successfully decoded', { 
        id: decoded.id, 
        email: decoded.email, 
        role: decoded.role 
      });
      
      return decoded.id;
    } catch (error) {
      addDebugLog('❌ Error decoding token', { error: error.message });
      console.error('Error decoding JWT token:', error);
      return null;
    }
  };

  // Function to add debug logs
  const addDebugLog = (message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      message,
      data: data ? JSON.stringify(data, null, 2) : null
    };
    
    console.log(`🔍 [DASHBOARD-FRONTEND] ${timestamp}: ${message}`, data || '');
    
    setDebugInfo(prev => [...prev.slice(-9), logEntry]); // Keep only the last 10 logs
  };

  // Function to fetch dashboard data
  const fetchDashboardData = async (companyId) => {
    addDebugLog('🚀 Starting fetchDashboardData', { companyId });
    
    try {
      setLoading(true);
      setError(null);
      
      // Company ID verification
      if (!companyId) {
        const errorMsg = 'Missing company ID';
        addDebugLog('❌ Error: ' + errorMsg);
        throw new Error(errorMsg);
      }
      
      addDebugLog('✅ Valid company ID', { companyId });
      
      // Building API URL
      const apiUrl = `http://localhost:4000/api/company-dashboard/dashboard/${companyId}`;
      addDebugLog('🌐 API URL built', { apiUrl });
      
      // Attempting to fetch data
      addDebugLog('📡 Sending fetch request...');
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // For including cookies if needed
      });
      
      addDebugLog('📨 Response received', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        addDebugLog('❌ Response not OK', { 
          status: response.status, 
          statusText: response.statusText,
          errorText 
        });
        throw new Error(`HTTP error: ${response.status} - ${response.statusText}`);
      }
      
      addDebugLog('📄 Attempting JSON parsing...');
      const result = await response.json();
      addDebugLog('✅ JSON successfully parsed', result);
      
      if (result.success) {
        addDebugLog('🎉 Data successfully retrieved', result.data);
        setDashData(result.data);
        addDebugLog('💾 State updated with new data');
      } else {
        const errorMsg = result.message || 'Error retrieving data';
        addDebugLog('❌ Retrieval failed', { error: errorMsg, result });
        throw new Error(errorMsg);
      }
      
    } catch (err) {
      const errorMsg = err.message || 'Unknown error';
      addDebugLog('💥 Exception caught', { 
        error: errorMsg, 
        stack: err.stack,
        name: err.name 
      });
      
      console.error('❌ [DASHBOARD-FRONTEND] Full error:', err);
      setError(errorMsg);
      
      // In case of error, use default data
      addDebugLog('🔄 Using default data');
      setDashData({
        employees: 0,
        applications: 0,
        partnerships: 0,
        revenue: 0,
        revenueDetails: [],
        projects: {
          active: 0,
          inactive: 0,
          closed: 0,
          total: 0
        },
        applicationsStatus: {
          pending: 0,
          reviewed: 0,
          accepted: 0,
          rejected: 0,
          completed: 0
        },
        chartData: [],
        recentActivities: []
      });
    } finally {
      addDebugLog('🏁 End of fetchDashboardData');
      setLoading(false);
    }
  };

  // API connectivity test
  const testApiConnectivity = async () => {
    addDebugLog('🧪 Testing API connectivity...');
    
    try {
      const response = await fetch('http://localhost:4000/api/company-dashboard/dashboard/test');
      const result = await response.json();
      addDebugLog('✅ API test successful', result);
      return true;
    } catch (err) {
      addDebugLog('❌ API test failed', { error: err.message });
      return false;
    }
  };

  // Load data when component mounts
  useEffect(() => {
    addDebugLog('🔄 useEffect triggered - Retrieving company ID');
    
    // Get company ID from token
    const extractedCompanyId = getCompanyIdFromToken();
    setCompanyId(extractedCompanyId);
    
    if (extractedCompanyId) {
      addDebugLog('✅ CompanyId retrieved, launching fetchDashboardData', { companyId: extractedCompanyId });
      
      // Test connectivity first
      testApiConnectivity().then(isConnected => {
        if (isConnected) {
          addDebugLog('🌐 API connectivity confirmed');
          fetchDashboardData(extractedCompanyId);
        } else {
          addDebugLog('❌ No API connectivity');
          setError('Unable to connect to API');
          setLoading(false);
        }
      });
    } else {
      addDebugLog('❌ CompanyId not retrieved from token');
      setError('Unable to retrieve company ID from token');
      setLoading(false);
    }
  }, []); // No dependency, runs only once on mount

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate active projects percentage
  const activeProjectsPercentage = dashData.projects.total > 0 
    ? Math.round((dashData.projects.active / dashData.projects.total) * 100)
    : 0;

  // Calculate accepted applications percentage
  const acceptedApplicationsPercentage = dashData.applications > 0
    ? Math.round((dashData.applicationsStatus.accepted / dashData.applications) * 100)
    : 0;

  // Function to get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Function to translate status
  const translateStatus = (status) => {
    const translations = {
      pending: 'Pending',
      reviewed: 'Reviewed',
      accepted: 'Accepted',
      rejected: 'Rejected',
      completed: 'Completed'
    };
    return translations[status] || status;
  };

  // Function to refresh data
  const handleRefreshData = () => {
    if (companyId) {
      fetchDashboardData(companyId);
    } else {
      const extractedCompanyId = getCompanyIdFromToken();
      if (extractedCompanyId) {
        setCompanyId(extractedCompanyId);
        fetchDashboardData(extractedCompanyId);
      }
    }
  };

  // Custom chart tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="p-6 relative bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-blue-600 text-lg mb-4">Loading data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 relative bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-100/30 blur-xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-blue-200/20 blur-xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-indigo-100/20 blur-xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <header className="mb-8 opacity-0 animate-fade-in" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">
            Company Dashboard
          </h1>
          <p className="text-blue-600">
            Overview of business operations and key metrics
          </p>
          
          {error && (
            <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded-md">
              <p className="text-red-700 text-sm">Error: {error}</p>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Employees Card */}
          <div className="opacity-0 animate-fade-in" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
            <div className="rounded-xl overflow-hidden border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 bg-white p-5 h-full transform hover:-translate-y-1">
              <div className="pb-2">
                <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                  <Users className="mr-2 h-5 w-5 text-blue-500" />
                  Employees
                </h3>
                <p className="text-sm text-gray-500">Total staff</p>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-blue-700">{dashData.employees}</p>
                    <p className="text-sm text-blue-500 mt-1">
                      <TrendingUp className="inline h-4 w-4 mr-1" />
                      Active and approved
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Applications Card */}
          <div className="opacity-0 animate-fade-in" style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}>
            <div className="rounded-xl overflow-hidden border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 bg-white p-5 h-full transform hover:-translate-y-1">
              <div className="pb-2">
                <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-500" />
                  Applications
                </h3>
                <p className="text-sm text-gray-500">Total received</p>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-blue-700">{dashData.applications}</p>
                    <p className="text-sm text-blue-500 mt-1">
                      <Activity className="inline h-4 w-4 mr-1" />
                      {acceptedApplicationsPercentage}% accepted
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Partnerships Card */}
          <div className="opacity-0 animate-fade-in" style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}>
            <div className="rounded-xl overflow-hidden border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 bg-white p-5 h-full transform hover:-translate-y-1">
              <div className="pb-2">
                <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                  <Handshake className="mr-2 h-5 w-5 text-blue-500" />
                  Partnerships
                </h3>
                <p className="text-sm text-gray-500">Active partnerships</p>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-blue-700">{dashData.partnerships}</p>
                    <p className="text-sm text-blue-500 mt-1">
                      <TrendingUp className="inline h-4 w-4 mr-1" />
                      Established collaborations
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Handshake className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="opacity-0 animate-fade-in" style={{ animationDelay: "1s", animationFillMode: "forwards" }}>
            <div className="rounded-xl overflow-hidden border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 bg-white p-5 h-full transform hover:-translate-y-1">
              <div className="pb-2">
                <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-blue-500" />
                  Estimated Revenue
                </h3>
                <p className="text-sm text-gray-500">Based on compensations</p>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-blue-700">{formatCurrency(dashData.revenue)}</p>
                    <p className="text-sm text-blue-500 mt-1">
                      <TrendingUp className="inline h-4 w-4 mr-1" />
                      {dashData.revenueDetails?.length || 0} paid offers
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dynamic Chart */}
          <div className="opacity-0 animate-fade-in" style={{ animationDelay: "1.2s", animationFillMode: "forwards" }}>
            <div className="rounded-xl overflow-hidden border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 bg-white p-5 h-full transform hover:-translate-y-1">
              <div className="pb-2">
                <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
                  Applications Trend
                </h3>
                <p className="text-sm text-gray-500">Applications received per month</p>
              </div>
              <div className="mt-4 h-64">
                {dashData.chartData && dashData.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashData.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Total"
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="accepted" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="Accepted"
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="pending" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        name="Pending"
                        dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Statistics Card */}
          <div className="lg:col-span-2 opacity-0 animate-fade-in" style={{ animationDelay: "1.4s", animationFillMode: "forwards" }}>
            <div className="rounded-xl overflow-hidden border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 bg-white p-5 h-full transform hover:-translate-y-1">
              <div className="pb-2">
                <h3 className="text-lg font-semibold text-blue-800">Projects Overview</h3>
                <p className="text-sm text-gray-500">Current project progress and resource allocation</p>
              </div>
              <div className="mt-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-700">Active Projects</span>
                    <div className="w-2/3 bg-blue-100 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${activeProjectsPercentage}%`, animation: "growWidth 2s ease-in-out" }}></div>
                    </div>
                    <span className="text-sm font-medium text-blue-700">{activeProjectsPercentage}%</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-700">Accepted Applications</span>
                    <div className="w-2/3 bg-blue-100 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${acceptedApplicationsPercentage}%`, animation: "growWidth 2s ease-in-out 0.3s both" }}></div>
                    </div>
                    <span className="text-sm font-medium text-blue-700">{acceptedApplicationsPercentage}%</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-700">Partnership Rate</span>
                    <div className="w-2/3 bg-blue-100 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "75%", animation: "growWidth 2s ease-in-out 0.6s both" }}></div>
                    </div>
                    <span className="text-sm font-medium text-blue-700">75%</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-700">{dashData.projects.active}</p>
                    <p className="text-sm text-blue-600">Active Projects</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-700">{dashData.applicationsStatus.accepted}</p>
                    <p className="text-sm text-green-600">Accepted Applications</p>
                  </div>
                </div>

                {/* Revenue details */}
                {dashData.revenueDetails && dashData.revenueDetails.length > 0 && (
                  <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Revenue Details</h4>
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {dashData.revenueDetails.slice(0, 3).map((detail, index) => (
                        <div key={index} className="text-xs text-gray-600 flex justify-between">
                          <span className="truncate">{detail.offerTitle}</span>
                          <span className="font-medium">{formatCurrency(detail.revenue)}</span>
                        </div>
                      ))}
                      {dashData.revenueDetails.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dashData.revenueDetails.length - 3} other offers
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={handleRefreshData}
                    className="px-4 py-2 mr-2 border border-blue-200 text-blue-700 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    Refresh Data
                  </button>
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:opacity-90 transition-opacity">
                    Create New Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities Section */}
        <div className="mt-8 opacity-0 animate-fade-in" style={{ animationDelay: "1.6s", animationFillMode: "forwards" }}>
          <div className="rounded-xl overflow-hidden border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 bg-white p-5">
            <div className="pb-2">
              <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                <Clock className="mr-2 h-5 w-5 text-blue-500" />
                Recent Activities & Applications
              </h3>
              <p className="text-sm text-gray-500">Latest updates and pending applications</p>
            </div>
            <div className="mt-4 overflow-x-auto">
              {dashData.recentActivities.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashData.recentActivities.map((activity, index) => (
                      <tr key={activity.id || index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{activity.task}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.project}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.assignedTo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(activity.dueDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(activity.status)}`}>
                            {translateStatus(activity.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-xs text-gray-400 mt-1">Applications will appear here once received</p>
                </div>
              )}
            </div>
            <div className="mt-4 text-right">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All Applications →
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes growWidth {
          from { width: 0%; }
          to { width: var(--target-width); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CompanyDashboard;