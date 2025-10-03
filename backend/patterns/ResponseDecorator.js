/**
 * Decorator Pattern Implementation
 * 
 * 用途：动态地为API响应添加额外功能，如日志、缓存、性能监控等
 * Why: 在不修改原有代码的情况下，灵活地扩展功能
 */

// 基础响应类
class BaseResponse {
    constructor(data) {
        this.data = data;
        this.timestamp = new Date();
    }

    send(res) {
        return res.json(this.data);
    }
}

// 装饰器基类
class ResponseDecorator {
    constructor(response) {
        this.response = response;
    }

    send(res) {
        return this.response.send(res);
    }
}

// 日志装饰器
class LoggingDecorator extends ResponseDecorator {
    constructor(response, logMessage) {
        super(response);
        this.logMessage = logMessage;
    }

    send(res) {
        console.log(`[Response Log] ${this.logMessage}`);
        console.log(`[Response Data]`, JSON.stringify(this.response.data, null, 2));
        console.log(`[Timestamp] ${this.response.timestamp.toISOString()}`);
        return super.send(res);
    }
}

// 元数据装饰器（添加额外信息）
class MetadataDecorator extends ResponseDecorator {
    constructor(response, metadata = {}) {
        super(response);
        this.metadata = metadata;
    }

    send(res) {
        const enhancedData = {
            ...this.response.data,
            _metadata: {
                timestamp: this.response.timestamp,
                version: '1.0.0',
                ...this.metadata
            }
        };
        this.response.data = enhancedData;
        return super.send(res);
    }
}

// 缓存装饰器
class CacheDecorator extends ResponseDecorator {
    static cache = new Map();

    constructor(response, cacheKey, ttl = 60000) {
        super(response);
        this.cacheKey = cacheKey;
        this.ttl = ttl; // Time to live in milliseconds
    }

    send(res) {
        // 存储到缓存
        CacheDecorator.cache.set(this.cacheKey, {
            data: this.response.data,
            timestamp: Date.now()
        });

        // 设置缓存过期
        setTimeout(() => {
            CacheDecorator.cache.delete(this.cacheKey);
            console.log(`[Cache] Expired: ${this.cacheKey}`);
        }, this.ttl);

        console.log(`[Cache] Stored: ${this.cacheKey}, TTL: ${this.ttl}ms`);
        return super.send(res);
    }

    static getFromCache(key) {
        const cached = CacheDecorator.cache.get(key);
        if (cached) {
            console.log(`[Cache] Hit: ${key}`);
            return cached.data;
        }
        console.log(`[Cache] Miss: ${key}`);
        return null;
    }

    static clearCache() {
        CacheDecorator.cache.clear();
        console.log('[Cache] All cache cleared');
    }
}

// 性能监控装饰器
class PerformanceDecorator extends ResponseDecorator {
    constructor(response, operationName) {
        super(response);
        this.operationName = operationName;
        this.startTime = Date.now();
    }

    send(res) {
        const duration = Date.now() - this.startTime;
        console.log(`[Performance] ${this.operationName}: ${duration}ms`);
        
        // 如果响应时间过长，记录警告
        if (duration > 1000) {
            console.warn(`[Performance Warning] ${this.operationName} took ${duration}ms (>1s)`);
        }

        return super.send(res);
    }
}

// 数据转换装饰器
class TransformDecorator extends ResponseDecorator {
    constructor(response, transformer) {
        super(response);
        this.transformer = transformer;
    }

    send(res) {
        this.response.data = this.transformer(this.response.data);
        return super.send(res);
    }
}

// 分页装饰器
class PaginationDecorator extends ResponseDecorator {
    constructor(response, page = 1, limit = 10, total = 0) {
        super(response);
        this.page = parseInt(page);
        this.limit = parseInt(limit);
        this.total = total;
    }

    send(res) {
        const paginatedData = {
            success: true,
            data: this.response.data,
            pagination: {
                page: this.page,
                limit: this.limit,
                total: this.total,
                totalPages: Math.ceil(this.total / this.limit),
                hasNextPage: this.page < Math.ceil(this.total / this.limit),
                hasPrevPage: this.page > 1
            }
        };
        this.response.data = paginatedData;
        return super.send(res);
    }
}

// 错误处理装饰器
class ErrorHandlingDecorator extends ResponseDecorator {
    constructor(response, errorHandler) {
        super(response);
        this.errorHandler = errorHandler;
    }

    send(res) {
        try {
            return super.send(res);
        } catch (error) {
            console.error('[Error Decorator] Caught error:', error);
            if (this.errorHandler) {
                return this.errorHandler(error, res);
            }
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

// 辅助函数：创建装饰器链
const decorateResponse = (data, decorators = []) => {
    let response = new BaseResponse(data);
    
    decorators.forEach(decorator => {
        response = decorator(response);
    });
    
    return response;
};

module.exports = {
    BaseResponse,
    ResponseDecorator,
    LoggingDecorator,
    MetadataDecorator,
    CacheDecorator,
    PerformanceDecorator,
    TransformDecorator,
    PaginationDecorator,
    ErrorHandlingDecorator,
    decorateResponse
};

