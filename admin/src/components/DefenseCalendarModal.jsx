"use client"

import axios from "axios"
import { useEffect, useState } from "react"
import { FiAlertCircle, FiCalendar, FiCheck, FiChevronLeft, FiChevronRight, FiClock, FiUser, FiX } from "react-icons/fi"

const getAuthToken = () => {
  // Try different possible token names in localStorage
  return localStorage.getItem('aToken') || 
         localStorage.getItem('token') || 
         localStorage.getItem('utoken') || 
         localStorage.getItem('authToken');
};

// Create axios headers with authentication
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    // Send token in multiple headers to match your backend expectations
    'token': token,
    'atoken': token,
    'utoken': token,
    'Authorization': `Bearer ${token}`
  };
};

const DefenseCalendarModal = ({ defense, onClose, onDateChange }) => {
  const [calendarData, setCalendarData] = useState({})
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [selectedProfessors, setSelectedProfessors] = useState([])
  const [loadingCalendar, setLoadingCalendar] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [successMessage, setSuccessMessage] = useState("")
  const [error, setError] = useState(null)

  useEffect(() => {
    if (defense) {
      const today = new Date()
      setCurrentMonth(today)
      fetchMonthAvailability(today)
    }
  }, [defense])

  const fetchMonthAvailability = async (date) => {
    setLoadingCalendar(true)
    setError(null)

    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const startDate = firstDay.toISOString().split("T")[0]
    const endDate = lastDay.toISOString().split("T")[0]

    try {
      // Check if token exists
      const token = getAuthToken();
      if (!token) {
        setError("Authentication token not found. Please login again.");
        setLoadingCalendar(false);
        return;
      }

      console.log('Making request with token:', token ? 'Token present' : 'No token');

      const response = await axios.get(
        `http://localhost:4000/api/defense/allProfessorAvailability?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: getAuthHeaders()
        }
      )

      if (response.data.success) {
        // Normalize time and deduplicate professors
        const normalizedAvailability = {}
        for (const [date, professors] of Object.entries(response.data.availability)) {
          const uniqueProfessors = []
          const seen = new Set()
          for (const prof of professors) {
            // Normalize time to HH:MM
            const normalizedTime = prof.time.match(/^\d{1,2}:\d{2}$/) ? prof.time.padStart(5, "0") : prof.time
            const key = `${prof.professorId}-${normalizedTime}`
            if (!seen.has(key)) {
              seen.add(key)
              uniqueProfessors.push({ ...prof, time: normalizedTime })
            }
          }
          normalizedAvailability[date] = uniqueProfessors
        }
        setCalendarData(normalizedAvailability)
        console.log('Calendar data loaded:', Object.keys(normalizedAvailability).length, 'days');
      } else {
        setCalendarData({})
        setError(response.data.message || "Failed to fetch availability data")
      }
    } catch (err) {
      console.error("Error fetching calendar data:", err)
      setCalendarData({})
      
      if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.")
      } else if (err.response?.status === 403) {
        setError("Access denied. You don't have permission to view this data.")
      } else {
        setError(err.response?.data?.message || "Server connection error")
      }
    }

    setLoadingCalendar(false)
  }

  const changeMonth = (increment) => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + increment)
    setCurrentMonth(newMonth)
    fetchMonthAvailability(newMonth)
  }

  const handleProfessorSelection = (professor, time) => {
    // Normalize time to HH:MM
    const normalizedTime = time.match(/^\d{1,2}:\d{2}$/) ? time.padStart(5, "0") : time
    setSelectedTimeSlot(normalizedTime)

    setSelectedProfessors((prev) => {
      if (!selectedDate || !prev.some((p) => p.date === selectedDate)) {
        return [
          {
            ...professor,
            date: selectedDate,
            time: normalizedTime,
          },
        ]
      }

      const isSelected = prev.some((p) => p.professorId === professor.professorId && p.date === selectedDate)

      if (isSelected) {
        return prev.filter((p) => !(p.professorId === professor.professorId && p.date === selectedDate))
      } else {
        if (prev.filter((p) => p.date === selectedDate).length < 3) {
          return [
            ...prev,
            {
              ...professor,
              date: selectedDate,
              time: normalizedTime,
            },
          ]
        }
        return prev
      }
    })
  }

  const generateCalendar = () => {
    if (!currentMonth) return null

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDayOfMonth = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    let dayOfWeek = firstDayOfMonth.getDay()
    dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1

    const calendar = []
    let week = []

    for (let i = 0; i < dayOfWeek; i++) {
      week.push(<td key={`empty-${i}`} className="p-1 border border-blue-100"></td>)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()
      const isSelected = dateStr === selectedDate

      const professorsForDay = calendarData[dateStr] || []
      const hasAvailableProfessors = professorsForDay.length > 0

      const handleDateClick = () => {
        setSelectedDate(dateStr)
        setSelectedTimeSlot(null)
        setSelectedProfessors((prev) => prev.filter((p) => p.date === dateStr))
      }

      const professorsByTime = {}
      professorsForDay.forEach((prof) => {
        if (!professorsByTime[prof.time]) {
          professorsByTime[prof.time] = []
        }
        professorsByTime[prof.time].push(prof)
      })

      week.push(
        <td
          key={`day-${day}`}
          className={`p-1 border ${isToday ? "bg-blue-50" : ""} ${
            isSelected ? "bg-blue-100 border-blue-400" : "border-blue-100"
          } 
                     ${
                       hasAvailableProfessors
                         ? "cursor-pointer hover:bg-blue-50 transition-colors"
                         : "opacity-50 cursor-default"
                     }`}
          onClick={hasAvailableProfessors ? handleDateClick : undefined}
        >
          <div className="h-full min-h-16">
            <div
              className={`text-center mb-1 font-medium ${
                isToday ? "text-blue-600" : isSelected ? "text-blue-800" : "text-slate-700"
              }`}
            >
              {day}
              {isToday && <span className="block text-xs text-blue-500 font-medium">Today</span>}
            </div>
            {hasAvailableProfessors && (
              <div className="text-xs max-h-32 overflow-y-auto">
                {Object.entries(professorsByTime)
                  .sort(([timeA], [timeB]) => timeA.localeCompare(timeB))
                  .map(([time, professors]) => (
                    <div key={`${dateStr}-${time}`} className="mb-1">
                      <div className="font-medium text-xs text-blue-700">{time}</div>
                      {professors.map((prof, index) => {
                        const isSelectedInThisSlot = selectedProfessors.some(
                          (p) => p.professorId === prof.professorId && p.date === dateStr && p.time === time,
                        )

                        return (
                          <div
                            key={`${dateStr}-${time}-${prof.professorId}-${index}`}
                            className={`my-1 p-1 rounded text-center ${
                              isSelectedInThisSlot
                                ? "bg-blue-600 text-white shadow-sm"
                                : "bg-white border border-blue-200 text-blue-800 hover:bg-blue-50"
                            } transition-colors`}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedDate(dateStr)
                              handleProfessorSelection(prof, time)
                            }}
                          >
                            <div className="truncate text-xs">{prof.name}</div>
                            <div className="text-[10px] mt-1">
                              {prof.currentDefenses}/{prof.maxDefenses} defenses
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </td>,
      )

      if (week.length === 7) {
        calendar.push(<tr key={`week-${calendar.length}`}>{week}</tr>)
        week = []
      }
    }

    if (week.length > 0) {
      while (week.length < 7) {
        week.push(<td key={`empty-end-${week.length}`} className="p-1 border border-blue-100"></td>)
      }
      calendar.push(<tr key={`week-${calendar.length}`}>{week}</tr>)
    }

    return calendar
  }

  const handleSubmit = async () => {
    if (!defense || !selectedDate || !selectedTimeSlot || selectedProfessors.length === 0) {
      setError("Please select a date, time, and at least one professor")
      return
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      setError("Invalid date format")
      return
    }

    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(selectedTimeSlot)) {
      setError("Invalid time format. Please select a valid time (HH:MM)")
      return
    }

    const professorsForSelectedDate = selectedProfessors.filter((p) => p.date === selectedDate)

    const payload = {
      defenseId: defense._id,
      date: selectedDate,
      time: selectedTimeSlot,
      professorIds: professorsForSelectedDate.map((p) => p.professorId),
    }

    console.log("Submitting payload:", payload)

    try {
      setSubmitting(true)
      setError(null)
      setSuccessMessage("")

      // Check if token exists
      const token = getAuthToken();
      if (!token) {
        setError("Authentication token not found. Please login again.");
        return;
      }

      const response = await axios.post(
        "http://localhost:4000/api/defense/updateDefenseAndJury", 
        payload, 
        {
          headers: getAuthHeaders()
        }
      )

      if (response.data.success) {
        setSuccessMessage(
          `Defense scheduled successfully with ${professorsForSelectedDate.length} professor${
            professorsForSelectedDate.length > 1 ? "s" : ""
          }!`,
        )
        onDateChange(
          defense._id,
          selectedDate,
          selectedTimeSlot,
          professorsForSelectedDate.map((p) => p.professorId),
        )
        setTimeout(() => onClose(), 2000)
      } else {
        setError(response.data.message || "Failed to update defense")
      }
    } catch (err) {
      console.error("Error updating defense:", {
        error: err.message,
        response: err.response?.data,
        status: err.response?.status,
      })
      
      if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.")
      } else if (err.response?.status === 403) {
        setError("Access denied. You don't have permission to perform this action.")
      } else {
        setError(err.response?.data?.message || "Failed to update defense. Please try again.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10 flex items-center">
            <div className="bg-white/20 p-2 rounded-lg mr-3">
              <FiCalendar className="text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Schedule Defense</h2>
              <p className="text-sm opacity-90">Select date, time and jury members</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-10"
            title="Close"
            aria-label="Close modal"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <FiCheck className="text-green-600" />
            </div>
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
            <div className="bg-red-100 p-2 rounded-full mr-3">
              <FiAlertCircle className="text-red-600" />
            </div>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Month Navigation */}
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => changeMonth(-1)}
                  className="flex items-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                >
                  <FiChevronLeft className="mr-1" /> Previous
                </button>
                <h3 className="text-lg font-bold text-blue-900">
                  {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h3>
                <button
                  onClick={() => changeMonth(1)}
                  className="flex items-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                >
                  Next <FiChevronRight className="ml-1" />
                </button>
              </div>

              {/* Calendar */}
              {loadingCalendar ? (
                <div className="flex justify-center py-16">
                  <div className="relative w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto bg-white rounded-xl border border-blue-100 shadow-sm">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                          <th key={day} className="border border-blue-100 p-2 bg-blue-50 text-blue-800 font-medium">
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>{generateCalendar()}</tbody>
                  </table>
                </div>
              )}

              {/* Available Professors for Selected Date */}
              {selectedDate && calendarData[selectedDate] && (
                <div className="mt-6 bg-white rounded-xl p-6 shadow-md border border-blue-100">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <FiUser className="text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-blue-900">
                      Available on{" "}
                      {new Date(selectedDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </h4>
                  </div>

                  <div className="space-y-6">
                    {Object.entries(
                      calendarData[selectedDate].reduce((acc, prof) => {
                        if (!acc[prof.time]) acc[prof.time] = []
                        acc[prof.time].push(prof)
                        return acc
                      }, {}),
                    )
                      .sort(([timeA], [timeB]) => timeA.localeCompare(timeB))
                      .map(([time, professors]) => (
                        <div key={`${selectedDate}-${time}`} className="pb-4 border-b border-blue-100 last:border-0">
                          <div className="flex items-center mb-3">
                            <div className="bg-blue-100 p-1.5 rounded-full mr-2">
                              <FiClock className="text-blue-600 text-sm" />
                            </div>
                            <h5 className="text-sm font-semibold text-blue-800">{time}</h5>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {professors.map((prof, index) => {
                              const isSelected = selectedProfessors.some(
                                (p) => p.professorId === prof.professorId && p.date === selectedDate && p.time === time,
                              )

                              return (
                                <button
                                  key={`${selectedDate}-${time}-${prof.professorId}-${index}`}
                                  onClick={() => handleProfessorSelection(prof, time)}
                                  className={`p-3 rounded-xl text-left transition-all ${
                                    isSelected
                                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md transform scale-[1.02]"
                                      : "bg-white border border-blue-200 text-slate-700 hover:border-blue-400 hover:shadow-sm"
                                  }`}
                                  disabled={
                                    selectedProfessors.filter((p) => p.date === selectedDate).length >= 3 && !isSelected
                                  }
                                >
                                  <div className="flex items-start">
                                    <div
                                      className={`p-2 rounded-full mr-3 ${isSelected ? "bg-white/20" : "bg-blue-100"}`}
                                    >
                                      <FiUser className={isSelected ? "text-white" : "text-blue-600"} />
                                    </div>
                                    <div>
                                      <div className="font-medium">{prof.name}</div>
                                      <div className="text-xs mt-1 flex items-center">
                                        <span
                                          className={`px-2 py-0.5 rounded-full ${
                                            isSelected ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700"
                                          }`}
                                        >
                                          {prof.currentDefenses}/{prof.maxDefenses} defenses
                                        </span>
                                      </div>
                                      {isSelected && (
                                        <div className="text-xs mt-2 flex items-center">
                                          <FiCheck className="mr-1" /> Selected
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Summary Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-md h-full">
                <h3 className="font-semibold text-blue-900 mb-4 pb-2 border-b border-blue-100 flex items-center">
                  <FiCalendar className="mr-2" /> Defense Summary
                </h3>

                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Selected Date:</p>
                    <p className="text-blue-800 font-semibold bg-blue-50 p-2 rounded-lg inline-block">
                      {selectedDate
                        ? new Date(selectedDate).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })
                        : "Not selected"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Selected Time:</p>
                    <p className="text-blue-800 font-semibold bg-blue-50 p-2 rounded-lg inline-block">
                      {selectedTimeSlot || "Not selected"}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-slate-500">
                        Selected Professors ({selectedProfessors.filter((p) => p.date === selectedDate).length}/3):
                      </p>
                      {selectedProfessors.filter((p) => p.date === selectedDate).length > 0 && (
                        <button
                          onClick={() => setSelectedProfessors((prev) => prev.filter((p) => p.date !== selectedDate))}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    {selectedProfessors.filter((p) => p.date === selectedDate).length > 0 ? (
                      <div className="space-y-3 mt-2">
                        {selectedProfessors
                          .filter((p) => p.date === selectedDate)
                          .map((prof) => (
                            <div
                              key={`selected-${prof.professorId}-${prof.date}`}
                              className="bg-white p-3 rounded-xl border border-blue-200 shadow-sm"
                            >
                              <div className="flex items-center">
                                <div className="bg-blue-100 p-2 rounded-full mr-3">
                                  <FiUser className="text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-slate-800">{prof.name}</p>
                                  <p className="text-xs text-blue-600 truncate">{prof.email}</p>
                                </div>
                                <button
                                  onClick={() => handleProfessorSelection(prof, prof.time)}
                                  className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-full transition-colors"
                                >
                                  <FiX />
                                </button>
                              </div>
                              <div className="flex justify-between items-center mt-2 pt-2 border-t border-blue-50">
                                <span className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded-full">
                                  {prof.currentDefenses}/{prof.maxDefenses} defenses
                                </span>
                                <span className="text-xs text-slate-500 flex items-center">
                                  <FiClock className="mr-1" /> {prof.time}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 italic text-sm bg-blue-50 p-3 rounded-lg">
                        No professors selected for this date
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-blue-100">
                  <button
                    onClick={handleSubmit}
                    disabled={
                      !selectedDate ||
                      selectedProfessors.filter((p) => p.date === selectedDate).length === 0 ||
                      submitting
                    }
                    className={`w-full py-3 rounded-xl font-medium text-white shadow-sm transition-all ${
                      !selectedDate ||
                      selectedProfessors.filter((p) => p.date === selectedDate).length === 0 ||
                      submitting
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                    }`}
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      `Schedule with ${selectedProfessors.filter((p) => p.date === selectedDate).length} Professor${
                        selectedProfessors.filter((p) => p.date === selectedDate).length !== 1 ? "s" : ""
                      }`
                    )}
                  </button>

                  <p className="mt-3 text-xs text-slate-500 text-center">
                    {selectedProfessors.filter((p) => p.date === selectedDate).length === 0
                      ? "Select up to 3 professors for the jury"
                      : selectedProfessors.filter((p) => p.date === selectedDate).length < 3
                        ? "You can select up to 3 professors"
                        : "Maximum 3 professors selected"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DefenseCalendarModal