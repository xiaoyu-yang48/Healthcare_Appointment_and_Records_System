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
      console.error('获取病历失败:', error);
      toast.error('获取病历失败');
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
      
      toast.success('文件下载成功');
    } catch (error) {
      console.error('下载失败:', error);
      toast.error('下载失败');
    }
  };

  const getRecordTypeLabel = (type) => {
    switch (type) {
      case 'consultation':
        return '门诊';
      case 'examination':
        return '检查';
      case 'treatment':
        return '治疗';
      case 'surgery':
        return '手术';
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
                        主治医生：{record.doctor?.name || '未知'}
                      </Typography>
                    </Box>
                    <Box>
                      <Tooltip title="查看详情">
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
                        症状描述：
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {record.symptoms}
                      </Typography>
                    </Box>
                  )}

                  {record.treatment && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        治疗方案：
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {record.treatment}
                      </Typography>
                    </Box>
                  )}

                  {record.prescription && record.prescription.medications && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        处方信息：
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
                        检查报告：
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
                暂无病历记录
              </Typography>
              <Typography variant="body2" color="textSecondary">
                您还没有任何病历记录，请先预约医生进行就诊
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
                  病历详情
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
                      基本信息
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <Person />
                        </ListItemIcon>
                        <ListItemText
                          primary="主治医生"
                          secondary={selectedRecord.doctor?.name || '未知'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CalendarToday />
                        </ListItemIcon>
                        <ListItemText
                          primary="就诊时间"
                          secondary={format(new Date(selectedRecord.visitDate), 'yyyy-MM-dd HH:mm')}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <LocalHospital />
                        </ListItemIcon>
                        <ListItemText
                          primary="科室"
                          secondary={selectedRecord.doctor?.department || '未知'}
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      诊断信息
                    </Typography>
                    {selectedRecord.diagnosis && (
                      <Typography variant="body2" color="textSecondary" paragraph>
                        {selectedRecord.diagnosis}
                      </Typography>
                    )}
                    {selectedRecord.symptoms && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          症状描述：
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
                        治疗方案
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
                        处方信息
                      </Typography>
                      {selectedRecord.prescription.medications.map((med, index) => (
                        <Box key={index} mb={1}>
                          <Typography variant="body2" color="textSecondary">
                            <strong>{med.name}</strong> - {med.dosage} - {med.frequency}
                          </Typography>
                          {med.instructions && (
                            <Typography variant="caption" color="textSecondary">
                              说明：{med.instructions}
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
                        生命体征
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="textSecondary">
                            血压：{selectedRecord.vitalSigns.bloodPressure}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="textSecondary">
                            心率：{selectedRecord.vitalSigns.heartRate}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="textSecondary">
                            体温：{selectedRecord.vitalSigns.temperature}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="textSecondary">
                            体重：{selectedRecord.vitalSigns.weight}kg
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
                        医生备注
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
                        随访信息
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        随访日期：{selectedRecord.followUpDate}
                      </Typography>
                      {selectedRecord.followUpNotes && (
                        <Typography variant="body2" color="textSecondary">
                          随访说明：{selectedRecord.followUpNotes}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenRecordDialog(false)}>
                关闭
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default PatientRecords; 