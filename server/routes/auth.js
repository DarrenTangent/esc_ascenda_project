const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');

// POST /api/auth/register
router.post('/register', validateUserRegistration, async (req, res) => {
    try {
        const { username, email, password, phoneNumber } = req.body;

        const newUser = await userService.registerUser({
            username,
            email,
            password,
            phoneNumber
        });

        // before email implementation
        console.log(`Verification token for ${email}: ${newUser.verificationToken}`);

        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please verify your email',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                phoneNumber: newUser.phoneNumber,
                isVerified: newUser.isVerified
            },

            // before email service implementation
            verificationToken: newUser.verificationToken
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Verification token is required'
            });
        }

        const user = await userService.verifyEmail(token);

        res.json({
            success: true,
            message: 'Email verified successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                phoneNumber: user.phoneNumber,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/auth/login
router.post('/login', validateUserLogin, async (req, res) => {
    try {
        const { email, password } = req.body;

        const loginResult = await userService.loginUser(email, password);

        res.json({
            success: true,
            message: 'Login successful',
            user: loginResult.user,
            token: loginResult.token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({
            success: false,
            error: error.message
        });
    }
});

// POST /apo/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        const user = await userService.resendVerificationEmail(email);

        console.log(`New verification token for ${email}: ${user.verificationToken}`);

        res.json({
            success: true,
            message: 'Verification email sent successfully',
            verificationToken: user.verificationToken
        });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/auth/me (protected route)
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        const decoded = userService.verifyToken(token);
        const user = await userService.getUserById(decoded.userId);

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logout successful'
    });
});

module.exports = router;