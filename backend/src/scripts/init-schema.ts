import pool from '../config/database';
import { readFileSync } from 'fs';
import { join } from 'path';

const initSchema = async () => {
  try {
    const sql = readFileSync(
      join(__dirname, '../../migrations/001_initial_schema.sql'),
      'utf-8'
    );
    
    await pool.query(sql);
    console.log('✅ Database schema initialized successfully!');
    process.exit(0);
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      console.log('✅ Database schema already exists. Skipping initialization.');
      process.exit(0);
    }
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

initSchema();

