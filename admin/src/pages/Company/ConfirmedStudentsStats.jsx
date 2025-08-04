// components/ConfirmedStudentsStats.jsx
"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  UserCheck, 
  Award, 
  TrendingUp,
  CheckCircle,
  Clock
} from "lucide-react";

const ConfirmedStudentsStats = ({ statistics }) => {
  const { total = 0, completed = 0, pending = 0, completionRate = 0 } = statistics;

  const statsCards = [
    {
      title: "Total Confirmed",
      value: total,
      icon: UserCheck,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: "Pending Completion",
      value: pending,
      icon: Clock,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Completed",
      value: completed,
      icon: Award,
      color: "bg-gray-500",
      bgColor: "bg-gray-50",
      textColor: "text-gray-600"
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`${stat.bgColor} rounded-lg p-6 border border-gray-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 ${stat.color} rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress Overview */}
      {total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Evaluation Progress
              </h3>
              <p className="text-sm text-gray-600">
                Track confirmed students and their evaluation status
              </p>
            </div>

            {/* Completion Rate Circle */}
            <div className="flex items-center space-x-4">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-green-500"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${completionRate}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-900">{completionRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Overall Progress</span>
              <span>{completed} of {total} completed</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="flex h-full">
                {/* Completed portion */}
                {completed > 0 && (
                  <div 
                    className="bg-gray-500 transition-all duration-500"
                    style={{ width: `${(completed / total) * 100}%` }}
                    title={`Completed: ${completed}`}
                  ></div>
                )}
                {/* Pending portion */}
                {pending > 0 && (
                  <div 
                    className="bg-blue-500 transition-all duration-500"
                    style={{ width: `${(pending / total) * 100}%` }}
                    title={`Pending: ${pending}`}
                  ></div>
                )}
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-sm mr-1"></div>
                <span className="text-gray-600">Pending ({pending})</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-500 rounded-sm mr-1"></div>
                <span className="text-gray-600">Completed ({completed})</span>
              </div>
            </div>
          </div>

          {/* Action Insights */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {pending > 0 && (
                  <div className="flex items-center text-sm text-blue-600">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{pending} student{pending > 1 ? 's' : ''} awaiting evaluation</span>
                  </div>
                )}
                
                {completed > 0 && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Award className="h-4 w-4 mr-1" />
                    <span>{completed} evaluation{completed > 1 ? 's' : ''} completed</span>
                  </div>
                )}
              </div>

              {/* Performance Indicator */}
              {total > 0 && (
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    Performance
                  </div>
                  <div className={`text-xs ${
                    completionRate >= 80 ? 'text-green-600' :
                    completionRate >= 50 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {completionRate >= 80 ? 'Excellent' :
                     completionRate >= 50 ? 'Good' :
                     'Needs Improvement'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ConfirmedStudentsStats;
