import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Cancel,
  Add,
  Search,
  Person,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../axiosConfig';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const PatientAppointments = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 获取预约列表
      const appointmentsResponse = await api.get('/appointments/patient');
      setAppointments(appointmentsResponse.data);
      
      // 获取医生列表
      const doctorsResponse = await api.get('/doctors');
      setDoctors(doctorsResponse.data);
      
    } catch (error) {
      console.error('获取数据失败:', error);
      toast.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    try {
      const appointmentData = {
        doctorId: selectedDoctor,
        date: selectedDate,
        time: selectedTime,
        patientId: user._id,
      };

      await api.post('/appointments', appointmentData);
      toast.success('预约成功！');
      setOpenBookingDialog(false);
      fetchData(); // 刷新数据
      
      // 重置表单
      setSelectedDoctor('');
      setSelectedDate(new Date());
      setSelectedTime('');
      
    } catch (error) {
      console.error('预约失败:', error);
      toast.error(error.response?.data?.message || '预约失败');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await api.put(`/appointments/${appointmentId}/cancel`);
      toast.success('预约已取消');
      fetchData(); // 刷新数据
    } catch (error) {
      console.error('取消预约失败:', error);
      toast.error('取消预约失败');
    }
  };

  const handleDoctorChange = async (doctorId) => {
    setSelectedDoctor(doctorId);
    if (doctorId && selectedDate) {
      try {
        const response = await api.get(`/doctors/${doctorId}/schedule`, {
          params: {
            date: format(selectedDate, 'yyyy-MM-dd'),
          },
        });
        setAvailableSlots(response.data.availableSlots || []);
      } catch (error) {
        console.error('获取可用时间失败:', error);
        setAvailableSlots([]);
      }
    }
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    if (selectedDoctor && date) {
      try {
        const response = await api.get(`/doctors/${selectedDoctor}/schedule`, {
          params: {
            date: format(date, 'yyyy-MM-dd'),
          },
        });
        setAvailableSlots(response.data.availableSlots || []);
      } catch (error) {
        console.error('获取可用时间失败:', error);
        setAvailableSlots([]);
      }
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

  const filteredDoctors = doctors.filter(doctor => {
    const matchesDepartment = !filterDepartment || doctor.department === filterDepartment;
    const matchesSearch = !searchTerm || 
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDepartment && matchesSearch;
  });

  const departments = [...new Set(doctors.map(doctor => doctor.department))];

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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          我的预约
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenBookingDialog(true)}
        >
          预约挂号
        </Button>
      </Box>

      {/* 预约列表 */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            预约记录
          </Typography>
          
          {appointments.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>医生</TableCell>
                    <TableCell>科室</TableCell>
                    <TableCell>预约时间</TableCell>
                    <TableCell>状态</TableCell>
                    <TableCell>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Person sx={{ mr: 1 }} />
                          {appointment.doctor?.name}
                        </Box>
                      </TableCell>
                      <TableCell>{appointment.department}</TableCell>
                      <TableCell>
                        {format(new Date(appointment.date), 'yyyy-MM-dd HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(appointment.status)}
                          color={getStatusColor(appointment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {appointment.status === 'confirmed' && (
                          <Tooltip title="取消预约">
                            <IconButton
                              color="error"
                              onClick={() => handleCancelAppointment(appointment._id)}
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
              暂无预约记录
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* 医生列表 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            选择医生预约
          </Typography>
          
          {/* 筛选和搜索 */}
          <Box display="flex" gap={2} mb={3}>
            <TextField
              label="搜索医生"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search />,
              }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>科室</InputLabel>
              <Select
                value={filterDepartment}
                label="科室"
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <MenuItem value="">全部科室</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Grid container spacing={2}>
            {filteredDoctors.map((doctor) => (
              <Grid item xs={12} sm={6} md={4} key={doctor._id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {doctor.name}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      {doctor.department}
                    </Typography>
                    {doctor.specialization && (
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        专业：{doctor.specialization}
                      </Typography>
                    )}
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setSelectedDoctor(doctor._id);
                        setOpenBookingDialog(true);
                      }}
                    >
                      预约
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* 预约对话框 */}
      <Dialog open={openBookingDialog} onClose={() => setOpenBookingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>预约挂号</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>选择医生</InputLabel>
              <Select
                value={selectedDoctor}
                label="选择医生"
                onChange={(e) => handleDoctorChange(e.target.value)}
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor._id} value={doctor._id}>
                    {doctor.name} - {doctor.department}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                选择日期
              </Typography>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                minDate={new Date()}
                dateFormat="yyyy-MM-dd"
                customInput={
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                }
              />
            </Box>

            {availableSlots.length > 0 && (
              <FormControl fullWidth margin="normal">
                <InputLabel>选择时间</InputLabel>
                <Select
                  value={selectedTime}
                  label="选择时间"
                  onChange={(e) => setSelectedTime(e.target.value)}
                >
                  {availableSlots.map((slot) => (
                    <MenuItem key={slot} value={slot}>
                      {slot}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {selectedDoctor && selectedDate && availableSlots.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                该日期暂无可用时间，请选择其他日期
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBookingDialog(false)}>
            取消
          </Button>
          <Button
            onClick={handleBookAppointment}
            variant="contained"
            disabled={!selectedDoctor || !selectedTime}
          >
            确认预约
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PatientAppointments; 