import { faker } from '@faker-js/faker';
import { BadRequestException, Logger } from '@nestjs/common';

import { PrismaClient, Schedule } from '../../../prisma/generated';

const prisma = new PrismaClient();

async function seeder() {
  try {
    Logger.log('Started seeding DB');

    type ScheduleDataType = Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>;

    const schedulesData: ScheduleDataType[] = Array.from({ length: 40 }).map(
      () => {
        const startTime = faker.date.future();
        const arrivalTime = new Date(
          startTime.getTime() + (Math.random() * (3 - 1) + 1) * 60 * 60 * 1000,
        ); // Random delay between 1 and 3 hours
        return {
          from: faker.location.city(),
          to: faker.location.city(),
          trainNumber: faker.string.alphanumeric({ length: 4 }),
          arrivalTime,
          startTime,
        };
      },
    );

    await prisma.$transaction([prisma.schedule.deleteMany()]);

    await prisma.schedule.createMany({
      data: schedulesData,
    });

    Logger.log('Schedules are created');
  } catch (err) {
    Logger.log(err);
    throw new BadRequestException('Error while seeding DB');
  } finally {
    await prisma.$disconnect();
  }
}

seeder();
