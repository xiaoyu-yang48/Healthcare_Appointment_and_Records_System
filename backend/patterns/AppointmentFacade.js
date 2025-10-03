/**
 * Facade Pattern Implementation
 * 
 * 用途：为复杂的预约系统提供简化的统一接口
 * Why: 隐藏系统的复杂性，将多个子系统的操作组合成简单的接口
 */

/**
 * 预约系统外观类
 * 整合了预约创建、验证、通知、日程更新等多个子系统
 */
class AppointmentFacade {
    constructor(dependencies) {
        this.appointmentModel = dependencies.appointmentModel;
        this.userModel = dependencies.userModel;
        this.scheduleModel = dependencies.scheduleModel;
        this.noticeModel = dependencies.noticeModel;
        this.notificationCenter = dependencies.notificationCenter;
    }

    /**
     * 完整的预约创建流程
     * 这个方法整合了多个步骤，对外提供简单接口
     */
    async createAppointmentComplete(appointmentData, patientUser) {
        console.log('[Facade] Starting complete appointment creation process...');

        try {
            // Step 1: 验证医生
            console.log('[Facade] Step 1: Validating doctor...');
            const doctor = await this.validateDoctor(appointmentData.doctorId);

            // Step 2: 检查时间槽可用性
            console.log('[Facade] Step 2: Checking time slot availability...');
            await this.checkTimeSlotAvailability(
                appointmentData.doctorId,
                appointmentData.date,
                appointmentData.timeSlot
            );

            // Step 3: 检查患者冲突
            console.log('[Facade] Step 3: Checking patient conflicts...');
            await this.checkPatientConflicts(
                patientUser.id,
                appointmentData.date,
                appointmentData.timeSlot
            );

            // Step 4: 创建预约
            console.log('[Facade] Step 4: Creating appointment...');
            const appointment = await this.createAppointment({
                patient: patientUser.id,
                doctor: appointmentData.doctorId,
                date: new Date(appointmentData.date),
                timeSlot: appointmentData.timeSlot,
                symptoms: appointmentData.symptoms,
                type: appointmentData.type || 'consultation'
            });

            // Step 5: 更新医生日程
            console.log('[Facade] Step 5: Updating doctor schedule...');
            await this.updateDoctorSchedule(
                appointmentData.doctorId,
                appointmentData.date,
                appointmentData.timeSlot,
                appointment._id
            );

            // Step 6: 发送通知
            console.log('[Facade] Step 6: Sending notifications...');
            await this.sendAppointmentNotifications({
                appointment,
                doctor,
                patient: patientUser,
                type: 'new_appointment'
            });

            // Step 7: 获取完整的预约信息
            console.log('[Facade] Step 7: Fetching complete appointment data...');
            const completeAppointment = await this.getCompleteAppointment(appointment._id);

            console.log('[Facade] Appointment creation completed successfully');

            return {
                success: true,
                message: 'Appointment created successfully',
                appointment: completeAppointment,
                notifications: {
                    doctorNotified: true,
                    patientNotified: true
                }
            };

        } catch (error) {
            console.error('[Facade] Appointment creation failed:', error.message);
            throw error;
        }
    }

    /**
     * 完整的预约取消流程
     */
    async cancelAppointmentComplete(appointmentId, cancellingUser, reason) {
        console.log('[Facade] Starting complete appointment cancellation process...');

        try {
            // Step 1: 获取预约详情
            console.log('[Facade] Step 1: Fetching appointment...');
            const appointment = await this.getCompleteAppointment(appointmentId);

            if (!appointment) {
                throw new Error('Appointment not found');
            }

            // Step 2: 验证权限
            console.log('[Facade] Step 2: Validating permissions...');
            this.validateCancellationPermission(appointment, cancellingUser);

            // Step 3: 更新预约状态
            console.log('[Facade] Step 3: Updating appointment status...');
            appointment.status = 'cancelled';
            appointment.cancellationReason = reason;
            appointment.cancelledBy = cancellingUser.id;
            appointment.cancelledAt = new Date();
            await appointment.save();

            // Step 4: 释放医生日程
            console.log('[Facade] Step 4: Releasing doctor schedule...');
            await this.releaseDoctorSchedule(
                appointment.doctor._id,
                appointment.date,
                appointment.timeSlot
            );

            // Step 5: 发送取消通知
            console.log('[Facade] Step 5: Sending cancellation notifications...');
            await this.sendCancellationNotifications({
                appointment,
                cancelledBy: cancellingUser,
                reason
            });

            console.log('[Facade] Appointment cancellation completed successfully');

            return {
                success: true,
                message: 'Appointment cancelled successfully',
                appointment
            };

        } catch (error) {
            console.error('[Facade] Appointment cancellation failed:', error.message);
            throw error;
        }
    }

    /**
     * 验证医生
     */
    async validateDoctor(doctorId) {
        const doctor = await this.userModel.findOne({
            _id: doctorId,
            role: 'doctor',
            isActive: true
        });

        if (!doctor) {
            throw new Error('Doctor not found or inactive');
        }

        return doctor;
    }

    /**
     * 检查时间槽可用性
     */
    async checkTimeSlotAvailability(doctorId, date, timeSlot) {
        const existingAppointment = await this.appointmentModel.findOne({
            doctor: doctorId,
            date: new Date(date),
            timeSlot,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingAppointment) {
            throw new Error('This time slot is already booked');
        }

        return true;
    }

    /**
     * 检查患者冲突
     */
    async checkPatientConflicts(patientId, date, timeSlot) {
        const patientConflict = await this.appointmentModel.findOne({
            patient: patientId,
            date: new Date(date),
            timeSlot,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (patientConflict) {
            throw new Error('You already have another appointment at this time');
        }

        return true;
    }

    /**
     * 创建预约
     */
    async createAppointment(data) {
        return await this.appointmentModel.create(data);
    }

    /**
     * 更新医生日程
     */
    async updateDoctorSchedule(doctorId, date, timeSlot, appointmentId) {
        const schedule = await this.scheduleModel.findOne({
            doctor: doctorId,
            date: new Date(date)
        });

        if (schedule) {
            const slot = schedule.timeSlots.find(s => s.time === timeSlot);
            if (slot) {
                slot.isAvailable = false;
                slot.appointmentId = appointmentId;
                await schedule.save();
            }
        }

        return schedule;
    }

    /**
     * 释放医生日程
     */
    async releaseDoctorSchedule(doctorId, date, timeSlot) {
        const schedule = await this.scheduleModel.findOne({
            doctor: doctorId,
            date: new Date(date)
        });

        if (schedule) {
            const slot = schedule.timeSlots.find(s => s.time === timeSlot);
            if (slot) {
                slot.isAvailable = true;
                slot.appointmentId = null;
                await schedule.save();
            }
        }

        return schedule;
    }

    /**
     * 发送预约通知
     */
    async sendAppointmentNotifications(data) {
        const notifications = [];

        try {
            // 通知医生
            if (this.notificationCenter) {
                await this.notificationCenter.notify('new_appointment', {
                    recipientId: data.doctor._id,
                    senderId: data.patient.id,
                    noticeType: 'appointment_request',
                    title: 'New Appointment Request',
                    content: `New appointment request from ${data.patient.name}`,
                    relatedId: data.appointment._id,
                    relatedType: 'appointment'
                });
                notifications.push('doctor_notified');
            }

            // 通知患者（确认）
            if (this.noticeModel) {
                await this.noticeModel.create({
                    recipientId: data.patient.id,
                    type: 'appointment_created',
                    title: 'Appointment Created',
                    content: `Your appointment with Dr. ${data.doctor.name} has been created`,
                    relatedId: data.appointment._id,
                    relatedType: 'appointment'
                });
                notifications.push('patient_notified');
            }

        } catch (error) {
            console.error('[Facade] Notification error:', error);
            // 通知失败不应该影响主流程
        }

        return notifications;
    }

    /**
     * 发送取消通知
     */
    async sendCancellationNotifications(data) {
        try {
            const recipientId = data.cancelledBy.role === 'doctor' 
                ? data.appointment.patient._id 
                : data.appointment.doctor._id;

            if (this.noticeModel) {
                await this.noticeModel.create({
                    recipientId: recipientId,
                    senderId: data.cancelledBy.id,
                    type: 'appointment_cancelled',
                    title: 'Appointment Cancelled',
                    content: `Appointment has been cancelled. Reason: ${data.reason || 'No reason provided'}`,
                    relatedId: data.appointment._id,
                    relatedType: 'appointment'
                });
            }
        } catch (error) {
            console.error('[Facade] Cancellation notification error:', error);
        }
    }

    /**
     * 获取完整的预约信息
     */
    async getCompleteAppointment(appointmentId) {
        return await this.appointmentModel.findById(appointmentId)
            .populate('doctor', 'name specialization department phone')
            .populate('patient', 'name phone email');
    }

    /**
     * 验证取消权限
     */
    validateCancellationPermission(appointment, user) {
        if (user.role === 'admin') {
            return true;
        }

        if (user.role === 'doctor' && appointment.doctor._id.toString() === user.id) {
            return true;
        }

        if (user.role === 'patient' && appointment.patient._id.toString() === user.id) {
            return true;
        }

        throw new Error('You do not have permission to cancel this appointment');
    }

    /**
     * 获取患者的所有预约（完整流程）
     */
    async getPatientAppointmentsComplete(patientId) {
        const appointments = await this.appointmentModel.find({ patient: patientId })
            .populate('doctor', 'name specialization department')
            .sort({ date: -1 });

        return {
            success: true,
            count: appointments.length,
            appointments,
            summary: this.getAppointmentSummary(appointments)
        };
    }

    /**
     * 获取预约摘要
     */
    getAppointmentSummary(appointments) {
        return {
            total: appointments.length,
            pending: appointments.filter(a => a.status === 'pending').length,
            confirmed: appointments.filter(a => a.status === 'confirmed').length,
            completed: appointments.filter(a => a.status === 'completed').length,
            cancelled: appointments.filter(a => a.status === 'cancelled').length
        };
    }
}

module.exports = AppointmentFacade;

