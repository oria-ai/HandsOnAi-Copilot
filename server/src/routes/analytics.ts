import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/v1/analytics/events - Log user events
router.post('/events', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { event_type, step_id, screen_id, event_data } = req.body;
    const user_id = req.user!.userId;

    // Validate required fields
    if (!event_type || !step_id) {
      return res.status(400).json({ error: 'event_type and step_id are required' });
    }

    // Create event record
    const event = await prisma.userEvent.create({
      data: {
        user_id,
        event_type,
        step_id,
        screen_id: screen_id || null,
        event_data: event_data || null
      }
    });

    res.status(201).json({ success: true, eventId: event.event_id });
  } catch (error) {
    console.error('Error logging event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/analytics/events - Get user events (for debugging/admin)
router.get('/events', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user_id = req.user!.userId;
    const { limit = 100, offset = 0 } = req.query;

    const events = await prisma.userEvent.findMany({
      where: { user_id },
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
