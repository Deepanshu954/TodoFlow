import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '../types/todo';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  skipAuth: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('todoflow_token');
      const storedUser = localStorage.getItem('todoflow_user');
      const guestMode = localStorage.getItem('todoflow_guest');

      if (guestMode === 'true') {
        setIsGuest(true);
        setLoading(false);
        return;
      }

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verify token is still valid
          await authAPI.verify();
        } catch (error) {
          localStorage.removeItem('todoflow_token');
          localStorage.removeItem('todoflow_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      localStorage.setItem('todoflow_token', response.token);
      localStorage.setItem('todoflow_user', JSON.stringify(response.user));
      localStorage.removeItem('todoflow_guest');
      setUser(response.user);
      setIsGuest(false);
      toast.success('Welcome back!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await authAPI.register(email, password, name);
      localStorage.setItem('todoflow_token', response.token);
      localStorage.setItem('todoflow_user', JSON.stringify(response.user));
      localStorage.removeItem('todoflow_guest');
      setUser(response.user);
      setIsGuest(false);
      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('todoflow_token');
    localStorage.removeItem('todoflow_user');
    localStorage.removeItem('todoflow_guest');
    setUser(null);
    setIsGuest(false);
    toast.success('Logged out successfully');
  };

  const skipAuth = () => {
    localStorage.setItem('todoflow_guest', 'true');
    setIsGuest(true);
    toast.success('Welcome! You\'re using TodoFlow as a guest');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('todoflow_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isGuest,
      login,
      register,
      logout,
      skipAuth,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};