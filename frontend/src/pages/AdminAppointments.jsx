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
      toast.error('获取预约列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('确定要删除这个预约吗？此操作不可撤销。')) {
      return;
    }

    try {
      await api.delete(`/admin/appointments/${appointmentId}`);
      setAppointments(prev => prev.filter(appointment => appointment.id !== appointmentId));
      setTotalAppointments(prev => prev - 1);
      toast.success('预约删除成功');
    } catch (error) {
      console.error('删除预约失败:', error);
      toast.error('删除预约失败');
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed':
        return '已确认';
      case 'pending':
        return '待确认';
      case 'cancelled':
        return '已取消';
      case 'completed':
        return '已完成';
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
        预约管理
      </Typography>

      {/* 搜索和筛选 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            label="搜索预约"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <Search />,
            }}
            sx={{ minWidth: 200 }}
            placeholder="患者姓名、医生姓名"
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>状态筛选</InputLabel>
            <Select
              value={statusFilter}
              label="状态筛选"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">全部</MenuItem>
              <MenuItem value="pending">待确认</MenuItem>
              <MenuItem value="confirmed">已确认</MenuItem>
              <MenuItem value="completed">已完成</MenuItem>
              <MenuItem value="cancelled">已取消</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchAppointments}
          >
            刷新
          </Button>
        </Box>
      </Paper>

      {/* 预约列表 */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>患者</TableCell>
                <TableCell>医生</TableCell>
                <TableCell>预约日期</TableCell>
                <TableCell>时间段</TableCell>
                <TableCell>状态</TableCell>
                <TableCell>创建时间</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
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
                      onClick={() => toast.info('查看详情功能待实现')}
                    >
                      <Visibility />
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
                      onClick={() => handleDeleteAppointment(appointment.id)}
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
          labelRowsPerPage="每页行数:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Paper>
    </Container>
  );
};

export default AdminAppointments;
