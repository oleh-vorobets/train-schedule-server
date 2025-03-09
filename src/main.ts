import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';

import { CoreModule } from './core/core.module';

async function bootstrap() {
  const app = await NestFactory.create(CoreModule);

  const config = app.get(ConfigService);

  app.use(cookieParser());

  app.enableCors({
    origin: config.getOrThrow<string>('ALLOWED_ORIGIN'),
    credentials: true,
    exposedHeaders: ['set-cookie'],
  });

  app.useGlobalPipes(new ValidationPipe());
  app.use(helmet());
  app.setGlobalPrefix('api/v1');

  console.log(
    '---SECURE: ',
    config.getOrThrow<string>('NODE_ENV') === 'production',
  );

  //Response extension
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setCookie = (name: string, value: string, options = {}) => {
      res.cookie(name, value, {
        httpOnly: true,
        secure: config.getOrThrow<string>('NODE_ENV') === 'production',
        sameSite: 'none',
        ...options,
      });
    };
    next();
  });

  await app.listen(config.getOrThrow<number>('APP_PORT'));
}
bootstrap();
