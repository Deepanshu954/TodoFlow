import { supabase } from '../lib/supabase';
import { Todo, User, Category, TodoStats, CategoryStats, ActivityLog } from '../types/todo';

// Auth API
export const authAPI = {
  register: async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    
    if (error) throw error;
    return data;
  },

  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  verify: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user };
  },
};

// Todos API
export const todosAPI = {
  getAll: async (params?: {
    category?: string;
    priority?: string;
    completed?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    let query = supabase.from('todos').select('*');
    
    if (params?.category) {
      query = query.eq('category', params.category);
    }
    
    if (params?.priority) {
      query = query.eq('priority', params.priority);
    }
    
    if (params?.completed !== undefined) {
      query = query.eq('completed', params.completed);
    }
    
    if (params?.search) {
      query = query.ilike('title', `%${params.search}%`);
    }
    
    if (params?.sortBy) {
      const ascending = params.sortOrder !== 'desc';
      query = query.order(params.sortBy, { ascending });
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as Todo[];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Todo;
  },

  create: async (todo: Partial<Todo>) => {
    const { data, error } = await supabase
      .from('todos')
      .insert([todo])
      .select()
      .single();
    
    if (error) throw error;
    return data as Todo;
  },

  update: async (id: string, updates: Partial<Todo>) => {
    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Todo;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  },

  bulkOperation: async (action: string, todoIds: string[], updates?: any) => {
    if (action === 'delete') {
      const { error } = await supabase
        .from('todos')
        .delete()
        .in('id', todoIds);
      
      if (error) throw error;
    } else if (action === 'update' && updates) {
      const { error } = await supabase
        .from('todos')
        .update(updates)
        .in('id', todoIds);
      
      if (error) throw error;
    }
    
    return { success: true };
  },

  getStats: async () => {
    const { data: todos, error } = await supabase
      .from('todos')
      .select('*');
    
    if (error) throw error;
    
    // Calculate stats from todos data
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const pending = total - completed;
    const overdue = todos.filter(todo => 
      !todo.completed && todo.due_date && new Date(todo.due_date) < new Date()
    ).length;
    
    const overview: TodoStats = {
      total,
      completed,
      pending,
      overdue,
    };
    
    // Calculate category stats
    const categoryMap = new Map<string, { total: number; completed: number }>();
    todos.forEach(todo => {
      const category = todo.category || 'Uncategorized';
      const current = categoryMap.get(category) || { total: 0, completed: 0 };
      current.total++;
      if (todo.completed) current.completed++;
      categoryMap.set(category, current);
    });
    
    const categories: CategoryStats[] = Array.from(categoryMap.entries()).map(
      ([name, stats]) => ({
        name,
        total: stats.total,
        completed: stats.completed,
        pending: stats.total - stats.completed,
      })
    );
    
    return { overview, categories };
  },
};

// Users API
export const usersAPI = {
  getProfile: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();
    
    if (profileError) throw profileError;
    return profile as User;
  },

  updateProfile: async (updates: Partial<User>) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user?.id)
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) throw error;
    return { success: true };
  },

  getActivity: async (limit = 50, offset = 0) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data as ActivityLog[];
  },
};