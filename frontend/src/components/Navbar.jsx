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
        return '患者';
      case 'doctor':
        return '医生';
      case 'admin':
        return '管理员';
      default:
        return '用户';
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
        { label: '预约挂号', path: '/patient/appointments', icon: <Schedule /> },
        { label: '我的病历', path: '/patient/records', icon: <MedicalServices /> },
        { label: '消息中心', path: '/patient/messages', icon: <Message /> },
      ];
    } else if (isDoctor()) {
      return [
        { label: '我的排班', path: '/doctor/schedule', icon: <Schedule /> },
        { label: '患者管理', path: '/doctor/patients', icon: <People /> },
        { label: '消息中心', path: '/doctor/messages', icon: <Message /> },
      ];
    } else if (isAdmin()) {
      return [
        { label: '用户管理', path: '/admin/users', icon: <People /> },
        { label: '系统设置', path: '/admin/settings', icon: <Settings /> },
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
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to={getDashboardPath()} style={{ textDecoration: 'none', color: 'inherit' }}>
            医疗预约系统
          </Link>
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
              个人资料
            </MenuItem>
            <MenuItem onClick={() => { navigate(getDashboardPath()); handleClose(); }}>
              <Dashboard sx={{ mr: 1 }} />
              仪表板
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              退出登录
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
