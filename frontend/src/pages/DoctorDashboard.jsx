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
      const upcomingResponse = await api.get('/appointments/doctor/upcoming');
      const upcomingData = upcomingResponse.data;
      setUpcomingAppointments(upcomingData.slice(0, 5)); // 只显示最近5个
      
      // 获取统计数据
      const statsResponse = await api.get('/doctors/stats');
      const statsData = statsResponse.data;
      setStats({
        totalPatients: statsData.totalPatients || 0,
        todayAppointments: todayData.length,
        completedToday: todayData.filter(apt => apt.status === 'completed').length,
        pendingAppointments: statsData.pendingAppointments || 0,
      });
      
    } catch (error) {
      console.error('获取仪表板数据失败:', error);
      toast.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId, status) => {
    try {
      await api.put(`/appointments/${appointmentId}/status`, { status });
      toast.success('预约状态更新成功');
      fetchDashboardData(); // 刷新数据
    } catch (error) {
      console.error('更新预约状态失败:', error);
      toast.error('更新失败');
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
        return '已确认';
      case 'pending':
        return '待确认';
      case 'cancelled':
        return '已取消';
      case 'completed':
        return '已完成';
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
        欢迎回来，{user?.name}医生！
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
                    总患者数
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
                    今日预约
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
                    已完成
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
                    待处理
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
                  今日预约 ({format(new Date(), 'MM-dd')})
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Schedule />}
                  onClick={() => navigate('/doctor/schedule')}
                >
                  管理排班
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
                        secondary={`${format(new Date(appointment.date), 'HH:mm')} - ${appointment.department}`}
                      />
                      <Box>
                        {appointment.status === 'pending' && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleUpdateAppointmentStatus(appointment._id, 'confirmed')}
                          >
                            确认
                          </Button>
                        )}
                        {appointment.status === 'confirmed' && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleUpdateAppointmentStatus(appointment._id, 'completed')}
                          >
                            完成
                          </Button>
                        )}
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="textSecondary" align="center" sx={{ py: 2 }}>
                  今日暂无预约
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
                  即将到来
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/doctor/appointments')}
                >
                  查看全部
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
                        secondary={`${format(new Date(appointment.date), 'MM-dd HH:mm')} - ${appointment.department}`}
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
                  暂无即将到来的预约
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 快速操作 */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          快速操作
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<Schedule />}
              onClick={() => navigate('/doctor/schedule')}
            >
              管理排班
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<People />}
              onClick={() => navigate('/doctor/patients')}
            >
              患者管理
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<MedicalServices />}
              onClick={() => navigate('/doctor/records')}
            >
              病历管理
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<Message />}
              onClick={() => navigate('/doctor/messages')}
            >
              消息中心
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default DoctorDashboard; 