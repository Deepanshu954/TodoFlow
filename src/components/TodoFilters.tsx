import React from 'react';
import { motion } from 'framer-motion';
import { Search, X, Filter, CheckSquare, Square, AlertTriangle, Calendar } from 'lucide-react';
import { FilterType, SortType } from '../types/todo';

interface TodoFiltersProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortType;
  onSortChange: (sort: SortType) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  stats: {
    total: number;
    active: number;
    completed: number;
    high_priority: number;
    overdue: number;
  };
  onClearCompleted: () => void;
  selectedCount?: number;
  onBulkAction?: (action: string) => void;
}

export const TodoFilters: React.FC<TodoFiltersProps> = ({
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  stats,
  onClearCompleted,
  selectedCount = 0,
  onBulkAction,
}) => {
  const filters: { key: FilterType; label: string; count: number; icon: any }[] = [
    { key: 'all', label: 'All', count: stats.total, icon: Filter },
    { key: 'active', label: 'Active', count: stats.active, icon: Square },
    { key: 'completed', label: 'Completed', count: stats.completed, icon: CheckSquare },
    { key: 'high-priority', label: 'High Priority', count: stats.high_priority, icon: AlertTriangle },
    { key: 'overdue', label: 'Overdue', count: stats.overdue, icon: Calendar },
  ];

  const sortOptions: { key: SortType; label: string }[] = [
    { key: 'created_at', label: 'Created Date' },
    { key: 'updated_at', label: 'Updated Date' },
    { key: 'due_date', label: 'Due Date' },
    { key: 'priority', label: 'Priority' },
    { key: 'text', label: 'Name' },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Search */}
      <div className="relative">
        <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks..."
          className="w-full pl-12 pr-12 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedCount > 0 && onBulkAction && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-xl"
        >
          <span className="text-sm font-medium text-indigo-700">
            {selectedCount} task{selectedCount > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onBulkAction('complete')}
              className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              Complete
            </button>
            <button
              onClick={() => onBulkAction('uncomplete')}
              className="px-3 py-1 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200"
            >
              Uncomplete
            </button>
            <button
              onClick={() => onBulkAction('delete')}
              className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Delete
            </button>
          </div>
        </motion.div>
      )}

      {/* Filter Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {filters.map(({ key, label, count, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onFilterChange(key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                filter === key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <Icon size={16} />
              {label}
              {count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                  filter === key ? 'bg-white/20' : 'bg-gray-200 text-gray-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortType)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {sortOptions.map(({ key, label }) => (
              <option key={key} value={key}>
                Sort by {label}
              </option>
            ))}
          </select>
          <button
            onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Clear Completed */}
      {stats.completed > 0 && (
        <div className="flex justify-end">
          <button
            onClick={onClearCompleted}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            Clear Completed ({stats.completed})
          </button>
        </div>
      )}
    </div>
  );
};