import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { ETokenType } from 'prisma/generated';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { parseDuration } from 'src/shared/utils/parse-duration.util';

import { SignInDto } from './dtos/sign-in.dto';
import { SignUpDto } from './dtos/sign-up.dto';
import { Tokens } from './types/token.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async signin({ email, password }: SignInDto): Promise<Tokens> {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User with such email is not found.');
    }

    if (!(await compare(password, user.password))) {
      throw new BadRequestException('Invalid email or password. Try again.');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    const refreshTokenId = await this.addRefreshToken(
      user.id,
      tokens.refreshToken,
    );

    return {
      accessToken: tokens.accessToken,
      refresh: { refreshToken: tokens.refreshToken, id: refreshTokenId },
    };
  }

  async signup({ email, password }: SignUpDto): Promise<Tokens> {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (user) {
      throw new BadRequestException('User is already registered.');
    }

    const hashedPassword = await this.hashData(password);

    const createdUser = await this.prismaService.user.create({
      data: { email, password: hashedPassword },
      omit: { password: true },
    });

    const tokens = await this.generateTokens(createdUser.id, createdUser.email);

    const refreshTokenId = await this.addRefreshToken(
      createdUser.id,
      tokens.refreshToken,
    );

    return {
      accessToken: tokens.accessToken,
      refresh: { refreshToken: tokens.refreshToken, id: refreshTokenId },
    };
  }

  async refresh(rt: string, tokenId: string): Promise<Tokens> {
    const token = await this.prismaService.token.findUnique({
      where: { type: ETokenType.REFRESH_TOKEN, id: tokenId },
      include: { user: true },
    });

    if (!token) {
      throw new UnauthorizedException('Access denied');
    }

    const { token: hashedRefreshToken } = token;
    const isValidToken = await compare(rt, hashedRefreshToken);
    if (!token.user || !isValidToken) {
      throw new UnauthorizedException('Access denied');
    }

    // Such a hard chunk of code for optimizing request time delay.
    // first function create and save new refresh token
    // second operation just delete previous refresh token
    const [tokens] = await Promise.all([
      (async () => {
        const tokens = await this.generateTokens(
          token.user.id,
          token.user.email,
        );
        const refreshTokenId = await this.addRefreshToken(
          token.user.id,
          tokens.refreshToken,
        );
        return {
          accessToken: tokens.accessToken,
          refresh: { refreshToken: tokens.refreshToken, id: refreshTokenId },
        };
      })(),
      this.prismaService.token.delete({
        where: { id: tokenId, type: ETokenType.REFRESH_TOKEN },
      }),
    ]);

    // const tokens = await this.generateTokens(token.user.id, token.user.email);
    // await this.addRefreshToken(token.user.id, tokens.refreshToken);

    // await this.prismaService.token.delete({
    //   where: { id: tokenId, type: ETokenType.REFRESH_TOKEN },
    // });

    return tokens;
  }

  async logout(rt: string) {
    if (rt) {
      await this.prismaService.token.deleteMany({
        where: {
          type: ETokenType.REFRESH_TOKEN,
          token: await this.hashData(rt),
        },
      });
    }
    return true;
  }

  async me(id: string) {
    if (id) {
      const user = await this.prismaService.user.findUnique({
        where: {
          id,
        },
      });

      return user;
    }
    return null;
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { id: userId, email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '15m',
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: parseDuration(
          this.configService.get<string>('REFRESH_TOKEN_DURATION'),
        ),
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async addRefreshToken(userId: string, token: string) {
    const hashedToken = await this.hashData(token);

    const rt = await this.prismaService.token.create({
      data: {
        expiresIn: new Date(
          Date.now() +
            parseDuration(
              this.configService.getOrThrow('REFRESH_TOKEN_DURATION'),
            ),
        ),
        token: hashedToken,
        type: ETokenType.REFRESH_TOKEN,
        user: {
          connect: { id: userId },
        },
      },
    });

    return rt.id;
  }

  private async hashData(data: string) {
    return await hash(data, +this.configService.getOrThrow('SALT_ROUNDS'));
  }
}
