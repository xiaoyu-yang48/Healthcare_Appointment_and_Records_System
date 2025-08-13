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
  Switch,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search,
  Refresh,
  Edit,
  Delete,
  Add,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../axiosConfig';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, search, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
      };

      const response = await api.get('/admin/users', { params });
      setUsers(response.data.users);
      setTotalUsers(response.data.pagination.totalUsers);
    } catch (error) {
      console.error('获取用户列表失败:', error);
      toast.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, isActive) => {
    try {
      setUpdating(prev => ({ ...prev, [userId]: true }));
      
      await api.put(`/admin/users/${userId}/status`, { isActive });
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, isActive } : user
      ));
      
      toast.success(`用户${isActive ? '启用' : '禁用'}成功`);
    } catch (error) {
      console.error('更新用户状态失败:', error);
      toast.error('更新用户状态失败');
    } finally {
      setUpdating(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('确定要删除这个用户吗？此操作不可撤销。')) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(user => user.id !== userId));
      setTotalUsers(prev => prev - 1);
      toast.success('用户删除成功');
    } catch (error) {
      console.error('删除用户失败:', error);
      toast.error('删除用户失败');
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'patient':
        return '患者';
      case 'doctor':
        return '医生';
      case 'admin':
        return '管理员';
      default:
        return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'patient':
        return 'primary';
      case 'doctor':
        return 'success';
      case 'admin':
        return 'error';
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
        用户管理
      </Typography>

      {/* 搜索和筛选 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            label="搜索用户"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <Search />,
            }}
            sx={{ minWidth: 200 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>角色筛选</InputLabel>
            <Select
              value={roleFilter}
              label="角色筛选"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="">全部</MenuItem>
              <MenuItem value="patient">患者</MenuItem>
              <MenuItem value="doctor">医生</MenuItem>
              <MenuItem value="admin">管理员</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchUsers}
          >
            刷新
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => toast.info('用户注册功能待实现')}
          >
            添加用户
          </Button>
        </Box>
      </Paper>

      {/* 用户列表 */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>姓名</TableCell>
                <TableCell>邮箱</TableCell>
                <TableCell>角色</TableCell>
                <TableCell>状态</TableCell>
                <TableCell>注册时间</TableCell>
                <TableCell>最后登录</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleLabel(user.role)}
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={user.isActive}
                      onChange={(e) => handleStatusChange(user.id, e.target.checked)}
                      disabled={updating[user.id]}
                    />
                  </TableCell>
                  <TableCell>
                    {user.createdAt ? format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm') : '-'}
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? format(new Date(user.lastLogin), 'yyyy-MM-dd HH:mm') : '-'}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => toast.info('编辑功能待实现')}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.role === 'admin'}
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
          count={totalUsers}
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

export default AdminUsers;
