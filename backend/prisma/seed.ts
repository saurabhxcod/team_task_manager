import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const hashedPassword = await bcrypt.hash('Password123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@team.com' },
    update: {},
    create: {
      email: 'admin@team.com',
      name: 'Admin User',
      password: hashedPassword,
    },
  });

  const member1 = await prisma.user.upsert({
    where: { email: 'member1@team.com' },
    update: {},
    create: {
      email: 'member1@team.com',
      name: 'Alice Member',
      password: hashedPassword,
    },
  });

  const member2 = await prisma.user.upsert({
    where: { email: 'member2@team.com' },
    update: {},
    create: {
      email: 'member2@team.com',
      name: 'Bob Member',
      password: hashedPassword,
    },
  });

  const member3 = await prisma.user.upsert({
    where: { email: 'member3@team.com' },
    update: {},
    create: {
      email: 'member3@team.com',
      name: 'Charlie Member',
      password: hashedPassword,
    },
  });

  // Create Projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Corporate Branding Sync',
      description: 'Unified brand identity rollout across all digital assets and internal systems.',
      color: '#6366f1',
      owner_id: admin.id,
      members: {
        create: [
          { user_id: admin.id, role: 'ADMIN' },
          { user_id: member1.id, role: 'MEMBER' },
          { user_id: member2.id, role: 'MEMBER' }
        ]
      }
    }
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'TaskSync API v2.0',
      description: 'Major infrastructure upgrade to support real-time collaboration and webhooks.',
      color: '#10b981',
      owner_id: admin.id,
      members: {
        create: [
          { user_id: admin.id, role: 'ADMIN' },
          { user_id: member3.id, role: 'MEMBER' }
        ]
      }
    }
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Client Portal Dashboard',
      description: 'Customer-facing interface for project tracking and reporting.',
      color: '#f59e0b',
      owner_id: admin.id,
      members: {
        create: [
          { user_id: admin.id, role: 'ADMIN' },
          { user_id: member1.id, role: 'MEMBER' }
        ]
      }
    }
  });

  // Create Tasks for Project 1
  const project1Tasks = [
    { title: 'Finalize Color Palette', status: 'Done', priority: 'High', assignee: member1.id },
    { title: 'Draft Brand Guidelines', status: 'Review', priority: 'Medium', assignee: member2.id },
    { title: 'Social Media Asset Pack', status: 'In Progress', priority: 'Medium', assignee: member1.id },
    { title: 'Stakeholder Review Meeting', status: 'Todo', priority: 'High', assignee: admin.id },
  ];

  for (const t of project1Tasks) {
    await prisma.task.create({
      data: {
        title: t.title,
        status: t.status,
        priority: t.priority,
        project_id: project1.id,
        creator_id: admin.id,
        assignee_id: t.assignee,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
  }

  // Create Tasks for Project 2
  const project2Tasks = [
    { title: 'Redis Migration', status: 'Done', priority: 'High', assignee: member3.id },
    { title: 'Webhook Documentation', status: 'In Progress', priority: 'Low', assignee: member3.id },
    { title: 'Auth Service Refactoring', status: 'Todo', priority: 'High', assignee: member3.id },
  ];

  for (const t of project2Tasks) {
    await prisma.task.create({
      data: {
        title: t.title,
        status: t.status,
        priority: t.priority,
        project_id: project2.id,
        creator_id: admin.id,
        assignee_id: t.assignee,
        due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // Overdue
      }
    });
  }

  // Create Tasks for Project 3
  const project3Tasks = [
    { title: 'Data Visualization Research', status: 'Todo', priority: 'Medium', assignee: member1.id },
    { title: 'User Interface Mockups', status: 'Todo', priority: 'High', assignee: member1.id },
  ];

  for (const t of project3Tasks) {
    await prisma.task.create({
      data: {
        title: t.title,
        status: t.status,
        priority: t.priority,
        project_id: project3.id,
        creator_id: admin.id,
        assignee_id: t.assignee,
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      }
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
