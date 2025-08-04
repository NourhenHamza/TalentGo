import React, { useState, useEffect, useContext } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { Calendar, MapPin, Clock, Users, Edit, Trash2, Plus, Eye, Send, Filter, Search } from 'lucide-react';

const UniversityEventsManagement = () => {
  const { aToken, uToken, currentUser, isAuthenticated, isAdmin, isUniversity } = useContext(AdminContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
'conference', 'workshop', 'seminar', 'competition', 'cultural', 'sports','orientation', 'other', 'social'
  // Get the appropriate token
  const getToken = () => aToken || uToken;

  const categories = [
    'academic',
'conference', 'workshop', 'seminar', 'competition', 'cultural', 'sports','orientation', 'social','other'
  ];

  const statusColors = {
    draft: 'bg-yellow-100 text-yellow-800',
    published: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  // Fetch events from API
  const fetchEvents = async (page = 1) => {
    if (!isAuthenticated() || !currentUser?._id) {
      console.log('Not authenticated or no current user');
      setLoading(false);
      return;
    }

    const token = getToken();
    if (!token) {
      console.log('No token available');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category: filters.category })
      });

      console.log('Fetching events with token:', token);
      console.log('Current user:', currentUser);
      console.log('API URL:', `${backendUrl}/api/events/university/${currentUser._id}?${params}`);

      const response = await fetch(
        `${backendUrl}/api/events/university/${currentUser._id}?${params}`,
        {
          headers: {
            'token': token,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        let filteredEvents = data.data;
        
        // Apply search filter on frontend
        if (filters.search) {
          filteredEvents = filteredEvents.filter(event =>
            event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            event.description.toLowerCase().includes(filters.search.toLowerCase())
          );
        }

        setEvents(filteredEvents);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        console.error('Failed to fetch events:', data.message);
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(currentPage);
  }, [currentPage, filters, aToken, uToken, currentUser]);

  // Create new event
  const createEvent = async (eventData) => {
    const token = getToken();
    if (!token || !currentUser?._id) {
      console.error('No token or current user available');
      return { success: false, message: 'Authentication required' };
    }

    try {
      console.log('Creating event with data:', eventData);
      console.log('Using token:', token);
      console.log('Current user:', currentUser);

      const response = await fetch(`${backendUrl}/api/events`, {
        method: 'POST',
        headers: {
          'token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...eventData,
          university_id: currentUser._id
        }),
      });

      console.log('Create response status:', response.status);
      const data = await response.json();
      console.log('Create response data:', data);
      
      if (data.success) {
        setShowCreateModal(false);
        await fetchEvents(currentPage);
        return { success: true, message: 'Event created successfully!' };
      } else {
        return { success: false, message: data.message || 'Failed to create event' };
      }
    } catch (error) {
      console.error('Error creating event:', error);
      return { success: false, message: 'Error creating event: ' + error.message };
    }
  };

  // Update event
  const updateEvent = async (eventId, eventData) => {
    const token = getToken();
    if (!token) {
      return { success: false, message: 'Authentication required' };
    }

    try {
      const response = await fetch(`${backendUrl}/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();
      
      if (data.success) {
        setEditingEvent(null);
        await fetchEvents(currentPage);
        return { success: true, message: 'Event updated successfully!' };
      } else {
        return { success: false, message: data.message || 'Failed to update event' };
      }
    } catch (error) {
      return { success: false, message: 'Error updating event' };
    }
  };

  // Delete event
  const deleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    const token = getToken();
    if (!token) {
      return { success: false, message: 'Authentication required' };
    }

    try {
      const response = await fetch(`${backendUrl}/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'token': token,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchEvents(currentPage);
        return { success: true, message: 'Event deleted successfully!' };
      } else {
        return { success: false, message: data.message || 'Failed to delete event' };
      }
    } catch (error) {
      return { success: false, message: 'Error deleting event' };
    }
  };

  // Publish event
  const publishEvent = async (eventId) => {
    const token = getToken();
    if (!token) {
      return { success: false, message: 'Authentication required' };
    }

    try {
      const response = await fetch(`${backendUrl}/api/events/${eventId}/publish`, {
        method: 'PATCH',
        headers: {
          'token': token,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchEvents(currentPage);
        return { success: true, message: 'Event published successfully!' };
      } else {
        return { success: false, message: data.message || 'Failed to publish event' };
      }
    } catch (error) {
      return { success: false, message: 'Error publishing event' };
    }
  };

  // Event form component
  const EventForm = ({ event, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      title: event?.title || '',
      description: event?.description || '',
      date: event?.date ? new Date(event.date).toISOString().slice(0, 16) : '',
      endDate: event?.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
      location: event?.location || '',
      category: event?.category || categories[0],
      contactEmail: event?.contactEmail || currentUser?.contactPerson?.email || currentUser?.email || '',
      isPublic: event?.isPublic !== undefined ? event.isPublic : true
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Validate required fields
      if (!formData.title || !formData.description || !formData.date || !formData.location || !formData.contactEmail) {
        alert('Please fill in all required fields');
        return;
      }

      const result = await onSubmit(formData);
      if (result.success) {
        alert(result.message);
      } else {
        alert(result.message);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6">
            {event ? 'Edit Event' : 'Create New Event'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Event description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Event location"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contact email"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                Make this event public
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {event ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Event details modal
  const EventDetails = ({ event, onClose }) => {
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">{event.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[event.status]}`}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
              <span className="text-sm text-gray-600">
                {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(event.date)}</span>
              {event.endDate && (
                <>
                  <span>to</span>
                  <span>{formatDate(event.endDate)}</span>
                </>
              )}
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{event.location}</span>
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span>{event.isPublic ? 'Public Event' : 'Private Event'}</span>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{event.description}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Contact</h3>
              <p className="text-gray-700">{event.contactEmail}</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!isAuthenticated()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600">You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Event Management</h1>
          <p className="text-gray-600">
            Manage events for {currentUser?.name || 'your university'}
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filters */}
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Create Event</span>
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No events found</h3>
            <p className="text-gray-600">Create your first event to get started.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div key={event._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{event.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[event.status]}`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{event.category}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {event.description}
                  </p>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">View</span>
                    </button>
                    <button
                      onClick={() => setEditingEvent(event)}
                      className="flex items-center space-x-1 text-green-600 hover:text-green-800"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-sm">Edit</span>
                    </button>
                    {event.status === 'draft' && (
                      <button
                        onClick={() => publishEvent(event._id)}
                        className="flex items-center space-x-1 text-purple-600 hover:text-purple-800"
                      >
                        <Send className="w-4 h-4" />
                        <span className="text-sm">Publish</span>
                      </button>
                    )}
                    <button
                      onClick={() => deleteEvent(event._id)}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modals */}
        {showCreateModal && (
          <EventForm
            onSubmit={createEvent}
            onCancel={() => setShowCreateModal(false)}
          />
        )}

        {editingEvent && (
          <EventForm
            event={editingEvent}
            onSubmit={(data) => updateEvent(editingEvent._id, data)}
            onCancel={() => setEditingEvent(null)}
          />
        )}

        {selectedEvent && (
          <EventDetails
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </div>
    </div>
  );
};

export default UniversityEventsManagement;