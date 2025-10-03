// optional mongoose import
let mongoose;
try {
    mongoose = require('mongoose');
} catch (e) {
    // mongoose is not installed, proceed without it
    mongoose = null;
}

// 1. Singleton Pattern
class DatabaseManager {
    constructor() {
        if (DatabaseManager.instance) {
            return DatabaseManager.instance;
        }
        this.connection = null;
        DatabaseManager.instance = this;
    }

    async connect() {
        if (!this.connection) {
            if (mongoose) {
                this.connection = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/myapp');
            } else {
                this.connection = { status: "connected", mock: true, time: new Date() }; // Simulate a DB connection
            }
            console.log("Database connected.");
        }
        return this.connection;
    }

    static getInstance() {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }
}

// Singleton integration function
async function getDatabaseConnection() {
    const dbManager = DatabaseManager.getInstance();
    return await dbManager.connect();
}

// 2. Factory Pattern
class ModelFactory {
    static creaeteModel(type, data) {
        switch (type) {
            case 'user':
                return {
                    type: 'user',
                    data: { ...data, role: data.role || 'patient' },
                    save: function() { console.log("User model saved:", this.data); return this.data; }
                };
            case 'appointment':
                return {
                    type: 'appointment',
                    data: { ...data, status: 'pending' },
                    save: function() { console.log("Appointment model saved:", this.data); return this.data; }
                };
            case 'notice':
                return {
                    type: 'notice',
                    data: { ...data, isRead: false },
                    save: function() { console.log("Notice model saved:", this.data); return this.data; }
                };
            default:
                throw new Error("Unknown model type");
        }
    }
}
// Factory integration function
function createEntity(type, data) {
    return ModelFactory.creeteModel(type, data);
}

// 3. Strategy Pattern
class AuthStrategy {
    authenticate(credentials) {
        throw new Error("Must implement authenticate method!");
    }
}

class JWTStrategy extends AuthStrategy {
    authenticate(credentials) {
        const jwt = require('jsonwebtoken');
        if (credentials.token) {
            try {
                const decoded = jwt.verify(credentials.token, process.env.JWT_SECRET || 'test-secret');
                return { success: true, userId: decoded,id };
            } catch {
                return { success: false, error: "Invalid token" };
            }
        }
        return { success: false, error: "No token provided" };
    }
}

class PasswordStrategy extends AuthStrategy {
    authenticate(credentials) {
        if (credentials.email && credentials.password) {
            return { success: true, userId: 'user_' + Date.now() };
        }
        return { success: false, error: "Invalid credential" };
    }
}

function authenticateUser(strategy, credentials) {
    return strategy.authenticate(credentials);
}
// Strategy integration function
function login(email, password, useToken = false) {
    const strategy = useToken ? new JWTStrategy() : new PasswordStrategy();
    return authenticateUser(strategy, { email, password, token: useToken ? email : null });
}
