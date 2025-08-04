"use client"

import axios from "axios"
import { useContext, useEffect, useState } from "react"
import {
  FiAlertCircle,
  FiCheckCircle,
  FiGlobe,
  FiHome,
  FiInfo,
  FiMail,
  FiMapPin,
  FiPhone,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "react-toastify"
import { AdminContext } from "../context/AdminContext"
import { CompanyContext } from "../context/CompanyContext"

const PartnershipAcceptPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { aToken } = useContext(AdminContext)
  const { cToken } = useContext(CompanyContext)
  const [partnership, setPartnership] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [action, setAction] = useState("")

  useEffect(() => {
    const fetchPartnership = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/partnerships/${id}`, {
          headers: {
            Authorization: `Bearer ${aToken || cToken}`,
          },
        })
        setPartnership(response.data.partnership)
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch partnership details")
      } finally {
        setLoading(false)
      }
    }

    fetchPartnership()
  }, [id, aToken, cToken])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!action) {
      toast.error("Please select an action")
      return
    }

    try {
      const token = aToken || cToken
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }

      if (action === "accept") {
        await axios.patch(`http://localhost:4000/api/partnerships/${id}`, { action: "accept" }, config)
        toast.success("Partnership accepted successfully!")
      } else if (action === "reject") {
        await axios.patch(`http://localhost:4000/api/partnerships/${id}`, { action: "reject" }, config)
        toast.success("Partnership rejected successfully!")
      }

      navigate("/partnerships")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process partnership action")
      toast.error(err.response?.data?.message || "Failed to process partnership action")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex justify-center items-center p-4">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-3">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-blue-800 font-semibold text-lg">Loading partnership invitation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-50 flex justify-center items-center p-4">
        <div className="max-w-2xl w-full bg-white p-4 rounded-xl shadow-2xl border border-red-200">
          <div className="text-center">
            <div className="bg-red-100 p-4 rounded-full w-20 h-20 mx-auto mb-3 flex items-center justify-center">
              <FiAlertCircle className="text-red-600 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-red-700 mb-3">Error Loading Invitation</h3>
            <p className="text-red-600 mb-3">{error}</p>
            <button
              onClick={() => navigate("/partnerships")}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
            >
              Back to Partnerships
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!partnership) {
    return (
      <div className="min-h-screen bg-blue-50 flex justify-center items-center p-4">
        <div className="max-w-2xl w-full bg-white p-4 rounded-xl shadow-2xl border border-red-200">
          <div className="text-center">
            <div className="bg-red-100 p-4 rounded-full w-20 h-20 mx-auto mb-3 flex items-center justify-center">
              <FiAlertCircle className="text-red-600 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-red-700 mb-3">Partnership Not Found</h3>
            <p className="text-red-600 mb-3">The requested partnership could not be found.</p>
            <button
              onClick={() => navigate("/partnerships")}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
            >
              Back to Partnerships
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (partnership.status !== "pending") {
    return (
      <div className="min-h-screen bg-blue-50 flex justify-center items-center p-4">
        <div className="max-w-2xl w-full bg-white p-4 rounded-xl shadow-2xl border border-amber-200">
          <div className="text-center">
            <div className="bg-amber-100 p-4 rounded-full w-20 h-20 mx-auto mb-3 flex items-center justify-center">
              <FiInfo className="text-amber-600 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-amber-700 mb-3">Partnership Invitation</h3>
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-3">
              This invitation is no longer valid. The partnership is already {partnership.status}.
            </div>
            <button
              onClick={() => navigate("/partnerships")}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
            >
              Back to Partnerships
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl border border-blue-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative z-10">
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <FiUsers className="text-2xl" />
                </div>
                <h1 className="text-xl font-bold mb-2">Partnership Invitation</h1>
                <p className="text-blue-100 text-sm">You've been invited to form a strategic partnership</p>
              </div>
            </div>
          </div>

          {/* Content - Layout Horizontal */}
          <div className="p-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Colonne 1: Organization Details */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-r from-blue-50 to-blue-50 p-4 rounded-lg border border-blue-100 h-full">
                  <h2 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
                    <div className="bg-blue-100 p-2 rounded-xl mr-3">
                      <FiHome className="text-blue-600" />
                    </div>
                    Organization Details
                  </h2>

                  <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-50 h-full">
                    {/* Header de l'organisation */}
                    <div className="flex items-center mb-4 pb-4 border-b border-blue-100">
                      <div className="bg-gradient-to-r from-blue-100 to-blue-100 p-3 rounded-lg w-16 h-16 flex items-center justify-center mr-4">
                        <FiHome className="text-2xl text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-blue-900 mb-1">{partnership.initiator.name}</h3>
                        <p className="text-blue-600 flex items-center">
                          <FiMail className="mr-2" /> {partnership.initiator.email}
                        </p>
                      </div>
                    </div>

                    {/* Détails en grille horizontale */}
                    {partnership.initiator.type === "University" ? (
                      <div className="space-y-4">
                        {partnership.initiator.description && (
                          <div className="bg-blue-50 p-4 rounded-xl">
                            <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                              <FiInfo className="mr-2" />
                              About
                            </h4>
                            <p className="text-gray-700">{partnership.initiator.description}</p>
                          </div>
                        )}
                        {partnership.initiator.contactPerson && (
                          <div className="bg-blue-50 p-4 rounded-xl">
                            <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                              <FiUser className="mr-2" />
                              Contact Person
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="flex items-center">
                                <FiUser className="mr-2 text-blue-600" />
                                <span className="text-gray-700">{partnership.initiator.contactPerson.name}</span>
                              </div>
                              <div className="flex items-center">
                                <FiPhone className="mr-2 text-blue-600" />
                                <span className="text-gray-700">{partnership.initiator.contactPerson.phone}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {partnership.initiator.description && (
                          <div className="bg-blue-50 p-4 rounded-xl">
                            <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                              <FiInfo className="mr-2" />
                              About
                            </h4>
                            <p className="text-gray-700">{partnership.initiator.description}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-4 rounded-xl">
                            <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                              <FiMapPin className="mr-2" />
                              Location
                            </h4>
                            <p className="text-gray-700">
                              {partnership.initiator.address?.street}, {partnership.initiator.address?.city}
                            </p>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-xl">
                            <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                              <FiHome className="mr-2" />
                              Sector
                            </h4>
                            <p className="text-gray-700">{partnership.initiator.sector}</p>
                          </div>
                        </div>

                        {partnership.initiator.website && (
                          <div className="bg-green-50 p-4 rounded-xl">
                            <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                              <FiGlobe className="mr-2" />
                              Website
                            </h4>
                            <p className="text-gray-700 flex items-center">
                              <FiGlobe className="mr-2 text-green-600" />
                              {partnership.initiator.website}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message de partenariat */}
                    {partnership.request_message && (
                      <div className="mt-4 pt-4 border-t border-blue-100">
                        <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                          <FiMail className="mr-2" />
                          Partnership Message
                        </h4>
                        <div className="bg-blue-50 p-4 rounded-xl">
                          <p className="text-gray-700 italic">"{partnership.request_message}"</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Colonne 2: Response Form */}
              <div className="lg:col-span-1">
                <form onSubmit={handleSubmit} className="space-y-4 h-full">
                  <div className="bg-gradient-to-r from-green-50 to-red-50 p-4 rounded-lg border border-gray-200 h-full flex flex-col">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center justify-center">
                      <div className="bg-gray-100 p-2 rounded-xl mr-3">
                        <FiInfo className="text-gray-600" />
                      </div>
                      Your Response
                    </h2>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col justify-center">
                      <div className="space-y-4">
                        <label className="cursor-pointer block">
                          <input
                            type="radio"
                            className="sr-only"
                            name="action"
                            value="accept"
                            checked={action === "accept"}
                            onChange={() => setAction("accept")}
                          />
                          <div
                            className={`flex items-center p-4 rounded-xl border-2 transition-all ${
                              action === "accept"
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200 bg-white hover:border-green-300"
                            }`}
                          >
                            <div
                              className={`p-3 rounded-full mr-4 ${action === "accept" ? "bg-green-100" : "bg-gray-100"}`}
                            >
                              <FiCheckCircle
                                className={`text-xl ${action === "accept" ? "text-green-600" : "text-gray-400"}`}
                              />
                            </div>
                            <div>
                              <span
                                className={`font-semibold block ${action === "accept" ? "text-green-700" : "text-gray-600"}`}
                              >
                                Accept Partnership
                              </span>
                              <span className="text-sm text-gray-500">Begin collaboration</span>
                            </div>
                          </div>
                        </label>

                        <label className="cursor-pointer block">
                          <input
                            type="radio"
                            className="sr-only"
                            name="action"
                            value="reject"
                            checked={action === "reject"}
                            onChange={() => setAction("reject")}
                          />
                          <div
                            className={`flex items-center p-4 rounded-xl border-2 transition-all ${
                              action === "reject"
                                ? "border-red-500 bg-red-50"
                                : "border-gray-200 bg-white hover:border-red-300"
                            }`}
                          >
                            <div
                              className={`p-3 rounded-full mr-4 ${action === "reject" ? "bg-red-100" : "bg-gray-100"}`}
                            >
                              <FiX className={`text-xl ${action === "reject" ? "text-red-600" : "text-gray-400"}`} />
                            </div>
                            <div>
                              <span
                                className={`font-semibold block ${action === "reject" ? "text-red-700" : "text-gray-600"}`}
                              >
                                Decline Partnership
                              </span>
                              <span className="text-sm text-gray-500">Politely decline</span>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mt-4">
                        <div className="flex items-center">
                          <FiAlertCircle className="mr-2" />
                          {error}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-3 pt-4 mt-auto">
                      <button
                        type="submit"
                        className={`w-full py-3 text-white rounded-lg transition-all flex items-center justify-center font-medium ${
                          action === "accept"
                            ? "bg-green-600 hover:bg-green-700"
                            : action === "reject"
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-gray-400 cursor-not-allowed"
                        }`}
                        disabled={!action}
                      >
                        {action === "accept" ? (
                          <FiCheckCircle className="mr-2" />
                        ) : action === "reject" ? (
                          <FiX className="mr-2" />
                        ) : null}
                        {action === "accept"
                          ? "Confirm Acceptance"
                          : action === "reject"
                            ? "Confirm Decline"
                            : "Select Response"}
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate("/partnerships")}
                        className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center font-medium"
                      >
                        <FiX className="mr-2" /> Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PartnershipAcceptPage
