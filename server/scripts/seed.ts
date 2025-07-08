import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create users with different roles and profiles
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'oria@gmail.com',
        password: await bcrypt.hash('1234', 10),
        name: 'Oria',
        role: 'AUTHOR',
        department: 'development',
        copilotLanguage: 'hebrew',
        aiKnowledgeLevel: 3
      }
    }),
    prisma.user.create({
      data: {
        email: 'aya@company.com',
        password: await bcrypt.hash('password', 10),
        name: 'Aya Cohen',
        role: 'LEARNER',
        department: 'marketing',
        copilotLanguage: 'hebrew',
        aiKnowledgeLevel: 1
      }
    }),
    prisma.user.create({
      data: {
        email: 'yaniv@company.com',
        password: await bcrypt.hash('password', 10),
        name: 'Yaniv Manager',
        role: 'MANAGER',
        department: 'marketing',
        copilotLanguage: 'hebrew',
        aiKnowledgeLevel: 2
      }
    }),
    prisma.user.create({
      data: {
        email: 'john@company.com',
        password: await bcrypt.hash('password', 10),
        name: 'John Smith',
        role: 'LEARNER',
        department: 'IT',
        copilotLanguage: 'english',
        aiKnowledgeLevel: 2
      }
    })
  ]);

  console.log('✅ Created users');

  // Create modules
  const wordModule = await prisma.module.create({
    data: {
      title: 'קופיילוט עם Word',
      description: 'למד כיצד להשתמש בקופיילוט ב-Microsoft Word',
      iconPath: '/icons/word.svg'
    }
  });

  const excelModule = await prisma.module.create({
    data: {
      title: 'קופיילוט עם Excel',
      description: 'למד כיצד להשתמש בקופיילוט ב-Microsoft Excel',
      iconPath: '/icons/excel.svg'
    }
  });

  console.log('✅ Created modules');

  // Create steps for Word module
  const videoStep = await prisma.step.create({
    data: {
      moduleId: wordModule.id,
      order: 1,
      title: 'מבוא לקופיילוט ב-Word',
      type: 'VIDEO'
    }
  });

  const skillStep = await prisma.step.create({
    data: {
      moduleId: wordModule.id,
      order: 2,
      title: 'שיפור פרומפט',
      type: 'SKILL'
    }
  });

  const handsOnStep = await prisma.step.create({
    data: {
      moduleId: wordModule.id,
      order: 3,
      title: 'תרגול מעשי',
      type: 'HANDSON'
    }
  });

  console.log('✅ Created steps');

  // Create screens for video step
  const videoScreen = await prisma.taskScreen.create({
    data: {
      stepId: videoStep.id,
      order: 1
    }
  });

  // Create video component
  const videoComponent = await prisma.screenComponent.create({
    data: {
      screenId: videoScreen.id,
      componentType: 'VIDEO_DISPLAY',
      slot: 'main_content',
      defaultContent: {
        videoUrl: 'https://player.vimeo.com/video/1086753235?badge=0&autopause=0&player_id=0&app_id=58479',
        title: 'מבוא לקופיילוט ב-Word',
        description: 'למד את היסודות של קופיילוט ב-Word'
      }
    }
  });

  // Create screens for skill step
  const skillScreen1 = await prisma.taskScreen.create({
    data: {
      stepId: skillStep.id,
      order: 1
    }
  });

  const skillScreen2 = await prisma.taskScreen.create({
    data: {
      stepId: skillStep.id,
      order: 2
    }
  });

  // Create instructions component with variants
  const instructionsComponent = await prisma.screenComponent.create({
    data: {
      screenId: skillScreen1.id,
      componentType: 'INSTRUCTIONS',
      slot: 'top_panel',
      defaultContent: {
        text: 'בחר את האלמנטים החסרים בפרומפט הבא:'
      }
    }
  });

  // Create variant for marketing role
  await prisma.componentVariant.create({
    data: {
      componentId: instructionsComponent.id,
      targetRole: 'marketing',
      variantContent: {
        text: 'כמומחה שיווק, בחר את האלמנטים החסרים בפרומפט הבא כדי ליצור תוכן שיווקי יעיל:'
      }
    }
  });

  // Create variant for IT role
  await prisma.componentVariant.create({
    data: {
      componentId: instructionsComponent.id,
      targetRole: 'IT',
      variantContent: {
        text: 'כמומחה IT, בחר את האלמנטים החסרים בפרומפט הבא כדי ליצור תיעוד טכני מדויק:'
      }
    }
  });

  // Create multiple choice question component
  const questionComponent = await prisma.screenComponent.create({
    data: {
      screenId: skillScreen1.id,
      componentType: 'QUESTION_MULTICHOICE',
      slot: 'main_content',
      defaultContent: {
        questionText: 'אילו אלמנטים חסרים בפרומפט?',
        options: ['הקשר', 'מטרה', 'תפקיד', 'מוטיבציה'],
        correctAnswers: [0, 1, 2]
      }
    }
  });

  // Create variant for different AI knowledge levels
  await prisma.componentVariant.create({
    data: {
      componentId: questionComponent.id,
      targetAiKnowledgeLevel: 1,
      variantContent: {
        questionText: 'אילו אלמנטים חסרים בפרומפט? (רמה בסיסית)',
        options: ['הקשר', 'מטרה', 'תפקיד'],
        correctAnswers: [0, 1, 2],
        hint: 'פרומפט טוב צריך להכיל הקשר, מטרה ותפקיד'
      }
    }
  });

  // Create open question for screen 2
  const openQuestionComponent = await prisma.screenComponent.create({
    data: {
      screenId: skillScreen2.id,
      componentType: 'QUESTION_OPEN',
      slot: 'main_content',
      defaultContent: {
        questionText: 'כתוב פרומפט משופר עבור המשימה הבאה:',
        placeholder: 'הכנס את הפרומפט המשופר כאן...',
        systemPrompt: 'אנא הערך את הפרומפט שהמשתמש כתב ותן משוב בונה'
      }
    }
  });

  // Create variant for Hebrew language
  await prisma.componentVariant.create({
    data: {
      componentId: openQuestionComponent.id,
      targetCopilotLanguage: 'hebrew',
      variantContent: {
        questionText: 'כתוב פרומפט משופר בעברית עבור המשימה הבאה:',
        placeholder: 'הכנס את הפרומפט המשופר בעברית כאן...',
        systemPrompt: 'אנא הערך את הפרומפט בעברית שהמשתמש כתב ותן משוב בונה בעברית'
      }
    }
  });

  console.log('✅ Created screens and components with variants');

  // Create some sample progress
  await prisma.userProgress.createMany({
    data: [
      {
        userId: users[1].id, // Aya
        stepId: videoStep.id,
        status: 'COMPLETED',
        progressPercent: 100,
        lastScreen: 1
      },
      {
        userId: users[1].id, // Aya
        stepId: skillStep.id,
        status: 'IN_PROGRESS',
        progressPercent: 50,
        lastScreen: 1
      },
      {
        userId: users[3].id, // John
        stepId: videoStep.id,
        status: 'IN_PROGRESS',
        progressPercent: 75,
        lastScreen: 1
      }
    ]
  });

  console.log('✅ Created sample progress');

  // Create some sample events
  await prisma.userEvent.createMany({
    data: [
      {
        userId: users[1].id,
        moduleId: wordModule.id,
        stepId: videoStep.id,
        screenId: videoScreen.id,
        eventType: 'VIDEO_PLAY',
        eventData: { timestamp: 0 }
      },
      {
        userId: users[1].id,
        moduleId: wordModule.id,
        stepId: videoStep.id,
        screenId: videoScreen.id,
        eventType: 'VIDEO_COMPLETE',
        eventData: { duration: 300 }
      },
      {
        userId: users[1].id,
        moduleId: wordModule.id,
        stepId: skillStep.id,
        screenId: skillScreen1.id,
        eventType: 'SCREEN_VIEW',
        eventData: { viewDuration: 45 }
      }
    ]
  });

  console.log('✅ Created sample events');

  console.log('🎉 Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Users: ${users.length}`);
  console.log(`- Modules: 2`);
  console.log(`- Steps: 3`);
  console.log(`- Screens: 3`);
  console.log(`- Components: 4`);
  console.log(`- Variants: 4`);
  console.log('\n🔑 Test accounts:');
  console.log('- Author: oria@gmail.com / 1234');
  console.log('- Learner: aya@company.com / password');
  console.log('- Manager: yaniv@company.com / password');
  console.log('- IT Learner: john@company.com / password');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
