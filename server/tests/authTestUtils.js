const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Test data directory - integrate with existing test setup
const TEST_DATA_DIR = path.join(__dirname, '../test-data');
const TEST_USERS_FILE = path.join(TEST_DATA_DIR, 'test-users.json');

class AuthTestUtils {
    static testSession = {
        users: [],
        tokens: []
    };

    static async setupAuthTestEnvironment() {
        try {
            await fs.mkdir(TEST_DATA_DIR, { recursive: true });
        } catch (error) {
            // Directory already exists, that's fine
        }

        // Initialize empty users file for auth tests
        await fs.writeFile(TEST_USERS_FILE, JSON.stringify([], null, 2));
        
        // Reset session data
        this.testSession.users = [];
        this.testSession.tokens = [];
        
        console.log('Auth test environment setup complete');
    }

    static async cleanupAuthTestEnvironment() {
        try {
            // Clean up test users file
            await fs.unlink(TEST_USERS_FILE);
            
            // If using MongoDB in tests, you would add cleanup here:
            // const mongoose = require('mongoose');
            // if (mongoose.connection.readyState === 1) {
            //     await mongoose.connection.db.collection('users').deleteMany({
            //         email: { $regex: /@test\.com$|@example\.com$/ }
            //     });
            // }
            
        } catch (error) {
            // File doesn't exist or other cleanup error, that's fine
        }
        
        // Reset session data
        this.testSession.users = [];
        this.testSession.tokens = [];
        
        console.log('Auth test environment cleanup complete');
    }

    static getTestUsersFilePath() {
        return TEST_USERS_FILE;
    }

    static generateValidUser(overrides = {}) {
        // Generate unique email for each test to avoid conflicts
        const randomId = crypto.randomBytes(4).toString('hex');
        const baseUser = {
            email: `test.${randomId}@example.com`,
            password: 'SecurePass123!',
            confirmPassword: 'SecurePass123!', // Add confirm password for registration
            firstName: 'Test',
            lastName: 'User',
            ...overrides
        };
        
        // Store in session for cleanup
        this.testSession.users.push(baseUser.email);
        
        return baseUser;
    }

    static generateInvalidUsers() {
        const randomId = crypto.randomBytes(4).toString('hex');
        
        return [
            {
                name: 'missing email',
                data: { 
                    password: 'SecurePass123!', 
                    confirmPassword: 'SecurePass123!',
                    firstName: 'Test', 
                    lastName: 'User' 
                }
            },
            {
                name: 'invalid email format',
                data: { 
                    email: 'invalid-email', 
                    password: 'SecurePass123!',
                    confirmPassword: 'SecurePass123!', 
                    firstName: 'Test', 
                    lastName: 'User' 
                }
            },
            {
                name: 'weak password',
                data: { 
                    email: `weak.test.${randomId}@example.com`, 
                    password: 'weak',
                    confirmPassword: 'weak', 
                    firstName: 'Test', 
                    lastName: 'User' 
                }
            },
            {
                name: 'password mismatch',
                data: { 
                    email: `mismatch.test.${randomId}@example.com`, 
                    password: 'SecurePass123!',
                    confirmPassword: 'DifferentPass123!', 
                    firstName: 'Test', 
                    lastName: 'User' 
                }
            },
            {
                name: 'missing firstName',
                data: { 
                    email: `missing.first.${randomId}@example.com`, 
                    password: 'SecurePass123!',
                    confirmPassword: 'SecurePass123!', 
                    lastName: 'User' 
                }
            },
            {
                name: 'missing lastName',
                data: { 
                    email: `missing.last.${randomId}@example.com`, 
                    password: 'SecurePass123!',
                    confirmPassword: 'SecurePass123!', 
                    firstName: 'Test' 
                }
            },
            {
                name: 'empty strings',
                data: { 
                    email: '', 
                    password: '',
                    confirmPassword: '', 
                    firstName: '', 
                    lastName: '' 
                }
            }
        ];
    }

    static generateMultipleValidUsers(count = 3) {
        return Array.from({ length: count }, (_, i) => {
            const randomId = crypto.randomBytes(4).toString('hex');
            return this.generateValidUser({
                email: `user${i + 1}.${randomId}@example.com`,
                firstName: `User${i + 1}`,
                lastName: `Test${i + 1}`
            });
        });
    }

    static async waitForAsync(ms = 100) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Helper method to generate test JWT tokens
    static generateTestToken(userPayload) {
        try {
            const jwt = require('jsonwebtoken');
            const token = jwt.sign(
                userPayload,
                process.env.JWT_SECRET || 'test-secret-key',
                { expiresIn: '1h' }
            );
            
            this.testSession.tokens.push(token);
            return token;
        } catch (error) {
            console.warn('JWT not available for token generation:', error.message);
            return 'mock-jwt-token';
        }
    }

    // Helper to create a complete user workflow for testing
    static async createVerifiedTestUser() {
        const userData = this.generateValidUser();
        return {
            userData,
            // In a real test, you'd call your registration endpoint here
            // and return the verification token, then verify the user
            mockVerificationToken: crypto.randomBytes(32).toString('hex'),
            mockUserId: crypto.randomBytes(12).toString('hex')
        };
    }

    // Helper to validate email format
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Helper to validate password strength
    static isValidPassword(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }

    // Get current test session info
    static getTestSession() {
        return { ...this.testSession };
    }

    // Reset test session
    static resetTestSession() {
        this.testSession.users = [];
        this.testSession.tokens = [];
    }
}

module.exports = AuthTestUtils;