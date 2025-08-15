import React, { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  Schedule,
  Person,
  Message,
  Description,
  CheckCircle,
  Cancel,
  AccessTime,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../axiosConfig';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { t } from '../utils/i18n';

const NoticeBell = () => {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notices, setNotices] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingNotices, setLoadingNotices] = useState(false);

  const open = Boolean(anchorEl);

  // 获取未读通知数量
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notices/unread-count');
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('获取未读通知数量失败:', error);
    }
  };

  // 获取通知列表
  const fetchNotices = async () => {
    try {
      setLoadingNotices(true);
      const response = await api.get('/notices?limit=10');
      setNotices(response.data.notices);
    } catch (error) {
      console.error('获取通知列表失败:', error);
      toast.error(t('get_notices_failed'));
    } finally {
      setLoadingNotices(false);
    }
  };

  // 标记通知为已读
  const markAsRead = async (noticeId) => {
    try {
      await api.put(`/notices/${noticeId}/read`);
      // 更新本地状态
      setNotices(prev => 
        prev.map(notice => 
          notice._id === noticeId ? { ...notice, isRead: true } : notice
        )
      );
      // 更新未读数量
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('标记通知已读失败:', error);
    }
  };

  // 标记所有通知为已读
  const markAllAsRead = async () => {
    try {
      setLoading(true);
      await api.put('/notices/mark-all-read');
      setNotices(prev => prev.map(notice => ({ ...notice, isRead: true })));
      setUnreadCount(0);
      toast.success(t('all_notices_marked_read'));
    } catch (error) {
      console.error('标记所有通知已读失败:', error);
      toast.error(t('mark_all_read_failed'));
    } finally {
      setLoading(false);
    }
  };

  // 删除通知
  const deleteNotice = async (noticeId) => {
    try {
      await api.delete(`/notices/${noticeId}`);
      setNotices(prev => prev.filter(notice => notice._id !== noticeId));
      toast.success(t('notice_deleted'));
    } catch (error) {
      console.error('删除通知失败:', error);
      toast.error(t('delete_notice_failed'));
    }
  };

  // 获取通知图标
  const getNoticeIcon = (type) => {
    switch (type) {
      case 'appointment_request':
        return <Schedule color="primary" />;
      case 'appointment_confirmed':
        return <CheckCircle color="success" />;
      case 'appointment_cancelled':
        return <Cancel color="error" />;
      case 'medical_record_added':
        return <Description color="info" />;
      case 'new_message':
        return <Message color="secondary" />;
      case 'system_notice':
        return <Notifications color="warning" />;
      default:
        return <AccessTime color="action" />;
    }
  };

  // 获取通知类型文本
  const getNoticeTypeText = (type) => {
    switch (type) {
      case 'appointment_request':
        return t('appointment_request');
      case 'appointment_confirmed':
        return t('appointment_confirmed');
      case 'appointment_cancelled':
        return t('appointment_cancelled');
      case 'medical_record_added':
        return t('medical_record_added');
      case 'new_message':
        return t('new_message');
      case 'system_notice':
        return t('system_notice');
      default:
        return t('notice');
    }
  };

  // 处理菜单打开
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotices();
  };

  // 处理菜单关闭
  const handleClose = () => {
    setAnchorEl(null);
  };

  // 处理通知点击
  const handleNoticeClick = (notice) => {
    if (!notice.isRead) {
      markAsRead(notice._id);
    }
    // 这里可以添加跳转到相关页面的逻辑
    handleClose();
  };

  // 定期获取未读数量
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // 每30秒检查一次
      return () => clearInterval(interval);
    }
  }, [user]);

  if (!user) return null;

  return (
    <>
      <Tooltip title={t('notifications')}>
        <IconButton
          color="inherit"
          onClick={handleClick}
          sx={{ ml: 1 }}
        >
          <Badge badgeContent={unreadCount} color="error">
            {unreadCount > 0 ? <NotificationsActive /> : <Notifications />}
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {t('notifications')}
            </Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                onClick={markAllAsRead}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : null}
              >
                {t('mark_all_read')}
              </Button>
            )}
          </Box>
        </Box>

        {loadingNotices ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={24} />
          </Box>
        ) : notices.length === 0 ? (
          <Box textAlign="center" p={3}>
            <Typography color="textSecondary">
              {t('no_notices')}
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notices.map((notice, index) => (
              <React.Fragment key={notice._id}>
                <ListItem
                  button
                  onClick={() => handleNoticeClick(notice)}
                  sx={{
                    backgroundColor: notice.isRead ? 'transparent' : 'action.hover',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                    },
                  }}
                >
                  <ListItemIcon>
                    {getNoticeIcon(notice.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: notice.isRead ? 'normal' : 'bold',
                        }}
                      >
                        {notice.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {notice.content}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {format(new Date(notice.createdAt), 'yyyy-MM-dd HH:mm')}
                        </Typography>
                      </Box>
                    }
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotice(notice._id);
                    }}
                    sx={{ ml: 1 }}
                  >
                    <Cancel fontSize="small" />
                  </IconButton>
                </ListItem>
                {index < notices.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
};

export default NoticeBell;
