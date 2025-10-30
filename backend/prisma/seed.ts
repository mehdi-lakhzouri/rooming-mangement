import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample sheets
  const sheet1 = await prisma.sheet.create({
    data: {
      name: 'Dormitory A',
      code: 'SDC-4376',
    },
  });

  const sheet2 = await prisma.sheet.create({
    data: {
      name: 'Dormitory B',
      code: 'SDC-7890',
    },
  });

  console.log('✅ Created sheets');

  // Create sample rooms
  await prisma.room.createMany({
    data: [
      {
        name: 'Room 1',
        capacity: 2,
        gender: 'MALE',
        sheetId: sheet1.id,
      },
      {
        name: 'Room 2',
        capacity: 6,
        gender: 'FEMALE',
        sheetId: sheet1.id,
      },
      {
        name: 'Room 3',
        capacity: 4,
        gender: 'FEMALE',
        sheetId: sheet1.id,
      },
      {
        name: 'Room 1',
        capacity: 4,
        gender: 'MALE',
        sheetId: sheet2.id,
      },
      {
        name: 'Room 2',
        capacity: 3,
        gender: 'MALE',
        sheetId: sheet2.id,
      },
    ],
  });

  console.log('✅ Created rooms');

  // Create sample users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        firstname: 'John',
        lastname: 'Doe',
      },
    }),
    prisma.user.create({
      data: {
        firstname: 'Jane',
        lastname: 'Smith',
      },
    }),
    prisma.user.create({
      data: {
        firstname: 'Alice',
        lastname: 'Johnson',
      },
    }),
    prisma.user.create({
      data: {
        firstname: 'Bob',
        lastname: 'Wilson',
      },
    }),
  ]);

  console.log('✅ Created users');

  // Get rooms to assign members
  const rooms = await prisma.room.findMany();
  
  // Create sample memberships
  await prisma.roomMember.create({
    data: {
      roomId: rooms[1].id, // Female room
      userId: users[1].id, // Jane
    },
  });

  await prisma.roomMember.create({
    data: {
      roomId: rooms[1].id, // Same female room
      userId: users[2].id, // Alice
    },
  });

  await prisma.roomMember.create({
    data: {
      roomId: rooms[0].id, // Male room
      userId: users[0].id, // John
    },
  });

  console.log('✅ Created room memberships');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });