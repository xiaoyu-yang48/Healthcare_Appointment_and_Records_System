// Decorator Pattern - Request Logger and Monitor

// Base Component
class RequestHandler {
    async handle(req, res, next) {
        // Base implementation - just pass through
        next();
    }
}

// Base Decorator
class RequestDecorator extends RequestHandler {
    constructor(handler) {
        super();
        this.handler = handler;
    }
    
    async handle(req, res, next) {
        // Call the wrapped handler
        return await this.handler.handle(req, res, next);
    }
}

// Logging Decorator
class LoggingDecorator extends RequestDecorator {
    constructor(handler) {
        super(handler);
        this.logs = [];
    }
    
    async handle(req, res, next) {
        const startTime = Date.now();
        const logEntry = {
            timestamp: new Date(),
            method: req.method,
            url: req.url,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            userId: req.user ? req.user.id : 'anonymous'
        };
        
        console.log(`[REQUEST] ${logEntry.method} ${logEntry.url} from ${logEntry.ip}`);
        
        // Store original end function
        const originalEnd = res.end;
        
        // Override end function to log response
        res.end = function(...args) {
            const duration = Date.now() - startTime;
            logEntry.duration = duration;
            logEntry.statusCode = res.statusCode;
            
            console.log(`[RESPONSE] ${logEntry.method} ${logEntry.url} - ${res.statusCode} (${duration}ms)`);
            
            // Call original end
            originalEnd.apply(res, args);
        };
        
        this.logs.push(logEntry);
        
        // Call the wrapped handler
        return await super.handle(req, res, next);
    }
    
    getLogs() {
        return this.logs;
    }
}

// Performance Monitoring Decorator
class PerformanceDecorator extends RequestDecorator {
    constructor(handler, threshold = 1000) {
        super(handler);
        this.threshold = threshold; // milliseconds
        this.slowRequests = [];
    }
    
    async handle(req, res, next) {
        const startTime = Date.now();
        const startMemory = process.memoryUsage();
        
        // Store original end function
        const originalEnd = res.end;
        
        // Override end function to measure performance
        res.end = (...args) => {
            const duration = Date.now() - startTime;
            const endMemory = process.memoryUsage();
            const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;
            
            if (duration > this.threshold) {
                const slowRequest = {
                    timestamp: new Date(),
                    method: req.method,
                    url: req.url,
                    duration,
                    memoryDelta: Math.round(memoryDelta / 1024 / 1024) + ' MB',
                    threshold: this.threshold
                };
                
                this.slowRequests.push(slowRequest);
                console.warn(`[SLOW REQUEST] ${req.method} ${req.url} took ${duration}ms (threshold: ${this.threshold}ms)`);
            }
            
            // Add performance headers
            res.set('X-Response-Time', `${duration}ms`);
            res.set('X-Memory-Delta', `${Math.round(memoryDelta / 1024)} KB`);
            
            // Call original end
            originalEnd.apply(res, args);
        };
        
        return await super.handle(req, res, next);
    }
    
    getSlowRequests() {
        return this.slowRequests;
    }
}

// Rate Limiting Decorator
class RateLimitDecorator extends RequestDecorator {
    constructor(handler, maxRequests = 100, windowMs = 60000) {
        super(handler);
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = new Map();
    }
    
    async handle(req, res, next) {
        const key = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        // Clean old entries
        this.cleanOldEntries(now);
        
        // Get or create request array for this IP
        if (!this.requests.has(key)) {
            this.requests.set(key, []);
        }
        
        const requestTimes = this.requests.get(key);
        requestTimes.push(now);
        
        // Check if rate limit exceeded
        if (requestTimes.length > this.maxRequests) {
            console.warn(`[RATE LIMIT] IP ${key} exceeded limit: ${requestTimes.length}/${this.maxRequests}`);
            return res.status(429).json({
                error: 'Too many requests',
                message: `Rate limit exceeded. Max ${this.maxRequests} requests per ${this.windowMs / 1000} seconds`
            });
        }
        
        // Add rate limit headers
        res.set('X-RateLimit-Limit', this.maxRequests.toString());
        res.set('X-RateLimit-Remaining', (this.maxRequests - requestTimes.length).toString());
        res.set('X-RateLimit-Reset', new Date(now + this.windowMs).toISOString());
        
        return await super.handle(req, res, next);
    }
    
    cleanOldEntries(now) {
        const cutoff = now - this.windowMs;
        
        for (const [key, times] of this.requests.entries()) {
            const filtered = times.filter(time => time > cutoff);
            if (filtered.length === 0) {
                this.requests.delete(key);
            } else {
                this.requests.set(key, filtered);
            }
        }
    }
}

// Security Headers Decorator
class SecurityDecorator extends RequestDecorator {
    async handle(req, res, next) {
        // Add security headers
        res.set('X-Content-Type-Options', 'nosniff');
        res.set('X-Frame-Options', 'DENY');
        res.set('X-XSS-Protection', '1; mode=block');
        res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        
        // Remove sensitive headers
        res.removeHeader('X-Powered-By');
        
        return await super.handle(req, res, next);
    }
}

// Factory function to create decorated middleware
function createDecoratedMiddleware(baseHandler, decorators = []) {
    let handler = baseHandler;
    
    // Apply decorators in reverse order so they execute in the correct order
    for (let i = decorators.length - 1; i >= 0; i--) {
        const DecoratorClass = decorators[i].class;
        const options = decorators[i].options || {};
        handler = new DecoratorClass(handler, ...Object.values(options));
    }
    
    return (req, res, next) => handler.handle(req, res, next);
}

module.exports = {
    RequestHandler,
    RequestDecorator,
    LoggingDecorator,
    PerformanceDecorator,
    RateLimitDecorator,
    SecurityDecorator,
    createDecoratedMiddleware
};