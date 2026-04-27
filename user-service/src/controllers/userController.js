const User = require('../models/User');

// Get User Profile
const getProfile = async (req, res) => {
    try {
        const { userId } = req.user;

        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile retrieved successfully',
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving profile',
            error: error.message,
        });
    }
};

// Get User by ID (for inter-service communication)
const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving user',
            error: error.message,
        });
    }
};

// Update User Profile
const updateProfile = async (req, res) => {
    try {
        const { userId } = req.user;
        const { firstName, lastName, phone, address, profilePhoto } = req.body;

        // Build update object with only provided fields
        const updateData = {};
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;
        if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;

        // Validate required fields if provided
        if (firstName && !firstName.trim()) {
            return res.status(400).json({
                success: false,
                message: 'First name cannot be empty',
            });
        }

        if (lastName && !lastName.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Last name cannot be empty',
            });
        }

        const updatedUser = await User.findOneAndUpdate(
            { userId },
            { ...updateData, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message,
        });
    }
};

// Verify Email
const verifyEmail = async (req, res) => {
    try {
        const { userId } = req.user;

        const user = await User.findOneAndUpdate(
            { userId },
            { isEmailVerified: true },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error verifying email',
            error: error.message,
        });
    }
};

// Deactivate Account
const deactivateAccount = async (req, res) => {
    try {
        const { userId } = req.user;

        const user = await User.findOneAndUpdate(
            { userId },
            { isActive: false },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Account deactivated successfully',
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deactivating account',
            error: error.message,
        });
    }
};

// Get User by Email (for inter-service communication)
const getUserByEmail = async (req, res) => {
    try {
        const { email } = req.params;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving user',
            error: error.message,
        });
    }
};

module.exports = {
    getProfile,
    getUserById,
    getUserByEmail,
    updateProfile,
    verifyEmail,
    deactivateAccount,
};
