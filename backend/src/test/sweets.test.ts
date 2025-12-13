import request from 'supertest';
import app from '../index';
import { query } from '../config/database';
import { hashPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { UserRole } from '../models/User';

describe('Sweet Routes', () => {
  let adminToken: string;
  let userToken: string;
  let adminId: string;
  let userId: string;

  beforeEach(async () => {
    await query('TRUNCATE TABLE sweets CASCADE');
    await query('TRUNCATE TABLE users CASCADE');

    const adminPassword = await hashPassword('password123');
    const adminResult = await query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['admin@example.com', adminPassword, 'Admin User', UserRole.ADMIN]
    );
    adminId = adminResult.rows[0].id;
    adminToken = generateToken({
      userId: adminId,
      email: 'admin@example.com',
      role: UserRole.ADMIN,
    });

    const userPassword = await hashPassword('password123');
    const userResult = await query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['user@example.com', userPassword, 'Regular User', UserRole.USER]
    );
    userId = userResult.rows[0].id;
    userToken = generateToken({
      userId: userId,
      email: 'user@example.com',
      role: UserRole.USER,
    });
  });

  afterAll(async () => {
    await query('TRUNCATE TABLE sweets CASCADE');
    await query('TRUNCATE TABLE users CASCADE');
  });

  describe('POST /api/sweets', () => {
    it('should create a sweet as admin', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Chocolate Bar',
          category: 'Chocolate',
          price: 5.99,
          quantity: 100,
        });

      expect(response.status).toBe(201);
      expect(response.body.sweet).toHaveProperty('id');
      expect(response.body.sweet.name).toBe('Chocolate Bar');
    });

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Chocolate Bar',
          category: 'Chocolate',
          price: 5.99,
          quantity: 100,
        });

      expect(response.status).toBe(403);
    });

    it('should return 401 without token', async () => {
      const response = await request(app).post('/api/sweets').send({
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 5.99,
        quantity: 100,
      });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/sweets', () => {
    beforeEach(async () => {
      await query(
        'INSERT INTO sweets (name, category, price, quantity) VALUES ($1, $2, $3, $4)',
        ['Sweet 1', 'Category 1', 10.99, 50]
      );
      await query(
        'INSERT INTO sweets (name, category, price, quantity) VALUES ($1, $2, $3, $4)',
        ['Sweet 2', 'Category 2', 15.99, 30]
      );
    });

    it('should get all sweets', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.sweets).toHaveLength(2);
    });

    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/sweets');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/sweets/search', () => {
    beforeEach(async () => {
      await query(
        'INSERT INTO sweets (name, category, price, quantity) VALUES ($1, $2, $3, $4)',
        ['Chocolate Bar', 'Chocolate', 10.99, 50]
      );
      await query(
        'INSERT INTO sweets (name, category, price, quantity) VALUES ($1, $2, $3, $4)',
        ['Candy', 'Hard Candy', 5.99, 30]
      );
    });

    it('should search sweets by name', async () => {
      const response = await request(app)
        .get('/api/sweets/search?name=Chocolate')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.sweets.length).toBeGreaterThan(0);
      expect(response.body.sweets[0].name).toContain('Chocolate');
    });

    it('should search sweets by category', async () => {
      const response = await request(app)
        .get('/api/sweets/search?category=Chocolate')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.sweets.every((s: { category: string }) => s.category === 'Chocolate')).toBe(true);
    });

    it('should search sweets by price range', async () => {
      const response = await request(app)
        .get('/api/sweets/search?minPrice=5&maxPrice=10')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(
        response.body.sweets.every(
          (s: { price: number }) => s.price >= 5 && s.price <= 10
        )
      ).toBe(true);
    });
  });

  describe('PUT /api/sweets/:id', () => {
    let sweetId: string;

    beforeEach(async () => {
      const result = await query(
        'INSERT INTO sweets (name, category, price, quantity) VALUES ($1, $2, $3, $4) RETURNING id',
        ['Original Sweet', 'Category', 10.99, 50]
      );
      sweetId = result.rows[0].id;
    });

    it('should update sweet as admin', async () => {
      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Sweet',
          price: 15.99,
        });

      expect(response.status).toBe(200);
      expect(response.body.sweet.name).toBe('Updated Sweet');
      expect(response.body.sweet.price).toBe(15.99);
    });

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Sweet',
        });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    let sweetId: string;

    beforeEach(async () => {
      const result = await query(
        'INSERT INTO sweets (name, category, price, quantity) VALUES ($1, $2, $3, $4) RETURNING id',
        ['Sweet to Delete', 'Category', 10.99, 50]
      );
      sweetId = result.rows[0].id;
    });

    it('should delete sweet as admin', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      const getResponse = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(getResponse.body.sweets.find((s: { id: string }) => s.id === sweetId)).toBeUndefined();
    });

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });
});
