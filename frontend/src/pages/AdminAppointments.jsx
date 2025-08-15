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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
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
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    date: '',
    timeSlot: '',
    type: 'consultation',
    status: 'pending',
    symptoms: '',
    notes: ''
  });
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

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenDetailsDialog(true);
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setEditFormData({
      date: appointment.date ? format(new Date(appointment.date), 'yyyy-MM-dd') : '',
      timeSlot: appointment.timeSlot || '',
      type: appointment.type || 'consultation',
      status: appointment.status || 'pending',
      symptoms: appointment.symptoms || '',
      notes: appointment.notes || ''
    });
    setOpenEditDialog(true);
  };

  const handleEditSubmit = async () => {
    try {
      console.log('提交的编辑数据:', editFormData);
      console.log('预约ID:', selectedAppointment._id);
      
      const response = await api.put(`/admin/appointments/${selectedAppointment._id}`, editFormData);
      console.log('更新成功:', response.data);
      
      toast.success(t('appointment_updated_success'));
      setOpenEditDialog(false);
      fetchAppointments();
    } catch (error) {
      console.error('更新预约失败:', error);
      console.error('错误详情:', error.response?.data);
      toast.error(error.response?.data?.message || t('update_appointment_failed'));
    }
  };

  const handleEditChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
                      onClick={() => handleViewDetails(appointment)}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEditAppointment(appointment)}
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
                      <strong>{t('name')}:</strong> {selectedAppointment.patient?.name || '-'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('email')}:</strong> {selectedAppointment.patient?.email || '-'}
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
                      <strong>{t('date')}:</strong> {selectedAppointment.date ? format(new Date(selectedAppointment.date), 'yyyy-MM-dd') : '-'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('time')}:</strong> {selectedAppointment.timeSlot || '-'}
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

      {/* 编辑预约对话框 */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        {selectedAppointment && (
          <>
            <DialogTitle>
              {t('edit_appointment')}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 1 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t('date')}
                      type="date"
                      value={editFormData.date}
                      onChange={(e) => handleEditChange('date', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ lang: 'en' }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t('time')}
                      value={editFormData.timeSlot}
                      onChange={(e) => handleEditChange('timeSlot', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>{t('type')}</InputLabel>
                      <Select
                        value={editFormData.type}
                        label={t('type')}
                        onChange={(e) => handleEditChange('type', e.target.value)}
                      >
                        <MenuItem value="consultation">{t('consultation')}</MenuItem>
                        <MenuItem value="follow-up">{t('follow_up')}</MenuItem>
                        <MenuItem value="emergency">{t('emergency')}</MenuItem>
                        <MenuItem value="routine">{t('routine')}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>{t('status')}</InputLabel>
                      <Select
                        value={editFormData.status}
                        label={t('status')}
                        onChange={(e) => handleEditChange('status', e.target.value)}
                      >
                        <MenuItem value="pending">{t('status_pending')}</MenuItem>
                        <MenuItem value="confirmed">{t('status_confirmed')}</MenuItem>
                        <MenuItem value="completed">{t('status_completed')}</MenuItem>
                        <MenuItem value="cancelled">{t('status_cancelled')}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('symptoms')}
                      multiline
                      rows={3}
                      value={editFormData.symptoms}
                      onChange={(e) => handleEditChange('symptoms', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('notes')}
                      multiline
                      rows={3}
                      value={editFormData.notes}
                      onChange={(e) => handleEditChange('notes', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenEditDialog(false)}>
                {t('cancel')}
              </Button>
              <Button onClick={handleEditSubmit} variant="contained">
                {t('save')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default AdminAppointments;
