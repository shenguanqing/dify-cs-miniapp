import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { AuthService } from './auth.service';

class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'code 不能为空' })
  code: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 小程序登录：前端 wx.login() -> code -> 换取后端 token
   * POST /api/auth/login
   */
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.loginByCode(dto.code);
  }
}
