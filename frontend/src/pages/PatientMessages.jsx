import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  CircularProgress,
  Chip,
  Paper,
} from '@mui/material';
import {
  Send,
  Person,
  Message,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../axiosConfig';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const PatientMessages = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/messages/conversations');
      setConversations(response.data);
      if (response.data.length > 0) {
        setSelectedConversation(response.data[0]);
      }
    } catch (error) {
      console.error('获取对话列表失败:', error);
      toast.error('获取对话列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(`/messages/conversation/${conversationId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('获取消息失败:', error);
      toast.error('获取消息失败');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const messageData = {
        conversationId: selectedConversation._id,
        content: newMessage.trim(),
        receiverId: selectedConversation.doctor._id,
      };

      const response = await api.post('/messages', messageData);
      setMessages([...messages, response.data]);
      setNewMessage('');
      
      // 更新对话列表中的最后消息
      const updatedConversations = conversations.map(conv => 
        conv._id === selectedConversation._id 
          ? { ...conv, lastMessage: response.data }
          : conv
      );
      setConversations(updatedConversations);
      
      toast.success('消息发送成功');
    } catch (error) {
      console.error('发送消息失败:', error);
      toast.error('发送消息失败');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageTime = (timestamp) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(messageDate, 'HH:mm');
    } else if (diffInHours < 48) {
      return '昨天';
    } else {
      return format(messageDate, 'MM-dd');
    }
  };

  const getUnreadCount = (conversation) => {
    return conversation.unreadCount || 0;
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
        消息中心
      </Typography>

      <Grid container spacing={3} sx={{ height: '70vh' }}>
        {/* 对话列表 */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                对话列表
              </Typography>
              
              {conversations.length > 0 ? (
                <List sx={{ maxHeight: 'calc(100% - 60px)', overflow: 'auto' }}>
                  {conversations.map((conversation) => (
                    <ListItem
                      key={conversation._id}
                      button
                      selected={selectedConversation?._id === conversation._id}
                      onClick={() => setSelectedConversation(conversation)}
                      sx={{ mb: 1, borderRadius: 1 }}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <Person />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2">
                              {conversation.doctor.name}
                            </Typography>
                            {getUnreadCount(conversation) > 0 && (
                              <Chip
                                label={getUnreadCount(conversation)}
                                size="small"
                                color="primary"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary" noWrap>
                              {conversation.lastMessage?.content || '暂无消息'}
                            </Typography>
                            {conversation.lastMessage && (
                              <Typography variant="caption" color="textSecondary">
                                {getMessageTime(conversation.lastMessage.createdAt)}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <Message sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    暂无对话
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    您还没有与任何医生进行过交流
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 消息区域 */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {selectedConversation ? (
              <>
                {/* 对话头部 */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ mr: 2 }}>
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {selectedConversation.doctor.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {selectedConversation.doctor.department}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* 消息列表 */}
                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                  {messages.length > 0 ? (
                    <Box>
                      {messages.map((message) => (
                        <Box
                          key={message._id}
                          display="flex"
                          justifyContent={message.senderId === user._id ? 'flex-end' : 'flex-start'}
                          mb={2}
                        >
                          <Paper
                            sx={{
                              p: 2,
                              maxWidth: '70%',
                              backgroundColor: message.senderId === user._id ? 'primary.main' : 'grey.100',
                              color: message.senderId === user._id ? 'white' : 'text.primary',
                            }}
                          >
                            <Typography variant="body2">
                              {message.content}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                mt: 1,
                                color: message.senderId === user._id ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                              }}
                            >
                              {getMessageTime(message.createdAt)}
                            </Typography>
                          </Paper>
                        </Box>
                      ))}
                      <div ref={messagesEndRef} />
                    </Box>
                  ) : (
                    <Box textAlign="center" py={4}>
                      <Typography variant="body2" color="textSecondary">
                        开始与医生交流吧
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* 发送消息区域 */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Box display="flex" gap={1}>
                    <TextField
                      fullWidth
                      multiline
                      maxRows={4}
                      placeholder="输入消息..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={sending}
                    />
                    <Button
                      variant="contained"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      {sending ? <CircularProgress size={20} /> : <Send />}
                    </Button>
                  </Box>
                </Box>
              </>
            ) : (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
              >
                <Box textAlign="center">
                  <Message sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    选择对话
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    请从左侧选择一个对话开始交流
                  </Typography>
                </Box>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PatientMessages; 