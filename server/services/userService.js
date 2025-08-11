const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class UserService {
    constructor() {
        this.usersPath = path.join(__dirname, '..', 'data', 'users.json');
        this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-this';
        this.initializeUsersFile();
    }

    // Initialize users.json file if it doesn't exist
    initializeUsersFile() {
        if (!fs.existsSync(this.usersPath)) {
            fs.writeFileSync(this.usersPath, JSON.stringify([], null, 2));
        }
    }

    // Load users from JSON file
    loadUsers() {
        try {
            const data = fs.readFileSync(this.usersPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading users:', error);
            return [];
        }
    }

    // Save users to JSON file
    saveUsers(users) {
        try {
            fs.writeFileSync(this.usersPath, JSON.stringify(users, null, 2));
        } catch (error) {
            console.error('Error saving users:', error);
            throw new Error('Failed to save user data');
        }
    }

    // Generate verification token
    generateVerificationToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    // Register new user
    async registerUser(userData) {
        const { username, email, password, phoneNumber } = userData;
        
        // Validate required fields
        if (!username || !email || !password || !phoneNumber) {
            throw new Error('All fields are required');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }

        // Load existing users
        const users = this.loadUsers();

        // Check if user already exists
        const existingUser = users.find(user => 
            user.email === email || user.username === username
        );
        
        if (existingUser) {
            if (existingUser.email === email) {
                throw new Error('Email already registered');
            }
            if (existingUser.username === username) {
                throw new Error('Username already taken');
            }
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = {
            id: crypto.randomUUID(),
            username,
            email,
            password: hashedPassword,
            phoneNumber,
            isVerified: false,
            verificationToken: this.generateVerificationToken(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Add to users array and save
        users.push(newUser);
        this.saveUsers(users);

        // Return user without password
        const { password: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    // Verify email with token
    async verifyEmail(token) {
        const users = this.loadUsers();
        const userIndex = users.findIndex(user => user.verificationToken === token);
        
        if (userIndex === -1) {
            throw new Error('Invalid or expired verification token');
        }

        // Mark user as verified
        users[userIndex].isVerified = true;
        users[userIndex].verificationToken = null;
        users[userIndex].updatedAt = new Date().toISOString();
        
        this.saveUsers(users);
        
        const { password, ...userWithoutPassword } = users[userIndex];
        return userWithoutPassword;
    }

    // Login user
    async loginUser(email, password) {
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        const users = this.loadUsers();
        const user = users.find(u => u.email === email);
        
        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        // Check if email is verified
        if (!user.isVerified) {
            throw new Error('Please verify your email before logging in');
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            this.jwtSecret,
            { expiresIn: '7d' }
        );

        const { password: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            token
        };
    }

    // Get user by ID
    async getUserById(userId) {
        const users = this.loadUsers();
        const user = users.find(u => u.id === userId);
        
        if (!user) {
            throw new Error('User not found');
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    // Resend verification email
    async resendVerificationEmail(email) {
        const users = this.loadUsers();
        const userIndex = users.findIndex(u => u.email === email);
        
        if (userIndex === -1) {
            throw new Error('User not found');
        }

        if (users[userIndex].isVerified) {
            throw new Error('User is already verified');
        }

        // Generate new verification token
        users[userIndex].verificationToken = this.generateVerificationToken();
        users[userIndex].updatedAt = new Date().toISOString();
        
        this.saveUsers(users);

        const { password, ...userWithoutPassword } = users[userIndex];
        return userWithoutPassword;
    }

    // Verify JWT token
    verifyToken(token) {
        try {
            return jwt.verify(token, this.jwtSecret);
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }
}

module.exports = new UserService();