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
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Schedule,
  MedicalServices,
  Message,
  People,
  CalendarToday,
  Person,
  CheckCircle,
  Pending,
  Cancel,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../axiosConfig';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { t } from '../utils/i18n';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    completedToday: 0,
    pendingAppointments: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 获取今日预约
      const todayResponse = await api.get('/appointments/doctor/today');
      const todayData = todayResponse.data;
      setTodayAppointments(todayData);
      
      // 获取即将到来的预约
      const upcomingResponse = await api.get('/appointments/doctor', {
        params: { status: 'confirmed' }
      });
      const upcomingData = upcomingResponse.data;
      setUpcomingAppointments(upcomingData.slice(0, 5)); // 只显示最近5个
      
      // 获取统计数据
      const statsResponse = await api.get('/doctors/stats');
      const statsData = statsResponse.data;
      setStats({
        totalPatients: statsData.recentPatients?.length || 0,
        todayAppointments: todayData.length,
        completedToday: todayData.filter(apt => apt.status === 'completed').length,
        pendingAppointments: statsData.statusStats?.find(s => s._id === 'pending')?.count || 0,
      });
      
    } catch (error) {
      console.error('获取仪表板数据失败:', error);
      console.error('错误详情:', error.response?.data);
      
      // 如果是401错误，可能是token过期，重定向到登录页
      if (error.response?.status === 401) {
        toast.error('登录已过期，请重新登录');
        // 清除本地存储并重定向到登录页
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      toast.error(t('get_data_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId, status) => {
    try {
      await api.put(`/appointments/${appointmentId}/status`, { status });
      toast.success(t('appointment_status_updated'));
      fetchDashboardData(); // 刷新数据
    } catch (error) {
      console.error('更新预约状态失败:', error);
      toast.error(t('update_failed'));
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle />;
      case 'pending':
        return <Pending />;
      case 'cancelled':
        return <Cancel />;
      case 'completed':
        return <CheckCircle />;
      default:
        return <Schedule />;
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
        {t('welcome_back')}，{user?.name} {t('doctor')}！
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
                    {t('total_patients')}
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalPatients}
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
                <CalendarToday color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t('today_appointments')}
                  </Typography>
                  <Typography variant="h4">
                    {stats.todayAppointments}
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
                <CheckCircle color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t('completed')}
                  </Typography>
                  <Typography variant="h4">
                    {stats.completedToday}
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
                <Pending color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t('pending')}
                  </Typography>
                  <Typography variant="h4">
                    {stats.pendingAppointments}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* 今日预约 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  {t('today_appointments_title')} ({format(new Date(), 'MM-dd')})
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Schedule />}
                  onClick={() => navigate('/doctor/schedule')}
                >
                  {t('manage_schedule')}
                </Button>
              </Box>
              
              {todayAppointments.length > 0 ? (
                <List>
                  {todayAppointments.map((appointment) => (
                    <ListItem key={appointment._id} divider>
                      <ListItemIcon>
                        {getStatusIcon(appointment.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle2">
                              {appointment.patient?.name}
                            </Typography>
                            <Chip
                              label={getStatusLabel(appointment.status)}
                              color={getStatusColor(appointment.status)}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={`${appointment.timeSlot} - ${appointment.type || '咨询'}`}
                      />
                      <Box>
                        {appointment.status === 'pending' && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleUpdateAppointmentStatus(appointment._id, 'confirmed')}
                          >
                            {t('confirm')}
                          </Button>
                        )}
                        {appointment.status === 'confirmed' && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleUpdateAppointmentStatus(appointment._id, 'completed')}
                          >
                            {t('complete')}
                          </Button>
                        )}
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="textSecondary" align="center" sx={{ py: 2 }}>
                  {t('no_appointments_today')}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 即将到来的预约 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  {t('upcoming_appointments')}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/doctor/appointments')}
                >
                  {t('view_all')}
                </Button>
              </Box>
              
              {upcomingAppointments.length > 0 ? (
                <List>
                  {upcomingAppointments.map((appointment) => (
                    <ListItem key={appointment._id} divider>
                      <ListItemIcon>
                        <Person />
                      </ListItemIcon>
                      <ListItemText
                        primary={appointment.patient?.name}
                        secondary={`${format(new Date(appointment.date), 'MM-dd')} ${appointment.timeSlot}`}
                      />
                      <Chip
                        label={getStatusLabel(appointment.status)}
                        color={getStatusColor(appointment.status)}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="textSecondary" align="center" sx={{ py: 2 }}>
                  {t('no_upcoming_appointments')}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 快速操作 */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('quick_actions')}
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<Schedule />}
              onClick={() => navigate('/doctor/schedule')}
            >
              {t('manage_schedule')}
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<People />}
              onClick={() => navigate('/doctor/patients')}
            >
              {t('patient_management')}
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<MedicalServices />}
              onClick={() => navigate('/doctor/records')}
            >
              {t('medical_records_management')}
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<Message />}
              onClick={() => navigate('/doctor/messages')}
            >
              {t('message_center')}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default DoctorDashboard; 