import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  People,
  MedicalServices,
  Schedule,
  Settings,
  TrendingUp,
  Person,
  LocalHospital,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../axiosConfig';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { t } from '../utils/i18n';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: {
      total: 0,
      patients: 0,
      doctors: 0,
      active: 0
    },
    appointments: {
      total: 0,
      today: 0,
      byStatus: []
    },
    records: {
      total: 0,
      thisMonth: 0
    },
    messages: {
      total: 0,
      unread: 0
    }
  });
  const [recentAppointments, setRecentAppointments] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 获取系统统计
      const statsResponse = await api.get('/admin/stats');
      setStats(statsResponse.data);
      
      // 获取最近预约（从stats中获取）
      setRecentAppointments(statsResponse.data.recentAppointments || []);
      
    } catch (error) {
      console.error('获取仪表板数据失败:', error);
      toast.error(t('get_data_failed'));
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'patient':
        return t('patient');
      case 'doctor':
        return t('doctor');
      case 'admin':
        return t('admin');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed':
        return t('status_confirmed');
      case 'pending':
        return t('status_pending');
      case 'cancelled':
        return t('status_cancelled');
      case 'completed':
        return t('status_completed');
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('system_management_dashboard')}
      </Typography>
      
      {/* 统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <People color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t('total_users')}
                  </Typography>
                  <Typography variant="h4">
                    {stats.users?.total || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <LocalHospital color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t('doctor_count')}
                  </Typography>
                  <Typography variant="h4">
                    {stats.users?.doctors || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Person color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t('patient_count')}
                  </Typography>
                  <Typography variant="h4">
                    {stats.users?.patients || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Schedule color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t('total_appointments')}
                  </Typography>
                  <Typography variant="h4">
                    {stats.appointments?.total || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 今日统计 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('today_appointment_stats')}
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h3" color="primary">
                    {stats.appointments?.today || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t('today_total_appointments')}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="h6" color="warning.main">
                    {stats.appointments?.byStatus?.find(s => s._id === 'pending')?.count || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t('pending_appointments')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('system_status')}
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUp color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('system_running_normal')}
                    secondary={t('all_services_normal')}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <MedicalServices color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('database_connection_normal')}
                    secondary={t('mongodb_connection_good')}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* 最近预约 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  {t('recent_appointments')}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/appointments')}
                >
                  {t('view_all')}
                </Button>
              </Box>
              
              {recentAppointments.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('patient')}</TableCell>
                        <TableCell>{t('doctor')}</TableCell>
                        <TableCell>{t('status')}</TableCell>
                        <TableCell>{t('time')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{appointment.patient?.name}</TableCell>
                          <TableCell>{appointment.doctor?.name}</TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(appointment.status)}
                              color={getStatusColor(appointment.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {format(new Date(appointment.date), 'MM-dd')} {appointment.timeSlot}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="textSecondary" align="center" sx={{ py: 2 }}>
                  {t('no_recent_appointments')}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 快速操作 */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('system_management')}
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<People />}
              onClick={() => navigate('/admin/users')}
            >
              {t('user_management')}
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<Schedule />}
              onClick={() => navigate('/admin/appointments')}
            >
              {t('appointment_management')}
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<MedicalServices />}
              onClick={() => navigate('/admin/records')}
            >
              {t('medical_records_management')}
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<Settings />}
              onClick={() => navigate('/admin/settings')}
            >
              {t('system_settings')}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AdminDashboard; 