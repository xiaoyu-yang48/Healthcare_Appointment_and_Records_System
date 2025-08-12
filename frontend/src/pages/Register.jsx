import React, { useState } from 'react';
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
      setError('密码确认不匹配');
      return false;
    }
    if (formData.password.length < 6) {
      setError('密码至少需要6个字符');
      return false;
    }
    if (!formData.name.trim()) {
      setError('请输入姓名');
      return false;
    }
    if (!formData.email.trim()) {
      setError('请输入邮箱地址');
      return false;
    }
    if (formData.role === 'doctor' && !formData.department) {
      setError('请选择科室');
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
        toast.success('注册成功！');
        
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
      setError('注册失败，请重试');
      toast.error('注册失败，请重试');
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
          <Typography component="h1" variant="h4" gutterBottom>
            医疗预约系统
          </Typography>
          
          <Typography variant="h6" color="textSecondary" gutterBottom>
            用户注册
          </Typography>

          <Tabs
            value={formData.role}
            onChange={handleRoleChange}
            sx={{ marginBottom: 3 }}
          >
            <Tab label="患者" value="patient" />
            <Tab label="医生" value="doctor" />
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
              label="姓名"
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
              label="邮箱地址"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="phone"
              label="手机号码"
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
              label="密码"
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
              label="确认密码"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            {formData.role === 'doctor' && (
              <>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="department-label">科室</InputLabel>
                  <Select
                    labelId="department-label"
                    id="department"
                    name="department"
                    value={formData.department}
                    label="科室"
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
                  label="专业特长"
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
              {loading ? <CircularProgress size={24} /> : '注册'}
            </Button>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                已有账号？{' '}
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  立即登录
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
