import { useState, useEffect } from 'react';
import { Todo, FilterType, TodoStats, CategoryStats } from '../types/todo';
import { todosAPI } from '../services/api';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

// Local storage key for guest todos
const GUEST_TODOS_KEY = 'todoflow_guest_todos';
const GUEST_STATS_KEY = 'todoflow_guest_stats';

export const useTodos = () => {
  const { isGuest } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [stats, setStats] = useState<TodoStats>({
    total: 0,
    active: 0,
    completed: 0,
    high_priority: 0,
    overdue: 0
  });
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [loading, setLoading] = useState(false);
  const [selectedTodos, setSelectedTodos] = useState<string[]>([]);

  // Generate guest todo ID
  const generateGuestId = () => `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Calculate stats for guest mode
  const calculateGuestStats = (todoList: Todo[]): TodoStats => {
    const now = new Date();
    return {
      total: todoList.length,
      active: todoList.filter(t => !t.completed).length,
      completed: todoList.filter(t => t.completed).length,
      high_priority: todoList.filter(t => t.priority === 'high' && !t.completed).length,
      overdue: todoList.filter(t => 
        t.due_date && 
        new Date(t.due_date) < now && 
        !t.completed
      ).length
    };
  };

  // Filter and sort todos for guest mode
  const filterAndSortTodos = (todoList: Todo[]): Todo[] => {
    let filtered = [...todoList];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(todo =>
        todo.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply status filter
    if (filter === 'active') {
      filtered = filtered.filter(t => !t.completed);
    } else if (filter === 'completed') {
      filtered = filtered.filter(t => t.completed);
    } else if (filter === 'high-priority') {
      filtered = filtered.filter(t => t.priority === 'high' && !t.completed);
    } else if (filter === 'overdue') {
      const now = new Date();
      filtered = filtered.filter(t => 
        t.due_date && 
        new Date(t.due_date) < now && 
        !t.completed
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Todo];
      let bValue: any = b[sortBy as keyof Todo];

      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        aValue = priorityOrder[a.priority];
        bValue = priorityOrder[b.priority];
      } else if (sortBy === 'text') {
        aValue = a.text.toLowerCase();
        bValue = b.text.toLowerCase();
      } else if (sortBy.includes('date')) {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const fetchTodos = async () => {
    if (isGuest) {
      // Guest mode: load from localStorage
      try {
        setLoading(true);
        const storedTodos = localStorage.getItem(GUEST_TODOS_KEY);
        const allTodos = storedTodos ? JSON.parse(storedTodos) : [];
        const filteredTodos = filterAndSortTodos(allTodos);
        setTodos(filteredTodos);
      } catch (error) {
        console.error('Error loading guest todos:', error);
        setTodos([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Authenticated mode: fetch from API
    try {
      setLoading(true);
      const params: any = {
        sortBy,
        sortOrder
      };

      if (searchQuery) params.search = searchQuery;
      if (filter === 'active') params.completed = false;
      if (filter === 'completed') params.completed = true;
      if (filter === 'overdue') {
        params.completed = false;
      }
      if (filter === 'high-priority') {
        params.priority = 'high';
        params.completed = false;
      }

      const data = await todosAPI.getAll(params);
      setTodos(data);
    } catch (error: any) {
      toast.error('Failed to fetch todos');
      console.error('Fetch todos error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (isGuest) {
      // Guest mode: calculate from localStorage
      try {
        const storedTodos = localStorage.getItem(GUEST_TODOS_KEY);
        const allTodos = storedTodos ? JSON.parse(storedTodos) : [];
        const calculatedStats = calculateGuestStats(allTodos);
        setStats(calculatedStats);
        setCategoryStats([]); // No categories in guest mode for now
      } catch (error) {
        console.error('Error calculating guest stats:', error);
      }
      return;
    }

    // Authenticated mode: fetch from API
    try {
      const data = await todosAPI.getStats();
      setStats(data.overview);
      setCategoryStats(data.categories);
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchTodos();
      await fetchStats();
    };
    fetchData();
  }, [filter, searchQuery, sortBy, sortOrder, isGuest]);

  const addTodo = async (text: string, priority: Todo['priority'] = 'medium', options?: {
    description?: string;
    category?: string;
    dueDate?: string;
    tags?: string[];
  }) => {
    if (isGuest) {
      // Guest mode: save to localStorage
      try {
        const newTodo: Todo = {
          id: generateGuestId(),
          text: text.trim(),
          description: options?.description,
          completed: false,
          priority,
          category: options?.category,
          due_date: options?.dueDate,
          reminder_date: undefined,
          tags: options?.tags || [],
          position: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const storedTodos = localStorage.getItem(GUEST_TODOS_KEY);
        const allTodos = storedTodos ? JSON.parse(storedTodos) : [];
        allTodos.unshift(newTodo);
        localStorage.setItem(GUEST_TODOS_KEY, JSON.stringify(allTodos));
        
        await fetchTodos();
        await fetchStats();
        toast.success('Task created successfully');
        return newTodo;
      } catch (error: any) {
        toast.error('Failed to create task');
        throw error;
      }
    }

    // Authenticated mode: save to API
    try {
      const newTodo = await todosAPI.create({
        text: text.trim(),
        priority,
        ...options
      });
      setTodos(prev => [newTodo, ...prev]);
      await fetchStats();
      toast.success('Task created successfully');
      return newTodo;
    } catch (error: any) {
      toast.error('Failed to create task');
      throw error;
    }
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    if (isGuest) {
      // Guest mode: update in localStorage
      try {
        const storedTodos = localStorage.getItem(GUEST_TODOS_KEY);
        const allTodos = storedTodos ? JSON.parse(storedTodos) : [];
        const todoIndex = allTodos.findIndex((t: Todo) => t.id === id);
        
        if (todoIndex !== -1) {
          allTodos[todoIndex] = {
            ...allTodos[todoIndex],
            ...updates,
            updated_at: new Date().toISOString()
          };
          localStorage.setItem(GUEST_TODOS_KEY, JSON.stringify(allTodos));
          
          await fetchTodos();
          await fetchStats();
          toast.success('Task updated successfully');
          return allTodos[todoIndex];
        }
      } catch (error: any) {
        toast.error('Failed to update task');
        throw error;
      }
    }

    // Authenticated mode: update via API
    try {
      const updatedTodo = await todosAPI.update(id, updates);
      setTodos(prev =>
        prev.map(todo => todo.id === id ? updatedTodo : todo)
      );
      await fetchStats();
      toast.success('Task updated successfully');
      return updatedTodo;
    } catch (error: any) {
      toast.error('Failed to update task');
      throw error;
    }
  };

  const deleteTodo = async (id: string) => {
    if (isGuest) {
      // Guest mode: remove from localStorage
      try {
        const storedTodos = localStorage.getItem(GUEST_TODOS_KEY);
        const allTodos = storedTodos ? JSON.parse(storedTodos) : [];
        const filteredTodos = allTodos.filter((t: Todo) => t.id !== id);
        localStorage.setItem(GUEST_TODOS_KEY, JSON.stringify(filteredTodos));
        
        setSelectedTodos(prev => prev.filter(todoId => todoId !== id));
        await fetchTodos();
        await fetchStats();
        toast.success('Task deleted successfully');
      } catch (error: any) {
        toast.error('Failed to delete task');
        throw error;
      }
      return;
    }

    // Authenticated mode: delete via API
    try {
      await todosAPI.delete(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
      setSelectedTodos(prev => prev.filter(todoId => todoId !== id));
      await fetchStats();
      toast.success('Task deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete task');
      throw error;
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      await updateTodo(id, { completed: !todo.completed });
    }
  };

  const bulkOperation = async (action: string, todoIds: string[], updates?: any) => {
    if (isGuest) {
      // Guest mode: bulk operations in localStorage
      try {
        const storedTodos = localStorage.getItem(GUEST_TODOS_KEY);
        const allTodos = storedTodos ? JSON.parse(storedTodos) : [];
        
        if (action === 'delete') {
          const filteredTodos = allTodos.filter((t: Todo) => !todoIds.includes(t.id));
          localStorage.setItem(GUEST_TODOS_KEY, JSON.stringify(filteredTodos));
        } else if (action === 'complete') {
          allTodos.forEach((t: Todo) => {
            if (todoIds.includes(t.id)) {
              t.completed = true;
              t.updated_at = new Date().toISOString();
            }
          });
          localStorage.setItem(GUEST_TODOS_KEY, JSON.stringify(allTodos));
        } else if (action === 'uncomplete') {
          allTodos.forEach((t: Todo) => {
            if (todoIds.includes(t.id)) {
              t.completed = false;
              t.updated_at = new Date().toISOString();
            }
          });
          localStorage.setItem(GUEST_TODOS_KEY, JSON.stringify(allTodos));
        }
        
        await fetchTodos();
        await fetchStats();
        setSelectedTodos([]);
        toast.success(`Bulk ${action} completed successfully`);
      } catch (error: any) {
        toast.error(`Failed to perform bulk ${action}`);
        throw error;
      }
      return;
    }

    // Authenticated mode: bulk operations via API
    try {
      await todosAPI.bulkOperation(action, todoIds, updates);
      await fetchTodos();
      await fetchStats();
      setSelectedTodos([]);
      toast.success(`Bulk ${action} completed successfully`);
    } catch (error: any) {
      toast.error(`Failed to perform bulk ${action}`);
      throw error;
    }
  };

  const clearCompleted = async () => {
    const completedIds = todos.filter(t => t.completed).map(t => t.id);
    if (completedIds.length > 0) {
      await bulkOperation('delete', completedIds);
    }
  };

  const toggleSelectTodo = (id: string) => {
    setSelectedTodos(prev =>
      prev.includes(id)
        ? prev.filter(todoId => todoId !== id)
        : [...prev, id]
    );
  };

  const selectAllTodos = () => {
    setSelectedTodos(todos.map(t => t.id));
  };

  const clearSelection = () => {
    setSelectedTodos([]);
  };

  return {
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
    fetchTodos,
    fetchStats
  };
};