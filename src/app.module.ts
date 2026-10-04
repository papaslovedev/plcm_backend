import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PublicModule } from './public/public.module';

@Module({ imports: [PrismaModule, AuthModule, DashboardModule, PublicModule, GraphQLModule.forRoot<ApolloDriverConfig>({ driver: ApolloDriver, autoSchemaFile: join(process.cwd(), 'src/schema.gql'), sortSchema: true, playground: process.env.NODE_ENV !== 'production', context: ({ req, res }) => ({ req, res }) })] })
export class AppModule {}
