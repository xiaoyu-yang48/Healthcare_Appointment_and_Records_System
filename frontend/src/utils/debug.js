// 调试工具
export const debug = {
  // 打印API请求信息
  logApiRequest: (method, url, data) => {
    console.log(`🔍 API请求: ${method} ${url}`, data);
  },

  // 打印API响应信息
  logApiResponse: (response) => {
    console.log('✅ API响应:', response.data);
  },

  // 打印API错误信息
  logApiError: (error) => {
    console.error('❌ API错误:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
  },

  // 打印本地存储信息
  logLocalStorage: () => {
    console.log('📦 本地存储:', {
      token: localStorage.getItem('token'),
      user: localStorage.getItem('user')
    });
  },

  // 打印用户状态
  logUserState: (user) => {
    console.log('👤 用户状态:', user);
  },

  // 测试API连接
  testApiConnection: async () => {
    try {
      const response = await fetch('http://localhost:5001/api/health');
      const data = await response.json();
      console.log('🌐 API连接测试:', data);
      return true;
    } catch (error) {
      console.error('🌐 API连接失败:', error);
      return false;
    }
  }
};

// 在开发环境下启用调试
if (process.env.NODE_ENV === 'development') {
  window.debug = debug;
}
