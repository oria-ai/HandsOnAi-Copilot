import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Variant resolution service
const resolveComponentVariant = (component: any, userProfile: any) => {
  // Start with default content
  let resolvedContent = component.defaultContent;

  // Find the best matching variant
  const matchingVariants = component.variants.filter((variant: any) => {
    // Check if variant matches user profile
    if (variant.targetRole && variant.targetRole !== userProfile.role) return false;
    if (variant.targetAiKnowledgeLevel && variant.targetAiKnowledgeLevel !== userProfile.aiKnowledgeLevel) return false;
    if (variant.targetCopilotLanguage && variant.targetCopilotLanguage !== userProfile.copilotLanguage) return false;
    return true;
  });

  // Use the most specific variant (prioritize by number of matching criteria)
  if (matchingVariants.length > 0) {
    const bestVariant = matchingVariants.reduce((best: any, current: any) => {
      const bestScore = (best.targetRole ? 1 : 0) + (best.targetAiKnowledgeLevel ? 1 : 0) + (best.targetCopilotLanguage ? 1 : 0);
      const currentScore = (current.targetRole ? 1 : 0) + (current.targetAiKnowledgeLevel ? 1 : 0) + (current.targetCopilotLanguage ? 1 : 0);
      return currentScore > bestScore ? current : best;
    });
    
    resolvedContent = { ...resolvedContent, ...bestVariant.variantContent };
  }

  return {
    componentId: component.id,
    type: component.componentType,
    slot: component.slot,
    content: resolvedContent
  };
};

// GET /api/v1/content/steps/:stepId - Core content endpoint with personalization
router.get('/steps/:stepId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stepId = parseInt(req.params.stepId);
    const user = req.user!;

    // Fetch step with all related data
    const step = await prisma.step.findUnique({
      where: { id: stepId },
      include: {
        module: true,
        screens: {
          orderBy: { order: 'asc' },
          include: {
            components: {
              include: {
                variants: true
              }
            }
          }
        }
      }
    });

    if (!step) {
      return res.status(404).json({ error: 'Step not found' });
    }

    // Build user profile for variant resolution
    const userProfile = {
      role: user.role,
      aiKnowledgeLevel: user.aiKnowledgeLevel,
      copilotLanguage: user.copilotLanguage
    };

    // Resolve variants for all components
    const personalizedScreens = step.screens.map(screen => ({
      screenId: screen.id,
      order: screen.order,
      components: screen.components.map(component => 
        resolveComponentVariant(component, userProfile)
      )
    }));

    // Build response according to API contract
    const response = {
      stepId: step.id,
      type: step.type,
      header: step.title,
      screens: personalizedScreens
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching step:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/content/modules - Get all modules
router.get('/modules', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const modules = await prisma.module.findMany({
      include: {
        steps: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            type: true,
            order: true
          }
        }
      }
    });

    res.json(modules);
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/content/modules/:moduleId - Get specific module
router.get('/modules/:moduleId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const moduleId = parseInt(req.params.moduleId);

    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        steps: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            type: true,
            order: true
          }
        }
      }
    });

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    res.json(module);
  } catch (error) {
    console.error('Error fetching module:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/v1/content/progress - Update user progress
router.post('/progress', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { stepId, status, progressPercent, lastScreen } = req.body;
    const userId = req.user!.userId;

    const progress = await prisma.userProgress.upsert({
      where: {
        userId_stepId: {
          userId,
          stepId: parseInt(stepId)
        }
      },
      update: {
        status,
        progressPercent: progressPercent || 0,
        lastScreen: lastScreen || 1
      },
      create: {
        userId,
        stepId: parseInt(stepId),
        status: status || 'IN_PROGRESS',
        progressPercent: progressPercent || 0,
        lastScreen: lastScreen || 1
      }
    });

    res.json(progress);
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/content/progress - Get user progress
router.get('/progress', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const progress = await prisma.userProgress.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
