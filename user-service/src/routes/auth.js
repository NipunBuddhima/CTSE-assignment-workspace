const express = require('express');
const { body } = require('express-validator');
const { register, login, changePassword } = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Register Route
router.post(
    '/register',
    [
        body('firstName', 'First name is required').notEmpty().trim(),
        body('lastName', 'Last name is required').notEmpty().trim(),
        body('email', 'Valid email is required').isEmail().normalizeEmail(),
        body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
        body('confirmPassword', 'Confirm password is required').notEmpty(),
    ],
    register
);

// Login Route
router.post(
    '/login',
    [
        body('email', 'Valid email is required').isEmail().normalizeEmail(),
        body('password', 'Password is required').notEmpty(),
    ],
    login
);

// Change Password Route (Protected)
router.post(
    '/change-password',
    authenticateToken,
    [
        body('currentPassword', 'Current password is required').notEmpty(),
        body('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 }),
        body('confirmPassword', 'Confirm password is required').notEmpty(),
    ],
    changePassword
);

module.exports = router;
