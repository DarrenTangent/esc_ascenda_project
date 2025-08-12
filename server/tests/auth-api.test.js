const request = require('supertest');
const AuthTestUtils = require('./authTestUtils');

const app = require('../index'); 

describe('Authentication API Integration Tests', () => {
  // Add a longer timeout for database operations
  jest.setTimeout(10000);

  beforeEach(async () => {
    // Ensure clean state before each test
    await AuthTestUtils.cleanupAuthTestEnvironment();
    await AuthTestUtils.setupAuthTestEnvironment();
  });

  afterEach(async () => {
    await AuthTestUtils.cleanupAuthTestEnvironment();
  });

  describe('POST /api/auth/register', () => {
    test('should register user with valid data', async () => {
      const userData = AuthTestUtils.generateValidUser();
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.password).toBeUndefined();
      expect(response.body.verificationToken).toBeDefined();
    });

    test('should return 400 for invalid registration data', async () => {
      const invalidUsers = AuthTestUtils.generateInvalidUsers();
      
      for (const { name, data } of invalidUsers) {
        const response = await request(app)
          .post('/api/auth/register')
          .send(data);
        
        // Should be either 400 (validation error) or 409 (duplicate email)
        // Both are acceptable for "invalid" data scenarios
        expect([400, 409]).toContain(response.status);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
        
        console.log(`${name}: ${response.status} - ${response.body.error}`);
      }
    });

    test('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should return 409 for duplicate email', async () => {
      const userData = AuthTestUtils.generateValidUser();
      
      // Register user first time
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
      
      // Try to register same user again
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already exists');
    });
  });

  describe('POST /api/auth/verify-email', () => {
    test('should verify email with valid token', async () => {
      const userData = AuthTestUtils.generateValidUser();
      
      // Register user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
      
      const { verificationToken } = registerResponse.body;
      
      // Verify email
      const verifyResponse = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: verificationToken })
        .expect(200);
      
      expect(verifyResponse.body.success).toBe(true);
      expect(verifyResponse.body.message).toBe('Email verified successfully');
    });

    test('should return 400 for invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'invalid-token' })
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid verification token');
    });

    test('should return 400 for missing token', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({})
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login verified user successfully', async () => {
      const userData = AuthTestUtils.generateValidUser();
      
      // Register user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
      
      // Verify user
      await request(app)
        .post('/api/auth/verify-email')
        .send({ token: registerResponse.body.verificationToken })
        .expect(200);
      
      // Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);
      
      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.token).toBeDefined();
      expect(loginResponse.body.user.email).toBe(userData.email);
      expect(loginResponse.body.user.password).toBeUndefined();
    }); 

    test('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'wrongpassword'
        })
        .expect(401);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid credentials');
    });

    test('should return 401 for unverified user', async () => {
      const userData = AuthTestUtils.generateValidUser();
      
      // Register but don't verify
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
      
      // Attempt login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(401);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Please verify your email before logging in');
    });

    test('should validate required login fields', async () => {
      // Missing email
      const response1 = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password' })
        .expect(400);
      
      // Missing password
      const response2 = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400);
      
      expect(response1.body.success).toBe(false);
      expect(response2.body.success).toBe(false);
    });
  });
});