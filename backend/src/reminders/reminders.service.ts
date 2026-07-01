import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// import { ReminderFrequency } from '@prisma/client';

@Injectable()
export class RemindersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: any) {
    const { title, description, frequency, nextRun } = data;
    return this.prisma.reminder.create({
      data: {
        title,
        description,
        frequency,
        nextRun: new Date(nextRun),
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.reminder.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: any) {
    if (data.nextRun) {
      data.nextRun = new Date(data.nextRun);
    }
    return this.prisma.reminder.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.reminder.delete({
      where: { id },
    });
  }

  async findDueReminders() {
    return this.prisma.reminder.findMany({
      where: {
        isActive: true,
        nextRun: {
          lte: new Date(),
        },
      },
    });
  }
}
