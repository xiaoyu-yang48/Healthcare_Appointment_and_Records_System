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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextareaAutosize,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Search,
  Refresh,
  Add,
  Edit,
  Delete,
  Visibility,
  MedicalServices,
  Person,
  CalendarToday,
  LocalHospital,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../axiosConfig';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { t } from '../utils/i18n';

const DoctorRecords = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patientId: '',
    type: 'consultation',
    diagnosis: '',
    symptoms: '',
    treatment: '',
    prescription: {
      medications: []
    },
    notes: '',
    followUpDate: '',
    followUpNotes: '',
  });

  const recordTypes = [
    { value: 'consultation', label: t('consultation') },
    { value: 'examination', label: t('examination') },
    { value: 'treatment', label: t('treatment') },
    { value: 'surgery', label: t('surgery') },
  ];

  useEffect(() => {
    fetchRecords();
    fetchPatients();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, searchTerm, typeFilter]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get('/medical-records/doctor');
      setRecords(response.data);
    } catch (error) {
      console.error('Failed to get medical records:', error);
      toast.error(t('get_medical_records_failed'));
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/doctors/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Failed to get patients:', error);
    }
  };

  const filterRecords = () => {
    let filtered = records;

    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter) {
      filtered = filtered.filter(record => record.type === typeFilter);
    }

    setFilteredRecords(filtered);
  };

  const handleAddRecord = () => {
    setEditingRecord(null);
    setFormData({
      patientId: '',
      type: 'consultation',
      diagnosis: '',
      symptoms: '',
      treatment: '',
      prescription: {
        medications: []
      },
      notes: '',
      followUpDate: '',
      followUpNotes: '',
    });
    setOpenDialog(true);
  };

  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setFormData({
      patientId: record.patient?._id || '',
      type: record.type || 'consultation',
      diagnosis: record.diagnosis || '',
      symptoms: record.symptoms || '',
      treatment: record.treatment || '',
      prescription: record.prescription || { medications: [] },
      notes: record.notes || '',
      followUpDate: record.followUpDate || '',
      followUpNotes: record.followUpNotes || '',
    });
    setOpenDialog(true);
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm(t('confirm_delete_record'))) {
      return;
    }

    try {
      await api.delete(`/medical-records/${recordId}`);
      toast.success(t('record_deleted_success'));
      fetchRecords();
    } catch (error) {
      console.error('Failed to delete record:', error);
      toast.error(t('delete_record_failed'));
    }
  };

  const handleSaveRecord = async () => {
    try {
      if (editingRecord) {
        await api.put(`/medical-records/${editingRecord._id}`, formData);
        toast.success(t('record_updated_success'));
      } else {
        await api.post('/medical-records', formData);
        toast.success(t('record_created_success'));
      }
      setOpenDialog(false);
      fetchRecords();
    } catch (error) {
      console.error('Failed to save record:', error);
      toast.error(t('save_record_failed'));
    }
  };

  const getTypeLabel = (type) => {
    const found = recordTypes.find(t => t.value === type);
    return found ? found.label : type;
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'consultation':
        return 'primary';
      case 'examination':
        return 'info';
      case 'treatment':
        return 'success';
      case 'surgery':
        return 'error';
      default:
        return 'default';
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          {t('medical_records_management')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddRecord}
        >
          {t('add_record')}
        </Button>
      </Box>

      {/* 搜索和筛选 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            label={t('search_records')}
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
            <InputLabel>{t('type_filter')}</InputLabel>
            <Select
              value={typeFilter}
              label={t('type_filter')}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="">{t('all')}</MenuItem>
              {recordTypes.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchRecords}
          >
            {t('refresh')}
          </Button>
        </Box>
      </Paper>

      {/* 病历列表 */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('patient')}</TableCell>
                <TableCell>{t('type')}</TableCell>
                <TableCell>{t('diagnosis')}</TableCell>
                <TableCell>{t('visit_date')}</TableCell>
                <TableCell>{t('actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record._id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Person sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="subtitle2">
                          {record.patient?.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {record.patient?.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getTypeLabel(record.type)}
                      color={getTypeColor(record.type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {record.diagnosis || t('no_diagnosis')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {format(new Date(record.visitDate), 'yyyy-MM-dd')}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title={t('view_details')}>
                        <IconButton
                          size="small"
                          onClick={() => setSelectedRecord(record)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('edit_record')}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditRecord(record)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('delete_record')}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteRecord(record._id)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredRecords.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography color="textSecondary">
              {t('no_records_found')}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* 病历编辑对话框 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRecord ? t('edit_record') : t('add_record')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>{t('patient')}</InputLabel>
                  <Select
                    value={formData.patientId}
                    label={t('patient')}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  >
                    {patients.map(patient => (
                      <MenuItem key={patient._id} value={patient._id}>
                        {patient.name} ({patient.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>{t('type')}</InputLabel>
                  <Select
                    value={formData.type}
                    label={t('type')}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    {recordTypes.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('diagnosis')}
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('symptoms')}
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('treatment')}
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('notes')}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label={t('follow_up_date')}
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ lang: 'en' }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('follow_up_notes')}
                  value={formData.followUpNotes}
                  onChange={(e) => setFormData({ ...formData, followUpNotes: e.target.value })}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSaveRecord} variant="contained">
            {t('save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 病历详情对话框 */}
      <Dialog open={!!selectedRecord} onClose={() => setSelectedRecord(null)} maxWidth="md" fullWidth>
        {selectedRecord && (
          <>
            <DialogTitle>
              {t('medical_record_details')}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ pt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('patient_info')}
                  </Typography>
                  <Box>
                    <Typography variant="body2">
                      <strong>{t('name')}:</strong> {selectedRecord.patient?.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('email')}:</strong> {selectedRecord.patient?.email}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('visit_date')}:</strong> {format(new Date(selectedRecord.visitDate), 'yyyy-MM-dd')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('type')}:</strong> {getTypeLabel(selectedRecord.type)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('diagnosis_info')}
                  </Typography>
                  <Box>
                    <Typography variant="body2">
                      <strong>{t('diagnosis')}:</strong> {selectedRecord.diagnosis || t('no_diagnosis')}
                    </Typography>
                    {selectedRecord.symptoms && (
                      <Typography variant="body2">
                        <strong>{t('symptoms')}:</strong> {selectedRecord.symptoms}
                      </Typography>
                    )}
                    {selectedRecord.treatment && (
                      <Typography variant="body2">
                        <strong>{t('treatment')}:</strong> {selectedRecord.treatment}
                      </Typography>
                    )}
                  </Box>
                </Grid>

                {selectedRecord.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      {t('notes')}
                    </Typography>
                    <Typography variant="body2">
                      {selectedRecord.notes}
                    </Typography>
                  </Grid>
                )}

                {selectedRecord.followUpDate && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      {t('follow_up_info')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('follow_up_date')}:</strong> {selectedRecord.followUpDate}
                    </Typography>
                    {selectedRecord.followUpNotes && (
                      <Typography variant="body2">
                        <strong>{t('follow_up_notes')}:</strong> {selectedRecord.followUpNotes}
                      </Typography>
                    )}
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedRecord(null)}>
                {t('close')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default DoctorRecords;
