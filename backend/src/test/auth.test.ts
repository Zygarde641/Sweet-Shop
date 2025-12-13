import request from 'supertest';
import app from '../index';
import { query } from '../config/database';
import { hashPassword } from '../utils/password';
import { UserRole } from '../models/User';

describe('Auth Routes', () => {
  beforeEach(async () => {
    await query('TRUNCATE TABLE users CASCADE');
  });

  afterAll(async () => {
    await query('TRUNCATE TABLE users CASCADE');
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.role).toBe(UserRole.USER);
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 for short password', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: '12345',
        name: 'Test User',
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 for duplicate email', async () => {
      await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Another User',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const hashedPassword = await hashPassword('password123');
      await query(
        'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)',
        ['test@example.com', hashedPassword, 'Test User', UserRole.USER]
      );
    });

    it('should login with valid credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should return 401 for invalid email', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'wrong@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(401);
    });

    it('should return 401 for invalid password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
    });
  });
});
