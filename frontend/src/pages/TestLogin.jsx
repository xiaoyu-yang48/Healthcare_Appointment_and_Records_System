import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { debug } from '../utils/debug';

const TestLogin = () => {
  const [formData, setFormData] = useState({
    email: 'admin@healthcare.com',
    password: 'admin123',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTestLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      console.log('🧪 开始测试登录...');
      
      // 测试API连接
      const apiConnected = await debug.testApiConnection();
      console.log('API连接状态:', apiConnected);
      
      // 测试登录
      const loginResult = await login(formData.email, formData.password);
      
      setResult({
        success: loginResult.success,
        message: loginResult.success ? '登录成功' : loginResult.error,
        data: loginResult
      });
      
      console.log('登录结果:', loginResult);
      
    } catch (error) {
      setResult({
        success: false,
        message: '测试过程中发生错误',
        error: error.message
      });
      console.error('测试错误:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearStorage = () => {
    localStorage.clear();
    setResult({
      success: true,
      message: '本地存储已清空'
    });
    console.log('本地存储已清空');
  };

  const handleShowStorage = () => {
    debug.logLocalStorage();
    setResult({
      success: true,
      message: '请查看控制台输出'
    });
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ marginTop: 4 }}>
        <Typography variant="h4" gutterBottom>
          登录测试页面
        </Typography>
        
        <Paper elevation={3} sx={{ padding: 3, marginBottom: 2 }}>
          <Typography variant="h6" gutterBottom>
            测试登录功能（临时管理员模式）
          </Typography>
          
          <Alert severity="info" sx={{ marginBottom: 2 }}>
            当前使用临时管理员登录，无需数据库验证
          </Alert>
          
          <Box component="form" onSubmit={handleTestLogin}>
            <TextField
              margin="normal"
              fullWidth
              id="email"
              label="邮箱地址"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              name="password"
              label="密码"
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : '测试登录'}
            </Button>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ padding: 3, marginBottom: 2 }}>
          <Typography variant="h6" gutterBottom>
            调试工具
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={handleClearStorage}
            >
              清空本地存储
            </Button>
            <Button
              variant="outlined"
              onClick={handleShowStorage}
            >
              显示本地存储
            </Button>
            <Button
              variant="outlined"
              onClick={() => debug.testApiConnection()}
            >
              测试API连接
            </Button>
          </Box>
        </Paper>

        {result && (
          <Paper elevation={3} sx={{ padding: 3 }}>
            <Typography variant="h6" gutterBottom>
              测试结果
            </Typography>
            
            <Alert 
              severity={result.success ? 'success' : 'error'}
              sx={{ marginBottom: 2 }}
            >
              {result.message}
            </Alert>
            
            {result.data && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  详细数据:
                </Typography>
                <pre style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '10px', 
                  borderRadius: '4px',
                  overflow: 'auto'
                }}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </Box>
            )}
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default TestLogin;
