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
import UserForm from '../components/UserForm';
import { t } from '../utils/i18n';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [updating, setUpdating] = useState({});
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

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
      console.error('Failed to get user list:', error);
      toast.error(t('get_user_list_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, isActive) => {
    try {
      setUpdating(prev => ({ ...prev, [userId]: true }));
      
      await api.put(`/admin/users/${userId}/status`, { isActive });
      
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, isActive } : user
      ));
      
      toast.success(t(isActive ? 'user_enabled_success' : 'user_disabled_success'));
    } catch (error) {
      console.error('Failed to update user status:', error);
      toast.error(t('update_user_status_failed'));
    } finally {
      setUpdating(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(t('confirm_delete_user'))) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(user => user._id !== userId));
      setTotalUsers(prev => prev - 1);
      toast.success(t('user_deleted_success'));
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error(t('delete_user_failed'));
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'patient':
        return t('patient');
      case 'doctor':
        return t('doctor');
      case 'admin':
        return t('admin');
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

  const handleAddUser = () => {
    setEditingUser(null);
    setUserFormOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormOpen(true);
  };

  const handleUserFormSuccess = () => {
    fetchUsers();
  };

  const handleUserFormClose = () => {
    setUserFormOpen(false);
    setEditingUser(null);
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
        {t('user_management')}
      </Typography>

      {/* 搜索和筛选 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            label={t('search_users')}
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
            <InputLabel>{t('role_filter')}</InputLabel>
            <Select
              value={roleFilter}
              label={t('role_filter')}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="">{t('all')}</MenuItem>
              <MenuItem value="patient">{t('patient')}</MenuItem>
              <MenuItem value="doctor">{t('doctor')}</MenuItem>
              <MenuItem value="admin">{t('admin')}</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchUsers}
          >
            {t('refresh')}
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddUser}
          >
            {t('add_user')}
          </Button>
        </Box>
      </Paper>

      {/* 用户列表 */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('name')}</TableCell>
                <TableCell>{t('email')}</TableCell>
                <TableCell>{t('role')}</TableCell>
                <TableCell>{t('status')}</TableCell>
                <TableCell>{t('registration_time')}</TableCell>
                <TableCell>{t('last_login')}</TableCell>
                <TableCell>{t('actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
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
                      onChange={(e) => handleStatusChange(user._id, e.target.checked)}
                      disabled={updating[user._id]}
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
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteUser(user._id)}
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
          labelRowsPerPage={t('rows_per_page')}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Paper>

      {/* 用户表单对话框 */}
      <UserForm
        open={userFormOpen}
        onClose={handleUserFormClose}
        user={editingUser}
        onSuccess={handleUserFormSuccess}
      />
    </Container>
  );
};

export default AdminUsers;
