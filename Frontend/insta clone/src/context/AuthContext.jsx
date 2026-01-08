import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // First set user from localStorage for faster UI
          setUser(JSON.parse(storedUser));
          
          // Then verify with server
          const res = await authAPI.getMe();
          if (res.data.success) {
            setUser(res.data.data);
          }
        } catch (err) {
          console.log('Token validation failed, using stored user');
          // Keep the stored user if server is down
          // Only logout if it's a 401 error
          if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      console.log('Attempting login for:', email);
      
      const res = await authAPI.login({ email, password });
      console.log('Login response:', res.data);
      
      if (res.data.success) {
        const { token, ...userData } = res.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, message: res.data.message || 'Login failed' };
      }
    } catch (err) {
      console.error('Login error:', err);
      const message = err.response?.data?.message || err.message || 'Login failed. Check your connection.';
      setError(message);
      return { success: false, message };
    }
  };

  const register = async (username, email, password, name) => {
    try {
      setError(null);
      console.log('Attempting registration for:', username, email);
      
      const res = await authAPI.register({ username, email, password, name });
      console.log('Register response:', res.data);
      
      if (res.data.success) {
        const { token, ...userData } = res.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, message: res.data.message || 'Registration failed' };
      }
    } catch (err) {
      console.error('Register error:', err);
      const message = err.response?.data?.message || err.message || 'Registration failed. Check your connection.';
      setError(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      register,
      logout,
      updateUser,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
