"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Trash2, X } from "lucide-react"

const DeleteProjectModal = ({ isOpen, onClose, project, onDelete }) => {
  if (!isOpen || !project) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="p-6 relative">
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
            
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="h-10 w-10 text-red-600" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
              Delete Project
            </h3>
            
            <p className="text-gray-600 mb-6 text-center">
              Are you sure you want to delete the project 
              <span className="font-medium text-gray-800"> "{project.title || 'Untitled Project'}"</span>? 
              This action cannot be undone.
            </p>
            
            {project.proposedBy?.name && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-6">
                <p className="text-red-600 text-sm text-center">
                  This will also remove the project from {project.proposedBy.name}'s profile.
                </p>
              </div>
            )}
            
            <div className="flex justify-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors shadow-sm flex-1 max-w-[150px]"
              >
                Cancel
              </button>
              <button
                onClick={onDelete}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-colors shadow-md flex-1 max-w-[150px]"
              >
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default DeleteProjectModal