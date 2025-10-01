// Singleton Pattern - Database Connection Manager
const mongoose = require('mongoose');

class DatabaseManager {
    constructor() {
        if (DatabaseManager.instance) {
            return DatabaseManager.instance;
        }
        
        this.connection = null;
        this.isConnected = false;
        DatabaseManager.instance = this;
    }
    
    static getInstance() {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }
    
    async connect(uri) {
        if (this.isConnected) {
            console.log('Database already connected');
            return this.connection;
        }
        
        try {
            this.connection = await mongoose.connect(uri || process.env.MONGO_URI);
            this.isConnected = true;
            console.log('MongoDB connected successfully via Singleton');
            return this.connection;
        } catch (error) {
            console.error('MongoDB connection error:', error.message);
            throw error;
        }
    }
    
    async disconnect() {
        if (!this.isConnected) {
            return;
        }
        
        await mongoose.disconnect();
        this.isConnected = false;
        this.connection = null;
        console.log('MongoDB disconnected');
    }
    
    getConnection() {
        if (!this.isConnected) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return this.connection;
    }
    
    isReady() {
        return this.isConnected && mongoose.connection.readyState === 1;
    }
}

module.exports = DatabaseManager;