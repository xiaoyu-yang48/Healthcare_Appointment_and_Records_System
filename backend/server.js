
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/medical-records', require('./routes/medicalRecordRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Import patterns integration
const patternsIntegration = require('./patterns-integration');

// Apply Decorator Pattern as middleware (Pattern #5)
app.use('/api/patterns/*', patternsIntegration.enhancedRequestHandler);

// Pattern Demo Routes - Each using a different pattern

// 1. Singleton Pattern - Database connection
app.get('/api/patterns/db-status', async (req, res) => {
    try {
        const connection = await patternsIntegration.getDatabaseConnection();
        res.json({ 
            pattern: 'Singleton',
            status: 'Connected',
            message: 'Database connection managed by Singleton pattern'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Factory Pattern - Create entities
app.post('/api/patterns/create-entity', (req, res) => {
    const { type, data } = req.body;
    try {
        const entity = patternsIntegration.createEntity(type || 'user', data || {});
        entity.save();
        res.json({ 
            pattern: 'Factory',
            created: entity,
            message: 'Entity created using Factory pattern'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 3. Strategy Pattern - Authentication
app.post('/api/patterns/auth', (req, res) => {
    const { email, password, useToken } = req.body;
    const result = patternsIntegration.login(email, password, useToken);
    res.json({ 
        pattern: 'Strategy',
        result,
        strategy: useToken ? 'JWT' : 'Password',
        message: 'Authentication using Strategy pattern'
    });
});

// 4. Observer Pattern - Create appointment with notifications
app.post('/api/patterns/appointment', (req, res) => {
    const appointment = patternsIntegration.createAppointment(req.body);
    res.json({ 
        pattern: 'Observer',
        appointment,
        message: 'Appointment created, observers notified'
    });
});

// 6. Repository Pattern - Data access
app.get('/api/patterns/user/:id', async (req, res) => {
    const user = await patternsIntegration.getUserById(req.params.id);
    res.json({ 
        pattern: 'Repository',
        user,
        message: 'User fetched using Repository pattern'
    });
});

// 7. Chain of Responsibility - Validation
app.post('/api/patterns/validate', (req, res) => {
    const result = patternsIntegration.validateUserData(req.body);
    res.json({ 
        pattern: 'Chain of Responsibility',
        validation: result,
        message: 'Data validated using Chain of Responsibility pattern'
    });
});

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
