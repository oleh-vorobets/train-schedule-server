import { Transform } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateScheduleDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  from: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  to: string;

  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  startTime: Date;

  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  arrivalTime: Date;

  @IsNotEmpty()
  @IsString()
  @Length(4, 4, {
    message: 'Train number have to contain 4 letters or numbers',
  })
  trainNumber: string;
}
