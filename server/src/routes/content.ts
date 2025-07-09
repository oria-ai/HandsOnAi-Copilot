import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Variant resolution service for skill tasks
const resolveSkillScreenVariant = (variants: any[], userProfile: any, part: string) => {
  // Find variants for this part (instructions or mission)
  const partVariants = variants.filter(v => v.part === part);
  
  if (partVariants.length === 0) {
    return null;
  }

  // Start with default variant (no targeting)
  let bestVariant = partVariants.find(v => !v.target_role && !v.target_level && !v.target_lang);
  
  // Find the most specific matching variant
  const matchingVariants = partVariants.filter((variant: any) => {
    if (variant.target_role && variant.target_role !== userProfile.role) return false;
    if (variant.target_level && variant.target_level !== userProfile.level) return false;
    if (variant.target_lang && variant.target_lang !== userProfile.language_preference) return false;
    return true;
  });

  if (matchingVariants.length > 0) {
    // Use the most specific variant (prioritize by number of matching criteria)
    bestVariant = matchingVariants.reduce((best: any, current: any) => {
      const bestScore = (best.target_role ? 1 : 0) + (best.target_level ? 1 : 0) + (best.target_lang ? 1 : 0);
      const currentScore = (current.target_role ? 1 : 0) + (current.target_level ? 1 : 0) + (current.target_lang ? 1 : 0);
      return currentScore > bestScore ? current : best;
    });
  }

  return bestVariant;
};

// GET /api/v1/content/steps/:stepId - Core content endpoint with personalization
router.get('/steps/:stepId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stepId = req.params.stepId;
    const user = req.user!;

    // Fetch step with all related data
    const step = await prisma.step.findUnique({
      where: { step_id: stepId },
      include: {
        module: true
      }
    });

    if (!step) {
      return res.status(404).json({ error: 'Step not found' });
    }

    // Build user profile for variant resolution
    const userProfile = {
      role: user.role,
      level: user.level,
      language_preference: user.language_preference
    };

    let response: any = {
      stepId: step.step_id,
      type: step.task_type,
      header: step.title,
      screens: []
    };

    // Handle different task types
    if (step.task_type === 'VIDEO') {
      // Fetch video content
      const videoContent = await prisma.videoStep.findUnique({
        where: { task_id: step.task_id }
      });

      if (videoContent) {
        response.screens = [{
          screenId: 1,
          order: 1,
          components: [{
            componentId: 1,
            type: 'VIDEO_DISPLAY',
            slot: 'main_content',
            content: {
              vimeo_url: videoContent.vimeo_url
            }
          }]
        }];
      }
    } else if (step.task_type === 'HANDSON') {
      // Fetch hands-on content
      const handsOnContent = await prisma.handsOnTask.findUnique({
        where: { task_id: step.task_id }
      });

      if (handsOnContent) {
        response.screens = [{
          screenId: 1,
          order: 1,
          components: [{
            componentId: 1,
            type: 'HANDSON_TASK',
            slot: 'main_content',
            content: {
              title: handsOnContent.title,
              has_download_file: handsOnContent.has_download_file,
              download_file_url: handsOnContent.download_file_url,
              cards_config: handsOnContent.cards_config
            }
          }]
        }];
      }
    } else if (step.task_type === 'SKILL') {
      // Fetch skill task screens and variants
      const skillScreens = await prisma.skillTaskScreen.findMany({
        where: { task_id: step.task_id },
        include: {
          variants: true
        },
        orderBy: { position: 'asc' }
      });

      response.screens = skillScreens.map(screen => {
        const instructionsVariant = resolveSkillScreenVariant(screen.variants, userProfile, 'instructions');
        const missionVariant = resolveSkillScreenVariant(screen.variants, userProfile, 'mission');

        const components = [];

        if (instructionsVariant) {
          components.push({
            componentId: `${screen.screen_id}_instructions`,
            type: 'INSTRUCTIONS',
            slot: 'top_panel',
            content: instructionsVariant.content
          });
        }

        if (missionVariant) {
          components.push({
            componentId: `${screen.screen_id}_mission`,
            type: missionVariant.content.type || 'QUESTION_MULTICHOICE',
            slot: 'main_content',
            content: missionVariant.content
          });
        }

        return {
          screenId: screen.screen_id,
          order: screen.position,
          components
        };
      });
    }

    res.json(response);
  } catch (error) {
    console.error('Error fetching step:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/content/modules - Get modules assigned to user's department
router.get('/modules', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;

    if (!user.dept_code) {
      return res.json([]);
    }

    // Get modules assigned to user's department
    const assignments = await prisma.departmentModuleAssignment.findMany({
      where: { dept_code: user.dept_code },
      include: {
        module: {
          include: {
            steps: {
              orderBy: { position: 'asc' },
              select: {
                step_id: true,
                title: true,
                task_type: true,
                position: true
              }
            }
          }
        }
      }
    });

    const modules = assignments.map(assignment => assignment.module);
    res.json(modules);
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/content/modules/:moduleId - Get specific module
router.get('/modules/:moduleId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const moduleId = req.params.moduleId;

    const module = await prisma.module.findUnique({
      where: { module_id: moduleId },
      include: {
        steps: {
          orderBy: { position: 'asc' },
          select: {
            step_id: true,
            title: true,
            task_type: true,
            position: true
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
    const { step_id, progress_percent } = req.body;
    const user_id = req.user!.userId;

    const progress = await prisma.userProgress.upsert({
      where: {
        user_id_step_id: {
          user_id,
          step_id
        }
      },
      update: {
        progress_percent: progress_percent || 0
      },
      create: {
        user_id,
        step_id,
        progress_percent: progress_percent || 0
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
    const user_id = req.user!.userId;

    const progress = await prisma.userProgress.findMany({
      where: { user_id },
      include: {
        user: {
          select: {
            user_id: true,
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

// POST /api/v1/content/submissions - Submit task answer
router.post('/submissions', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { step_id, content } = req.body;
    const user_id = req.user!.userId;

    const submission = await prisma.taskSubmission.create({
      data: {
        user_id,
        step_id,
        content,
        submitted_at: new Date()
      }
    });

    res.status(201).json(submission);
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AUTHORING ENDPOINTS (for future implementation)

// GET /api/v1/content/authoring/modules - Get all modules for authoring
router.get('/authoring/modules', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    
    if (user.role !== 'AUTHOR') {
      return res.status(403).json({ error: 'Access denied. Authors only.' });
    }

    const modules = await prisma.module.findMany({
      include: {
        steps: {
          orderBy: { position: 'asc' }
        }
      }
    });

    res.json(modules);
  } catch (error) {
    console.error('Error fetching modules for authoring:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
