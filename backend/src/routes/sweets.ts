import { Router, Response } from 'express';
import { body, validationResult, query as queryValidator } from 'express-validator';
import { AuthRequest, authenticate, requireAdmin } from '../middleware/auth';
import {
  createSweet,
  findAllSweets,
  findSweetById,
  searchSweets,
  updateSweet,
  deleteSweet,
} from '../models/Sweet';

const router = Router();

router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
    body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { name, category, price, quantity } = req.body;
      const sweet = await createSweet({ name, category, price, quantity });

      res.status(201).json({
        message: 'Sweet created successfully',
        sweet,
      });
    } catch (error) {
      console.error('Create sweet error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.get(
  '/',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const sweets = await findAllSweets();
      res.json({ sweets });
    } catch (error) {
      console.error('Get sweets error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.get(
  '/search',
  authenticate,
  [
    queryValidator('name').optional().trim(),
    queryValidator('category').optional().trim(),
    queryValidator('minPrice').optional().isFloat({ min: 0 }),
    queryValidator('maxPrice').optional().isFloat({ min: 0 }),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const filters: {
        name?: string;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
      } = {};

      if (req.query.name) filters.name = req.query.name as string;
      if (req.query.category) filters.category = req.query.category as string;
      if (req.query.minPrice) filters.minPrice = parseFloat(req.query.minPrice as string);
      if (req.query.maxPrice) filters.maxPrice = parseFloat(req.query.maxPrice as string);

      const sweets = await searchSweets(filters);
      res.json({ sweets });
    } catch (error) {
      console.error('Search sweets error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  [
    body('name').optional().trim().isLength({ min: 1 }),
    body('category').optional().trim().isLength({ min: 1 }),
    body('price').optional().isFloat({ min: 0 }),
    body('quantity').optional().isInt({ min: 0 }),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { id } = req.params;
      const updateData = req.body;

      const sweet = await updateSweet(id, updateData);

      if (!sweet) {
        res.status(404).json({ error: 'Sweet not found' });
        return;
      }

      res.json({
        message: 'Sweet updated successfully',
        sweet,
      });
    } catch (error) {
      console.error('Update sweet error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const deleted = await deleteSweet(id);

      if (!deleted) {
        res.status(404).json({ error: 'Sweet not found' });
        return;
      }

      res.json({ message: 'Sweet deleted successfully' });
    } catch (error) {
      console.error('Delete sweet error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
