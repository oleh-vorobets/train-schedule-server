import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { SignUpDto } from 'src/modules/auth/dtos/sign-up.dto';

@Injectable()
export class PasswordMatchPipe implements PipeTransform {
  transform(value: SignUpDto, metadata: ArgumentMetadata) {
    if (value.password !== value.repeatPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    return value;
  }
}
