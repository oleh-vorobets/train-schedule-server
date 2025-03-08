import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Schedule } from 'prisma/generated';

export class ScheduleQueryFilterDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  skip?: number = 0;

  @IsOptional()
  @IsInt()
  @Min(1)
  take?: number = 10;

  @IsOptional()
  @IsString()
  searchTerm?: string = '';

  @IsOptional()
  @IsString()
  sortBy?: keyof Schedule = 'startTime';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}
