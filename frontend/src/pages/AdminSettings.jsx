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
import { t } from '../utils/i18n';

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
      toast.info(t('settings.fetching_placeholder'));
    } catch (error) {
      console.error('获取设置失败:', error);
      toast.error(t('settings.fetch_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      // 这里应该调用后端API保存设置
      // await api.put('/admin/settings', settings);
      
      toast.success(t('settings.save_success'));
    } catch (error) {
      console.error('保存设置失败:', error);
      toast.error(t('settings.save_failed'));
    } finally {
      setSaving(false);
    }
  };

  const handleBackup = async () => {
    try {
      toast.info(t('settings.backup_placeholder'));
    } catch (error) {
      console.error('备份失败:', error);
      toast.error(t('settings.backup_failed'));
    }
  };

  const handleRestore = async () => {
    try {
      toast.info(t('settings.restore_placeholder'));
    } catch (error) {
      console.error('恢复失败:', error);
      toast.error(t('settings.restore_failed'));
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
        {t('settings.title')}
      </Typography>

      <Grid container spacing={3}>
        {/* 系统设置 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={t('settings.system_title')}
              avatar={<Settings />}
            />
            <CardContent>
              <TextField
                fullWidth
                label={t('settings.site_name_label')}
                value={settings.system.siteName}
                onChange={(e) => handleSettingChange('system', 'siteName', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label={t('settings.max_file_size_label')}
                type="number"
                value={settings.system.maxFileSize}
                onChange={(e) => handleSettingChange('system', 'maxFileSize', parseInt(e.target.value))}
                margin="normal"
              />
              <TextField
                fullWidth
                label={t('settings.session_timeout_label')}
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
                label={t('settings.maintenance_mode_label')}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* 安全设置 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={t('settings.security_title')}
              avatar={<Security />}
            />
            <CardContent>
              <TextField
                fullWidth
                label={t('settings.password_min_length_label')}
                type="number"
                value={settings.security.passwordMinLength}
                onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                margin="normal"
              />
              <TextField
                fullWidth
                label={t('settings.max_login_attempts_label')}
                type="number"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                margin="normal"
              />
              <TextField
                fullWidth
                label={t('settings.lockout_duration_label')}
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
                label={t('settings.require_strong_password_label')}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* 通知设置 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={t('settings.notifications_title')}
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
                label={t('settings.email_notifications_label')}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.smsNotifications}
                    onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
                  />
                }
                label={t('settings.sms_notifications_label')}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.appointmentReminders}
                    onChange={(e) => handleSettingChange('notifications', 'appointmentReminders', e.target.checked)}
                  />
                }
                label={t('settings.appointment_reminders_label')}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.systemAlerts}
                    onChange={(e) => handleSettingChange('notifications', 'systemAlerts', e.target.checked)}
                  />
                }
                label={t('settings.system_alerts_label')}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* 备份设置 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={t('settings.backup_title')}
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
                label={t('settings.auto_backup_label')}
              />
              <TextField
                fullWidth
                label={t('settings.retention_days_label')}
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
                  {t('settings.backup_now_button')}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Restore />}
                  onClick={handleRestore}
                >
                  {t('settings.restore_data_button')}
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
            {t('settings.reset_button')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveSettings}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving ? t('settings.saving_text') : t('settings.save_settings_button')}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminSettings;
