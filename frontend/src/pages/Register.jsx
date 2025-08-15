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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    phone: '',
    department: '',
    specialization: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
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

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError(t('password_mismatch'));
      return false;
    }
    if (formData.password.length < 6) {
      setError(t('password_too_short'));
      return false;
    }
    if (!formData.name.trim()) {
      setError(t('name_required'));
      return false;
    }
    if (!formData.email.trim()) {
      setError(t('email_required'));
      return false;
    }
    if (formData.role === 'doctor' && !formData.department) {
      setError(t('department_required'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        ...(formData.role === 'doctor' && {
          department: formData.department,
          specialization: formData.specialization,
        }),
      };

      const result = await register(userData);
      
      if (result.success) {
        toast.success(t('register_success'));
        
        // 根据角色重定向到不同页面
        switch (result.user.role) {
          case 'patient':
            navigate('/patient/dashboard');
            break;
          case 'doctor':
            navigate('/doctor/dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    } catch (error) {
      setError(t('register_failed'));
      toast.error(t('register_failed'));
    } finally {
      setLoading(false);
    }
  };

  const departments = [
    '内科',
    '外科',
    '儿科',
    '妇产科',
    '眼科',
    '耳鼻喉科',
    '皮肤科',
    '神经科',
    '心血管科',
    '骨科',
    '肿瘤科',
    '急诊科',
  ];

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* Language Switch Button at Top */}
          <Box mt={-2} mb={2} textAlign="right" sx={{ width: '100%' }}>
            <Button color="inherit" onClick={() => setLanguage(getLanguage() === 'en' ? 'zh' : 'en')}>
              {getLanguage() === 'en' ? t('chinese') : t('english')}
            </Button>
          </Box>

          <Typography component="h1" variant="h4" gutterBottom>
            {t('system_name')}
          </Typography>

          <Typography variant="h6" color="textSecondary" gutterBottom>
            {t('register')}
          </Typography>

          <Tabs
            value={formData.role}
            onChange={handleRoleChange}
            sx={{ marginBottom: 3 }}
          >
            <Tab label={t('patient')} value="patient" />
            <Tab label={t('doctor')} value="doctor" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ width: '100%', marginBottom: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label={t('name')}
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label={t('email')}
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
            />

            <TextField
              margin="normal"
              fullWidth
              id="phone"
              label={t('phone')}
              name="phone"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={t('password')}
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label={t('confirm_password')}
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            {formData.role === 'doctor' && (
              <>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="department-label">{t('department')}</InputLabel>
                  <Select
                    labelId="department-label"
                    id="department"
                    name="department"
                    value={formData.department}
                    label={t('department')}
                    onChange={handleChange}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  margin="normal"
                  fullWidth
                  id="specialization"
                  label={t('specialization')}
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                />
              </>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : t('register')}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                {t('have_account')} <Link to="/login" style={{ textDecoration: 'none' }}>{t('login')}</Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
