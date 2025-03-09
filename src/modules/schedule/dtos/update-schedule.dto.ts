import { Transform } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateScheduleDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  @IsOptional()
  from?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  @IsOptional()
  to?: string;

  @IsNotEmpty()
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  startTime?: Date;

  @IsNotEmpty()
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  arrivalTime?: Date;

  @IsNotEmpty()
  @IsString()
  @Length(4, 4, {
    message: 'Train number have to contain 4 letters or numbers',
  })
  @IsOptional()
  trainNumber?: string;
}
