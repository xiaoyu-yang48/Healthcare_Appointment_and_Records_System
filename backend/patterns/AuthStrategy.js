// Strategy Pattern - Authentication Strategies
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Base Strategy Interface
class AuthStrategy {
    async authenticate(credentials) {
        throw new Error('authenticate() method must be implemented by subclass');
    }
    
    generateToken(userId) {
        return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test-secret-key', { 
            expiresIn: '30d' 
        });
    }
}

// Email/Password Strategy
class EmailPasswordStrategy extends AuthStrategy {
    async authenticate(credentials) {
        const { email, password } = credentials;
        
        if (!email || !password) {
            throw new Error('Email and password are required');
        }
        
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            throw new Error('Invalid email or password');
        }
        
        if (!user.isActive) {
            throw new Error('Account is disabled');
        }
        
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }
        
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        
        return {
            user: this.formatUserResponse(user),
            token: this.generateToken(user._id)
        };
    }
    
    formatUserResponse(user) {
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            specialization: user.specialization,
            department: user.department,
            avatar: user.avatar
        };
    }
}

// Admin Override Strategy (for testing)
class AdminOverrideStrategy extends AuthStrategy {
    async authenticate(credentials) {
        const { email, password } = credentials;
        
        if (email === 'admin@healthcare.com' && password === 'admin123') {
            const adminUser = {
                id: 'temp-admin-id',
                name: '系统管理员',
                email: 'admin@healthcare.com',
                role: 'admin',
                phone: '13800000000',
                address: '',
                dateOfBirth: null,
                gender: null,
                specialization: null,
                department: null,
                avatar: null
            };
            
            return {
                user: adminUser,
                token: this.generateToken(adminUser.id),
                message: 'Admin login successful (temporary mode)'
            };
        }
        
        throw new Error('Invalid admin credentials');
    }
}

// Token-based Strategy
class TokenStrategy extends AuthStrategy {
    async authenticate(credentials) {
        const { token } = credentials;
        
        if (!token) {
            throw new Error('Token is required');
        }
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret-key');
            
            // Handle temp admin
            if (decoded.id === 'temp-admin-id') {
                return {
                    user: {
                        id: 'temp-admin-id',
                        name: '系统管理员',
                        email: 'admin@healthcare.com',
                        role: 'admin'
                    },
                    valid: true
                };
            }
            
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user || !user.isActive) {
                throw new Error('Invalid or inactive user');
            }
            
            return {
                user: this.formatUserResponse(user),
                valid: true
            };
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
    
    formatUserResponse(user) {
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone
        };
    }
}

// Context class for strategy pattern
class AuthContext {
    constructor(strategy) {
        this.strategy = strategy;
    }
    
    setStrategy(strategy) {
        this.strategy = strategy;
    }
    
    async authenticate(credentials) {
        if (!this.strategy) {
            throw new Error('No authentication strategy set');
        }
        return await this.strategy.authenticate(credentials);
    }
}

module.exports = {
    AuthContext,
    AuthStrategy,
    EmailPasswordStrategy,
    AdminOverrideStrategy,
    TokenStrategy
};