
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { 
    RequestHandler, 
    LoggingDecorator, 
    PerformanceDecorator, 
    SecurityDecorator,
    createDecoratedMiddleware 
} = require('./patterns/RequestDecorator');

dotenv.config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply Decorator Pattern for request handling
const decoratedMiddleware = createDecoratedMiddleware(
    new RequestHandler(),
    [
        { class: SecurityDecorator },
        { class: LoggingDecorator },
        { class: PerformanceDecorator, options: { threshold: 1000 } }
    ]
);
app.use(decoratedMiddleware);

// 路由
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/medical-records', require('./routes/medicalRecordRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/validation', require('./routes/validationRoutes')); // Chain of Responsibility demo

// 健康检查端点
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'service running...',
        timestamp: new Date().toISOString()
    });
});

// 404 处理
app.use('*', (req, res) => {
    res.status(404).json({ message: 'route not exist' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('middleware err:', err);
    res.status(500).json({ 
        message: 'inner err',
        error: process.env.NODE_ENV === 'development' ? err.message : 'wait ...'
    });
});

// 启动服务器
if (require.main === module) {
    connectDB();
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
        console.log(`Appointment Management System run On port: ${PORT}`);
        console.log(`api health check: http://localhost:${PORT}/api/health`);
    });
}

module.exports = app;
