import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { StudentContext } from '../context/StudentContext';
import { toast } from 'react-toastify';

const StudentEventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { sToken } = useContext(StudentContext);

  useEffect(() => {
    if (id) {
      fetchEventDetails(id);
    }
  }, [id, sToken]);

  const fetchEventDetails = async (eventId) => {
    try {
      setLoading(true);
      setError(null);
      
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
      
      const response = await fetch(`${backendUrl}/api/events/${eventId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'sToken': sToken || '',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('You need to be logged in to view this event');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setEvent(data.data || data.event);
      } else {
        throw new Error(data.message || 'Failed to fetch event details');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date, time) => {
    if (!date) return 'Date not specified';
    
    const eventDate = new Date(date);
    const dateStr = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Extract exact time from the event or use current time format
    let timeStr = '';
    if (time) {
      timeStr = ` at ${time}`;
    } else if (eventDate) {
      // If no specific time provided, extract from date object
      const hours = eventDate.getHours();
      const minutes = eventDate.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, '0');
      timeStr = ` at ${displayHours}:${displayMinutes} ${ampm}`;
    }
    
    return `${dateStr}${timeStr}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 flex justify-center items-center ml-64">
        <div className="bg-white p-12 rounded-3xl shadow-2xl border border-sky-100">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-sky-300 border-t-transparent mx-auto"></div>
          <p className="text-sky-600 mt-6 text-center font-medium text-lg">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center p-6 ml-64">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center border border-sky-100">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Something went wrong</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <button 
            onClick={() => fetchEventDetails(id)}
            className="bg-sky-400 hover:bg-sky-500 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center ml-64">
        <div className="bg-white rounded-3xl shadow-2xl p-10 text-center border border-sky-100">
          <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.664-2.647l-.054-.063A4.956 4.956 0 016 10c0-3.314 2.686-6 6-6s6 2.686 6 6a4.956 4.956 0 01-.282 1.29l-.054.063A7.962 7.962 0 0112 15z"></path>
            </svg>
          </div>
          <p className="text-gray-500 text-xl font-medium">Event not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-sky-100 to-cyan-50 py-12 ml-64">
      <div className="flex justify-center px-6 pr-12">
        <div className="w-full max-w-5xl">
          {/* Main Event Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-sky-200/50">
            
            {/* Header Section */}
            <div className="relative">
              <div className="h-80 bg-gradient-to-br from-sky-300 via-sky-400 to-cyan-400 relative overflow-hidden">
                {event.image && event.image !== 'no-event-image.jpg' && (
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover mix-blend-overlay"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-sky-600/30 to-transparent"></div>
                
                {/* Floating elements for visual interest */}
                <div className="absolute top-8 right-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-12 left-12 w-32 h-32 bg-cyan-300/20 rounded-full blur-2xl"></div>
                
                <div className="absolute bottom-8 left-8 right-8">
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                    {event.title}
                  </h1>
                  <div className="flex items-center text-sky-50 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 inline-flex">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span className="font-semibold text-lg">{formatDateTime(event.date, event.time)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* Left Column - Description and Requirements */}
                <div className="lg:col-span-2 space-y-8">
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-3 h-3 bg-sky-400 rounded-full mr-4"></div>
                      <h2 className="text-2xl font-bold text-gray-800">Event Description</h2>
                    </div>
                    <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-8 border border-sky-100">
                      <p className="text-gray-700 leading-relaxed text-lg">{event.description}</p>
                    </div>
                  </div>

                  {/* Schedule Section */}
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-3 h-3 bg-cyan-400 rounded-full mr-4"></div>
                      <h2 className="text-2xl font-bold text-gray-800">Schedule</h2>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-sky-100">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mr-4">
                          <svg className="w-6 h-6 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">Event Time</p>
                          <p className="text-sky-600 font-medium text-lg mt-1">{formatDateTime(event.date, event.time)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {event.requirements && (
                    <div>
                      <div className="flex items-center mb-6">
                        <div className="w-3 h-3 bg-emerald-400 rounded-full mr-4"></div>
                        <h2 className="text-2xl font-bold text-gray-800">Requirements</h2>
                      </div>
                      <div className="bg-emerald-50 rounded-2xl p-8 border-l-4 border-emerald-400">
                        <p className="text-gray-700 leading-relaxed text-lg">{event.requirements}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Event Details */}
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-3 h-3 bg-cyan-400 rounded-full mr-4"></div>
                      <h2 className="text-2xl font-bold text-gray-800">Event Details</h2>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Location */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-sky-100">
                        <div className="flex items-start">
                          <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                            <svg className="w-6 h-6 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">Location</p>
                            <p className="text-gray-600 mt-1">{event.location}</p>
                          </div>
                        </div>
                      </div>

                      {/* Category */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-sky-100">
                        <div className="flex items-start">
                          <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                            <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">Category</p>
                            <span className="inline-block bg-gradient-to-r from-sky-100 to-cyan-100 text-sky-700 text-sm font-medium px-4 py-2 rounded-xl mt-2 border border-sky-200">
                              {event.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* University */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-sky-100">
                        <div className="flex items-start">
                          <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                            <svg className="w-6 h-6 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">University</p>
                            <p className="text-gray-600 mt-1">{event.universityDetails?.name || event.university}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {event.published && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                      <div className="flex items-center">
                        <svg className="w-6 h-6 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <div>
                          <p className="font-medium text-emerald-800">Event Published</p>
                          <p className="text-emerald-600 text-sm">Open for registration</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentEventDetails;
