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
      const response = await api.get(`/medical-records/${recordId}/download`, {
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
            <Grid item xs={12} key={record._id}>
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
                          {format(new Date(record.createdAt), 'yyyy-MM-dd HH:mm')}
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

                  {record.prescription && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        处方信息：
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {record.prescription}
                      </Typography>
                    </Box>
                  )}

                  {record.attachments && record.attachments.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        检查报告：
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {record.attachments.map((attachment, index) => (
                          <Button
                            key={index}
                            variant="outlined"
                            size="small"
                            startIcon={<Download />}
                            onClick={() => handleDownloadReport(record._id, attachment.name)}
                          >
                            {attachment.name || `报告${index + 1}`}
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
                          secondary={format(new Date(selectedRecord.createdAt), 'yyyy-MM-dd HH:mm')}
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

                {selectedRecord.prescription && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        处方信息
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {selectedRecord.prescription}
                      </Typography>
                    </Paper>
                  </Grid>
                )}

                {selectedRecord.attachments && selectedRecord.attachments.length > 0 && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        检查报告
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {selectedRecord.attachments.map((attachment, index) => (
                          <Button
                            key={index}
                            variant="outlined"
                            startIcon={<Download />}
                            onClick={() => handleDownloadReport(selectedRecord._id, attachment.name)}
                          >
                            {attachment.name || `报告${index + 1}`}
                          </Button>
                        ))}
                      </Box>
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