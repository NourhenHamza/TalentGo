import axios from 'axios';
import { format } from 'date-fns';
import { jwtDecode } from 'jwt-decode';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ProfessorContext } from '../../context/ProfessorContext';

const AssignedDefenses = () => {
  const { dToken, backendUrl } = useContext(ProfessorContext);
  const [defenses, setDefenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [professorId, setProfessorId] = useState(null);

  // Extract professor ID from token
  useEffect(() => {
    if (dToken) {
      try {
        const decoded = jwtDecode(dToken);
        setProfessorId(decoded.id);
      } catch (error) {
        console.error("Error decoding token:", error);
        setError("Authentication error");
        toast.error("Failed to authenticate. Please log in again.", {
          className: 'bg-red-100 text-red-800 border border-red-200 rounded-lg shadow-sm'
        });
      }
    }
  }, [dToken]);

  // Fetch defenses when professorId is available
  useEffect(() => {
    if (professorId) {
      fetchDefenses();
    }
  }, [professorId]);

  // Fetch defenses with proper error handling
  const fetchDefenses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${backendUrl || 'http://localhost:4000'}/api/defense/by-jury/${professorId}`,
        { 
          headers: { dToken },
          validateStatus: (status) => status < 500 // Accept all status codes < 500
        }
      );

      // Handle 404 specifically
      if (response.status === 404) {
        setDefenses([]);
        return;
      }

      // Check for successful response
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch defenses');
      }

      // Validate response data structure
      if (!Array.isArray(response.data.defenses)) {
        throw new Error('Invalid data format received from server');
      }

      // Enhance defense data with acceptance status
      const enhancedDefenses = response.data.defenses.map(defense => {
        const acceptedBy = defense.acceptedBy?.map(id => id.toString()) || [];
        const jury = defense.jury?.map(j => j._id?.toString() || j.toString()) || [];
        
        return {
          ...defense,
          acceptanceProgress: {
            accepted: acceptedBy.length,
            total: jury.length,
            hasAccepted: acceptedBy.includes(professorId.toString())
          }
        };
      });

      setDefenses(enhancedDefenses);
    } catch (err) {
      console.error('Fetch defenses error:', err);
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Failed to fetch defenses';
      setError(errorMessage);
      
      toast.error(`Error: ${errorMessage}`, {
        className: 'bg-red-100 text-red-800 border border-red-200 rounded-lg shadow-sm'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle accepting a defense
  const handleAccept = async (defenseId) => {
    try {
      const response = await axios.put(
        `${backendUrl || 'http://localhost:4000'}/api/defense/${defenseId}/accept/${professorId}`,
        {},
        { 
          headers: { dToken },
          validateStatus: (status) => status < 500
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Acceptance failed');
      }

      toast.success(response.data.message || 'Defense accepted successfully', {
        className: 'bg-green-100 text-green-800 border border-green-200 rounded-lg shadow-sm'
      });

      // Refresh the list after successful acceptance
      fetchDefenses();
    } catch (error) {
      console.error('Accept defense error:', error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to accept defense';

      toast.error(`Error: ${errorMessage}`, {
        className: 'bg-red-100 text-red-800 border border-red-200 rounded-lg shadow-sm'
      });
    }
  };

  // Handle rejecting a defense
  const handleReject = async (defenseId) => {
    try {
      const response = await axios.put(
        `${backendUrl || 'http://localhost:4000'}/api/defense/${defenseId}/reject/${professorId}`,
        {},
        { 
          headers: { dToken },
          validateStatus: (status) => status < 500
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Rejection failed');
      }

      toast.success(response.data.message || 'Defense declined successfully', {
        className: 'bg-blue-100 text-blue-800 border border-blue-200 rounded-lg shadow-sm'
      });

      // Refresh the list after successful rejection
      fetchDefenses();
    } catch (error) {
      console.error('Reject defense error:', error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to decline defense';

      toast.error(`Error: ${errorMessage}`, {
        className: 'bg-red-100 text-red-800 border border-red-200 rounded-lg shadow-sm'
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-blue-100 max-w-md w-full text-center">
          <div className="animate-pulse flex flex-col space-y-4">
            <div className="h-8 bg-blue-100 rounded w-3/4 mx-auto"></div>
            <div className="h-6 bg-blue-50 rounded w-1/2 mx-auto"></div>
            <div className="h-10 bg-blue-100 rounded mt-4"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-blue-100 max-w-md w-full text-center">
          <div className="text-red-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-blue-800 mb-2">Error Loading Defenses</h2>
          <p className="text-blue-700 mb-6">{error}</p>
          <button
            onClick={fetchDefenses}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No defenses state
  if (defenses.length === 0 && !loading && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-blue-100 max-w-md w-full text-center">
          <div className="text-blue-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-blue-800 mb-2">No Defenses Assigned</h2>
          <p className="text-blue-700 mb-6">You don&apos;t have any defense assignments at this time.</p>
          <button
            onClick={fetchDefenses}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-normal text-blue-900 sm:text-4xl">
            Defense Assignments
          </h1>
          <p className="mt-3 text-lg text-blue-700">
            Review and manage your scheduled defenses
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden border border-blue-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-100">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-800 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-800 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-800 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-800 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-800 uppercase tracking-wider">
                    Acceptance
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-800 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {defenses.map((defense) => (
                  <tr
                    key={defense._id}
                    className="hover:bg-blue-50/50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-900">
                        {defense.student?.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-blue-600">
                        {defense.student?.email || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-blue-800">
                        {defense.subject?.title || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-blue-800">
                        {defense.date ? format(new Date(defense.date), 'PPpp') : 'Not scheduled'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full
                        ${defense.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                          defense.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          defense.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'}`}>
                        {defense.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-24 mr-4">
                          <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                              <div>
                                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                                  {defense.acceptanceProgress.accepted}/{defense.acceptanceProgress.total}
                                </span>
                              </div>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                              <div
                                style={{
                                  width: `${defense.acceptanceProgress.total > 0 ?
                                    (defense.acceptanceProgress.accepted / defense.acceptanceProgress.total) * 100 :
                                    0}%`
                                }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                              ></div>
                            </div>
                          </div>
                        </div>
                        {defense.acceptanceProgress.hasAccepted && (
                          <span className="text-xs text-green-600 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            You accepted
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAccept(defense._id)}
                            disabled={defense.acceptanceProgress.hasAccepted}
                            className={`px-4 py-2 rounded-lg shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              defense.acceptanceProgress.hasAccepted 
                                ? 'bg-green-100 text-green-800 cursor-not-allowed' 
                                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                            }`}
                          >
                            {defense.acceptanceProgress.hasAccepted ? 'Accepted' : 'Accept'}
                          </button>
                          <button
                            onClick={() => handleReject(defense._id)}
                            className="px-4 py-2 bg-white text-blue-800 border border-blue-200 rounded-lg shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Decline
                          </button>
                        </div>
                      
                   
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignedDefenses;