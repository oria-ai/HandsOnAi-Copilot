import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/v1/analytics/events - Log user events
router.post('/events', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { eventType, moduleId, stepId, screenId, eventData } = req.body;
    const userId = req.user!.userId;

    // Validate required fields
    if (!eventType || !moduleId || !stepId) {
      return res.status(400).json({ error: 'eventType, moduleId, and stepId are required' });
    }

    // Create event record
    const event = await prisma.userEvent.create({
      data: {
        userId,
        eventType,
        moduleId: parseInt(moduleId),
        stepId: parseInt(stepId),
        screenId: screenId ? parseInt(screenId) : null,
        eventData: eventData || null
      }
    });

    res.status(201).json({ success: true, eventId: event.id });
  } catch (error) {
    console.error('Error logging event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/analytics/events - Get user events (for debugging/admin)
router.get('/events', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { limit = 100, offset = 0 } = req.query;

    const events = await prisma.userEvent.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
