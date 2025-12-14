import dotenv from 'dotenv';
import { query } from '../config/database';
import { hashPassword } from '../utils/password';
import { UserRole } from '../models/User';

dotenv.config();

const createAdmin = async () => {
  try {
    const adminEmail = 'admin@sweetshop.com';
    const adminPassword = 'admin123';
    const adminName = 'Admin User';

    // Check if admin already exists
    const existingAdmin = await query(
      'SELECT id FROM users WHERE email = $1',
      [adminEmail]
    );

    if (existingAdmin.rows.length > 0) {
      console.log('Admin user already exists!');
      console.log('Email:', adminEmail);
      console.log('Password:', adminPassword);
      return;
    }

    // Create admin user
    const hashedPassword = await hashPassword(adminPassword);
    await query(
      `INSERT INTO users (email, password, name, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [adminEmail, hashedPassword, adminName, UserRole.ADMIN]
    );

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin Credentials:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin().then(() => process.exit(0));
