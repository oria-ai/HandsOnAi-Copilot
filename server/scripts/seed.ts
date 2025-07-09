import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create departments
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { dept_code: 'marketing' },
      update: {},
      create: {
        dept_code: 'marketing',
        name: 'Marketing Department'
      }
    }),
    prisma.department.upsert({
      where: { dept_code: 'IT' },
      update: {},
      create: {
        dept_code: 'IT',
        name: 'IT Department'
      }
    }),
    prisma.department.upsert({
      where: { dept_code: 'development' },
      update: {},
      create: {
        dept_code: 'development',
        name: 'Development Department'
      }
    })
  ]);

  console.log('✅ Created departments');

  // Create users with different roles and profiles
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'oria@gmail.com' },
      update: {},
      create: {
        user_id: 'user_oria',
        email: 'oria@gmail.com',
        password_hash: await bcrypt.hash('1234', 10),
        name: 'Oria',
        role: 'AUTHOR',
        dept_code: 'development',
        language_preference: 'hebrew',
        level: 3
      }
    }),
    prisma.user.upsert({
      where: { email: 'aya@company.com' },
      update: {},
      create: {
        user_id: 'user_aya',
        email: 'aya@company.com',
        password_hash: await bcrypt.hash('password', 10),
        name: 'Aya Cohen',
        role: 'LEARNER',
        dept_code: 'marketing',
        language_preference: 'hebrew',
        level: 1
      }
    }),
    prisma.user.upsert({
      where: { email: 'yaniv@company.com' },
      update: {},
      create: {
        user_id: 'user_yaniv',
        email: 'yaniv@company.com',
        password_hash: await bcrypt.hash('password', 10),
        name: 'Yaniv Manager',
        role: 'MANAGER',
        dept_code: 'marketing',
        language_preference: 'hebrew',
        level: 2
      }
    }),
    prisma.user.upsert({
      where: { email: 'john@company.com' },
      update: {},
      create: {
        user_id: 'user_john',
        email: 'john@company.com',
        password_hash: await bcrypt.hash('password', 10),
        name: 'John Smith',
        role: 'LEARNER',
        dept_code: 'IT',
        language_preference: 'english',
        level: 2
      }
    })
  ]);

  console.log('✅ Created users');

  // Create modules
  const wordModule = await prisma.module.upsert({
    where: { module_id: '01-word' },
    update: {},
    create: {
      module_id: '01-word',
      title: 'קופיילוט עם Word',
      position: 1
    }
  });

  const excelModule = await prisma.module.upsert({
    where: { module_id: '02-excel' },
    update: {},
    create: {
      module_id: '02-excel',
      title: 'קופיילוט עם Excel',
      position: 2
    }
  });

  console.log('✅ Created modules');

  // Assign modules to departments
  try {
    await prisma.departmentModuleAssignment.createMany({
      data: [
        { dept_code: 'marketing', module_id: '01-word' },
        { dept_code: 'marketing', module_id: '02-excel' },
        { dept_code: 'IT', module_id: '01-word' },
        { dept_code: 'development', module_id: '01-word' }
      ]
    });
  } catch (error) {
    // Ignore duplicate errors
    console.log('⚠️ Some assignments already exist, skipping...');
  }

  console.log('✅ Created department assignments');

  // Create steps for Word module
  const videoStep = await prisma.step.upsert({
    where: { step_id: 'word_v1' },
    update: {},
    create: {
      step_id: 'word_v1',
      module_id: '01-word',
      position: 1,
      title: 'מבוא לקופיילוט ב-Word',
      task_type: 'VIDEO',
      task_id: 'video_word_intro'
    }
  });

  const skillStep = await prisma.step.upsert({
    where: { step_id: 'word_s1' },
    update: {},
    create: {
      step_id: 'word_s1',
      module_id: '01-word',
      position: 2,
      title: 'שיפור פרומפט',
      task_type: 'SKILL',
      task_id: 'skill_prompt_improvement'
    }
  });

  const handsOnStep = await prisma.step.upsert({
    where: { step_id: 'word_h1' },
    update: {},
    create: {
      step_id: 'word_h1',
      module_id: '01-word',
      position: 3,
      title: 'תרגול מעשי',
      task_type: 'HANDSON',
      task_id: 'handson_word_practice'
    }
  });

  console.log('✅ Created steps');

  // Create video step content
  await prisma.videoStep.upsert({
    where: { task_id: 'video_word_intro' },
    update: {},
    create: {
      task_id: 'video_word_intro',
      vimeo_url: 'https://player.vimeo.com/video/1086753235?badge=0&autopause=0&player_id=0&app_id=58479'
    }
  });

  // Create hands-on task content
  await prisma.handsOnTask.upsert({
    where: { task_id: 'handson_word_practice' },
    update: {},
    create: {
      task_id: 'handson_word_practice',
      title: 'תרגול מעשי ב-Word',
      has_download_file: true,
      download_file_url: '/files/word_practice.docx',
      cards_config: {
        cards: [
          {
            title: 'משימה 1',
            description: 'צור מסמך חדש עם קופיילוט',
            instructions: 'השתמש בקופיילוט כדי ליצור מסמך מקצועי'
          },
          {
            title: 'משימה 2', 
            description: 'ערוך טקסט קיים',
            instructions: 'שפר את הטקסט הקיים באמצעות קופיילוט'
          }
        ]
      }
    }
  });

  // Create skill task screens and variants
  const skillScreen1 = await prisma.skillTaskScreen.create({
    data: {
      task_id: 'skill_prompt_improvement',
      position: 1
    }
  });

  const skillScreen2 = await prisma.skillTaskScreen.create({
    data: {
      task_id: 'skill_prompt_improvement',
      position: 2
    }
  });

  // Create variants for screen 1 - instructions
  await prisma.skillScreenVariant.createMany({
    data: [
      {
        screen_id: skillScreen1.screen_id,
        part: 'instructions',
        content: {
          text: 'בחר את האלמנטים החסרים בפרומפט הבא:'
        }
      },
      {
        screen_id: skillScreen1.screen_id,
        part: 'instructions',
        target_role: 'marketing',
        content: {
          text: 'כמומחה שיווק, בחר את האלמנטים החסרים בפרומפט הבא כדי ליצור תוכן שיווקי יעיל:'
        }
      },
      {
        screen_id: skillScreen1.screen_id,
        part: 'instructions',
        target_role: 'IT',
        content: {
          text: 'כמומחה IT, בחר את האלמנטים החסרים בפרומפט הבא כדי ליצור תיעוד טכני מדויק:'
        }
      }
    ]
  });

  // Create variants for screen 1 - mission (multiple choice question)
  await prisma.skillScreenVariant.createMany({
    data: [
      {
        screen_id: skillScreen1.screen_id,
        part: 'mission',
        content: {
          type: 'QUESTION_MULTICHOICE',
          questionText: 'אילו אלמנטים חסרים בפרומפט?',
          options: ['הקשר', 'מטרה', 'תפקיד', 'מוטיבציה'],
          correctAnswers: [0, 1, 2]
        }
      },
      {
        screen_id: skillScreen1.screen_id,
        part: 'mission',
        target_level: 1,
        content: {
          type: 'QUESTION_MULTICHOICE',
          questionText: 'אילו אלמנטים חסרים בפרומפט? (רמה בסיסית)',
          options: ['הקשר', 'מטרה', 'תפקיד'],
          correctAnswers: [0, 1, 2],
          hint: 'פרומפט טוב צריך להכיל הקשר, מטרה ותפקיד'
        }
      }
    ]
  });

  // Create variants for screen 2 - open question
  await prisma.skillScreenVariant.createMany({
    data: [
      {
        screen_id: skillScreen2.screen_id,
        part: 'instructions',
        content: {
          text: 'כתוב פרומפט משופר עבור המשימה הבאה:'
        }
      },
      {
        screen_id: skillScreen2.screen_id,
        part: 'mission',
        content: {
          type: 'QUESTION_OPEN',
          questionText: 'כתוב פרומפט משופר עבור המשימה הבאה:',
          placeholder: 'הכנס את הפרומפט המשופר כאן...',
          systemPrompt: 'אנא הערך את הפרומפט שהמשתמש כתב ותן משוב בונה'
        }
      },
      {
        screen_id: skillScreen2.screen_id,
        part: 'mission',
        target_lang: 'hebrew',
        content: {
          type: 'QUESTION_OPEN',
          questionText: 'כתוב פרומפט משופר בעברית עבור המשימה הבאה:',
          placeholder: 'הכנס את הפרומפט המשופר בעברית כאן...',
          systemPrompt: 'אנא הערך את הפרומפט בעברית שהמשתמש כתב ותן משוב בונה בעברית'
        }
      }
    ]
  });

  console.log('✅ Created skill task screens and variants');

  // Create some sample progress
  try {
    await prisma.userProgress.createMany({
      data: [
        {
          user_id: 'user_aya',
          step_id: 'word_v1',
          progress_percent: 100
        },
        {
          user_id: 'user_aya',
          step_id: 'word_s1',
          progress_percent: 50
        },
        {
          user_id: 'user_john',
          step_id: 'word_v1',
          progress_percent: 75
        }
      ]
    });
  } catch (error) {
    console.log('⚠️ Some progress already exists, skipping...');
  }

  console.log('✅ Created sample progress');

  // Create some sample events
  try {
    await prisma.userEvent.createMany({
      data: [
        {
          user_id: 'user_aya',
          step_id: 'word_v1',
          event_type: 'VIDEO_PLAY',
          event_data: { timestamp: 0 }
        },
        {
          user_id: 'user_aya',
          step_id: 'word_v1',
          event_type: 'VIDEO_COMPLETE',
          event_data: { duration: 300 }
        },
        {
          user_id: 'user_aya',
          step_id: 'word_s1',
          screen_id: skillScreen1.screen_id,
          event_type: 'SCREEN_VIEW',
          event_data: { viewDuration: 45 }
        }
      ]
    });
  } catch (error) {
    console.log('⚠️ Some events already exist, skipping...');
  }

  console.log('✅ Created sample events');

  console.log('🎉 Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Departments: ${departments.length}`);
  console.log(`- Users: ${users.length}`);
  console.log(`- Modules: 2`);
  console.log(`- Steps: 3`);
  console.log(`- Skill Screens: 2`);
  console.log(`- Variants: 8`);
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
