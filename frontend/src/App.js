import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import PatientDashboard from './pages/PatientDashboard';
import PatientAppointments from './pages/PatientAppointments';
import PatientRecords from './pages/PatientRecords';
import PatientMessages from './pages/PatientMessages';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorSchedule from './pages/DoctorSchedule';
import DoctorPatients from './pages/DoctorPatients';
import DoctorRecords from './pages/DoctorRecords';
import DoctorMessages from './pages/DoctorMessages';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminAppointments from './pages/AdminAppointments';
import AdminRecords from './pages/AdminRecords';
import AdminSettings from './pages/AdminSettings';
import TestLogin from './pages/TestLogin';

// 创建主题
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

// 受保护的路由组件
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div>加载中...</div>;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// 主应用组件
const AppContent = () => {
  const { user, isAuthenticated } = useAuth();

  const getDefaultRoute = () => {
    if (!isAuthenticated()) {
      return '/login';
    }
    
    switch (user?.role) {
        case 'patient':
            return '/patient/dashboard';
        case 'doctor':
            return '/doctor/dashboard';
        case 'admin':
            return '/admin/dashboard';
        default:
            return '/login';
    }
  };

  return (
    <Router>
      <CssBaseline />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      {isAuthenticated() && <Navbar />}
      
      <Routes>
        {/* 公共路由 */}
        <Route path="/login" element={
          isAuthenticated() ? <Navigate to={getDefaultRoute()} replace /> : <Login />
        } />
        <Route path="/register" element={
          isAuthenticated() ? <Navigate to={getDefaultRoute()} replace /> : <Register />
        } />
        <Route path="/test-login" element={<TestLogin />} />
        
        {/* 受保护的路由 */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        {/* 患者路由 */}
        <Route path="/patient/dashboard" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientDashboard />
          </ProtectedRoute>
        } />
        <Route path="/patient/appointments" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientAppointments />
          </ProtectedRoute>
        } />
        <Route path="/patient/records" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientRecords />
          </ProtectedRoute>
        } />
        <Route path="/patient/messages" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientMessages />
          </ProtectedRoute>
        } />
        
        {/* 医生路由 */}
        <Route path="/doctor/dashboard" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/doctor/appointments" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorAppointments />
          </ProtectedRoute>
        } />
        <Route path="/doctor/schedule" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorSchedule />
          </ProtectedRoute>
        } />
        <Route path="/doctor/patients" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorPatients />
          </ProtectedRoute>
        } />
        <Route path="/doctor/records" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorRecords />
          </ProtectedRoute>
        } />
        <Route path="/doctor/messages" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorMessages />
          </ProtectedRoute>
        } />
        
        {/* 管理员路由 */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsers />
          </ProtectedRoute>
        } />
        <Route path="/admin/appointments" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAppointments />
          </ProtectedRoute>
        } />
        <Route path="/admin/records" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminRecords />
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminSettings />
          </ProtectedRoute>
        } />
        
        {/* 默认重定向 */}
        <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
        <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
      </Routes>
    </Router>
  );
};

// 根组件
const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
