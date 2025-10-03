/**
 * Factory Pattern Implementation
 * 
 * 用途：根据不同角色创建不同类型的用户对象
 * Why: 封装用户创建逻辑，根据角色返回不同配置的用户对象
 */

class UserFactory {
    /**
     * 创建用户对象
     * @param {String} role - 用户角色 (patient|doctor|admin)
     * @param {Object} userData - 用户数据
     * @returns {Object} 配置好的用户对象
     */
    static createUser(role, userData) {
        switch (role) {
            case 'patient':
                return this.createPatient(userData);
            case 'doctor':
                return this.createDoctor(userData);
            case 'admin':
                return this.createAdmin(userData);
            default:
                throw new Error(`Invalid user role: ${role}`);
        }
    }

    /**
     * 创建患者对象
     */
    static createPatient(userData) {
        return {
            ...userData,
            role: 'patient',
            emergencyContact: userData.emergencyContact || {},
            medicalHistory: userData.medicalHistory || [],
            allergies: userData.allergies || [],
            // 患者特有的默认配置
            permissions: ['view_appointments', 'create_appointments', 'view_own_records'],
            appointmentLimit: 5 // 患者每天最多预约次数
        };
    }

    /**
     * 创建医生对象
     */
    static createDoctor(userData) {
        return {
            ...userData,
            role: 'doctor',
            specialization: userData.specialization || 'General',
            department: userData.department || 'General Medicine',
            licenseNumber: userData.licenseNumber || '',
            experience: userData.experience || 0,
            education: userData.education || '',
            bio: userData.bio || '',
            // 医生特有的默认配置
            permissions: [
                'view_appointments',
                'manage_appointments',
                'create_records',
                'view_all_records',
                'manage_schedule'
            ],
            maxAppointmentsPerDay: 20 // 医生每天最多接诊数
        };
    }

    /**
     * 创建管理员对象
     */
    static createAdmin(userData) {
        return {
            ...userData,
            role: 'admin',
            // 管理员特有的默认配置
            permissions: [
                'view_all_users',
                'manage_users',
                'view_all_appointments',
                'manage_all_appointments',
                'view_all_records',
                'manage_system_settings',
                'view_statistics',
                'manage_doctors'
            ],
            accessLevel: 'full' // 完全访问权限
        };
    }

    /**
     * 验证用户数据完整性
     * @param {String} role - 用户角色
     * @param {Object} userData - 用户数据
     * @returns {Object} 验证结果
     */
    static validateUserData(role, userData) {
        const commonRequired = ['name', 'email', 'password'];
        const roleSpecific = {
            doctor: ['specialization', 'department'],
            patient: [],
            admin: []
        };

        const requiredFields = [...commonRequired, ...(roleSpecific[role] || [])];
        const missingFields = requiredFields.filter(field => !userData[field]);

        if (missingFields.length > 0) {
            return {
                valid: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            };
        }

        return { valid: true };
    }
}

module.exports = UserFactory;

