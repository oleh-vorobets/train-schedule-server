import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { Auth } from 'src/shared/decorators/auth.decorator';

import { CreateScheduleDto } from './dtos/create-schedule.dto';
import { ScheduleQueryFilterDto } from './dtos/schedule-query-filter.dto';
import { UpdateScheduleDto } from './dtos/update-schedule.dto';
import { ScheduleService } from './schedule.service';

@Controller('schedule')
@Auth()
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async getAll(
    @Query(new ValidationPipe({ transform: true }))
    query: ScheduleQueryFilterDto,
  ) {
    return this.scheduleService.findAll(query);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.scheduleService.findOne(id);
  }

  @Post()
  async create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.scheduleService.create(createScheduleDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.scheduleService.update(id, updateScheduleDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.scheduleService.delete(id);
  }
}
