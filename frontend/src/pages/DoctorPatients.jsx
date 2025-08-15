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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Search,
  Refresh,
  Person,
  Email,
  Phone,
  CalendarToday,
  MedicalServices,
  Visibility,
  Schedule,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../axiosConfig';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { t } from '../utils/i18n';

const DoctorPatients = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [patientStats, setPatientStats] = useState({});

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      console.log('Fetching patients...');
      
      const response = await api.get('/doctors/patients');
      console.log('Patients response:', response.data);
      
      setPatients(response.data);
      
      // 计算患者统计信息
      const stats = {
        total: response.data.length,
        active: response.data.filter(p => p.isActive).length,
        recent: response.data.filter(p => {
          const lastVisit = p.lastVisit ? new Date(p.lastVisit) : null;
          return lastVisit && lastVisit > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        }).length,
      };
      console.log('Patient stats:', stats);
      setPatientStats(stats);
    } catch (error) {
      console.error('Failed to get patients:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || t('get_patients_failed'));
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = patients;

    if (searchTerm) {
      filtered = filtered.filter(patient => 
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm)
      );
    }

    setFilteredPatients(filtered);
  };

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setOpenDetailsDialog(true);
  };

  const getPatientStatus = (patient) => {
    if (!patient.isActive) return { label: t('inactive'), color: 'error' };
    
    const lastVisit = patient.lastVisit ? new Date(patient.lastVisit) : null;
    if (!lastVisit) return { label: t('new_patient'), color: 'info' };
    
    const daysSinceLastVisit = Math.floor((Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastVisit <= 30) return { label: t('recent_visit'), color: 'success' };
    if (daysSinceLastVisit <= 90) return { label: t('regular_patient'), color: 'primary' };
    return { label: t('long_term_patient'), color: 'warning' };
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
        {t('patient_management')}
      </Typography>

      {/* 统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Person color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t('total_patients')}
                  </Typography>
                  <Typography variant="h4">
                    {patientStats.total}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Person color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t('active_patients')}
                  </Typography>
                  <Typography variant="h4">
                    {patientStats.active}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CalendarToday color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {t('recent_visits')}
                  </Typography>
                  <Typography variant="h4">
                    {patientStats.recent}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 搜索 */}
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
            sx={{ minWidth: 300 }}
          />

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchPatients}
          >
            {t('refresh')}
          </Button>
        </Box>
      </Paper>

      {/* 患者列表 */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('name')}</TableCell>
                <TableCell>{t('email')}</TableCell>
                <TableCell>{t('phone')}</TableCell>
                <TableCell>{t('last_visit')}</TableCell>
                <TableCell>{t('status')}</TableCell>
                <TableCell>{t('actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPatients.map((patient) => {
                const status = getPatientStatus(patient);
                return (
                  <TableRow key={patient._id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Person sx={{ mr: 1 }} />
                        <Typography variant="subtitle2">
                          {patient.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Email sx={{ mr: 1, fontSize: 'small' }} />
                        {patient.email}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Phone sx={{ mr: 1, fontSize: 'small' }} />
                        {patient.phone || t('not_provided')}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {patient.lastVisit ? (
                        <Box display="flex" alignItems="center">
                          <CalendarToday sx={{ mr: 1, fontSize: 'small' }} />
                          {format(new Date(patient.lastVisit), 'yyyy-MM-dd')}
                        </Box>
                      ) : (
                        <Typography color="textSecondary">
                          {t('no_visits')}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={status.label}
                        color={status.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={t('view_details')}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(patient)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredPatients.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography color="textSecondary">
              {t('no_patients_found')}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* 患者详情对话框 */}
      <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="md" fullWidth>
        {selectedPatient && (
          <>
            <DialogTitle>
              {t('patient_details')}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ pt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('basic_info')}
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Person />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('name')}
                        secondary={selectedPatient.name}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Email />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('email')}
                        secondary={selectedPatient.email}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Phone />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('phone')}
                        secondary={selectedPatient.phone || t('not_provided')}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarToday />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('registration_date')}
                        secondary={selectedPatient.createdAt ? 
                          format(new Date(selectedPatient.createdAt), 'yyyy-MM-dd') : 
                          t('not_available')
                        }
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('visit_history')}
                  </Typography>
                  <Box>
                    <Typography variant="body2">
                      <strong>{t('last_visit')}:</strong> {
                        selectedPatient.lastVisit ? 
                        format(new Date(selectedPatient.lastVisit), 'yyyy-MM-dd') : 
                        t('no_visits')
                      }
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('total_visits')}:</strong> {selectedPatient.visitCount || 0}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('status')}:</strong> {getPatientStatus(selectedPatient).label}
                    </Typography>
                  </Box>
                </Grid>

                {selectedPatient.medicalHistory && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      {t('medical_history')}
                    </Typography>
                    <Typography variant="body2">
                      {selectedPatient.medicalHistory}
                    </Typography>
                  </Grid>
                )}

                {selectedPatient.allergies && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      {t('allergies')}
                    </Typography>
                    <Typography variant="body2">
                      {selectedPatient.allergies}
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

export default DoctorPatients;
