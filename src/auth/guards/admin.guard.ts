import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { AuthenticatedRequest } from 'src/interfaces/authenticated-user.interface';
import { UserType } from '@prisma/client';

@Injectable()
export class Admin implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const { user } = request;

    if (user.type === 'ADMIN') {
      return true;
    }

    throw new ForbiddenException('Access denied');
  }
}
