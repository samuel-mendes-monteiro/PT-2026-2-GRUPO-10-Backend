import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UseGuards,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginRequestBody } from './dto/loginRequestBody.dto.js';
import { AuthGuard } from './guards/auth-guard.js';
import type { AuthenticatedRequest } from './types/authenticated-request.js';
import { Public } from './decorators/isPublic.decorator.js';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() body:any) {
    console.log('Dados puros que chegaram ao controlador:', body);
    return this.authService.login(body)
  }

  @Get('me')
  getProfile(@Request() req: AuthenticatedRequest) {
    return req.user;
  }

}
