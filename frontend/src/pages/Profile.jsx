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

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
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
      const response = await api.put('/users/profile', formData);
      updateUser(response.data);
      setEditing(false);
      toast.success('个人信息更新成功');
    } catch (error) {
      console.error('更新个人信息失败:', error);
      setError(error.response?.data?.message || '更新失败');
      toast.error('更新失败');
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'patient':
        return '患者';
      case 'doctor':
        return '医生';
      case 'admin':
        return '管理员';
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
        个人资料
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
                注册时间：{new Date(user.createdAt).toLocaleDateString()}
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
                  label="姓名"
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
                  label="邮箱"
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
                  label="手机号码"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!editing}
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>

              {user.role === 'doctor' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth disabled={!editing}>
                      <InputLabel>科室</InputLabel>
                      <Select
                        name="department"
                        value={formData.department}
                        label="科室"
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
                      label="专业特长"
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
                            department: user.department || '',
                            specialization: user.specialization || '',
                          });
                        }}
                      >
                        取消
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                        disabled={loading}
                      >
                        保存
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<Edit />}
                      onClick={() => setEditing(true)}
                    >
                      编辑资料
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
