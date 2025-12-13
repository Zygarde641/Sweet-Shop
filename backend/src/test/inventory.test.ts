import request from 'supertest';
import app from '../index';
import { query } from '../config/database';
import { hashPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { UserRole } from '../models/User';

describe('Inventory Routes', () => {
  let adminToken: string;
  let userToken: string;
  let sweetId: string;

  beforeEach(async () => {
    await query('TRUNCATE TABLE sweets CASCADE');
    await query('TRUNCATE TABLE users CASCADE');

    const adminPassword = await hashPassword('password123');
    const adminResult = await query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['admin@example.com', adminPassword, 'Admin User', UserRole.ADMIN]
    );
    adminToken = generateToken({
      userId: adminResult.rows[0].id,
      email: 'admin@example.com',
      role: UserRole.ADMIN,
    });

    const userPassword = await hashPassword('password123');
    const userResult = await query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['user@example.com', userPassword, 'Regular User', UserRole.USER]
    );
    userToken = generateToken({
      userId: userResult.rows[0].id,
      email: 'user@example.com',
      role: UserRole.USER,
    });

    const sweetResult = await query(
      'INSERT INTO sweets (name, category, price, quantity) VALUES ($1, $2, $3, $4) RETURNING id',
      ['Test Sweet', 'Category', 10.99, 100]
    );
    sweetId = sweetResult.rows[0].id;
  });

  afterAll(async () => {
    await query('TRUNCATE TABLE sweets CASCADE');
    await query('TRUNCATE TABLE users CASCADE');
  });

  describe('POST /api/sweets/:id/purchase', () => {
    it('should purchase sweet and decrease quantity', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 10 });

      expect(response.status).toBe(200);
      expect(response.body.sweet.quantity).toBe(90);
    });

    it('should return 400 for insufficient quantity', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 200 });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Insufficient');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .send({ quantity: 10 });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/sweets/:id/restock', () => {
    it('should restock sweet as admin', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 50 });

      expect(response.status).toBe(200);
      expect(response.body.sweet.quantity).toBe(150);
    });

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 50 });

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent sweet', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .post(`/api/sweets/${fakeId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 50 });

      expect(response.status).toBe(404);
    });
  });
});
