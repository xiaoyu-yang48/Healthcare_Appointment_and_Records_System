/**
 * Singleton Pattern Implementation
 * 
 * 用途：确保数据库连接在整个应用中只有一个实例
 * Why: 避免重复创建连接，节省资源，确保连接的一致性
 */

const mongoose = require('mongoose');

class DatabaseConnection {
    constructor() {
        if (DatabaseConnection.instance) {
            return DatabaseConnection.instance;
        }

        this.connection = null;
        this.isConnected = false;
        this.connectionAttempts = 0;
        this.maxRetries = 3;
        
        DatabaseConnection.instance = this;
    }

    /**
     * 获取单例实例
     */
    static getInstance() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    /**
     * 连接数据库
     */
    async connect(uri = process.env.MONGO_URI) {
        // 如果已经连接，返回现有连接
        if (this.isConnected && this.connection) {
            console.log('[Singleton] Using existing database connection');
            return this.connection;
        }

        try {
            this.connectionAttempts++;
            console.log(`[Singleton] Attempting to connect to database (Attempt ${this.connectionAttempts}/${this.maxRetries})`);

            const options = {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            };

            await mongoose.connect(uri, options);
            this.connection = mongoose.connection;
            this.isConnected = true;
            this.connectionAttempts = 0; // 重置计数器

            console.log('[Singleton] Database connected successfully');
            console.log(`[Singleton] Connection state: ${mongoose.connection.readyState}`);
            
            // 监听连接事件
            this.setupEventListeners();

            return this.connection;
        } catch (error) {
            console.error(`[Singleton] Database connection error:`, error.message);
            
            // 如果还有重试机会
            if (this.connectionAttempts < this.maxRetries) {
                console.log(`[Singleton] Retrying in 3 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 3000));
                return this.connect(uri);
            }
            
            throw new Error(`Failed to connect to database after ${this.maxRetries} attempts`);
        }
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        mongoose.connection.on('connected', () => {
            console.log('[Singleton] Mongoose connected to database');
        });

        mongoose.connection.on('error', (err) => {
            console.error('[Singleton] Mongoose connection error:', err);
            this.isConnected = false;
        });

        mongoose.connection.on('disconnected', () => {
            console.log('[Singleton] Mongoose disconnected from database');
            this.isConnected = false;
        });

        // 优雅关闭
        process.on('SIGINT', async () => {
            await this.disconnect();
            process.exit(0);
        });
    }

    /**
     * 断开连接
     */
    async disconnect() {
        if (!this.isConnected) {
            console.log('[Singleton] No active connection to disconnect');
            return;
        }

        try {
            await mongoose.connection.close();
            this.isConnected = false;
            this.connection = null;
            console.log('[Singleton] Database connection closed successfully');
        } catch (error) {
            console.error('[Singleton] Error closing database connection:', error);
            throw error;
        }
    }

    /**
     * 获取连接状态
     */
    getConnectionState() {
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };

        return {
            isConnected: this.isConnected,
            state: states[mongoose.connection.readyState],
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            name: mongoose.connection.name
        };
    }

    /**
     * 健康检查
     */
    async healthCheck() {
        try {
            if (!this.isConnected) {
                return {
                    status: 'unhealthy',
                    message: 'Not connected to database'
                };
            }

            // 执行简单的数据库操作来验证连接
            await mongoose.connection.db.admin().ping();
            
            return {
                status: 'healthy',
                message: 'Database connection is active',
                details: this.getConnectionState()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                message: error.message,
                details: this.getConnectionState()
            };
        }
    }
}

// 导出单例实例
const dbInstance = DatabaseConnection.getInstance();

module.exports = dbInstance;

