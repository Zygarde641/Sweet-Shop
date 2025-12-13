import { readFileSync } from 'fs';
import { join } from 'path';
import pool from '../config/database';

const initDatabase = async () => {
  try {
    const sql = readFileSync(join(__dirname, '../../migrations/001_initial_schema.sql'), 'utf-8');
    await pool.query(sql);
    console.log('Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

initDatabase();
