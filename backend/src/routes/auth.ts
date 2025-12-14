import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { OAuth2Client } from 'google-auth-library';
import { createUser, findUserByEmail } from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';

const router = Router();

// Initialize Google OAuth client
const googleClient = process.env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  : null;

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password, name } = req.body;

      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        res.status(400).json({ error: 'User with this email already exists' });
        return;
      }

      const hashedPassword = await hashPassword(password);
      const user = await createUser({
        email,
        password: hashedPassword,
        name,
      });

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password } = req.body;

      const user = await findUserByEmail(email);
      if (!user) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Google OAuth login endpoint
router.post(
  '/google',
  [body('token').notEmpty().withMessage('Token is required')],
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!googleClient) {
        res.status(503).json({ error: 'Google OAuth is not configured' });
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { token } = req.body;

      // Verify the Google token
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        res.status(401).json({ error: 'Invalid Google token' });
        return;
      }

      const { email, name, sub: googleId } = payload;

      if (!email) {
        res.status(400).json({ error: 'Email not provided by Google' });
        return;
      }

      // Check if user exists
      let user = await findUserByEmail(email);

      if (!user) {
        // Create new user with Google account
        const hashedPassword = await hashPassword(googleId + Date.now()); // Random password since they use Google
        user = await createUser({
          email,
          password: hashedPassword,
          name: name || email.split('@')[0],
        });
      }

      // Generate JWT token
      const jwtToken = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      res.json({
        message: 'Google login successful',
        token: jwtToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Google OAuth error:', error);
      res.status(500).json({ error: 'Google authentication failed' });
    }
  }
);

export default router;
