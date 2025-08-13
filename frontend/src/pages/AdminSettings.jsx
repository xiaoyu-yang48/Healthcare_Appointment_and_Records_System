import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Settings,
  Security,
  Notifications,
  Storage,
  Backup,
  Restore,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../axiosConfig';
import { toast } from 'react-hot-toast';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    system: {
      siteName: '医疗预约系统',
      maintenanceMode: false,
      maxFileSize: 10,
      sessionTimeout: 30,
    },
    security: {
      passwordMinLength: 6,
      requireStrongPassword: false,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      appointmentReminders: true,
      systemAlerts: true,
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionDays: 30,
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // 这里应该调用后端API获取设置
      // const response = await api.get('/admin/settings');
      // setSettings(response.data);
      
      // 暂时使用默认设置
      toast.info('设置功能待实现');
    } catch (error) {
      console.error('获取设置失败:', error);
      toast.error('获取设置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      // 这里应该调用后端API保存设置
      // await api.put('/admin/settings', settings);
      
      toast.success('设置保存成功');
    } catch (error) {
      console.error('保存设置失败:', error);
      toast.error('保存设置失败');
    } finally {
      setSaving(false);
    }
  };

  const handleBackup = async () => {
    try {
      toast.info('备份功能待实现');
    } catch (error) {
      console.error('备份失败:', error);
      toast.error('备份失败');
    }
  };

  const handleRestore = async () => {
    try {
      toast.info('恢复功能待实现');
    } catch (error) {
      console.error('恢复失败:', error);
      toast.error('恢复失败');
    }
  };

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
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
        系统设置
      </Typography>

      <Grid container spacing={3}>
        {/* 系统设置 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="系统设置"
              avatar={<Settings />}
            />
            <CardContent>
              <TextField
                fullWidth
                label="系统名称"
                value={settings.system.siteName}
                onChange={(e) => handleSettingChange('system', 'siteName', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="最大文件大小 (MB)"
                type="number"
                value={settings.system.maxFileSize}
                onChange={(e) => handleSettingChange('system', 'maxFileSize', parseInt(e.target.value))}
                margin="normal"
              />
              <TextField
                fullWidth
                label="会话超时时间 (分钟)"
                type="number"
                value={settings.system.sessionTimeout}
                onChange={(e) => handleSettingChange('system', 'sessionTimeout', parseInt(e.target.value))}
                margin="normal"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.system.maintenanceMode}
                    onChange={(e) => handleSettingChange('system', 'maintenanceMode', e.target.checked)}
                  />
                }
                label="维护模式"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* 安全设置 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="安全设置"
              avatar={<Security />}
            />
            <CardContent>
              <TextField
                fullWidth
                label="密码最小长度"
                type="number"
                value={settings.security.passwordMinLength}
                onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                margin="normal"
              />
              <TextField
                fullWidth
                label="最大登录尝试次数"
                type="number"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                margin="normal"
              />
              <TextField
                fullWidth
                label="锁定时间 (分钟)"
                type="number"
                value={settings.security.lockoutDuration}
                onChange={(e) => handleSettingChange('security', 'lockoutDuration', parseInt(e.target.value))}
                margin="normal"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.security.requireStrongPassword}
                    onChange={(e) => handleSettingChange('security', 'requireStrongPassword', e.target.checked)}
                  />
                }
                label="要求强密码"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* 通知设置 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="通知设置"
              avatar={<Notifications />}
            />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                  />
                }
                label="邮件通知"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.smsNotifications}
                    onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
                  />
                }
                label="短信通知"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.appointmentReminders}
                    onChange={(e) => handleSettingChange('notifications', 'appointmentReminders', e.target.checked)}
                  />
                }
                label="预约提醒"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.systemAlerts}
                    onChange={(e) => handleSettingChange('notifications', 'systemAlerts', e.target.checked)}
                  />
                }
                label="系统警报"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* 备份设置 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="备份设置"
              avatar={<Storage />}
            />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.backup.autoBackup}
                    onChange={(e) => handleSettingChange('backup', 'autoBackup', e.target.checked)}
                  />
                }
                label="自动备份"
              />
              <TextField
                fullWidth
                label="保留天数"
                type="number"
                value={settings.backup.retentionDays}
                onChange={(e) => handleSettingChange('backup', 'retentionDays', parseInt(e.target.value))}
                margin="normal"
              />
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Backup />}
                  onClick={handleBackup}
                  sx={{ mr: 1 }}
                >
                  立即备份
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Restore />}
                  onClick={handleRestore}
                >
                  恢复数据
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 保存按钮 */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="outlined"
            onClick={fetchSettings}
          >
            重置
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveSettings}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving ? '保存中...' : '保存设置'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminSettings;
