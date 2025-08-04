"use client"

import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import FullCalendar from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"
import axios from "axios"
import { jwtDecode } from "jwt-decode"
import { useContext, useEffect, useRef, useState } from "react"
import { FiCalendar, FiClock, FiInfo, FiPlus, FiSave, FiTrash2 } from "react-icons/fi"
import { toast } from "react-toastify"
import { ProfessorContext } from "../../context/ProfessorContext"

const ProfessorAvailability = () => {
  const { dToken, backendUrl } = useContext(ProfessorContext)
  const [selectedDates, setSelectedDates] = useState([]) // Slots selected by the user in this session (light blue)
  const [existingAvailabilities, setExistingAvailabilities] = useState([]) // Slots already saved from previous sessions (dark blue)
  const [datesToRemove, setDatesToRemove] = useState([]) // Existing slots marked for removal (red)
  const [isLoading, setIsLoading] = useState(true)
  const calendarRef = useRef(null)
  const [professorId, setProfessorId] = useState(null)
  const [currentView, setCurrentView] = useState("timeGridWeek")

  useEffect(() => {
    if (dToken) {
      try {
        const decoded = jwtDecode(dToken)
        setProfessorId(decoded.id)
      } catch (error) {
        console.error("Error decoding token:", error)
        toast.error("Authentication error")
      }
    }
  }, [dToken])

  useEffect(() => {
    if (professorId) {
      fetchAvailability()
    }
  }, [professorId])

  // Fetch existing availabilities from the backend
  const fetchAvailability = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${backendUrl || "http://localhost:4000"}/api/Professor/availability`, {
        headers: { dToken },
        params: { professorId },
      })
      // Ensure response is an array and store it
      setExistingAvailabilities(Array.isArray(response.data) ? response.data.map(normalizeDate) : [])
      // Reset temporary selections upon fetching
      setSelectedDates([])
      setDatesToRemove([])
    } catch (error) {
      console.error("Error fetching availability:", error)
      toast.error("Failed to load availability data")
    } finally {
      setIsLoading(false)
    }
  }

  // Normalize date string to ISO format
  const normalizeDate = (dateStr) => {
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? null : date.toISOString()
  }

  // Check if two date strings represent the same hour slot
  const isSameHourSlot = (date1, date2) => {
    if (!date1 || !date2) return false
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate() &&
      d1.getHours() === d2.getHours()
    )
  }

  // Check if a date string corresponds to an existing availability slot
  const isExistingSlot = (dateStr) => {
    return existingAvailabilities.some((date) => isSameHourSlot(date, dateStr))
  }

  // Check if a date string corresponds to a slot marked for removal
  const isMarkedForRemoval = (dateStr) => {
    return datesToRemove.some((date) => isSameHourSlot(date, dateStr))
  }

  // Handle clicks or selections on the calendar grid
  const handleDateSelect = (selectInfo) => {
    const dateStr = selectInfo.startStr.split("T")[0]
    const viewType = selectInfo.view.type
    setCurrentView(viewType)

    // --- Month View Logic ---
    // Allows selecting/deselecting all working hours for a specific day
    if (viewType === "dayGridMonth") {
      // Check if any slot on this day is already in the 'new selections' (light blue)
      const hasSelectedSlots = selectedDates.some((d) => d.split("T")[0] === dateStr)

      if (hasSelectedSlots) {
        // If yes, remove all 'new selections' for this day
        setSelectedDates((prev) => prev.filter((d) => d.split("T")[0] !== dateStr))
      } else {
        // If no, add all working hours (8am-5pm) for this day as 'new selections'
        const slots = []
        const start = new Date(dateStr)
        start.setHours(8, 0, 0, 0)
        for (let i = 0; i < 10; i++) {
          // 8:00 to 17:00 (10 slots)
          const slotTime = new Date(start)
          slotTime.setHours(start.getHours() + i)
          const slotIso = slotTime.toISOString()

          // Only add if it's NOT an existing slot (dark blue) OR if it IS marked for removal (red)
          if (!isExistingSlot(slotIso) || isMarkedForRemoval(slotIso)) {
            slots.push(slotIso)
          }
        }

        // Add the generated slots to 'new selections' (light blue)
        setSelectedDates((prev) => [...new Set([...prev, ...slots])]) // Use Set to avoid duplicates
        // Ensure these newly added slots are not marked for removal (remove from red)
        setDatesToRemove((prev) => prev.filter((d) => !slots.some((slot) => isSameHourSlot(d, slot))))
      }
    }
    // --- Time Grid (Week/Day) View Logic ---
    else {
      const clickedDate = new Date(selectInfo.startStr)
      const hour = clickedDate.getHours()

      // Validate if the selected time is within working hours
      if (hour < 8 || hour >= 18) {
        toast.warning("Please select time between 8:00 AM and 5:00 PM")
        selectInfo.view.calendar.unselect() // Clear the visual selection
        return
      }

      const clickedSlot = normalizeDate(selectInfo.startStr)
      if (!clickedSlot) return // Exit if date is invalid

      // Case 1: Clicked on an existing slot (dark blue)
      if (isExistingSlot(clickedSlot)) {
        if (isMarkedForRemoval(clickedSlot)) {
          // If already marked for removal (red), unmark it (remove from red)
          setDatesToRemove((prev) => prev.filter((d) => !isSameHourSlot(d, clickedSlot)))
        } else {
          // If not marked for removal, mark it (add to red)
          setDatesToRemove((prev) => [...prev, clickedSlot])
          // Ensure it's not in 'new selections' if it's being marked for removal
          setSelectedDates((prev) => prev.filter((d) => !isSameHourSlot(d, clickedSlot)))
        }
      }
      // Case 2: Clicked on an empty slot or a 'new selection' slot (light blue)
      else {
        const slotExistsInNew = selectedDates.some((d) => isSameHourSlot(d, clickedSlot))
        setSelectedDates(
          (prev) =>
            slotExistsInNew
              ? prev.filter((d) => !isSameHourSlot(d, clickedSlot)) // If already selected (light blue), deselect it
              : [...prev, clickedSlot], // Otherwise, select it (add to light blue)
        )
      }
    }

    // Clear the visual selection highlight in the calendar
    selectInfo.view.calendar.unselect()
  }

  // Handle clicks directly on event blocks
  const handleEventClick = (clickInfo) => {
    const clickedDate = normalizeDate(clickInfo.event.start)
    if (!clickedDate) return
    const eventType = clickInfo.event.extendedProps?.type

    // Clicked on an existing slot (dark blue)
    if (eventType === "existing") {
      if (isMarkedForRemoval(clickedDate)) {
        // If it was marked for removal (red), unmark it
        setDatesToRemove((prev) => prev.filter((d) => !isSameHourSlot(d, clickedDate)))
      } else {
        // Otherwise, mark it for removal (red)
        setDatesToRemove((prev) => [...prev, clickedDate])
        // Ensure it's not in 'new selections' if it's being marked for removal
        setSelectedDates((prev) => prev.filter((d) => !isSameHourSlot(d, clickedDate)))
      }
    }
    // Clicked on a slot marked for removal (red)
    else if (eventType === "to-remove") {
      // Unmark it (remove from red)
      setDatesToRemove((prev) => prev.filter((d) => !isSameHourSlot(d, clickedDate)))
    }
    // Clicked on a new selection (light blue)
    else if (eventType === "new") {
      // Deselect it (remove from light blue)
      setSelectedDates((prev) => prev.filter((d) => !isSameHourSlot(d, clickedDate)))
    }
  }

  // Handle submission of changes to the backend
  const handleSubmit = async () => {
    if (!professorId) {
      toast.error("Authentication required")
      return
    }

    try {
      setIsLoading(true) // Add loading state when submitting

      // Normalize all dates to ISO format to ensure consistency
      const formattedDatesToAdd = selectedDates
        .filter((date) => date) // Filter out any null values
        .map((date) => new Date(date).toISOString())

      const formattedDatesToRemove = datesToRemove
        .filter((date) => date) // Filter out any null values
        .map((date) => new Date(date).toISOString())

      // Log data being sent for debugging
      console.log("Sending dates to add:", formattedDatesToAdd)
      console.log("Sending dates to remove:", formattedDatesToRemove)

      const response = await axios.post(
        `${backendUrl || "http://localhost:4000"}/api/Professor/availability`,
        {
          dates: formattedDatesToAdd, // Send new selections
          datesToRemove: formattedDatesToRemove, // Send slots marked for removal
          professorId: professorId,
        },
        {
          headers: { dToken },
          // Add a longer timeout for potentially large requests
          timeout: 10000,
        },
      )

      console.log("Server response:", response.data)
      toast.success("Availability saved successfully!")

      // Refetch availability to show the updated state (all confirmed slots become dark blue)
      fetchAvailability()
    } catch (error) {
      console.error("Error saving availability:", error)

      // Enhanced error handling
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        console.error("Server error data:", error.response.data)
        toast.error(error.response.data?.message || "Server error: " + error.response.status)
      } else if (error.request) {
        // The request was made but no response was received
        toast.error("No response from server. Please check your connection.")
      } else {
        // Something else triggered the error
        toast.error("Error: " + error.message)
      }
    } finally {
      setIsLoading(false) // Clear loading state
    }
  }

  // Generate event objects for FullCalendar based on current state
  const getCalendarEvents = () => {
    const events = []

    // 1. Existing Availabilities (Dark Blue)
    existingAvailabilities.forEach((date) => {
      // Only show if NOT marked for removal
      if (!isMarkedForRemoval(date)) {
        events.push({
          title: "Available",
          start: date,
          end: new Date(new Date(date).getTime() + 60 * 60 * 1000).toISOString(), // Assuming 1-hour slots
          backgroundColor: "#1d4ed8", // Darker Blue (blue-700)
          borderColor: "#1e40af", // blue-800
          textColor: "#eff6ff", // Light text for contrast
          extendedProps: { type: "existing" },
        })
      }
    })

    // 2. Slots Marked for Removal (Red)
    datesToRemove.forEach((date) => {
      events.push({
        title: "To Remove",
        start: date,
        end: new Date(new Date(date).getTime() + 60 * 60 * 1000).toISOString(),
        backgroundColor: "#ef4444", // Red (red-500)
        borderColor: "#dc2626", // red-600
        textColor: "#fef2f2", // Light text
        extendedProps: { type: "to-remove" },
      })
    })

    // 3. New Selections (Light Blue)
    selectedDates.forEach((date) => {
      // Only show if not also an existing slot that isn't marked for removal
      // (Prevents showing light blue over dark blue if logic error occurs)
      if (!isExistingSlot(date) || isMarkedForRemoval(date)) {
        events.push({
          title: "Selected",
          start: date,
          end: new Date(new Date(date).getTime() + 60 * 60 * 1000).toISOString(),
          backgroundColor: "#60a5fa", // Lighter Blue (blue-400)
          borderColor: "#3b82f6", // blue-500
          textColor: "#1e3a8a", // Darker text
          extendedProps: { type: "new" },
        })
      }
    })

    // Optional: Background highlighting for days with any new selections in month view
    const selectedDays = {}
    selectedDates.forEach((date) => {
      const dayKey = date.split("T")[0]
      selectedDays[dayKey] = true
    })
    Object.keys(selectedDays).forEach((day) => {
      events.push({
        // title: "Selected Day", // No title needed for background
        start: day,
        allDay: true,
        display: "background",
        backgroundColor: "#dbeafe", // Very light blue (blue-100)
      })
    })

    return events
  }

  // Render loading state or login prompt if necessary
  if (!professorId && !dToken) {
    // Check dToken as well, might be decoding
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-blue-100 p-8 text-center">
          <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCalendar className="text-4xl text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-blue-800 mb-2">Authentication Required</h2>
          <p className="text-slate-600">Please log in to manage your availability schedule</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-blue-100 p-8 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
            </div>
            <p className="mt-6 text-blue-700 font-medium">Loading your availability calendar...</p>
          </div>
        </div>
      </div>
    )
  }

  // Render the main component
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 p-6 border border-blue-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-blue-600/10 rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-3 rounded-xl shadow-md mr-4">
                <FiCalendar className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-900">Manage Your Availability</h1>
                <p className="text-blue-600 mt-1">Set your available time slots for defense sessions and meetings</p>
              </div>
            </div>
            <p className="text-slate-600 max-w-3xl">
              Click on time slots to mark your availability. You can add new slots (light blue), remove existing slots
              (red), or keep your current availability (dark blue).
            </p>
          </div>
        </div>

        {/* Calendar Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100 mb-8">
          {/* Calendar Header */}
          <div className="bg-gradient-to-r from-blue-500/10 to-blue-400/5 p-4 border-b border-blue-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <FiClock className="text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-blue-800">Availability Calendar</h2>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-3">
              <div className="bg-blue-50 px-3 py-1.5 rounded-lg flex items-center">
                <div className="w-3 h-3 bg-blue-700 rounded-sm mr-2"></div>
                <span className="text-sm font-medium text-blue-800">
                  {existingAvailabilities.filter((d) => !isMarkedForRemoval(d)).length} Existing
                </span>
              </div>
              <div className="bg-blue-50 px-3 py-1.5 rounded-lg flex items-center">
                <div className="w-3 h-3 bg-blue-400 rounded-sm mr-2"></div>
                <span className="text-sm font-medium text-blue-800">{selectedDates.length} New</span>
              </div>
              <div className="bg-blue-50 px-3 py-1.5 rounded-lg flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-sm mr-2"></div>
                <span className="text-sm font-medium text-blue-800">{datesToRemove.length} To Remove</span>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="p-4">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
              initialView="timeGridWeek"
              selectable={true}
              select={handleDateSelect} // Handles grid clicks/selections
              eventClick={handleEventClick} // Handles clicks on existing event blocks
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek",
              }}
              events={getCalendarEvents()} // Fetch events from our state
              height="auto" // Adjust height automatically
              contentHeight={650} // Set a specific content height
              aspectRatio={1.8}
              selectMirror={true} // Show placeholder event while selecting
              allDaySlot={false} // Don't show the all-day slot row
              slotMinTime="08:00:00"
              slotMaxTime="18:00:00" // Show until 6 PM to include 5 PM slot
              slotDuration="01:00:00"
              businessHours={{
                daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
                startTime: "08:00",
                endTime: "18:00",
              }}
              eventDisplay="block" // Render events as solid blocks
              eventClassNames="cursor-pointer hover:opacity-80 transition-opacity duration-150 rounded-md shadow-sm"
              dayHeaderClassNames="bg-blue-50 text-blue-800 font-medium"
              nowIndicator={true} // Show the current time indicator
              nowIndicatorClassNames="bg-red-500/80"
              viewDidMount={(info) => setCurrentView(info.view.type)}
            />
          </div>
        </div>

        {/* Instructions Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-5 border border-blue-100 shadow-md flex items-start">
            <div className="bg-blue-100 p-2 rounded-lg mr-3 mt-0.5">
              <FiPlus className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Adding Availability</h3>
              <p className="text-sm text-slate-600">
                {currentView === "dayGridMonth"
                  ? "Click on any day to add all working hours (8 AM - 5 PM)."
                  : "Click on empty time slots to mark yourself as available."}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-blue-100 shadow-md flex items-start">
            <div className="bg-blue-100 p-2 rounded-lg mr-3 mt-0.5">
              <FiTrash2 className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Removing Availability</h3>
              <p className="text-sm text-slate-600">
                Click on existing slots (dark blue) to mark them for removal. Click again to undo.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-blue-100 shadow-md flex items-start">
            <div className="bg-blue-100 p-2 rounded-lg mr-3 mt-0.5">
              <FiInfo className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Working Hours</h3>
              <p className="text-sm text-slate-600">
                You can only set availability between 8:00 AM and 5:00 PM on weekdays.
              </p>
            </div>
          </div>
        </div>

        {/* Legend and Save Button */}
        <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            {/* Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center bg-blue-50 p-3 rounded-lg">
                <div className="w-5 h-5 bg-blue-400 mr-3 rounded-md shadow-sm border border-blue-500"></div>
                <div>
                  <span className="text-blue-800 font-medium">New Selection</span>
                  <p className="text-xs text-blue-600">Slots you're adding</p>
                </div>
              </div>
              <div className="flex items-center bg-blue-50 p-3 rounded-lg">
                <div className="w-5 h-5 bg-blue-700 mr-3 rounded-md shadow-sm border border-blue-800"></div>
                <div>
                  <span className="text-blue-800 font-medium">Existing</span>
                  <p className="text-xs text-blue-600">Your current availability</p>
                </div>
              </div>
              <div className="flex items-center bg-blue-50 p-3 rounded-lg">
                <div className="w-5 h-5 bg-red-500 mr-3 rounded-md shadow-sm border border-red-600"></div>
                <div>
                  <span className="text-blue-800 font-medium">To Remove</span>
                  <p className="text-xs text-blue-600">Slots being deleted</p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSubmit}
              className={`px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-md font-medium flex items-center ${
                selectedDates.length === 0 && datesToRemove.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:shadow-lg transform hover:-translate-y-0.5"
              }`}
              disabled={selectedDates.length === 0 && datesToRemove.length === 0}
            >
              <FiSave className="mr-2 h-5 w-5" />
              Save Changes
              {/* Display count of changes */}
              {(selectedDates.length > 0 || datesToRemove.length > 0) && (
                <span className="ml-3 px-2.5 py-1 bg-white/20 rounded-full text-xs font-medium">
                  {selectedDates.length > 0 && `${selectedDates.length} new`}
                  {selectedDates.length > 0 && datesToRemove.length > 0 && " • "}
                  {datesToRemove.length > 0 && `${datesToRemove.length} removed`}
                </span>
              )}
            </button>
          </div>

          {/* Tip Text */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
            <div className="text-blue-500 mt-0.5">
              <FiInfo className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-800">Pro Tip</h3>
              <p className="text-xs text-blue-700 mt-1">
                Switch between month and week views using the buttons in the top right. Month view allows you to quickly
                add all working hours for entire days, while week view gives you more precise control over individual
                time slots.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfessorAvailability
