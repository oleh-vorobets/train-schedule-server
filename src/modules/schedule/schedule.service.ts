import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';

import { CreateScheduleDto } from './dtos/create-schedule.dto';
import { ScheduleQueryFilterDto } from './dtos/schedule-query-filter.dto';
import { UpdateScheduleDto } from './dtos/update-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll({
    skip,
    take,
    searchTerm,
    sortBy,
    sortOrder,
  }: ScheduleQueryFilterDto) {
    return this.prismaService.schedule.findMany({
      where: {
        OR: [
          { from: { contains: searchTerm, mode: 'insensitive' } },
          { to: { contains: searchTerm, mode: 'insensitive' } },
          { trainNumber: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      skip,
      take,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });
  }

  async findOne(id: string) {
    const schedule = await this.prismaService.schedule.findUnique({
      where: { id },
    });
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }
    return schedule;
  }

  async create(createScheduleDto: CreateScheduleDto) {
    return this.prismaService.schedule.create({
      data: createScheduleDto,
    });
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto) {
    const schedule = await this.prismaService.schedule.update({
      where: { id },
      data: { ...updateScheduleDto },
    });
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }
    return schedule;
  }

  async delete(id: string) {
    const deletedSchedule = await this.prismaService.schedule.delete({
      where: { id },
    });

    if (!deletedSchedule) {
      throw new NotFoundException('Schedule not found');
    }
    return deletedSchedule;
  }
}
