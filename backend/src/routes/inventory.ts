import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest, authenticate, requireAdmin } from '../middleware/auth';
import { findSweetById, purchaseSweet, restockSweet, releaseSweet } from '../models/Sweet';

const router = Router();

router.post(
  '/:id/purchase',
  authenticate,
  [body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer')],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { id } = req.params;
      const { quantity } = req.body;

      const sweet = await findSweetById(id);
      if (!sweet) {
        res.status(404).json({ error: 'Sweet not found' });
        return;
      }

      if (sweet.quantity < quantity) {
        res.status(400).json({ error: 'Insufficient quantity available' });
        return;
      }

      const updatedSweet = await purchaseSweet(id, quantity);

      if (!updatedSweet) {
        res.status(400).json({ error: 'Purchase failed. Insufficient quantity.' });
        return;
      }

      res.json({
        message: 'Purchase successful',
        sweet: updatedSweet,
      });
    } catch (error) {
      console.error('Purchase error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.post(
  '/:id/restock',
  authenticate,
  requireAdmin,
  [body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer')],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { id } = req.params;
      const { quantity } = req.body;

      const sweet = await findSweetById(id);
      if (!sweet) {
        res.status(404).json({ error: 'Sweet not found' });
        return;
      }

      const updatedSweet = await restockSweet(id, quantity);

      if (!updatedSweet) {
        res.status(404).json({ error: 'Sweet not found' });
        return;
      }

      res.json({
        message: 'Restock successful',
        sweet: updatedSweet,
      });
    } catch (error) {
      console.error('Restock error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.post(
  '/:id/release',
  authenticate,
  [body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer')],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { id } = req.params;
      const { quantity } = req.body;

      const sweet = await findSweetById(id);
      if (!sweet) {
        res.status(404).json({ error: 'Sweet not found' });
        return;
      }

      const updatedSweet = await releaseSweet(id, quantity);

      if (!updatedSweet) {
        res.status(404).json({ error: 'Sweet not found' });
        return;
      }

      res.json({
        message: 'Stock released successfully',
        sweet: updatedSweet,
      });
    } catch (error) {
      console.error('Release error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
