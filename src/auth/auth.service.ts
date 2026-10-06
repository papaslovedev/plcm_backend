import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.module';

@Injectable()
export class AuthService {
 constructor(private db: PrismaService) {}
 async login(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  const secret = process.env.JWT_SECRET;
  if (!expectedEmail || !hash || !secret) throw new Error('ADMIN_EMAIL, ADMIN_PASSWORD_HASH and JWT_SECRET must be configured');
  let account = await this.db.adminAccount.findUnique({ where: { id: 'main' } });
  if (!account) account = await this.db.adminAccount.create({ data: { id: 'main', email: expectedEmail, passwordHash: hash } });
  const valid = email.trim().toLowerCase() === account.email.trim().toLowerCase() && await bcrypt.compare(password, account.passwordHash);
  if (!valid) throw new UnauthorizedException('Invalid email or password');
  const accessToken = jwt.sign({ sub: 'single-admin', email: account.email, role: 'ADMIN' }, secret, { expiresIn: '8h', issuer: 'plcm-api', audience: 'plcm-admin' });
  return { accessToken, tokenType: 'Bearer', expiresInSeconds: 28800, email: account.email };
 }
 async changePassword(email: string, currentPassword: string, newPassword: string) {
  if (newPassword.length < 8) throw new UnauthorizedException('New password must be at least 8 characters long');
  const account = await this.db.adminAccount.findUnique({ where: { id: 'main' } });
  if (!account || account.email.trim().toLowerCase() !== email.trim().toLowerCase() || !(await bcrypt.compare(currentPassword, account.passwordHash))) throw new UnauthorizedException('Current password is incorrect');
  await this.db.adminAccount.update({ where: { id: 'main' }, data: { passwordHash: await bcrypt.hash(newPassword, 12) } });
  return true;
 }
 verify(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  try { return jwt.verify(token, secret, { issuer: 'plcm-api', audience: 'plcm-admin' }) as { sub: string; email: string; role: string }; }
  catch { throw new UnauthorizedException('Session expired. Please sign in again.'); }
 }
}
