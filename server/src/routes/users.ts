import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/v1/users/profile - Get current user profile
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        email: true,
        name: true,
        role: true,
        dept_code: true,
        language_preference: true,
        level: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/v1/users/profile - Update current user profile
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name, dept_code, language_preference, level } = req.body;

    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      data: {
        name,
        dept_code,
        language_preference,
        level
      },
      select: {
        user_id: true,
        email: true,
        name: true,
        role: true,
        dept_code: true,
        language_preference: true,
        level: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/users - Get all users (Manager/Author only)
router.get('/', authenticateToken, requireRole(['MANAGER', 'AUTHOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        user_id: true,
        email: true,
        name: true,
        role: true,
        dept_code: true,
        language_preference: true,
        level: true
      }
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
