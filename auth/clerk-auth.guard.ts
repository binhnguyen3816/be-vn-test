import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { getAuth } from '@clerk/express';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    try {
      const user = getAuth(request);
      if (!user.userId) {
        throw new UnauthorizedException('User not authenticated');
      }
      return true;
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
