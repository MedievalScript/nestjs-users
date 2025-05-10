import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthenticatedRequest } from 'src/interfaces/authenticated-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'qwertyx',
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.id,
      email: payload.email,
      type: payload.type,
      organizationId: payload.organization,
    };
  }
}
