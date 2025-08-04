"use client"

import { Archive, Bell, BellRing, Check, Settings, Trash2 } from "lucide-react"
import { useContext, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AdminContext } from "../../context/AdminContext"
import { CompanyContext } from "../../context/CompanyContext"
import { ExternalSupervisorContext } from "../../context/ExternalSupervisorContext"
import { GlobalAdminContext } from "../../context/GlobalAdminContext"
import { ProfessorContext } from "../../context/ProfessorContext"
import { useNotifications } from "../../hooks/useNotifications.jsx"

/**
 * Composant cloche de notification avec dropdown
 * @param {Object} props - Props du composant
 * @returns {JSX.Element} Composant cloche de notification
 */
const NotificationBell = ({
  className = "",
  showSettings = true,
  maxNotifications = 5,
  onSettingsClick = null,
  position = "bottom-right",
}) => {
  const { aToken, uToken } = useContext(AdminContext)
  const { cToken } = useContext(CompanyContext)
  const { dToken } = useContext(ProfessorContext)
  const { bToken } = useContext(GlobalAdminContext)
  const { eToken, rToken } = useContext(ExternalSupervisorContext)

  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const bellRef = useRef(null)
  const dropdownRef = useRef(null)

  // Get the active token for notifications
  const getActiveToken = () =>
    aToken || uToken || bToken || cToken || dToken || eToken || rToken || localStorage.getItem("token")

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    refresh,
  } = useNotifications({
    autoRefresh: true,
    pageSize: maxNotifications,
    headers: { Authorization: `Bearer ${getActiveToken()}` },
  })

  // Calculer la position du dropdown
  const calculateDropdownPosition = () => {
    if (!bellRef.current) return { top: 0, left: 0 }

    const rect = bellRef.current.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

    let top = rect.bottom + scrollTop + 8 // 8px de marge
    let left = rect.left + scrollLeft

    // Ajuster selon la position
    switch (position) {
      case "bottom-left":
        left = rect.right + scrollLeft - 384 // 384px = w-96
        break
      case "bottom-right":
        left = rect.left + scrollLeft
        break
      case "top-left":
        top = rect.top + scrollTop - 8
        left = rect.right + scrollLeft - 384
        break
      case "top-right":
        top = rect.top + scrollTop - 8
        left = rect.left + scrollLeft
        break
      default:
        left = rect.right + scrollLeft - 384
    }

    // S'assurer que le dropdown reste dans la viewport
    const dropdownWidth = 384
    const dropdownHeight = 400
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Ajuster horizontalement
    if (left + dropdownWidth > viewportWidth) {
      left = viewportWidth - dropdownWidth - 16
    }
    if (left < 16) {
      left = 16
    }

    // Ajuster verticalement
    if (top + dropdownHeight > viewportHeight + scrollTop) {
      top = rect.top + scrollTop - dropdownHeight - 8
    }

    return { top, left }
  }

  // Gérer l'ouverture/fermeture du dropdown
  const toggleDropdown = () => {
    if (!isOpen) {
      const position = calculateDropdownPosition()
      setDropdownPosition(position)
      refresh() // Actualiser les notifications à l'ouverture
    }
    setIsOpen(!isOpen)
  }

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
      // Empêcher le scroll du body quand le dropdown est ouvert
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  // Recalculer la position lors du redimensionnement
  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        const position = calculateDropdownPosition()
        setDropdownPosition(position)
      }
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("scroll", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleResize)
    }
  }, [isOpen, position])

  // Récupérer les notifications récentes pour l'aperçu
  const recentNotifications = notifications.slice(0, maxNotifications)

  // Composant Dropdown rendu via Portal
  const DropdownPortal = () => {
    if (!isOpen) return null

    return createPortal(
      <>
        {/* Overlay pour capturer les clics */}
        <div className="fixed inset-0" style={{ zIndex: 999998 }} onClick={() => setIsOpen(false)} />

        {/* Le dropdown */}
        <div
          ref={dropdownRef}
          className="fixed w-96 bg-white rounded-lg shadow-2xl border border-gray-200"
          style={{
            zIndex: 999999,
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          }}
        >
          {/* En-tête */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({unreadCount} non lue{unreadCount > 1 ? "s" : ""})
                </span>
              )}
            </h3>

            <div className="flex items-center space-x-2">
              {/* Bouton marquer tout comme lu */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                  title="Marquer tout comme lu"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}

              {/* Bouton actualiser */}
              <button
                onClick={refresh}
                className={`p-1 text-gray-400 hover:text-gray-600 rounded transition-colors ${loading ? "animate-spin" : ""}`}
                title="Actualiser"
                disabled={loading}
              >
                <Bell className="w-4 h-4" />
              </button>

              {/* Bouton paramètres */}
              {showSettings && (
                <button
                  onClick={() => {
                    setIsOpen(false)
                    if (onSettingsClick) {
                      onSettingsClick()
                    }
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                  title="Paramètres de notification"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Contenu des notifications */}
          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                Chargement...
              </div>
            ) : recentNotifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentNotifications.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onArchive={archiveNotification}
                    onDelete={deleteNotification}
                    compact={true}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Aucune notification</p>
              </div>
            )}
          </div>

          {/* Pied de page */}
          {recentNotifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setIsOpen(false)
                  window.location.href = "/notifications"
                }}
                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>
      </>,
      document.body,
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Bouton cloche */}
      <button
        ref={bellRef}
        onClick={toggleDropdown}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ""}`}
      >
        {unreadCount > 0 ? <BellRing className="w-6 h-6" /> : <Bell className="w-6 h-6" />}

        {/* Badge de compteur */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown rendu via Portal */}
      <DropdownPortal />
    </div>
  )
}

/**
 * Composant pour un élément de notification compact
 */
const NotificationItem = ({ notification, onMarkAsRead, onArchive, onDelete, compact = false }) => {
  const [showActions, setShowActions] = useState(false)

  const handleMarkAsRead = (e) => {
    e.stopPropagation()
    onMarkAsRead(notification._id)
  }

  const handleArchive = (e) => {
    e.stopPropagation()
    onArchive(notification._id)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete(notification._id)
  }

  const formatTime = (date) => {
    const now = new Date()
    const notifDate = new Date(date)
    const diffInMinutes = Math.floor((now - notifDate) / (1000 * 60))

    if (diffInMinutes < 1) return "À l'instant"
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    return `${Math.floor(diffInMinutes / 1440)}j`
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500 bg-red-50"
      case "high":
        return "border-l-orange-500 bg-orange-50"
      case "medium":
        return "border-l-blue-500 bg-blue-50"
      default:
        return "border-l-gray-300 bg-white"
    }
  }

  return (
    <div
      className={`p-3 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${getPriorityColor(notification.priority)} ${
        notification.status === "unread" ? "bg-blue-50" : ""
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => {
        if (notification.status === "unread") {
          onMarkAsRead(notification._id)
        }
        if (notification.metadata?.actionUrl) {
          window.location.href = notification.metadata.actionUrl
        }
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm ${notification.status === "unread" ? "font-semibold text-gray-900" : "text-gray-700"}`}
          >
            {notification.message}
          </p>
          <div className="flex items-center mt-1 text-xs text-gray-500 space-x-2">
            <span>{formatTime(notification.createdAt)}</span>
            {notification.priority === "urgent" && (
              <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">Urgent</span>
            )}
            {notification.status === "unread" && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
          </div>
        </div>
        {showActions && (
          <div className="flex items-center space-x-1 ml-2">
            {notification.status === "unread" && (
              <button
                onClick={handleMarkAsRead}
                className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors"
                title="Marquer comme lu"
              >
                <Check className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={handleArchive}
              className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
              title="Archiver"
            >
              <Archive className="w-3 h-3" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationBell
