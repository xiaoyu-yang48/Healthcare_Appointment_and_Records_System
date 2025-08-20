import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocalHospital,
  School,
  Save,
  Edit,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../axiosConfig';
import { toast } from 'react-hot-toast';
import { t } from '../utils/i18n';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    department: '',
    specialization: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        department: user.department || '',
        specialization: user.specialization || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.put('/auth/profile', formData);
      updateUser(response.data);
      setEditing(false);
      toast.success(t('profile_config.updateSuccess'));
    } catch (error) {
      console.error('更新个人信息失败:', error);
              setError(error.response?.data?.message || t('profile_config.updateFailed'));
        toast.error(t('profile_config.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'patient':
        return t('profile_config.patient');
      case 'doctor':
        return t('profile_config.doctor');
      case 'admin':
        return t('profile_config.admin');
      default:
        return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'patient':
        return 'primary';
      case 'doctor':
        return 'success';
      case 'admin':
        return 'error';
      default:
        return 'default';
    }
  };

  const departments = [
    'Internal Medicine',
    'Surgery',
    'Pediatrics',
    'Obstetrics & Gynecology',
    'Ophthalmology',
    'Otorhinolaryngology',
    'Dermatology',
    'Neurology',
    'Cardiology',
    'Orthopedics',
    'Oncology',
    'Emergency',
  ];

  const genders = [
    { value: 'male', label: t('profile_config.male') },
    { value: 'female', label: t('profile_config.female') },
    { value: 'other', label: t('profile_config.other') },
  ];

  if (!user) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('profile_config.personalInfo')}
      </Typography>

      <Card>
        <CardContent>
          {/* 头像和基本信息 */}
          <Box display="flex" alignItems="center" mb={3}>
            <Avatar
              sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main' }}
            >
              {user.name?.charAt(0) || <Person />}
            </Avatar>
            <Box>
              <Typography variant="h5" gutterBottom>
                {user.name}
              </Typography>
              <Chip
                label={getRoleLabel(user.role)}
                color={getRoleColor(user.role)}
                sx={{ mr: 1 }}
              />
              <Typography variant="body2" color="textSecondary">
                {t('profile_config.registrationDate')}: {new Date(user.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('profile_config.name')}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!editing}
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('profile_config.email')}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!editing}
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('profile_config.phone')}
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!editing}
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('profile_config.address')}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('profile_config.dateOfBirth')}
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  disabled={!editing}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{ lang: 'en' }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={!editing}>
                  <InputLabel>{t('profile_config.gender')}</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    label={t('profile_config.gender')}
                    onChange={handleChange}
                  >
                    {genders.map((gender) => (
                      <MenuItem key={gender.value} value={gender.value}>
                        {gender.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {user.role === 'doctor' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth disabled={!editing}>
                      <InputLabel>{t('profile_config.department')}</InputLabel>
                      <Select
                        name="department"
                        value={formData.department}
                        label={t('profile_config.department')}
                        onChange={handleChange}
                        startAdornment={<LocalHospital sx={{ mr: 1, color: 'text.secondary' }} />}
                      >
                        {departments.map((dept) => (
                          <MenuItem key={dept} value={dept}>
                            {dept}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('profile_config.specialization')}
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      disabled={!editing}
                      multiline
                      rows={3}
                      InputProps={{
                        startAdornment: <School sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  {editing ? (
                    <>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setEditing(false);
                          setFormData({
                            name: user.name || '',
                            email: user.email || '',
                            phone: user.phone || '',
                            address: user.address || '',
                            dateOfBirth: user.dateOfBirth || '',
                            gender: user.gender || '',
                            department: user.department || '',
                            specialization: user.specialization || '',
                          });
                        }}
                      >
                        {t('profile_config.cancel')}
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                        disabled={loading}
                      >
                        {t('profile_config.save')}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<Edit />}
                      onClick={() => setEditing(true)}
                    >
                      {t('profile_config.editInfo')}
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Profile;
