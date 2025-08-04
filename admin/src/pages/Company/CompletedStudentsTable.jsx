// components/CompletedStudentsTable.jsx
"use client";

import { motion } from "framer-motion";
import { 
  Eye,
  Award,
  Calendar,
  User,
  Mail,
  Briefcase,
  Star,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { useState } from "react";

const CompletedStudentsTable = ({ completedStudents, onViewDetails }) => {
  const [sortField, setSortField] = useState('reviewedAt');
  const [sortDirection, setSortDirection] = useState('desc');

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedStudents = [...completedStudents].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortField) {
      case 'student.name':
        aValue = a.student?.name || '';
        bValue = b.student?.name || '';
        break;
      case 'student.email':
        aValue = a.student?.email || '';
        bValue = b.student?.email || '';
        break;
      case 'offre.titre':
        aValue = a.offre?.titre || '';
        bValue = b.offre?.titre || '';
        break;
      case 'confirmedAt':
        aValue = new Date(a.confirmedAt || 0);
        bValue = new Date(b.confirmedAt || 0);
        break;
      case 'reviewedAt':
        aValue = new Date(a.reviewedAt || 0);
        bValue = new Date(b.reviewedAt || 0);
        break;
      case 'finalGrade':
        aValue = a.finalGrade || 0;
        bValue = b.finalGrade || 0;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  if (completedStudents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
        <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Completed Students
        </h3>
        <p className="text-gray-600">
          No students have been marked as completed yet.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Completed Students ({completedStudents.length})
          </h3>
          <div className="text-sm text-gray-500">
            Showing all completed evaluations
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('student.name')}
              >
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>Student Name</span>
                  <SortIcon field="student.name" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('student.email')}
              >
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                  <SortIcon field="student.email" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('offre.titre')}
              >
                <div className="flex items-center space-x-1">
                  <Briefcase className="h-4 w-4" />
                  <span>Offer Title</span>
                  <SortIcon field="offre.titre" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('confirmedAt')}
              >
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Confirmation Date</span>
                  <SortIcon field="confirmedAt" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('reviewedAt')}
              >
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Completion Date</span>
                  <SortIcon field="reviewedAt" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('finalGrade')}
              >
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4" />
                  <span>Final Grade</span>
                  <SortIcon field="finalGrade" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedStudents.map((studentData, index) => (
              <motion.tr
                key={studentData._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Student Name */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-medium text-xs">
                        {studentData.student?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {studentData.student?.name || 'Name not available'}
                      </div>
                      {studentData.student?.specialization && (
                        <div className="text-xs text-gray-500">
                          {studentData.student.specialization}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {studentData.student?.email || 'Email not available'}
                  </div>
                </td>

                {/* Offer Title */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-blue-600">
                    {studentData.offre?.titre || 'Title not available'}
                  </div>
                  {studentData.offre?.type_offre && (
                    <div className="text-xs text-gray-500">
                      {studentData.offre.type_offre}
                    </div>
                  )}
                </td>

                {/* Confirmation Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(studentData.confirmedAt)}
                  </div>
                </td>

                {/* Completion Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(studentData.reviewedAt)}
                  </div>
                </td>

                {/* Final Grade */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {studentData.finalGrade !== null && studentData.finalGrade !== undefined ? (
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-yellow-600">
                          {studentData.finalGrade}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">/100</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Not graded</span>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onViewDetails(studentData)}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Total: {completedStudents.length} completed student{completedStudents.length !== 1 ? 's' : ''}
          </div>
          <div className="text-sm text-gray-500">
            Average Grade: {
              completedStudents.length > 0 && completedStudents.some(s => s.finalGrade !== null && s.finalGrade !== undefined)
                ? Math.round(
                    completedStudents
                      .filter(s => s.finalGrade !== null && s.finalGrade !== undefined)
                      .reduce((sum, s) => sum + s.finalGrade, 0) / 
                    completedStudents.filter(s => s.finalGrade !== null && s.finalGrade !== undefined).length
                  )
                : 'N/A'
            }/100
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CompletedStudentsTable;
