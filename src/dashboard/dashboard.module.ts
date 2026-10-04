import { Module } from '@nestjs/common';
import { DashboardResolver } from './dashboard.resolver';
import { AdminGuard } from '../auth/admin.guard';
import { AuthService } from '../auth/auth.service';
@Module({ providers: [DashboardResolver, AdminGuard, AuthService] })
export class DashboardModule {}
