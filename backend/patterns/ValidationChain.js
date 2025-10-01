// Chain of Responsibility Pattern - Request Validation

// Base Handler
class ValidationHandler {
    constructor() {
        this.nextHandler = null;
    }
    
    setNext(handler) {
        this.nextHandler = handler;
        return handler;
    }
    
    async handle(request) {
        const result = await this.validate(request);
        
        if (!result.valid) {
            return result;
        }
        
        if (this.nextHandler) {
            return await this.nextHandler.handle(request);
        }
        
        return { valid: true, message: 'All validations passed' };
    }
    
    async validate(request) {
        throw new Error('validate() method must be implemented by subclass');
    }
}

// Authentication Validation
class AuthenticationValidator extends ValidationHandler {
    async validate(request) {
        const { headers } = request;
        
        if (!headers.authorization) {
            return {
                valid: false,
                statusCode: 401,
                message: 'No authentication token provided'
            };
        }
        
        if (!headers.authorization.startsWith('Bearer ')) {
            return {
                valid: false,
                statusCode: 401,
                message: 'Invalid authentication format'
            };
        }
        
        // Token validation would happen here
        return { valid: true };
    }
}

// Required Fields Validation
class RequiredFieldsValidator extends ValidationHandler {
    constructor(requiredFields = []) {
        super();
        this.requiredFields = requiredFields;
    }
    
    async validate(request) {
        const { body } = request;
        const missingFields = [];
        
        for (const field of this.requiredFields) {
            if (!body[field]) {
                missingFields.push(field);
            }
        }
        
        if (missingFields.length > 0) {
            return {
                valid: false,
                statusCode: 400,
                message: `Missing required fields: ${missingFields.join(', ')}`
            };
        }
        
        return { valid: true };
    }
}

// Email Validation
class EmailValidator extends ValidationHandler {
    async validate(request) {
        const { body } = request;
        
        if (body.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(body.email)) {
                return {
                    valid: false,
                    statusCode: 400,
                    message: 'Invalid email format'
                };
            }
        }
        
        return { valid: true };
    }
}

// Password Strength Validation
class PasswordValidator extends ValidationHandler {
    constructor(minLength = 6) {
        super();
        this.minLength = minLength;
    }
    
    async validate(request) {
        const { body } = request;
        
        if (body.password) {
            if (body.password.length < this.minLength) {
                return {
                    valid: false,
                    statusCode: 400,
                    message: `Password must be at least ${this.minLength} characters long`
                };
            }
            
            // Additional password strength checks
            const hasUpperCase = /[A-Z]/.test(body.password);
            const hasLowerCase = /[a-z]/.test(body.password);
            const hasNumber = /\d/.test(body.password);
            
            if (!hasUpperCase || !hasLowerCase || !hasNumber) {
                return {
                    valid: false,
                    statusCode: 400,
                    message: 'Password must contain uppercase, lowercase, and number'
                };
            }
        }
        
        return { valid: true };
    }
}

// Role Validation
class RoleValidator extends ValidationHandler {
    constructor(allowedRoles = []) {
        super();
        this.allowedRoles = allowedRoles;
    }
    
    async validate(request) {
        const { user } = request;
        
        if (!user) {
            return {
                valid: false,
                statusCode: 401,
                message: 'User not authenticated'
            };
        }
        
        if (this.allowedRoles.length > 0 && !this.allowedRoles.includes(user.role)) {
            return {
                valid: false,
                statusCode: 403,
                message: `Requires ${this.allowedRoles.join(' or ')} role`
            };
        }
        
        return { valid: true };
    }
}

// Date Validation
class DateValidator extends ValidationHandler {
    async validate(request) {
        const { body } = request;
        
        if (body.date) {
            const date = new Date(body.date);
            
            if (isNaN(date.getTime())) {
                return {
                    valid: false,
                    statusCode: 400,
                    message: 'Invalid date format'
                };
            }
            
            // Check if date is in the past
            if (date < new Date()) {
                return {
                    valid: false,
                    statusCode: 400,
                    message: 'Date cannot be in the past'
                };
            }
        }
        
        return { valid: true };
    }
}

// Business Logic Validation
class AppointmentValidator extends ValidationHandler {
    async validate(request) {
        const { body } = request;
        
        if (body.timeSlot) {
            // Validate time slot format (e.g., "09:00-09:30")
            const timeSlotRegex = /^\d{2}:\d{2}-\d{2}:\d{2}$/;
            if (!timeSlotRegex.test(body.timeSlot)) {
                return {
                    valid: false,
                    statusCode: 400,
                    message: 'Invalid time slot format'
                };
            }
            
            // Check business hours
            const [start] = body.timeSlot.split('-');
            const [hour] = start.split(':').map(Number);
            
            if (hour < 8 || hour >= 18) {
                return {
                    valid: false,
                    statusCode: 400,
                    message: 'Appointments must be between 8:00 and 18:00'
                };
            }
        }
        
        return { valid: true };
    }
}

// Sanitization Handler
class SanitizationHandler extends ValidationHandler {
    async validate(request) {
        const { body } = request;
        
        // Sanitize input fields
        for (const key in body) {
            if (typeof body[key] === 'string') {
                // Remove leading/trailing whitespace
                body[key] = body[key].trim();
                
                // Prevent XSS by escaping HTML
                body[key] = this.escapeHtml(body[key]);
            }
        }
        
        return { valid: true };
    }
    
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Validation Chain Builder
class ValidationChainBuilder {
    constructor() {
        this.firstHandler = null;
        this.lastHandler = null;
    }
    
    add(handler) {
        if (!this.firstHandler) {
            this.firstHandler = handler;
            this.lastHandler = handler;
        } else {
            this.lastHandler.setNext(handler);
            this.lastHandler = handler;
        }
        return this;
    }
    
    build() {
        return this.firstHandler;
    }
    
    // Predefined chains
    static createLoginChain() {
        return new ValidationChainBuilder()
            .add(new RequiredFieldsValidator(['email', 'password']))
            .add(new EmailValidator())
            .add(new SanitizationHandler())
            .build();
    }
    
    static createRegistrationChain() {
        return new ValidationChainBuilder()
            .add(new RequiredFieldsValidator(['name', 'email', 'password']))
            .add(new EmailValidator())
            .add(new PasswordValidator(8))
            .add(new SanitizationHandler())
            .build();
    }
    
    static createAppointmentChain() {
        return new ValidationChainBuilder()
            .add(new AuthenticationValidator())
            .add(new RequiredFieldsValidator(['doctorId', 'date', 'timeSlot']))
            .add(new DateValidator())
            .add(new AppointmentValidator())
            .add(new SanitizationHandler())
            .build();
    }
    
    static createAdminChain() {
        return new ValidationChainBuilder()
            .add(new AuthenticationValidator())
            .add(new RoleValidator(['admin']))
            .add(new SanitizationHandler())
            .build();
    }
}

// Middleware factory
function createValidationMiddleware(chain) {
    return async (req, res, next) => {
        const result = await chain.handle(req);
        
        if (!result.valid) {
            return res.status(result.statusCode || 400).json({
                success: false,
                message: result.message
            });
        }
        
        next();
    };
}

module.exports = {
    ValidationHandler,
    AuthenticationValidator,
    RequiredFieldsValidator,
    EmailValidator,
    PasswordValidator,
    RoleValidator,
    DateValidator,
    AppointmentValidator,
    SanitizationHandler,
    ValidationChainBuilder,
    createValidationMiddleware
};