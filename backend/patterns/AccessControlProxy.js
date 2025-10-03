/**
 * Proxy Pattern Implementation
 * 
 * 用途：为敏感数据访问提供代理层，控制访问权限和数据过滤
 * Why: 在不修改原始对象的情况下，添加访问控制、日志记录、数据脱敏等功能
 */

// 真实主题：医疗记录服务
class MedicalRecordService {
    constructor(recordModel) {
        this.recordModel = recordModel;
    }

    async getRecord(recordId) {
        return await this.recordModel.findById(recordId)
            .populate('patient', 'name email phone')
            .populate('doctor', 'name specialization');
    }

    async getAllRecords() {
        return await this.recordModel.find()
            .populate('patient', 'name email')
            .populate('doctor', 'name specialization');
    }

    async createRecord(data) {
        return await this.recordModel.create(data);
    }

    async updateRecord(recordId, data) {
        return await this.recordModel.findByIdAndUpdate(recordId, data, { new: true });
    }

    async deleteRecord(recordId) {
        return await this.recordModel.findByIdAndDelete(recordId);
    }
}

// 代理：访问控制代理
class MedicalRecordAccessProxy {
    constructor(medicalRecordService) {
        this.service = medicalRecordService;
        this.accessLog = [];
    }

    /**
     * 检查用户是否有权限访问记录
     */
    checkPermission(user, record, action) {
        // 管理员有所有权限
        if (user.role === 'admin') {
            return { allowed: true, reason: 'Admin access' };
        }

        // 医生可以访问自己创建的记录
        if (user.role === 'doctor') {
            if (action === 'read' || action === 'update') {
                if (record.doctor.toString() === user.id.toString()) {
                    return { allowed: true, reason: 'Doctor owns this record' };
                }
            }
            if (action === 'create') {
                return { allowed: true, reason: 'Doctor can create records' };
            }
        }

        // 患者只能查看自己的记录
        if (user.role === 'patient') {
            if (action === 'read' && record.patient.toString() === user.id.toString()) {
                return { allowed: true, reason: 'Patient owns this record' };
            }
        }

        return { 
            allowed: false, 
            reason: `${user.role} not authorized to ${action} this record` 
        };
    }

    /**
     * 记录访问日志
     */
    logAccess(user, action, recordId, allowed, reason) {
        const logEntry = {
            timestamp: new Date(),
            userId: user.id,
            userRole: user.role,
            action: action,
            recordId: recordId,
            allowed: allowed,
            reason: reason
        };
        
        this.accessLog.push(logEntry);
        console.log('[Access Control]', JSON.stringify(logEntry, null, 2));
        
        // 如果拒绝访问，发出警告
        if (!allowed) {
            console.warn(`[Security Alert] Unauthorized access attempt by user ${user.id}`);
        }
    }

    /**
     * 数据脱敏（隐藏敏感信息）
     */
    sanitizeData(record, user) {
        const sanitized = { ...record.toObject() };

        // 患者查看时，隐藏医生的私人信息
        if (user.role === 'patient') {
            if (sanitized.doctor) {
                delete sanitized.doctor.phone;
                delete sanitized.doctor.email;
            }
            // 可能还需要隐藏某些医疗细节
        }

        // 非管理员不显示内部标识
        if (user.role !== 'admin') {
            delete sanitized.__v;
        }

        return sanitized;
    }

    /**
     * 代理方法：获取单个记录
     */
    async getRecord(recordId, user) {
        try {
            const record = await this.service.getRecord(recordId);
            
            if (!record) {
                this.logAccess(user, 'read', recordId, false, 'Record not found');
                throw new Error('Record not found');
            }

            const permission = this.checkPermission(user, record, 'read');
            this.logAccess(user, 'read', recordId, permission.allowed, permission.reason);

            if (!permission.allowed) {
                throw new Error(`Access denied: ${permission.reason}`);
            }

            // 返回脱敏后的数据
            return this.sanitizeData(record, user);
        } catch (error) {
            console.error('[Proxy Error]', error.message);
            throw error;
        }
    }

    /**
     * 代理方法：获取所有记录（带过滤）
     */
    async getAllRecords(user) {
        try {
            let records = await this.service.getAllRecords();

            // 根据角色过滤记录
            if (user.role === 'doctor') {
                records = records.filter(r => r.doctor._id.toString() === user.id.toString());
            } else if (user.role === 'patient') {
                records = records.filter(r => r.patient._id.toString() === user.id.toString());
            }

            this.logAccess(user, 'read_all', 'multiple', true, `Filtered for ${user.role}`);

            // 返回脱敏后的数据
            return records.map(record => this.sanitizeData(record, user));
        } catch (error) {
            console.error('[Proxy Error]', error.message);
            throw error;
        }
    }

    /**
     * 代理方法：创建记录
     */
    async createRecord(data, user) {
        try {
            // 只有医生和管理员可以创建记录
            if (user.role === 'patient') {
                this.logAccess(user, 'create', 'new', false, 'Patients cannot create records');
                throw new Error('Access denied: Patients cannot create medical records');
            }

            // 确保医生只能以自己的名义创建记录
            if (user.role === 'doctor') {
                data.doctor = user.id;
            }

            const record = await this.service.createRecord(data);
            this.logAccess(user, 'create', record._id, true, `Record created by ${user.role}`);

            return record;
        } catch (error) {
            console.error('[Proxy Error]', error.message);
            throw error;
        }
    }

    /**
     * 代理方法：更新记录
     */
    async updateRecord(recordId, data, user) {
        try {
            const record = await this.service.getRecord(recordId);
            
            if (!record) {
                this.logAccess(user, 'update', recordId, false, 'Record not found');
                throw new Error('Record not found');
            }

            const permission = this.checkPermission(user, record, 'update');
            this.logAccess(user, 'update', recordId, permission.allowed, permission.reason);

            if (!permission.allowed) {
                throw new Error(`Access denied: ${permission.reason}`);
            }

            const updated = await this.service.updateRecord(recordId, data);
            return updated;
        } catch (error) {
            console.error('[Proxy Error]', error.message);
            throw error;
        }
    }

    /**
     * 获取访问日志
     */
    getAccessLog(limit = 50) {
        return this.accessLog.slice(-limit);
    }

    /**
     * 获取安全统计
     */
    getSecurityStats() {
        const totalAccess = this.accessLog.length;
        const deniedAccess = this.accessLog.filter(log => !log.allowed).length;
        const byRole = this.accessLog.reduce((acc, log) => {
            acc[log.userRole] = (acc[log.userRole] || 0) + 1;
            return acc;
        }, {});

        return {
            totalAccess,
            deniedAccess,
            successRate: totalAccess > 0 ? ((totalAccess - deniedAccess) / totalAccess * 100).toFixed(2) + '%' : 'N/A',
            accessByRole: byRole
        };
    }
}

// 用户数据访问代理
class UserDataProxy {
    constructor(userService) {
        this.service = userService;
    }

    /**
     * 脱敏用户数据
     */
    sanitizeUserData(userData, requester) {
        const sanitized = { ...userData };

        // 移除敏感字段
        delete sanitized.password;

        // 非管理员不能看到其他用户的完整信息
        if (requester.role !== 'admin' && requester.id !== userData._id.toString()) {
            delete sanitized.phone;
            delete sanitized.address;
            delete sanitized.dateOfBirth;
            delete sanitized.emergencyContact;
            delete sanitized.medicalHistory;
            delete sanitized.allergies;
        }

        return sanitized;
    }

    async getUser(userId, requester) {
        const user = await this.service.getUser(userId);
        return this.sanitizeUserData(user, requester);
    }
}

module.exports = {
    MedicalRecordService,
    MedicalRecordAccessProxy,
    UserDataProxy
};

