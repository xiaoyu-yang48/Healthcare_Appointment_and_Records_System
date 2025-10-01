const Appointment = require('../models/Appointment');
const User = require('../models/User');
const DoctorSchedule = require('../models/DoctorSchedule');
const Notice = require('../models/Notice');
const { getUserLanguage } = require('../utils/i18n');

// Get patient appointment list
const getPatientAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patient: req.user.id })
            .populate('doctor', 'name specialization department')
            .sort({ date: -1 });

        res.json(appointments);
    } catch (error) {
        console.error('Error getting patient appointments:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get doctor appointment list
const getDoctorAppointments = async (req, res) => {
    try {
        const { status, date } = req.query;
        let query = { doctor: req.user.id };

        if (status) {
            query.status = status;
        }

        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.date = { $gte: startDate, $lt: endDate };
        }

        const appointments = await Appointment.find(query)
            .populate('patient', 'name phone')
            .sort({ date: 1, timeSlot: 1 });

        res.json(appointments);
    } catch (error) {
        console.error('Error getting doctor appointments:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get today's appointments
const getTodayAppointments = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointments = await Appointment.find({
            doctor: req.user.id,
            date: { $gte: today, $lt: tomorrow }
        })
        .populate('patient', 'name phone')
        .sort({ timeSlot: 1 });

        res.json(appointments);
    } catch (error) {
        console.error('Error getting today\'s appointments:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create appointment
const createAppointment = async (req, res) => {
    try {
        const { doctorId, date, timeSlot, symptoms, type } = req.body;

        // Verify doctor exists
        const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Check if appointment time is available
        const existingAppointment = await Appointment.findOne({
            doctor: doctorId,
            date: new Date(date),
            timeSlot,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingAppointment) {
            return res.status(400).json({ message: 'This time slot is already booked' });
        }

        // Check if patient has another appointment at the same time
        const patientConflict = await Appointment.findOne({
            patient: req.user.id,
            date: new Date(date),
            timeSlot,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (patientConflict) {
            return res.status(400).json({ message: 'You already have another appointment at this time slot' });
        }

        const appointment = await Appointment.create({
            patient: req.user.id,
            doctor: doctorId,
            date: new Date(date),
            timeSlot,
            symptoms,
            type: type || 'consultation'
        });

        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('doctor', 'name specialization department')
            .populate('patient', 'name phone');

        // Create appointment request notification for doctor
        try {
            const language = getUserLanguage(req);
            await Notice.createAppointmentRequest(
                doctorId,
                req.user.id,
                appointment._id,
                req.user.name,
                language
            );
        } catch (noticeError) {
            console.error('Failed to create appointment notification:', noticeError);
            // Notification failure does not affect appointment creation
        }

        res.status(201).json({
            message: 'Appointment created successfully',
            appointment: populatedAppointment
        });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Verify permissions
        if (req.user.role === 'doctor' && appointment.doctor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'No permission to operate on this appointment' });
        }

        if (req.user.role === 'patient' && appointment.patient.toString() !== req.user.id) {
            return res.status(403).json({ message: 'No permission to operate on this appointment' });
        }

        appointment.status = status;
        if (notes) appointment.notes = notes;

        if (status === 'cancelled') {
            appointment.cancelledBy = req.user.id;
            appointment.cancelledAt = new Date();
        }

        await appointment.save();

        const updatedAppointment = await Appointment.findById(id)
            .populate('doctor', 'name specialization department')
            .populate('patient', 'name phone');

        // If status updated to confirmed, create confirmation notification for patient
        if (status === 'confirmed') {
            try {
                const language = getUserLanguage(req);
                await Notice.createAppointmentConfirmed(
                    appointment.patient,
                    req.user.id,
                    appointment._id,
                    req.user.name,
                    language
                );
            } catch (noticeError) {
                console.error('Failed to create confirmation notification:', noticeError);
                // Notification failure does not affect status update
            }
        }

        res.json({
            message: 'Appointment status updated successfully',
            appointment: updatedAppointment
        });
    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Verify permissions
        if (req.user.role === 'doctor' && appointment.doctor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'No permission to operate on this appointment' });
        }

        if (req.user.role === 'patient' && appointment.patient.toString() !== req.user.id) {
            return res.status(403).json({ message: 'No permission to operate on this appointment' });
        }

        // Check if can be cancelled
        if (appointment.status === 'cancelled' || appointment.status === 'completed') {
            return res.status(400).json({ message: 'This appointment cannot be cancelled' });
        }

        appointment.status = 'cancelled';
        appointment.cancellationReason = reason;
        appointment.cancelledBy = req.user.id;
        appointment.cancelledAt = new Date();

        await appointment.save();

        // Create cancellation notification
        try {
            const recipientId = req.user.role === 'doctor' ? appointment.patient : appointment.doctor;
            await Notice.createAppointmentCancelled(
                recipientId,
                req.user.id,
                appointment._id,
                req.user.name
            );
        } catch (noticeError) {
            console.error('Failed to create cancellation notification:', noticeError);
            // Notification failure does not affect cancellation
        }

        res.json({ message: 'Appointment cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get appointment details
const getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findById(id)
            .populate('doctor', 'name specialization department phone')
            .populate('patient', 'name phone address');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Verify permissions
        if (req.user.role === 'doctor' && appointment.doctor._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'No permission to view this appointment' });
        }

        if (req.user.role === 'patient' && appointment.patient._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'No permission to view this appointment' });
        }

        res.json(appointment);
    } catch (error) {
        console.error('Error getting appointment details:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getPatientAppointments,
    getDoctorAppointments,
    getTodayAppointments,
    createAppointment,
    updateAppointmentStatus,
    cancelAppointment,
    getAppointmentById
};