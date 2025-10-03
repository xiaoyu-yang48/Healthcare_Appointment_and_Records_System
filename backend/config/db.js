// 使用Singleton Pattern确保数据库连接只有一个实例
const dbInstance = require('../patterns/DatabaseSingleton');

const connectDB = async () => {
  try {
    await dbInstance.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully (using Singleton pattern)");
    
    // 输出连接状态
    const state = dbInstance.getConnectionState();
    console.log("Connection state:", state);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
