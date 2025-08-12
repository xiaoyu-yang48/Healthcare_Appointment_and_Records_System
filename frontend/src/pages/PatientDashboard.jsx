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
  Add,
  CalendarToday,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../axiosConfig';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    totalRecords: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 获取预约信息
      const appointmentsResponse = await api.get('/appointments/patient');
      const appointmentsData = appointmentsResponse.data;
      setAppointments(appointmentsData.slice(0, 5)); // 只显示最近5个
      
      // 获取病历信息
      const recordsResponse = await api.get('/medical-records/patient');
      const recordsData = recordsResponse.data;
      setMedicalRecords(recordsData.slice(0, 5)); // 只显示最近5个
      
      // 计算统计数据
      const upcoming = appointmentsData.filter(apt => 
        new Date(apt.date) > new Date() && apt.status === 'confirmed'
      ).length;
      
      const completed = appointmentsData.filter(apt => 
        apt.status === 'completed'
      ).length;
      
      setStats({
        totalAppointments: appointmentsData.length,
        upcomingAppointments: upcoming,
        completedAppointments: completed,
        totalRecords: recordsData.length,
      });
      
    } catch (error) {
      console.error('获取仪表板数据失败:', error);
      toast.error('获取数据失败');
    } finally {
      setLoading(false);
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
        欢迎回来，{user?.name}！
      </Typography>
      
      {/* 统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Schedule color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    总预约数
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalAppointments}
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
                    即将到来
                  </Typography>
                  <Typography variant="h4">
                    {stats.upcomingAppointments}
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
                <MedicalServices color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    已完成
                  </Typography>
                  <Typography variant="h4">
                    {stats.completedAppointments}
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
                <Message color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    病历数量
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalRecords}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* 最近预约 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  最近预约
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => navigate('/patient/appointments')}
                >
                  预约挂号
                </Button>
              </Box>
              
              {appointments.length > 0 ? (
                <List>
                  {appointments.map((appointment) => (
                    <ListItem key={appointment._id} divider>
                      <ListItemIcon>
                        <Schedule />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${appointment.doctor?.name || '医生'} - ${appointment.department}`}
                        secondary={`${format(new Date(appointment.date), 'yyyy-MM-dd HH:mm')}`}
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
                  暂无预约记录
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 最近病历 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  最近病历
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/patient/records')}
                >
                  查看全部
                </Button>
              </Box>
              
              {medicalRecords.length > 0 ? (
                <List>
                  {medicalRecords.map((record) => (
                    <ListItem key={record._id} divider>
                      <ListItemIcon>
                        <MedicalServices />
                      </ListItemIcon>
                      <ListItemText
                        primary={record.diagnosis || '诊断信息'}
                        secondary={`${record.doctor?.name || '医生'} - ${format(new Date(record.createdAt), 'yyyy-MM-dd')}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="textSecondary" align="center" sx={{ py: 2 }}>
                  暂无病历记录
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
              startIcon={<Add />}
              onClick={() => navigate('/patient/appointments')}
            >
              预约挂号
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<MedicalServices />}
              onClick={() => navigate('/patient/records')}
            >
              查看病历
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<Message />}
              onClick={() => navigate('/patient/messages')}
            >
              消息中心
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default PatientDashboard; 