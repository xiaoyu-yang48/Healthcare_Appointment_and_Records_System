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
      toast.error('获取病历列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('确定要删除这个病历吗？此操作不可撤销。')) {
      return;
    }

    try {
      await api.delete(`/admin/medical-records/${recordId}`);
      setRecords(prev => prev.filter(record => record._id !== recordId));
      setTotalRecords(prev => prev - 1);
      toast.success('病历删除成功');
    } catch (error) {
      console.error('删除病历失败:', error);
      toast.error('删除病历失败');
    }
  };

  const handleExportRecord = async (recordId) => {
    try {
      toast.info('导出功能待实现');
    } catch (error) {
      console.error('导出病历失败:', error);
      toast.error('导出病历失败');
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
        病历管理
      </Typography>

      {/* 搜索和筛选 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            label="搜索病历"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <Search />,
            }}
            sx={{ minWidth: 200 }}
            placeholder="患者姓名、医生姓名、诊断"
          />

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchRecords}
          >
            刷新
          </Button>

          <Button
            variant="contained"
            onClick={() => toast.info('批量导出功能待实现')}
          >
            批量导出
          </Button>
        </Box>
      </Paper>

      {/* 病历列表 */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>患者</TableCell>
                <TableCell>医生</TableCell>
                <TableCell>就诊日期</TableCell>
                <TableCell>诊断</TableCell>
                <TableCell>状态</TableCell>
                <TableCell>创建时间</TableCell>
                <TableCell>操作</TableCell>
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
                      label={record.isActive ? '有效' : '已归档'}
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
                      onClick={() => toast.info('查看详情功能待实现')}
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
                      onClick={() => toast.info('编辑功能待实现')}
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
          labelRowsPerPage="每页行数:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Paper>
    </Container>
  );
};

export default AdminRecords;
