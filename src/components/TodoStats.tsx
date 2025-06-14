import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, BarChart3, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';
import { TodoStats as TodoStatsType, CategoryStats } from '../types/todo';

interface TodoStatsProps {
  stats: TodoStatsType;
  categoryStats?: CategoryStats[];
}

export const TodoStats: React.FC<TodoStatsProps> = ({ stats, categoryStats = [] }) => {
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const productivityScore = Math.max(0, Math.min(100, completionRate - (stats.overdue * 10)));

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: BarChart3,
      color: 'indigo',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600'
    },
    {
      title: 'Active',
      value: stats.active,
      icon: Circle,
      color: 'amber',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-600'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      title: 'High Priority',
      value: stats.high_priority,
      icon: AlertTriangle,
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600'
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: Calendar,
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600'
    },
    {
      title: 'Productivity',
      value: `${productivityScore}%`,
      icon: TrendingUp,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6 mb-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                <stat.icon size={20} className={stat.textColor} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-gray-900">{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
            />
          </div>
        </motion.div>
      )}

      {/* Category Stats */}
      {categoryStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoryStats.map((category) => {
              const categoryCompletion = category.count > 0 
                ? Math.round((category.completed_count / category.count) * 100) 
                : 0;
              
              return (
                <div key={category.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="flex-grow min-w-0">
                    <p className="font-medium text-gray-900 truncate">{category.name}</p>
                    <p className="text-sm text-gray-600">
                      {category.completed_count}/{category.count} ({categoryCompletion}%)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};