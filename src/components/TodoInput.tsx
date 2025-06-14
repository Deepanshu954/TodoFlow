import React, { useState, useRef, useEffect } from 'react';
import { Plus, Zap, AlertTriangle, Minus, Calendar, Tag, FileText, Clock, Repeat, Bell } from 'lucide-react';
import { PriorityType } from '../types/todo';
import { motion, AnimatePresence } from 'framer-motion';

interface TodoInputProps {
  onAdd: (text: string, priority: PriorityType, options?: {
    description?: string;
    category?: string;
    dueDate?: string;
    reminderDate?: string;
    tags?: string[];
    recurring?: string;
  }) => void;
}

export const TodoInput: React.FC<TodoInputProps> = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityType>('medium');
  const [dueDate, setDueDate] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [recurring, setRecurring] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onAdd(text, priority, {
          description: description.trim() || undefined,
          dueDate: dueDate || undefined,
          reminderDate: reminderDate || undefined,
          tags: tags.length > 0 ? tags : undefined,
          recurring: recurring || undefined
        });
        
        // Reset form
        setText('');
        setDescription('');
        setPriority('medium');
        setDueDate('');
        setReminderDate('');
        setTags([]);
        setTagInput('');
        setRecurring('');
        setIsExpanded(false);
      } catch (error) {
        // Error handled by parent component
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim() && !tags.includes(tagInput.trim())) {
      e.preventDefault();
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      setIsExpanded(false);
    }
  };

  const priorityColors = {
    low: 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100',
    medium: 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100',
    high: 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100',
  };

  const priorityIcons = {
    low: Minus,
    medium: AlertTriangle,
    high: Zap,
  };

  const quickActions = [
    { label: 'Today', action: () => setDueDate(new Date().toISOString().slice(0, 16)) },
    { label: 'Tomorrow', action: () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDueDate(tomorrow.toISOString().slice(0, 16));
    }},
    { label: 'This Week', action: () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setDueDate(nextWeek.toISOString().slice(0, 16));
    }},
  ];

  return (
    <motion.div className="mb-8" layout>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              onKeyDown={handleKeyDown}
              placeholder="What needs to be done? (⌘+Enter to save)"
              className="w-full px-6 py-4 pr-16 text-lg bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
            />
            
            {/* Quick Add Button */}
            <button
              type="submit"
              disabled={!text.trim() || isSubmitting}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus size={20} />
              )}
            </button>
          </div>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-2 p-6 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl z-20"
              >
                {/* Quick Actions */}
                <div className="flex gap-2 mb-4">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={action.action}
                      className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <FileText size={16} />
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add more details..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200"
                    rows={2}
                  />
                </div>

                {/* Date & Time Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Calendar size={16} />
                      Due Date
                    </label>
                    <input
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Bell size={16} />
                      Reminder
                    </label>
                    <input
                      type="datetime-local"
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Recurring */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Repeat size={16} />
                    Recurring
                  </label>
                  <select
                    value={recurring}
                    onChange={(e) => setRecurring(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">No repeat</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                {/* Tags */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Tag size={16} />
                    Tags
                  </label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                    placeholder="Type and press Enter to add tags..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <motion.span
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-indigo-900 transition-colors duration-200"
                          >
                            ×
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Priority */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-medium text-gray-700">Priority Level</span>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as PriorityType[]).map((p) => {
                      const Icon = priorityIcons[p];
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 ${
                            priority === p ? priorityColors[p] : 'text-gray-500 bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <Icon size={12} />
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Press <kbd className="px-1 py-0.5 bg-gray-100 rounded">⌘+Enter</kbd> to save quickly
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsExpanded(false)}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!text.trim() || isSubmitting}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Plus size={16} />
                      )}
                      Add Task
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </motion.div>
  );
};