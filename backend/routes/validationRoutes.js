// Validation Routes - Demonstrating Chain of Responsibility Pattern
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    ValidationChainBuilder, 
    createValidationMiddleware 
} = require('../patterns/ValidationChain');

// Example endpoint with login validation chain
router.post('/validate-login',
    createValidationMiddleware(ValidationChainBuilder.createLoginChain()),
    async (req, res) => {
        res.json({
            success: true,
            message: 'Login validation passed',
            data: req.body
        });
    }
);

// Example endpoint with registration validation chain
router.post('/validate-registration',
    createValidationMiddleware(ValidationChainBuilder.createRegistrationChain()),
    async (req, res) => {
        res.json({
            success: true,
            message: 'Registration validation passed',
            data: req.body
        });
    }
);

// Example endpoint with appointment validation chain
router.post('/validate-appointment',
    protect,
    createValidationMiddleware(ValidationChainBuilder.createAppointmentChain()),
    async (req, res) => {
        res.json({
            success: true,
            message: 'Appointment validation passed',
            data: req.body
        });
    }
);

// Example endpoint with admin validation chain
router.post('/validate-admin',
    protect,
    createValidationMiddleware(ValidationChainBuilder.createAdminChain()),
    async (req, res) => {
        res.json({
            success: true,
            message: 'Admin validation passed',
            user: req.user
        });
    }
);

module.exports = router;