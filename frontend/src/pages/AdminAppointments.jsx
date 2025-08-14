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
  TablePagination,
  Button,
  Chip,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search,
  Refresh,
  Edit,
  Delete,
  Visibility,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../axiosConfig';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { t } from '../utils/i18n';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, [page, rowsPerPage, search, statusFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      };

      const response = await api.get('/admin/appointments', { params });
      setAppointments(response.data.appointments);
      setTotalAppointments(response.data.pagination.totalAppointments);
          } catch (error) {
        console.error('获取预约列表失败:', error);
        toast.error(t('get_appointment_list_failed'));
      } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm(t('confirm_delete_appointment'))) {
      return;
    }

    try {
      await api.delete(`/admin/appointments/${appointmentId}`);
      setAppointments(prev => prev.filter(appointment => appointment._id !== appointmentId));
      setTotalAppointments(prev => prev - 1);
      toast.success(t('appointment_deleted_success'));
    } catch (error) {
      console.error('删除预约失败:', error);
      toast.error(t('delete_appointment_failed'));
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
         {t('appointment_management')}
        </Typography>

      {/* 搜索和筛选 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                      <TextField
             label={t('search_appointments')}
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <Search />,
              }}
              sx={{ minWidth: 200 }}
             placeholder={t('patient_name_doctor_name')}
            />
          
                      <FormControl size="small" sx={{ minWidth: 120 }}>
             <InputLabel>{t('status_filter')}</InputLabel>
              <Select
                value={statusFilter}
               label={t('status_filter')}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
               <MenuItem value="">{t('all_status')}</MenuItem>
               <MenuItem value="pending">{t('status_pending')}</MenuItem>
               <MenuItem value="confirmed">{t('status_confirmed')}</MenuItem>
               <MenuItem value="completed">{t('status_completed')}</MenuItem>
               <MenuItem value="cancelled">{t('status_cancelled')}</MenuItem>
              </Select>
            </FormControl>

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
                 <TableCell>{t('doctor')}</TableCell>
                 <TableCell>{t('appointment_date')}</TableCell>
                 <TableCell>{t('time_slot')}</TableCell>
                 <TableCell>{t('status')}</TableCell>
                 <TableCell>{t('created_at')}</TableCell>
                 <TableCell>{t('actions')}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment._id}>
                  <TableCell>{appointment.patient?.name || '-'}</TableCell>
                  <TableCell>{appointment.doctor?.name || '-'}</TableCell>
                  <TableCell>
                    {appointment.date ? format(new Date(appointment.date), 'yyyy-MM-dd') : '-'}
                  </TableCell>
                  <TableCell>{appointment.timeSlot || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(appointment.status)}
                      color={getStatusColor(appointment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {appointment.createdAt ? format(new Date(appointment.createdAt), 'yyyy-MM-dd HH:mm') : '-'}
                  </TableCell>
                  <TableCell>
                                        <IconButton
                      size="small"
                     onClick={() => toast.info(t('view_details_not_implemented'))}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                     onClick={() => toast.info(t('edit_not_implemented'))}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteAppointment(appointment._id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalAppointments}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={t('rows_per_page')}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${t('of')} ${count}`}
        />
      </Paper>
    </Container>
  );
};

export default AdminAppointments;
