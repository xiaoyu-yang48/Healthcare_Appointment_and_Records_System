import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// 调试工具
const debug = {
  logRequest: (config) => {
    console.log(`🔍 发送请求: ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      headers: config.headers
    });
  },
  
  logResponse: (response) => {
    console.log(`✅ 收到响应: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
  },
  
  logError: (error) => {
    console.error(`❌ 请求错误: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
