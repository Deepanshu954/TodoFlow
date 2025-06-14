import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, Edit3, Trash2, X, Zap, AlertTriangle, Minus, 
  Calendar, Clock, Tag, FileText, MoreHorizontal 
} from 'lucide-react';
import { Todo } from '../types/todo';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ 
  todo, 
  onToggle, 
  onUpdate, 
  onDelete,
  isSelected = false,
  onSelect
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [showDetails, setShowDetails] = useState(false);

  const handleEdit = () => {
    if (editText.trim() && (editText !== todo.text || editDescription !== todo.description)) {
      onUpdate(todo.id, { 
        text: editText.trim(),
        description: editDescription.trim() || undefined
      });
    } else {
      setEditText(todo.text);
      setEditDescription(todo.description || '');
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEdit();
    } else if (e.key === 'Escape') {
      setEditText(todo.text);
      setEditDescription(todo.description || '');
      setIsEditing(false);
    }
  };

  const priorityColors = {
    low: 'text-green-600',
    medium: 'text-amber-600',
    high: 'text-red-600',
  };

  const priorityIcons = {
    low: Minus,
    medium: AlertTriangle,
    high: Zap,
  };

  const PriorityIcon = priorityIcons[todo.priority];

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  };

  const isDueToday = todo.due_date && isToday(new Date(todo.due_date));
  const isOverdue = todo.due_date && isPast(new Date(todo.due_date)) && !todo.completed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`group relative bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${
        todo.completed ? 'opacity-75' : ''
      } ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
    >
      <div className="flex items-start gap-4 p-4">
        {/* Selection Checkbox */}
        {onSelect && (
          <button
            onClick={() => onSelect(todo.id)}
            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
              isSelected
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'border-gray-300 hover:border-indigo-400'
            }`}
          >
            {isSelected && <Check size={12} />}
          </button>
        )}

        {/* Completion Toggle */}
        <button
          onClick={() => onToggle(todo.id)}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            todo.completed
              ? 'bg-indigo-600 border-indigo-600 text-white'
              : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
          }`}
        >
          {todo.completed && <Check size={14} />}
        </button>

        <div className="flex-grow min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={handleEdit}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                autoFocus
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add description..."
                className="w-full px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={2}
              />
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-gray-900 ${
                    todo.completed ? 'line-through text-gray-500' : ''
                  }`}
                >
                  {todo.text}
                </span>
                <PriorityIcon 
                  size={14} 
                  className={`flex-shrink-0 ${priorityColors[todo.priority]}`}
                />
                {todo.category_name && (
                  <span 
                    className="px-2 py-0.5 text-xs rounded-full text-white"
                    style={{ backgroundColor: todo.category_color }}
                  >
                    {todo.category_name}
                  </span>
                )}
              </div>

              {todo.description && (
                <p className="text-sm text-gray-600 mb-2">{todo.description}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-500">
                {todo.due_date && (
                  <div className={`flex items-center gap-1 ${
                    isOverdue ? 'text-red-600' : isDueToday ? 'text-amber-600' : ''
                  }`}>
                    <Calendar size={12} />
                    {formatDueDate(todo.due_date)}
                  </div>
                )}
                
                {todo.tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Tag size={12} />
                    {todo.tags.slice(0, 2).join(', ')}
                    {todo.tags.length > 2 && ` +${todo.tags.length - 2}`}
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  {format(new Date(todo.created_at), 'MMM d')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
            title="Show details"
          >
            <MoreHorizontal size={16} />
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
            title="Edit task"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            title="Delete task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-200 p-4 bg-gray-50/50"
        >
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <p className="text-gray-600">{format(new Date(todo.created_at), 'PPp')}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Updated:</span>
              <p className="text-gray-600">{format(new Date(todo.updated_at), 'PPp')}</p>
            </div>
            {todo.tags.length > 0 && (
              <div className="col-span-2">
                <span className="font-medium text-gray-700">Tags:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {todo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};