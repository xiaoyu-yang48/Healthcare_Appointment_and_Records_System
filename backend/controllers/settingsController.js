const SystemSettings = require('../models/SystemSettings');

// 获取系统设置
const getSystemSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.getInstance();
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('获取系统设置失败:', error);
    res.status(500).json({
      success: false,
      message: '获取系统设置失败'
    });
  }
};

// 更新系统设置
const updateSystemSettings = async (req, res) => {
  try {
    const updates = req.body;
    const settings = await SystemSettings.updateSettings(updates);
    
    res.json({
      success: true,
      message: '系统设置更新成功',
      settings
    });
  } catch (error) {
    console.error('更新系统设置失败:', error);
    res.status(500).json({
      success: false,
      message: '更新系统设置失败'
    });
  }
};

// 获取通知设置
const getNotificationSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.getInstance();
    res.json({
      success: true,
      notifications: settings.notifications
    });
  } catch (error) {
    console.error('获取通知设置失败:', error);
    res.status(500).json({
      success: false,
      message: '获取通知设置失败'
    });
  }
};

// 更新通知设置
const updateNotificationSettings = async (req, res) => {
  try {
    const { notifications } = req.body;
    const settings = await SystemSettings.updateSettings({ notifications });
    
    res.json({
      success: true,
      message: '通知设置更新成功',
      notifications: settings.notifications
    });
  } catch (error) {
    console.error('更新通知设置失败:', error);
    res.status(500).json({
      success: false,
      message: '更新通知设置失败'
    });
  }
};

// 切换维护模式
const toggleMaintenanceMode = async (req, res) => {
  try {
    const settings = await SystemSettings.getInstance();
    settings.system.maintenanceMode = !settings.system.maintenanceMode;
    await settings.save();
    
    res.json({
      success: true,
      message: `维护模式已${settings.system.maintenanceMode ? '开启' : '关闭'}`,
      maintenanceMode: settings.system.maintenanceMode
    });
  } catch (error) {
    console.error('切换维护模式失败:', error);
    res.status(500).json({
      success: false,
      message: '切换维护模式失败'
    });
  }
};

module.exports = {
  getSystemSettings,
  updateSystemSettings,
  getNotificationSettings,
  updateNotificationSettings,
  toggleMaintenanceMode
};
