"use client"

import axios from "axios"
import { set } from "date-fns"
import { Calendar, CalendarRange, CheckCircle, ClipboardList, Clock } from "lucide-react"
import { useContext, useState } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { toast } from "react-toastify"
import { AdminContext } from "../../context/AdminContext"

// Custom styles for DatePicker - included in the same file as requested
const datePickerStyles = `
  .react-datepicker {
    font-family: inherit;
    border-radius: 0.75rem;
    border: 1px solid #e2e8f0;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }

  .react-datepicker__header {
    background: linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05));
    border-bottom: 1px solid #e2e8f0;
    padding-top: 0.75rem;
  }

  .react-datepicker__current-month {
    font-weight: 600;
    color: #1e40af;
    padding-bottom: 0.5rem;
  }

  .react-datepicker__day-name {
    color: #64748b;
    font-weight: 500;
    width: 2rem;
    margin: 0.2rem;
  }

  .react-datepicker__day {
    width: 2rem;
    height: 2rem;
    line-height: 2rem;
    margin: 0.2rem;
    border-radius: 9999px;
    color: #334155;
  }

  .react-datepicker__day:hover {
    background-color: rgba(59, 130, 246, 0.1);
    border-radius: 9999px;
  }

  .react-datepicker__day--selected {
    background-color: #3b82f6;
    color: white;
    font-weight: 600;
  }

  .react-datepicker__day--keyboard-selected {
    background-color: rgba(59, 130, 246, 0.2);
    color: #1e40af;
  }

  .react-datepicker__day--today {
    font-weight: 600;
    color: #3b82f6;
  }

  .react-datepicker__time-container {
    border-left: 1px solid #e2e8f0;
  }

  .react-datepicker__time-container .react-datepicker__time {
    background: white;
  }

  .react-datepicker__time-container
    .react-datepicker__time
    .react-datepicker__time-box
    ul.react-datepicker__time-list
    li.react-datepicker__time-list-item {
    padding: 0.5rem;
    height: auto;
  }

  .react-datepicker__time-container
    .react-datepicker__time
    .react-datepicker__time-box
    ul.react-datepicker__time-list
    li.react-datepicker__time-list-item:hover {
    background-color: rgba(59, 130, 246, 0.1);
  }

  .react-datepicker__time-container
    .react-datepicker__time
    .react-datepicker__time-box
    ul.react-datepicker__time-list
    li.react-datepicker__time-list-item--selected {
    background-color: #3b82f6;
    color: white;
    font-weight: 600;
  }

  .react-datepicker__triangle {
    display: none;
  }

  .react-datepicker__year-dropdown-container {
    margin: 0 0.5rem;
  }

  .react-datepicker__year-dropdown {
    background-color: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .react-datepicker__year-option {
    padding: 0.5rem;
  }

  .react-datepicker__year-option:hover {
    background-color: rgba(59, 130, 246, 0.1);
  }

  .react-datepicker__year-option--selected {
    background-color: #3b82f6;
    color: white;
  }

  .react-datepicker__year-option--selected_year {
    font-weight: 600;
  }

  .react-datepicker__navigation {
    top: 0.75rem;
  }
`

const CreateSession = () => {
  const [formData, setFormData] = useState({
    type: "defense",
    startDate: null,
    startTime: null,
    endDate: null,
    endTime: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { backendUrl, aToken } = useContext(AdminContext)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      setIsSubmitting(true)

      const startDateTime = set(formData.startDate, {
        hours: formData.startTime.getHours(),
        minutes: formData.startTime.getMinutes(),
        seconds: 0,
        milliseconds: 0,
      })

      const endDateTime = set(formData.endDate, {
        hours: formData.endTime.getHours(),
        minutes: formData.endTime.getMinutes(),
        seconds: 0,
        milliseconds: 0,
      })

      const apiData = {
        type: formData.type,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
      }

      const { data } = await axios.post(`http://localhost:4000/api/session/createsession`, apiData, {
        headers: { aToken },
      })

      toast.success(data.message || "Session created successfully!")
      setFormData({
        type: "defense",
        startDate: null,
        startTime: null,
        endDate: null,
        endTime: null,
      })
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating session")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Custom styles for the DatePicker
  const datePickerWrapperClassName = "relative w-full"
  const datePickerClassName =
    "w-full p-3.5 pl-11 border border-blue-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all duration-200 shadow-sm text-slate-700"

  return (
    <>
      {/* Inject custom DatePicker styles */}
      <style>{datePickerStyles}</style>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl">
          {/* Header Card */}
          <div className="bg-white rounded-2xl shadow-xl mb-6 p-6 border border-blue-100 flex items-center gap-4">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-3.5 rounded-xl shadow-md">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-800">Create Academic Session</h1>
              <p className="text-slate-500">Schedule a new session for project submissions or defenses</p>
            </div>
          </div>

          {/* Main Form Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-blue-500/10 to-blue-400/5 p-6 border-b border-blue-100">
              <h2 className="text-lg font-semibold text-blue-800">Session Details</h2>
              <p className="text-slate-500 text-sm mt-1">Define the type and timeframe for this academic session</p>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Session Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-800 flex items-center gap-1.5">
                  <CalendarRange className="h-4 w-4 text-blue-500" />
                  Session Type
                </label>
                <div className="relative">
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-3.5 pl-11 border border-blue-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all duration-200 shadow-sm text-slate-700 appearance-none"
                  >
                    <option value="pfe_submission">Project Submission</option>
                    <option value="defense">Defense</option>
                  </select>
                  <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-blue-500">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-slate-500 ml-1">Select the type of academic session you want to create</p>
              </div>

              {/* Date and Time Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-800 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Start Date
                  </label>
                  <div className={datePickerWrapperClassName}>
                    <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <DatePicker
                      selected={formData.startDate}
                      onChange={(date) => setFormData({ ...formData, startDate: date })}
                      dateFormat="MMMM d, yyyy"
                      placeholderText="Select start date"
                      className={datePickerClassName}
                      showYearDropdown
                      scrollableYearDropdown
                      yearDropdownItemNumber={15}
                      wrapperClassName="w-full"
                      calendarClassName="shadow-xl border border-blue-100 rounded-xl"
                    />
                  </div>
                  <p className="text-xs text-slate-500 ml-1">The first day of the session</p>
                </div>

                {/* Start Time */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-800 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Start Time
                  </label>
                  <div className={datePickerWrapperClassName}>
                    <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                      <Clock className="h-5 w-5" />
                    </div>
                    <DatePicker
                      selected={formData.startTime}
                      onChange={(time) => setFormData({ ...formData, startTime: time })}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="h:mm aa"
                      placeholderText="Select start time"
                      className={datePickerClassName}
                      wrapperClassName="w-full"
                      calendarClassName="shadow-xl border border-blue-100 rounded-xl"
                    />
                  </div>
                  <p className="text-xs text-slate-500 ml-1">When the session begins</p>
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-800 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    End Date
                  </label>
                  <div className={datePickerWrapperClassName}>
                    <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <DatePicker
                      selected={formData.endDate}
                      onChange={(date) => setFormData({ ...formData, endDate: date })}
                      dateFormat="MMMM d, yyyy"
                      placeholderText="Select end date"
                      className={datePickerClassName}
                      showYearDropdown
                      scrollableYearDropdown
                      yearDropdownItemNumber={15}
                      minDate={formData.startDate}
                      wrapperClassName="w-full"
                      calendarClassName="shadow-xl border border-blue-100 rounded-xl"
                    />
                  </div>
                  <p className="text-xs text-slate-500 ml-1">The last day of the session</p>
                </div>

                {/* End Time */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-800 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-blue-500" />
                    End Time
                  </label>
                  <div className={datePickerWrapperClassName}>
                    <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                      <Clock className="h-5 w-5" />
                    </div>
                    <DatePicker
                      selected={formData.endTime}
                      onChange={(time) => setFormData({ ...formData, endTime: time })}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="h:mm aa"
                      placeholderText="Select end time"
                      className={datePickerClassName}
                      wrapperClassName="w-full"
                      calendarClassName="shadow-xl border border-blue-100 rounded-xl"
                    />
                  </div>
                  <p className="text-xs text-slate-500 ml-1">When the session concludes</p>
                </div>
              </div>

              {/* Session Duration Summary */}
              {formData.startDate && formData.endDate && formData.startTime && formData.endTime && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                  <div className="text-blue-500 mt-0.5">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Session Duration</h3>
                    <p className="text-xs text-blue-700 mt-1">
                      This {formData.type === "defense" ? "defense" : "project submission"} session will run from{" "}
                      {formData.startDate.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      at {formData.startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} to{" "}
                      {formData.endDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}{" "}
                      at {formData.endTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}.
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
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
                      Creating...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-5 w-5" />
                      Create Session
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center">
                Created sessions will be available for students to submit their projects or schedule defenses
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CreateSession
