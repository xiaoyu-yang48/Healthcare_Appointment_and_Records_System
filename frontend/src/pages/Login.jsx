import React, { useState } from 'react';
import { t, setLanguage, getLanguage } from '../utils/i18n';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'patient',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (event, newRole) => {
    setFormData({
      ...formData,
      role: newRole,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast.success(t('login_success'));
        
        // 根据角色重定向到不同页面
        switch (result.user.role) {
          case 'patient':
            navigate('/patient/dashboard');
            break;
          case 'doctor':
            navigate('/doctor/dashboard');
            break;
          case 'admin':
            navigate('/admin/dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    } catch (error) {
      setError(t('login_failed'));
      toast.error(t('login_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 3, width: '100%' }}>
          <Typography variant="h5" align="center" gutterBottom>
            {t('login')}EMR
          </Typography>
          <Tabs
            value={formData.role}
            onChange={handleRoleChange}
            indicatorColor="primary"
            textColor="primary"
            centered
            sx={{ mb: 2 }}
          >
            <Tab label={t('patient')} value="patient" />
            <Tab label={t('doctor')} value="doctor" />
            <Tab label={t('admin')} value="admin" />
          </Tabs>
          <form onSubmit={handleSubmit}>
            <TextField
              label={t('email')}
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label={t('password')}
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : t('login')}
            </Button>
          </form>
          <Box mt={2} textAlign="center">
            <Typography variant="body2">
              {t('no_account')} <Link to="/register">{t('register')}</Link>
            </Typography>
          </Box>
          <Box mt={2} textAlign="center">
            <Button color="inherit" onClick={() => setLanguage(getLanguage() === 'en' ? 'zh' : 'en')}>
              {getLanguage() === 'en' ? t('chinese') : t('english')}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
