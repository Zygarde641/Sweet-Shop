import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { query } from './config/database';
import authRoutes from './routes/auth';
import sweetRoutes from './routes/sweets';
import inventoryRoutes from './routes/inventory';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Allow multiple origins for CORS (production + local dev)
const allowedOrigins = [
  FRONTEND_URL,
  'https://sweet-shop-sigma.vercel.app',
  'http://localhost:5173',
].filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Sweet Shop API is running' });
});

// Initialize database schema on startup (only if tables don't exist)
const initializeDatabase = async () => {
  try {
    // Check if users table exists
    const result = await query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )`
    );

    if (!result.rows[0].exists) {
      console.log('Initializing database schema...');
      
      // Embedded SQL schema (avoids file system issues in production)
      const schemaSQL = `
        -- Create users table
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        -- Create sweets table
        CREATE TABLE IF NOT EXISTS sweets (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          category VARCHAR(255) NOT NULL,
          price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
          quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_sweets_category ON sweets(category);
        CREATE INDEX IF NOT EXISTS idx_sweets_name ON sweets(name);
      `;
      
      // Execute each statement separately for better error handling
      const statements = schemaSQL.split(';').filter(s => s.trim().length > 0);
      for (const statement of statements) {
        if (statement.trim()) {
          await query(statement.trim());
        }
      }
      
      console.log('✅ Database schema initialized successfully!');
    } else {
      console.log('✅ Database schema already exists.');
    }
    
    // Always check and create default admin user if it doesn't exist
    try {
      const { hashPassword } = require('./utils/password');
      const adminEmail = 'admin@sweetshop.com';
      const adminPassword = 'admin123';
      const adminName = 'Admin User';
      
      // Check if admin exists
      const adminCheck = await query('SELECT id FROM users WHERE email = $1', [adminEmail]);
      
      if (adminCheck.rows.length === 0) {
        const hashedPassword = await hashPassword(adminPassword);
        await query(
          `INSERT INTO users (email, password, name, role, created_at, updated_at)
           VALUES ($1, $2, $3, 'admin', NOW(), NOW())`,
          [adminEmail, hashedPassword, adminName]
        );
        console.log('✅ Default admin user created!');
        console.log('   Email: admin@sweetshop.com');
        console.log('   Password: admin123');
      } else {
        console.log('✅ Admin user already exists.');
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
      // Don't exit - let the server start anyway
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    // Don't exit - let the server start anyway
  }
};

// Initialize database before starting server
initializeDatabase();

app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetRoutes);
app.use('/api/sweets', inventoryRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
