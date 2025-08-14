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
import { t } from '../utils/i18n';

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
      toast.error(t('get_data_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    try {
      const appointmentData = {
        doctorId: selectedDoctor,
        date: format(selectedDate, 'yyyy-MM-dd'),
        timeSlot: selectedTime,
        symptoms: '',
        type: 'consultation',
      };

      await api.post('/appointments', appointmentData);
      toast.success(t('appointment_success'));
      setOpenBookingDialog(false);
      fetchData(); // 刷新数据
      
      // 重置表单
      setSelectedDoctor('');
      setSelectedDate(new Date());
      setSelectedTime('');
      
    } catch (error) {
      console.error('预约失败:', error);
      toast.error(error.response?.data?.message || t('appointment_failed'));
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await api.put(`/appointments/${appointmentId}/cancel`, {
              reason: t('patient_cancelled')
    });
    toast.success(t('cancel_appointment_success'));
      fetchData(); // 刷新数据
    } catch (error) {
      console.error('取消预约失败:', error);
      toast.error(t('cancel_appointment_failed'));
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
        const availableTimeSlots = response.data.timeSlots
          .filter(slot => slot.isAvailable)
          .map(slot => slot.time);
        setAvailableSlots(availableTimeSlots);
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
        const availableTimeSlots = response.data.timeSlots
          .filter(slot => slot.isAvailable)
          .map(slot => slot.time);
        setAvailableSlots(availableTimeSlots);
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
        return t('status_confirmed');
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
          {t('my_appointments')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenBookingDialog(true)}
        >
          {t('book_appointment')}
        </Button>
      </Box>

      {/* 预约列表 */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('appointment_records')}
          </Typography>
          
          {appointments.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('doctor')}</TableCell>
                    <TableCell>{t('department')}</TableCell>
                    <TableCell>{t('appointment_time')}</TableCell>
                    <TableCell>{t('status')}</TableCell>
                    <TableCell>{t('actions')}</TableCell>
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
                      <TableCell>{appointment.doctor?.department || t('not_set')}</TableCell>
                      <TableCell>
                        {format(new Date(appointment.date), 'yyyy-MM-dd')} {appointment.timeSlot}
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
                          <Tooltip title={t('cancel_appointment')}>
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
              {t('no_appointment_records')}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* 医生列表 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('select_doctor_appointment')}
          </Typography>
          
          {/* 筛选和搜索 */}
          <Box display="flex" gap={2} mb={3}>
            <TextField
              label={t('search_doctor')}
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search />,
              }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>{t('department')}</InputLabel>
              <Select
                value={filterDepartment}
                label={t('department')}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <MenuItem value="">{t('all_departments')}</MenuItem>
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
                      {doctor.department || t('department_not_set')}
                    </Typography>
                    {doctor.specialization && (
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {t('specialization')}: {doctor.specialization}
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
                      {t('book')}
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
        <DialogTitle>{t('book_appointment')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>{t('select_doctor')}</InputLabel>
              <Select
                value={selectedDoctor}
                label={t('select_doctor')}
                onChange={(e) => handleDoctorChange(e.target.value)}
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor._id} value={doctor._id}>
                    {doctor.name} - {doctor.department || t('department_not_set')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('select_date')}
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