import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UsePipes,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { PasswordMatchPipe } from 'src/shared/pipes/password-match.pipe';
import { parseDuration } from 'src/shared/utils/parse-duration.util';

import { AuthService } from './auth.service';
import { SignInDto } from './dtos/sign-in.dto';
import { SignUpDto } from './dtos/sign-up.dto';
import { RefreshTokenCookie } from './types/token.type';

@Controller('auth')
export class AuthController {
  private readonly rtName: string;
  private readonly rtDuration: number;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.rtName = this.configService.getOrThrow('REFRESH_TOKEN_NAME');
    this.rtDuration = parseDuration(
      this.configService.getOrThrow('REFRESH_TOKEN_DURATION'),
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refresh } = await this.authService.signin(signInDto);

    this.setRefreshToken(response, refresh);
    return { accessToken };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  @UsePipes(PasswordMatchPipe)
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refresh } = await this.authService.signup(signUpDto);

    this.setRefreshToken(response, refresh);
    return { accessToken };
  }

  @HttpCode(HttpStatus.OK)
  @Get('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { id, refreshToken } = JSON.parse(
      req.cookies[this.rtName],
    ) as RefreshTokenCookie;

    const { accessToken, refresh } = await this.authService.refresh(
      refreshToken,
      id,
    );

    this.setRefreshToken(response, refresh);
    return { accessToken };
  }

  @Auth()
  @Get('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(req.cookies[this.rtName]);

    this.clearRefreshToken(response);
    return true;
  }

  private setRefreshToken(response: Response, token: RefreshTokenCookie) {
    response.setCookie(this.rtName, JSON.stringify(token), {
      maxAge: this.rtDuration,
    });
  }

  private clearRefreshToken(response: Response) {
    response.setCookie(this.rtName, '', {
      maxAge: 0,
    });
  }
}
