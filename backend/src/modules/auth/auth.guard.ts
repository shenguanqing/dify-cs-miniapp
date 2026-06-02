import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

/**
 * 校验 Authorization: Bearer <token>，把 userId 注入 request.user。
 * 对应方案「用户登录态校验」。
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const header: string = req.headers['authorization'] || '';
    const [type, token] = header.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('缺少登录态');
    }
    const payload = await this.authService.verify(token);
    req.user = { id: payload.sub, openid: payload.openid };
    return true;
  }
}
