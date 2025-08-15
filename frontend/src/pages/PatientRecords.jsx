import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  MedicalServices,
  Person,
  CalendarToday,
  Download,
  Visibility,
  LocalHospital,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../axiosConfig';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { t } from '../utils/i18n';

const PatientRecords = () => {
  const [loading, setLoading] = useState(true);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [openRecordDialog, setOpenRecordDialog] = useState(false);

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get('/medical-records/patient');
      setMedicalRecords(response.data);
    } catch (error) {
      console.error('Failed to get medical records:', error);
      toast.error(t('get_medical_records_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setOpenRecordDialog(true);
  };

  const handleDownloadReport = async (recordId, fileName) => {
    try {
      const response = await api.get(`/medical-records/${recordId}/attachments`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'medical-report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(t('file_download_success'));
    } catch (error) {
      console.error('Download failed:', error);
      toast.error(t('download_failed'));
    }
  };

  const getRecordTypeLabel = (type) => {
    switch (type) {
      case 'consultation':
        return t('consultation');
      case 'examination':
        return t('examination');
      case 'treatment':
        return t('treatment');
      case 'surgery':
        return t('surgery');
      default:
        return type;
    }
  };

  const getRecordTypeColor = (type) => {
    switch (type) {
      case 'consultation':
        return 'primary';
      case 'examination':
        return 'secondary';
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
      <Typography variant="h4" gutterBottom>
        我的病历
      </Typography>

      {medicalRecords.length > 0 ? (
        <Grid container spacing={3}>
          {medicalRecords.map((record) => (
            <Grid item xs={12} key={record.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {record.diagnosis || '诊断信息'}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={2} mb={1}>
                        <Chip
                          label={getRecordTypeLabel(record.type)}
                          color={getRecordTypeColor(record.type)}
                          size="small"
                        />
                        <Typography variant="body2" color="textSecondary">
                          {format(new Date(record.visitDate), 'yyyy-MM-dd HH:mm')}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        {t('attending_doctor')}: {record.doctor?.name || t('unknown')}
                      </Typography>
                    </Box>
                    <Box>
                      <Tooltip title={t('view_details')}>
                        <IconButton
                          onClick={() => handleViewRecord(record)}
                          color="primary"
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {record.symptoms && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('symptoms_description')}:
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {record.symptoms}
                      </Typography>
                    </Box>
                  )}

                  {record.treatment && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('treatment_plan')}:
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {record.treatment}
                      </Typography>
                    </Box>
                  )}

                  {record.prescription && record.prescription.medications && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('prescription_info')}:
                      </Typography>
                      {record.prescription.medications.map((med, index) => (
                        <Typography key={index} variant="body2" color="textSecondary">
                          {med.name} - {med.dosage} - {med.frequency}
                        </Typography>
                      ))}
                    </Box>
                  )}

                  {record.labResults && record.labResults.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('examination_reports')}:
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {record.labResults.map((result, index) => (
                          <Button
                            key={index}
                            variant="outlined"
                            size="small"
                            startIcon={<Download />}
                            onClick={() => handleDownloadReport(record.id, `${result.testName}.pdf`)}
                          >
                            {result.testName}
                          </Button>
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <MedicalServices sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                {t('no_medical_records')}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {t('no_medical_records_message')}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 病历详情对话框 */}
      <Dialog
        open={openRecordDialog}
        onClose={() => setOpenRecordDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedRecord && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  {t('medical_record_details')}
                </Typography>
                <Chip
                  label={getRecordTypeLabel(selectedRecord.type)}
                  color={getRecordTypeColor(selectedRecord.type)}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {t('basic_info')}
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <Person />
                        </ListItemIcon>
                        <ListItemText
                          primary={t('attending_doctor')}
                          secondary={selectedRecord.doctor?.name || t('unknown')}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CalendarToday />
                        </ListItemIcon>
                        <ListItemText
                          primary={t('visit_time')}
                          secondary={format(new Date(selectedRecord.visitDate), 'yyyy-MM-dd HH:mm')}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <LocalHospital />
                        </ListItemIcon>
                        <ListItemText
                          primary={t('department')}
                          secondary={selectedRecord.doctor?.department || t('unknown')}
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {t('diagnosis_info')}
                    </Typography>
                    {selectedRecord.diagnosis && (
                      <Typography variant="body2" color="textSecondary" paragraph>
                        {selectedRecord.diagnosis}
                      </Typography>
                    )}
                    {selectedRecord.symptoms && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          {t('symptoms_description')}:
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {selectedRecord.symptoms}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                {selectedRecord.treatment && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {t('treatment_plan')}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {selectedRecord.treatment}
                      </Typography>
                    </Paper>
                  </Grid>
                )}

                {selectedRecord.prescription && selectedRecord.prescription.medications && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {t('prescription_info')}
                      </Typography>
                      {selectedRecord.prescription.medications.map((med, index) => (
                        <Box key={index} mb={1}>
                          <Typography variant="body2" color="textSecondary">
                            <strong>{med.name}</strong> - {med.dosage} - {med.frequency}
                          </Typography>
                          {med.instructions && (
                            <Typography variant="caption" color="textSecondary">
                              {t('instructions')}: {med.instructions}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Paper>
                  </Grid>
                )}

                {selectedRecord.vitalSigns && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {t('vital_signs')}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="textSecondary">
                            {t('blood_pressure')}: {selectedRecord.vitalSigns.bloodPressure}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="textSecondary">
                            {t('heart_rate')}: {selectedRecord.vitalSigns.heartRate}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="textSecondary">
                            {t('temperature')}: {selectedRecord.vitalSigns.temperature}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="textSecondary">
                            {t('weight')}: {selectedRecord.vitalSigns.weight}kg
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                )}

                {selectedRecord.notes && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {t('doctor_notes')}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {selectedRecord.notes}
                      </Typography>
                    </Paper>
                  </Grid>
                )}

                {selectedRecord.followUpDate && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {t('follow_up_info')}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {t('follow_up_date')}: {selectedRecord.followUpDate}
                      </Typography>
                      {selectedRecord.followUpNotes && (
                        <Typography variant="body2" color="textSecondary">
                          {t('follow_up_notes')}: {selectedRecord.followUpNotes}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenRecordDialog(false)}>
                {t('close')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default PatientRecords; 