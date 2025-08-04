"use client"

import axios from "axios"
import { createContext, useContext, useEffect, useState } from "react"
import { toast } from "react-toastify"

// Create a mock AdminContext only for the preview environment
const PreviewAdminContext = createContext({
  VITE_BACKEND_URL: "http://localhost:4000",
  aToken: localStorage.getItem('aToken') || null, // Utiliser le vrai token du localStorage
})

// Try to import the real AdminContext, fall back to the preview one if it fails
let AdminContext
try {
  AdminContext = require("../../context/AdminContext").AdminContext
} catch (error) {
  AdminContext = PreviewAdminContext
}

const AddProfessor = () => {
  const [email, setEmail] = useState("")
  const [provisionalProfessors, setProvisionalProfessors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showIcons, setShowIcons] = useState(false)

  const { VITE_BACKEND_URL, aToken } = useContext(AdminContext)

  useEffect(() => {
    fetchProvisionalProfessors()
    setTimeout(() => setShowIcons(true), 1000)
  }, [VITE_BACKEND_URL, aToken])

  const fetchProvisionalProfessors = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(
        `${VITE_BACKEND_URL}/api/user/provisional-Professor`, 
        { 
          headers: { 
            'atoken': aToken,
            'Content-Type': 'application/json'
          } 
        }
      )
      setProvisionalProfessors(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error("Failed to load provisional professors")
      console.error("Error fetching provisional professors:", error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    
    try {
      // Vérifications préliminaires
      console.log('=== DEBUG TOKEN ===')
      console.log('aToken from context:', aToken)
      console.log('aToken type:', typeof aToken)
      console.log('aToken length:', aToken ? aToken.length : 'N/A')
      
      // Vérifier si le token existe et n'est pas null/undefined
      if (!aToken || aToken === 'null' || aToken === 'undefined' || aToken.trim() === '') {
        toast.error("Session expired. Please login again.")
        return
      }

      // Vérifier le format JWT (doit avoir 3 parties séparées par des points)
      const tokenParts = aToken.split('.')
      if (tokenParts.length !== 3) {
        toast.error("Invalid session token. Please login again.")
        return
      }

      const professorData = { email }
      
      // Configuration de la requête
      const config = {
        headers: { 
          'atoken': aToken,
          'Content-Type': 'application/json'
        }
      }
      
      console.log('=== REQUEST CONFIG ===')
      console.log('URL:', `${VITE_BACKEND_URL}/api/user/provisional-professor`)
      console.log('Headers:', config.headers)
      console.log('Data:', professorData)
      
      const { data } = await axios.post(
        `${VITE_BACKEND_URL}/api/user/provisional-professor`,
        professorData, 
        config
      )
      
      console.log('=== RESPONSE ===')
      console.log('Response data:', data)
      
      if (data.success || (data.message && data.message.includes("sent successfully"))) {
        toast.success("Invitation email sent successfully!")
        setEmail("")
        await fetchProvisionalProfessors()
      } else {
        toast.error(data.message || "Failed to send invitation")
      }
      
    } catch (error) {
      console.error('=== ERROR DETAILS ===')
      console.error("Full error:", error)
      console.error("Error response:", error.response?.data)
      console.error("Error status:", error.response?.status)
      console.error("Error headers:", error.response?.headers)
      
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.")
        // Optionnel: rediriger vers la page de login
        // window.location.href = '/login'
      } else if (error.response?.status === 403) {
        toast.error("Access denied. Insufficient permissions.")
      } else {
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           "An unexpected error occurred"
        toast.error(errorMessage)
      }
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invitation?")) return
    
    try {
      await axios.delete(
        `${VITE_BACKEND_URL}/api/user/provisional-Professor/${id}`, 
        { 
          headers: { 
            'atoken': aToken,
            'Content-Type': 'application/json'
          } 
        }
      )
      toast.success("Invitation deleted successfully")
      await fetchProvisionalProfessors()
    } catch (error) {
      console.error("Error deleting invitation:", error)
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.")
      } else {
        toast.error("Failed to delete invitation")
      }
    }
  }

  const iconVariants = {
    hidden: { opacity: 0, y: -20, scale: 1 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6 } },
    hover: { scale: 1.3, transition: { duration: 0.2 } },
  }

  const professorImage = "/assets/professor.jpg"

  return (
    <div className="validation-container">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute opacity-20 rounded-full bg-blue-500"
            style={{
              width: `${50 + i * 20}px`,
              height: `${50 + i * 20}px`,
              top: `${10 + i * 15}%`,
              left: i % 2 === 0 ? `${5 + i * 10}%` : `${80 - i * 10}%`,
              animation: `float-${i + 1} ${8 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
              zIndex: 0,
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10 p-5">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-3">
            Professor <span className="text-blue-500">Management</span>
          </h1>
          <div className="w-32 h-1.5 bg-blue-500 mx-auto my-5 rounded-full animate-width-expand"></div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmitHandler} className="mb-8 animate-fade-in">
          <div className="bg-white px-8 py-8 border border-blue-100 rounded-3xl shadow-2xl w-full max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-700 to-blue-500 -mx-8 -mt-8 px-8 py-6 rounded-t-3xl mb-8">
              <h2 className="text-2xl font-semibold text-white flex items-center">
                <svg className="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                Invite New Professor
              </h2>
            </div>

            <div className="relative group animate-slide-up">
              <div className="absolute inset-0 bg-blue-200 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <img
                className="w-36 h-36 bg-blue-50 rounded-full object-cover mx-auto border-4 border-blue-100 shadow-md transition-transform duration-300 group-hover:scale-105"
                src={professorImage || "/placeholder.svg"}
                alt="Professor Preview"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = "/placeholder.svg?height=144&width=144"
                }}
              />
              <div className="absolute bottom-0 right-1/2 transform translate-x-16 bg-blue-500 p-2 rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <div className="flex flex-col gap-4 text-gray-600 mt-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-blue-800 font-medium flex items-center gap-2">
                  <div className="p-1 bg-blue-100 rounded transition-transform duration-300 hover:scale-110">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-blue-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  Professor Email
                </label>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  className="border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  type="email"
                  placeholder="Enter professor email"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-500 px-10 py-3 mt-6 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 w-fit animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
              Send Invitation
            </button>

            <p
              className="mt-3 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-start gap-2 animate-slide-up"
              style={{ animationDelay: "0.4s" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 flex-shrink-0 mt-0.5 transition-transform duration-300 hover:scale-125"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              An invitation link will be sent to the professor to complete their registration for your university.
            </p>
          </div>
        </form>

        {/* Provisional Professors Table */}
        <div
          className="bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden animate-fade-in"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-8 py-6 flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full transition-transform duration-300 hover:scale-110">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">Pending Invitations</h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : provisionalProfessors.length === 0 ? (
              <div className="text-center py-8 text-blue-800 bg-blue-50 rounded-lg border border-blue-100 flex flex-col items-center">
                <div className="p-3 bg-white rounded-full mb-3 shadow-md transition-transform duration-300 hover:scale-110">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-lg">No pending invitations</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-200 rounded-lg overflow-hidden">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Invitation Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-100">
                    {provisionalProfessors.map((prof, index) => (
                      <tr
                        key={prof._id}
                        className="hover:bg-blue-50 transition-colors animate-slide-up"
                        style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-full transition-transform duration-300 hover:scale-125">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-blue-600"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                            </div>
                            <span className="text-sm text-blue-800">{prof.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-full transition-transform duration-300 hover:scale-125">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-blue-600"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <span className="text-sm text-blue-800">
                              {new Date(prof.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleDelete(prof._id)}
                            className="flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors hover:underline"
                          >
                            <div className="p-1.5 bg-red-100 rounded-full transition-transform duration-300 hover:scale-125">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-red-600"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .validation-container {
          min-height: 100vh;
          width: 100%;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          padding: 2rem 1rem;
          position: relative;
          overflow-x: hidden;
          margin: 0;
          box-sizing: border-box;
        }
        
        @keyframes float-1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(3deg); }
        }
        @keyframes float-4 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-3deg); }
        }
        @keyframes float-5 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-6 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        
        .animate-fade-in { 
          opacity: 0;
          animation: fadeIn 0.8s ease-out forwards;
        }
        
        .animate-slide-up {
          opacity: 0;
          transform: translateY(20px);
          animation: slideUp 0.5s ease-out forwards;
        }
        
        .animate-width-expand {
          width: 0;
          animation: widthExpand 1s ease-out 0.5s forwards;
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes widthExpand {
          from { width: 0; }
          to { width: 8rem; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default AddProfessor