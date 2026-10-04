import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
 async login(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  const secret = process.env.JWT_SECRET;
  if (!expectedEmail || !hash || !secret) throw new Error('ADMIN_EMAIL, ADMIN_PASSWORD_HASH and JWT_SECRET must be configured');
  const valid = email.trim().toLowerCase() === expectedEmail.trim().toLowerCase() && await bcrypt.compare(password, hash);
  if (!valid) throw new UnauthorizedException('Invalid email or password');
  const accessToken = jwt.sign({ sub: 'single-admin', email: expectedEmail, role: 'ADMIN' }, secret, { expiresIn: '8h', issuer: 'plcm-api', audience: 'plcm-admin' });
  return { accessToken, tokenType: 'Bearer', expiresInSeconds: 28800, email: expectedEmail };
 }
 verify(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  try { return jwt.verify(token, secret, { issuer: 'plcm-api', audience: 'plcm-admin' }) as { sub: string; email: string; role: string }; }
  catch { throw new UnauthorizedException('Session expired. Please sign in again.'); }
 }
}
