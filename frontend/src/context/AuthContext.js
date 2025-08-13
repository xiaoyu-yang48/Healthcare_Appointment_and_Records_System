import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../axiosConfig';
import { debug } from '../utils/debug';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // 验证token是否有效
        validateToken();
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const validateToken = async () => {
    try {
      await api.get('/auth/profile');
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const login = async (email, password) => {
    try {
      debug.logApiRequest('POST', '/auth/login', { email, password: '***' });
      
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      debug.logApiResponse(response);
      debug.logUserState(userData);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      debug.logLocalStorage();
      
      return { success: true, user: userData };
    } catch (error) {
      debug.logApiError(error);
      return { 
        success: false, 
        error: error.response?.data?.message || '登录失败' 
      };
    }
  };

  const register = async (userData) => {
    try {
      debug.logApiRequest('POST', '/auth/register', { ...userData, password: '***' });
      
      const response = await api.post('/auth/register', userData);
      const { token, user: newUser } = response.data;
      
      debug.logApiResponse(response);
      debug.logUserState(newUser);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      
      debug.logLocalStorage();
      
      return { success: true, user: newUser };
    } catch (error) {
      debug.logApiError(error);
      return { 
        success: false, 
        error: error.response?.data?.message || '注册失败' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const isPatient = () => hasRole('patient');
  const isDoctor = () => hasRole('doctor');
  const isAdmin = () => hasRole('admin');

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated,
    hasRole,
    isPatient,
    isDoctor,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
