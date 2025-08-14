import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Chip,
} from '@mui/material';
import {
  AccountCircle,
  Dashboard,
  Schedule,
  MedicalServices,
  Message,
  People,
  Settings,
  Logout,
} from '@mui/icons-material';
import { t, setLanguage, getLanguage } from '../utils/i18n';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isPatient, isDoctor, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'patient':
        return t('patient');
      case 'doctor':
        return t('doctor');
      case 'admin':
        return t('admin');
      default:
        return t('user');
    }
  };

  const getDashboardPath = () => {
    switch (user?.role) {
      case 'patient':
        return '/patient/dashboard';
      case 'doctor':
        return '/doctor/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  const getNavItems = () => {
    if (isPatient()) {
      return [
        { label: t('appointments'), path: '/patient/appointments', icon: <Schedule /> },
        { label: t('records'), path: '/patient/records', icon: <MedicalServices /> },
        { label: t('messages'), path: '/patient/messages', icon: <Message /> },
      ];
    } else if (isDoctor()) {
      return [
        { label: t('schedule'), path: '/doctor/schedule', icon: <Schedule /> },
        { label: t('patients'), path: '/doctor/patients', icon: <People /> },
        { label: t('messages'), path: '/doctor/messages', icon: <Message /> },
      ];
    } else if (isAdmin()) {
      return [
        { label: t('patients'), path: '/admin/users', icon: <People /> },
        { label: t('settings'), path: '/admin/settings', icon: <Settings /> },
      ];
    }
    return [];
  };

  if (!user) {
    return null;
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={Link} to={getDashboardPath()} sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1 }}>
          {t('dashboard')}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {getNavItems().map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              component={Link}
              to={item.path}
            >
              {item.label}
            </Button>
          ))}
          <Chip
            label={getRoleLabel()}
            color="secondary"
            size="small"
            sx={{ mr: 1 }}
          />
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {user.name?.charAt(0) || <AccountCircle />}
            </Avatar>
          </IconButton>
          <Button color="inherit" onClick={() => setLanguage(getLanguage() === 'en' ? 'zh' : 'en')}>
            {getLanguage() === 'en' ? t('chinese') : t('english')}
          </Button>
        </Box>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
            <AccountCircle sx={{ mr: 1 }} />
            {t('profile')}
          </MenuItem>
          <MenuItem onClick={() => { navigate(getDashboardPath()); handleClose(); }}>
            <Dashboard sx={{ mr: 1 }} />
            {t('dashboard')}
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <Logout sx={{ mr: 1 }} />
            {t('logout')}
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
