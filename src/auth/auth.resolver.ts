import { Args, Mutation, ObjectType, Field, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UseGuards } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
@ObjectType()
class LoginResult { @Field() accessToken!: string; @Field() tokenType!: string; @Field() expiresInSeconds!: number; @Field() email!: string; }
@Resolver()
export class AuthResolver {
 constructor(private auth: AuthService) {}
 @Mutation(() => LoginResult)
 adminLogin(@Args('email') email: string, @Args('password') password: string) { return this.auth.login(email, password); }
 @Mutation(() => Boolean)
 @UseGuards(AdminGuard)
 changeAdminPassword(@Args('email') email: string, @Args('currentPassword') currentPassword: string, @Args('newPassword') newPassword: string) { return this.auth.changePassword(email, currentPassword, newPassword); }
}
