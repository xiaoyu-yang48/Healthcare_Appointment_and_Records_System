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
  Download,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../axiosConfig';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { t } from '../utils/i18n';

const AdminRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRecords();
  }, [page, rowsPerPage, search]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...(search && { search }),
      };

      const response = await api.get('/admin/medical-records', { params });
      setRecords(response.data.records);
      setTotalRecords(response.data.pagination.totalRecords);
    } catch (error) {
      console.error('获取病历列表失败:', error);
      toast.error(t('get_medical_records_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm(t('confirm_delete_record'))) {
      return;
    }

    try {
      await api.delete(`/admin/medical-records/${recordId}`);
      setRecords(prev => prev.filter(record => record._id !== recordId));
      setTotalRecords(prev => prev - 1);
      toast.success(t('record_deleted_success'));
    } catch (error) {
      console.error('删除病历失败:', error);
      toast.error(t('delete_record_failed'));
    }
  };

  const handleExportRecord = async (recordId) => {
    try {
      toast.info(t('export_not_implemented'));
    } catch (error) {
      console.error('导出病历失败:', error);
      toast.error(t('export_not_implemented'));
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
         {t('medical_records_management')}
        </Typography>

      {/* 搜索和筛选 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                      <TextField
             label={t('search_medical_records')}
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <Search />,
              }}
              sx={{ minWidth: 200 }}
             placeholder={t('patient_name_doctor_name_diagnosis')}
            />

                      <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchRecords}
            >
             {t('refresh')}
            </Button>

            <Button
              variant="contained"
              onClick={() => toast.info(t('batch_export_not_implemented'))}
            >
             {t('batch_export')}
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
                 <TableCell>{t('doctor')}</TableCell>
                 <TableCell>{t('visit_date')}</TableCell>
                 <TableCell>{t('diagnosis')}</TableCell>
                 <TableCell>{t('status')}</TableCell>
                 <TableCell>{t('created_at')}</TableCell>
                 <TableCell>{t('actions')}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record._id}>
                  <TableCell>{record.patient?.name || '-'}</TableCell>
                  <TableCell>{record.doctor?.name || '-'}</TableCell>
                  <TableCell>
                    {record.visitDate ? format(new Date(record.visitDate), 'yyyy-MM-dd') : '-'}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {record.diagnosis || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={record.isActive ? t('active') : t('archived')}
                      color={record.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {record.createdAt ? format(new Date(record.createdAt), 'yyyy-MM-dd HH:mm') : '-'}
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
                      onClick={() => handleExportRecord(record._id)}
                    >
                      <Download />
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
                      onClick={() => handleDeleteRecord(record._id)}
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
          count={totalRecords}
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

export default AdminRecords;
