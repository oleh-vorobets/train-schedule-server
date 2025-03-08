import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(private readonly prismaService: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async deleteExpiredTokens() {
    try {
      const result = await this.prismaService.token.deleteMany({
        where: { expiresIn: { lt: new Date() } },
      });

      this.logger.log(`Deleted ${result.count} expired tokens.`);
    } catch (error) {
      this.logger.error('Error deleting expired tokens:', error);
    }
  }
}
