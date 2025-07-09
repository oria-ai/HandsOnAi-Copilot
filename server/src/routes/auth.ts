import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Register endpoint
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role = 'LEARNER', dept_code, language_preference, level = 1 } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate user ID
    const user_id = `user_${Date.now()}`;

    // Create user
    const user = await prisma.user.create({
      data: {
        user_id,
        email,
        password_hash: hashedPassword,
        name,
        role,
        dept_code,
        language_preference,
        level
      }
    });

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        email: user.email, 
        role: user.role,
        dept_code: user.dept_code,
        language_preference: user.language_preference,
        level: user.level
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        role: user.role,
        dept_code: user.dept_code,
        language_preference: user.language_preference,
        level: user.level
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        email: user.email, 
        role: user.role,
        dept_code: user.dept_code,
        language_preference: user.language_preference,
        level: user.level
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        role: user.role,
        dept_code: user.dept_code,
        language_preference: user.language_preference,
        level: user.level
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
