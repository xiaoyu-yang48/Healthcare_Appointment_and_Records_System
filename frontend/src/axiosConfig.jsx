import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://3.106.188.53:5001/api';

// 调试工具
const debug = {
  logRequest: (config) => {
    console.log(`🔍 send request: ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      headers: config.headers
    });
  },
  
  logResponse: (response) => {
    console.log(`✅ receive response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
  },
  
  logError: (error) => {
    console.error(`❌ request error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10秒超时
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 调试信息
    if (process.env.NODE_ENV === 'development') {
      debug.logRequest(config);
    }
    
    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      debug.logError(error);
    }
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    // 调试信息
    if (process.env.NODE_ENV === 'development') {
      debug.logResponse(response);
    }
    return response;
  },
  (error) => {
    // 调试信息
    if (process.env.NODE_ENV === 'development') {
      debug.logError(error);
    }
    
    if (error.response?.status === 401) {
      console.log('detected 401 error, clear authentication information and redirect to login page');
      console.log('current URL:', window.location.href);
      console.log('user information:', localStorage.getItem('user'));
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // 避免在登录页面重复重定向
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
