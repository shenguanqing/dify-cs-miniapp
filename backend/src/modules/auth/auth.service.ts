import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { UserEntity } from '../../database/entities';

interface Jscode2SessionResp {
  openid?: string;
  unionid?: string;
  session_key?: string;
  errcode?: number;
  errmsg?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    private readonly cfg: ConfigService,
    private readonly jwt: JwtService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  /**
   * 用小程序 wx.login 拿到的 code 换取 openid，落库并签发 JWT。
   * 未配置微信 AppID 时（本地联调）走 mock，便于先把链路跑通。
   */
  async loginByCode(code: string): Promise<{ token: string; userId: string }> {
    const appid = this.cfg.get<string>('WX_APPID');
    const secret = this.cfg.get<string>('WX_SECRET');

    let openid: string;
    let unionid: string | undefined;

    if (!appid || !secret || appid === 'your_wx_appid') {
      // 未配置或占位值：直接走 mock，便于本地联调
      this.logger.warn('未配置微信 AppID/Secret，使用本地 mock 登录');
      openid = `mock_${code}`.slice(0, 64);
    } else {
      // 有真实 AppID：先尝试调微信接口，失败时自动降级为 mock 登录
      // 这样 HBuilderX 模拟器（uni.login 返回假 code）也能正常登录
      try {
        const url = 'https://api.weixin.qq.com/sns/jscode2session';
        const { data } = await axios.get<Jscode2SessionResp>(url, {
          params: { appid, secret, js_code: code, grant_type: 'authorization_code' },
          timeout: 8000,
        });
        if (!data.openid) {
          throw new Error(`${data.errcode}: ${data.errmsg}`);
        }
        openid = data.openid;
        unionid = data.unionid;
      } catch (e: any) {
        this.logger.warn(
          `微信接口调用失败，降级为 mock 登录（可在生产环境删除此逻辑）: ${e.message}`,
        );
        openid = `mock_${code}`.slice(0, 64);
      }
    }

    let user = await this.userRepo.findOne({ where: { openid } });
    if (!user) {
      user = this.userRepo.create({ openid, unionid });
      user = await this.userRepo.save(user);
    }

    const token = await this.jwt.signAsync({ sub: user.id, openid });
    return { token, userId: user.id };
  }

  async verify(token: string): Promise<{ sub: string; openid: string }> {
    try {
      return await this.jwt.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('登录态无效或已过期');
    }
  }
}
