import supertest from 'supertest';
import app from '../src/app';

const request = supertest(app);

describe('Auth Tests', () => {
  describe('POST /api/v1/auth/register', () => {
    test('should register a new user successfully', async () => {
      const response = await request.post('/api/v1/auth/register').send({
        email: 'newuser@test.com',
        password: 'password123',
        name: 'New User',
        role: 'tenant',
        orgId: 'org-123',
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('newuser@test.com');
      expect(response.body.data.token).toBeDefined();
    });

    test('should fail with invalid email', async () => {
      const response = await request.post('/api/v1/auth/register').send({
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
        role: 'tenant',
        orgId: 'org-123',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should fail with duplicate email', async () => {
      // Create first user
      await request.post('/api/v1/auth/register').send({
        email: 'duplicate@test.com',
        password: 'password123',
        name: 'First User',
        role: 'tenant',
        orgId: 'org-123',
      });

      // Attempt to create second user with same email
      const response = await request.post('/api/v1/auth/register').send({
        email: 'duplicate@test.com',
        password: 'password456',
        name: 'Second User',
        role: 'tenant',
        orgId: 'org-456',
      });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request.post('/api/v1/auth/register').send({
        email: 'logintest@test.com',
        password: 'password123',
        name: 'Login Test',
        role: 'landlord',
        orgId: 'org-login',
      });
    });

    test('should login successfully with correct credentials', async () => {
      const response = await request.post('/api/v1/auth/login').send({
        email: 'logintest@test.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('logintest@test.com');
    });

    test('should fail with incorrect password', async () => {
      const response = await request.post('/api/v1/auth/login').send({
        email: 'logintest@test.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    test('should fail with non-existent email', async () => {
      const response = await request.post('/api/v1/auth/login').send({
        email: 'nonexistent@test.com',
        password: 'password123',
      });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });
});
