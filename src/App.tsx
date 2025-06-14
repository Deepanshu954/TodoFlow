import React from 'react';
import { Toaster } from 'react-hot-toast';
import { CheckSquare, User, LogOut, UserCheck } from 'lucide-react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useTodos } from './hooks/useTodos';
import { AuthPage } from './components/auth/AuthPage';
import { TodoInput } from './components/TodoInput';
import { TodoFilters } from './components/TodoFilters';
import { TodoItem } from './components/TodoItem';
import { TodoStats } from './components/TodoStats';
import { motion, AnimatePresence } from 'framer-motion';

const TodoApp: React.FC = () => {
  const { user, logout, isGuest } = useAuth();
  const {
    todos,
    stats,
    categoryStats,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    loading,
    selectedTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    bulkOperation,
    clearCompleted,
    toggleSelectTodo,
    selectAllTodos,
    clearSelection,
  } = useTodos();

  const handleBulkAction = async (action: string) => {
    if (selectedTodos.length === 0) return;
    await bulkOperation(action, selectedTodos);
  };

  if (!user && !isGuest) {
    return <AuthPage />;
  }

  const displayName = isGuest ? 'Guest User' : user?.name;
  const displayEmail = isGuest ? 'guest@todoflow.app' : user?.email;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-xl shadow-lg">
              <CheckSquare size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                TodoFlow
              </h1>
              <p className="text-gray-600">Welcome back, {displayName}!</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl">
              {isGuest ? <UserCheck size={20} className="text-emerald-600" /> : <User size={20} className="text-gray-600" />}
              <span className="text-sm font-medium text-gray-700">{displayEmail}</span>
              {isGuest && (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                  Guest
                </span>
              )}
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">{isGuest ? 'Exit Guest' : 'Logout'}</span>
            </button>
          </div>
        </div>

        {/* Guest Mode Notice */}
        {isGuest && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl"
          >
            <div className="flex items-center gap-2 text-emerald-800">
              <UserCheck size={20} />
              <span className="font-medium">Guest Mode Active</span>
            </div>
            <p className="text-sm text-emerald-700 mt-1">
              You're using TodoFlow as a guest. Your tasks are stored locally and won't sync across devices. 
              Create an account to save your data permanently.
            </p>
          </motion.div>
        )}

        {/* Stats */}
        <TodoStats stats={stats} categoryStats={categoryStats} />

        {/* Input */}
        <TodoInput onAdd={addTodo} />

        {/* Filters */}
        <TodoFilters
          filter={filter}
          onFilterChange={setFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          stats={stats}
          onClearCompleted={clearCompleted}
          selectedCount={selectedTodos.length}
          onBulkAction={handleBulkAction}
        />

        {/* Selection Controls */}
        {todos.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={selectedTodos.length === todos.length ? clearSelection : selectAllTodos}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
              >
                {selectedTodos.length === todos.length ? 'Deselect All' : 'Select All'}
              </button>
              {selectedTodos.length > 0 && (
                <span className="text-sm text-gray-500">
                  ({selectedTodos.length} selected)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Todo List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading tasks...</p>
            </div>
          ) : todos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <CheckSquare size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                {searchQuery ? 'No matching tasks' : 'No tasks yet'}
              </h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? 'Try adjusting your search or filters'
                  : 'Add your first task to get started'
                }
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onUpdate={updateTodo}
                  onDelete={deleteTodo}
                  isSelected={selectedTodos.includes(todo.id)}
                  onSelect={toggleSelectTodo}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Built with React, TypeScript, Express.js, and SQLite
          </p>
        </div>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#374151',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
          },
        }}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <TodoApp />
    </AuthProvider>
  );
}

export default App;