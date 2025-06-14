export interface Todo {
  id: string;
  text: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  category_name?: string;
  category_color?: string;
  due_date?: string;
  reminder_date?: string;
  tags: string[];
  position: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  preferences: UserPreferences;
  created_at: string;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  defaultPriority?: 'low' | 'medium' | 'high';
  showCompletedTasks?: boolean;
  sortBy?: 'created_at' | 'due_date' | 'priority' | 'text';
  sortOrder?: 'asc' | 'desc';
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
}

export interface TodoStats {
  total: number;
  active: number;
  completed: number;
  high_priority: number;
  overdue: number;
}

export interface CategoryStats {
  name: string;
  color: string;
  count: number;
  completed_count: number;
}

export interface ActivityLog {
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: any;
  created_at: string;
}

export type FilterType = 'all' | 'active' | 'completed' | 'overdue' | 'high-priority';
export type PriorityType = 'low' | 'medium' | 'high';
export type SortType = 'created_at' | 'updated_at' | 'due_date' | 'priority' | 'text';