import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search,
  Refresh,
  Edit,
  CheckCircle,
  Cancel,
  Person,
  Schedule,
  Visibility,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../axiosConfig';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { t } from '../utils/i18n';

const DoctorAppointments = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, statusFilter, dateFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/appointments/doctor');
      setAppointments(response.data);
    } catch (error) {
      console.error('Failed to get appointments:', error);
      toast.error(t('get_appointments_failed'));
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;

    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patient?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter(apt => apt.date === dateFilter);
    }

    setFilteredAppointments(filtered);
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await api.put(`/appointments/${appointmentId}/status`, { status: newStatus });
      toast.success(t('appointment_status_updated'));
      fetchAppointments();
    } catch (error) {
      console.error('Failed to update appointment status:', error);
      toast.error(t('update_appointment_status_failed'));
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenDetailsDialog(true);
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

  const getStatusActions = (appointment) => {
    const actions = [];

    if (appointment.status === 'pending') {
      actions.push(
        <Tooltip key="confirm" title={t('confirm_appointment')}>
          <IconButton
            color="success"
            onClick={() => handleStatusChange(appointment._id, 'confirmed')}
          >
            <CheckCircle />
          </IconButton>
        </Tooltip>
      );
      actions.push(
        <Tooltip key="cancel" title={t('cancel_appointment')}>
          <IconButton
            color="error"
            onClick={() => handleStatusChange(appointment._id, 'cancelled')}
          >
            <Cancel />
          </IconButton>
        </Tooltip>
      );
    }

    if (appointment.status === 'confirmed') {
      actions.push(
        <Tooltip key="complete" title={t('complete_appointment')}>
          <IconButton
            color="primary"
            onClick={() => handleStatusChange(appointment._id, 'completed')}
          >
            <CheckCircle />
          </IconButton>
        </Tooltip>
      );
    }

    return actions;
  };

  const getStats = () => {
    const total = appointments.length;
    const pending = appointments.filter(apt => apt.status === 'pending').length;
    const confirmed = appointments.filter(apt => apt.status === 'confirmed').length;
    const completed = appointments.filter(apt => apt.status === 'completed').length;
    const cancelled = appointments.filter(apt => apt.status === 'cancelled').length;

    return { total, pending, confirmed, completed, cancelled };
  };

  const stats = getStats();

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
        {t('appointment_management')}
      </Typography>

      {/* 统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Schedule color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t('total_appointments')}
                  </Typography>
                  <Typography variant="h4">
                    {stats.total}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Schedule color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t('pending')}
                  </Typography>
                  <Typography variant="h4">
                    {stats.pending}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Schedule color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t('status_confirmed')}
                  </Typography>
                  <Typography variant="h4">
                    {stats.confirmed}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Schedule color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t('status_completed')}
                  </Typography>
                  <Typography variant="h4">
                    {stats.completed}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Schedule color="error" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t('status_cancelled')}
                  </Typography>
                  <Typography variant="h4">
                    {stats.cancelled}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 搜索和筛选 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            label={t('search_patients')}
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search />,
            }}
            sx={{ minWidth: 200 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{t('status_filter')}</InputLabel>
            <Select
              value={statusFilter}
              label={t('status_filter')}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">{t('all')}</MenuItem>
              <MenuItem value="pending">{t('status_pending')}</MenuItem>
              <MenuItem value="confirmed">{t('status_confirmed')}</MenuItem>
              <MenuItem value="completed">{t('status_completed')}</MenuItem>
              <MenuItem value="cancelled">{t('status_cancelled')}</MenuItem>
            </Select>
          </FormControl>

          <TextField
            type="date"
            label={t('date_filter')}
            variant="outlined"
            size="small"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchAppointments}
          >
            {t('refresh')}
          </Button>
        </Box>
      </Paper>

      {/* 预约列表 */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('patient')}</TableCell>
                <TableCell>{t('appointment_date')}</TableCell>
                <TableCell>{t('appointment_time')}</TableCell>
                <TableCell>{t('type')}</TableCell>
                <TableCell>{t('status')}</TableCell>
                <TableCell>{t('actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAppointments.map((appointment) => (
                <TableRow key={appointment._id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Person sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="subtitle2">
                          {appointment.patient?.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {appointment.patient?.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {format(new Date(appointment.date), 'yyyy-MM-dd')}
                  </TableCell>
                  <TableCell>
                    {appointment.timeSlot}
                  </TableCell>
                  <TableCell>
                    {appointment.type || t('consultation')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(appointment.status)}
                      color={getStatusColor(appointment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title={t('view_details')}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(appointment)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      {getStatusActions(appointment)}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredAppointments.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography color="textSecondary">
              {t('no_appointments_found')}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* 预约详情对话框 */}
      <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="md" fullWidth>
        {selectedAppointment && (
          <>
            <DialogTitle>
              {t('appointment_details')}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ pt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('patient_info')}
                  </Typography>
                  <Box>
                    <Typography variant="body2">
                      <strong>{t('name')}:</strong> {selectedAppointment.patient?.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('email')}:</strong> {selectedAppointment.patient?.email}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('phone')}:</strong> {selectedAppointment.patient?.phone || t('not_provided')}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('appointment_info')}
                  </Typography>
                  <Box>
                    <Typography variant="body2">
                      <strong>{t('date')}:</strong> {format(new Date(selectedAppointment.date), 'yyyy-MM-dd')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('time')}:</strong> {selectedAppointment.timeSlot}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('type')}:</strong> {selectedAppointment.type || t('consultation')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('status')}:</strong> {getStatusLabel(selectedAppointment.status)}
                    </Typography>
                  </Box>
                </Grid>

                {selectedAppointment.symptoms && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      {t('symptoms')}
                    </Typography>
                    <Typography variant="body2">
                      {selectedAppointment.symptoms}
                    </Typography>
                  </Grid>
                )}

                {selectedAppointment.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      {t('notes')}
                    </Typography>
                    <Typography variant="body2">
                      {selectedAppointment.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDetailsDialog(false)}>
                {t('close')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default DoctorAppointments;
