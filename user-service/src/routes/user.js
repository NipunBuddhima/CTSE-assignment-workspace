const express = require('express');
const { body } = require('express-validator');
const {
    getProfile,
    getUserById,
    getUserByEmail,
    updateProfile,
    verifyEmail,
    deactivateAccount,
} = require('../controllers/userController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Get own profile (Protected)
router.get('/profile', authenticateToken, getProfile);

// Update profile (Protected)
router.put(
    '/profile',
    authenticateToken,
    [
        body('firstName').optional().trim().notEmpty(),
        body('lastName').optional().trim().notEmpty(),
        body('phone').optional().trim(),
    ],
    updateProfile
);

// Verify email (Protected)
router.post('/verify-email', authenticateToken, verifyEmail);

// Deactivate account (Protected)
router.post('/deactivate', authenticateToken, deactivateAccount);

// Get user by ID (For inter-service communication - no auth required for service-to-service)
router.get('/id/:userId', getUserById);

// Get user by email (For inter-service communication - no auth required for service-to-service)
router.get('/email/:email', getUserByEmail);

module.exports = router;
