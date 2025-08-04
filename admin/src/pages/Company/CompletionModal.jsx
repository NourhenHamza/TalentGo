// components/CompletionModal.jsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { 
  X, 
  Award, 
  Star, 
  Save,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";

const CompletionModal = ({ 
  isOpen, 
  onClose, 
  studentData, 
  onSubmit 
}) => {
  const [finalGrade, setFinalGrade] = useState('');
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (studentData) {
      // Pre-fill if editing existing completion
      setFinalGrade(studentData.finalGrade?.toString() || '');
      setReview(studentData.review || '');
    } else {
      // Reset for new completion
      setFinalGrade('');
      setReview('');
    }
    setErrors({});
  }, [studentData, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    // Validate final grade
    if (!finalGrade || finalGrade.trim() === '') {
      newErrors.finalGrade = 'Final grade is required';
    } else {
      const grade = parseFloat(finalGrade);
      if (isNaN(grade) || grade < 0 || grade > 100) {
        newErrors.finalGrade = 'Grade must be a number between 0 and 100';
      }
    }

    // Validate review
    if (!review || review.trim().length < 10) {
      newErrors.review = 'Review must contain at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        finalGrade: parseFloat(finalGrade),
        review: review.trim()
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!studentData) return null;

  const isEditing = studentData.status === 'completed';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {isEditing ? 'Edit Evaluation' : 'Mark as Completed'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {studentData.student?.name || 'Student'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Student and Offer Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Student:</span>
                      <span className="ml-2 font-medium">{studentData.student?.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Offer:</span>
                      <span className="ml-2 font-medium">{studentData.offre?.titre}</span>
                    </div>
                  </div>
                </div>

                {/* Final Grade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Final Grade <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={finalGrade}
                      onChange={(e) => setFinalGrade(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.finalGrade ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Grade out of 100"
                      disabled={isSubmitting}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                      /100
                    </div>
                  </div>
                  {errors.finalGrade && (
                    <div className="mt-1 flex items-center text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.finalGrade}
                    </div>
                  )}
                </div>

                {/* Review */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Review <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    rows={6}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.review ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Write a detailed review of the student's performance, skills, attitude, etc. (minimum 10 characters)"
                    disabled={isSubmitting}
                  />
                  <div className="mt-1 flex items-center justify-between">
                    {errors.review ? (
                      <div className="flex items-center text-sm text-red-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.review}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        {review.length} characters (minimum 10)
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isEditing ? 'Update' : 'Mark as Completed'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CompletionModal;
