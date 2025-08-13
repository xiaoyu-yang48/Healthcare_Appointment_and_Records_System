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
      toast.error('获取数据失败');
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
        系统管理仪表板
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
                    总用户数
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
                    医生数量
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
                    患者数量
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
                    总预约数
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
                今日预约统计
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h3" color="primary">
                    {stats.appointments?.today || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    今日预约总数
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="h6" color="warning.main">
                    {stats.appointments?.byStatus?.find(s => s._id === 'pending')?.count || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    待处理预约
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
                系统状态
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUp color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="系统运行正常"
                    secondary="所有服务正常运行"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <MedicalServices color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="数据库连接正常"
                    secondary="MongoDB 连接状态良好"
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
                  最近预约
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/appointments')}
                >
                  查看全部
                </Button>
              </Box>
              
              {recentAppointments.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>患者</TableCell>
                        <TableCell>医生</TableCell>
                        <TableCell>状态</TableCell>
                        <TableCell>时间</TableCell>
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
                  暂无最近预约
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 快速操作 */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          系统管理
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<People />}
              onClick={() => navigate('/admin/users')}
            >
              用户管理
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<Schedule />}
              onClick={() => navigate('/admin/appointments')}
            >
              预约管理
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<MedicalServices />}
              onClick={() => navigate('/admin/records')}
            >
              病历管理
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<Settings />}
              onClick={() => navigate('/admin/settings')}
            >
              系统设置
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AdminDashboard; 