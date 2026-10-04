import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from './auth.service';
@Injectable()
export class AdminGuard implements CanActivate {
 constructor(private auth: AuthService) {}
 canActivate(context: ExecutionContext) {
  const ctx = GqlExecutionContext.create(context).getContext();
  const header = ctx.req?.headers?.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) throw new UnauthorizedException('Sign in required');
  const claims = this.auth.verify(token);
  if (claims.role !== 'ADMIN' || claims.sub !== 'single-admin') throw new UnauthorizedException();
  ctx.admin = claims;
  return true;
 }
}
