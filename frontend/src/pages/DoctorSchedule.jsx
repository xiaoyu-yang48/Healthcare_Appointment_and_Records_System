import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Schedule,
  CheckCircle,
  Cancel,
  AccessTime,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../axiosConfig';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { toast } from 'react-hot-toast';
import { t } from '../utils/i18n';

const DoctorSchedule = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    timeSlots: [],
    isAvailable: true,
  });

  const timeSlots = [
    '09:00-09:30', '09:30-10:00', '10:00-10:30', '10:30-11:00',
    '11:00-11:30', '11:30-12:00', '14:00-14:30', '14:30-15:00',
    '15:00-15:30', '15:30-16:00', '16:00-16:30', '16:30-17:00',
  ];

  useEffect(() => {
    fetchSchedules();
  }, [currentWeek]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const startDate = format(startOfWeek(currentWeek), 'yyyy-MM-dd');
      const endDate = format(endOfWeek(currentWeek), 'yyyy-MM-dd');
      
      const response = await api.get('/doctors/schedule', {
        params: { startDate, endDate }
      });
      setSchedules(response.data);
    } catch (error) {
      console.error('Failed to get schedules:', error);
      toast.error(t('get_schedule_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      timeSlots: [],
      isAvailable: true,
    });
    setOpenDialog(true);
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      date: schedule.date,
      timeSlots: schedule.timeSlots || [],
      isAvailable: schedule.isAvailable,
    });
    setOpenDialog(true);
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm(t('confirm_delete_schedule'))) {
      return;
    }

    try {
      await api.delete(`/doctors/schedule/${scheduleId}`);
      toast.success(t('schedule_deleted_success'));
      fetchSchedules();
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      toast.error(t('delete_schedule_failed'));
    }
  };

  const handleSaveSchedule = async () => {
    try {
      if (editingSchedule) {
        await api.put(`/doctors/schedule/${editingSchedule._id}`, formData);
        toast.success(t('schedule_updated_success'));
      } else {
        await api.post('/doctors/schedule', formData);
        toast.success(t('schedule_created_success'));
      }
      setOpenDialog(false);
      fetchSchedules();
    } catch (error) {
      console.error('Failed to save schedule:', error);
      toast.error(t('save_schedule_failed'));
    }
  };

  const handleTimeSlotToggle = (slot) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.includes(slot)
        ? prev.timeSlots.filter(s => s !== slot)
        : [...prev.timeSlots, slot]
    }));
  };

  const getWeekDays = () => {
    const days = [];
    const start = startOfWeek(currentWeek);
    for (let i = 0; i < 7; i++) {
      days.push(addDays(start, i));
    }
    return days;
  };

  const getScheduleForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return schedules.find(s => s.date === dateStr);
  };

  const getDayName = (date) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayNames[date.getDay()];
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          {t('schedule_management')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddSchedule}
        >
          {t('add_schedule')}
        </Button>
      </Box>

      {/* 周导航 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
          >
            {t('previous_week')}
          </Button>
          <Typography variant="h6">
            {format(startOfWeek(currentWeek), 'MMM dd')} - {format(endOfWeek(currentWeek), 'MMM dd, yyyy')}
          </Typography>
          <Button
            onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
          >
            {t('next_week')}
          </Button>
        </Box>
      </Paper>

      {/* 周排班表 */}
      <Grid container spacing={2}>
        {getWeekDays().map((date) => {
          const schedule = getScheduleForDate(date);
          const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={date.toISOString()}>
              <Card 
                variant={isToday ? "outlined" : "elevation"}
                sx={{ 
                  border: isToday ? 2 : 1,
                  borderColor: isToday ? 'primary.main' : 'divider'
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      {getDayName(date)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {format(date, 'MMM dd')}
                    </Typography>
                  </Box>

                  {schedule ? (
                    <Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Chip
                          label={schedule.isAvailable ? t('available') : t('unavailable')}
                          color={schedule.isAvailable ? 'success' : 'error'}
                          size="small"
                        />
                        <Box>
                          <Tooltip title={t('edit_schedule')}>
                            <IconButton
                              size="small"
                              onClick={() => handleEditSchedule(schedule)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('delete_schedule')}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteSchedule(schedule._id)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      {schedule.isAvailable && schedule.timeSlots && schedule.timeSlots.length > 0 && (
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            {t('available_slots')}:
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
                            {schedule.timeSlots.map((slot) => (
                              <Chip
                                key={slot}
                                label={slot}
                                size="small"
                                variant="outlined"
                                icon={<AccessTime />}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Box textAlign="center" py={2}>
                      <Typography variant="body2" color="textSecondary">
                        {t('no_schedule')}
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<Add />}
                        onClick={() => {
                          setFormData({
                            date: format(date, 'yyyy-MM-dd'),
                            timeSlots: [],
                            isAvailable: true,
                          });
                          setEditingSchedule(null);
                          setOpenDialog(true);
                        }}
                        sx={{ mt: 1 }}
                      >
                        {t('add_schedule')}
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* 排班编辑对话框 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSchedule ? t('edit_schedule') : t('add_schedule')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              type="date"
              label={t('date')}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                />
              }
              label={formData.isAvailable ? t('available') : t('unavailable')}
              sx={{ mt: 2 }}
            />

            {formData.isAvailable && (
              <Box mt={3}>
                <Typography variant="subtitle1" gutterBottom>
                  {t('select_time_slots')}
                </Typography>
                <Grid container spacing={1}>
                  {timeSlots.map((slot) => (
                    <Grid item xs={6} sm={4} md={3} key={slot}>
                      <Button
                        variant={formData.timeSlots.includes(slot) ? "contained" : "outlined"}
                        size="small"
                        fullWidth
                        onClick={() => handleTimeSlotToggle(slot)}
                        startIcon={formData.timeSlots.includes(slot) ? <CheckCircle /> : <AccessTime />}
                      >
                        {slot}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSaveSchedule} variant="contained">
            {t('save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DoctorSchedule;
