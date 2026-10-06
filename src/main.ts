import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  // Image uploads are sent as base64 inside GraphQL JSON requests. The default
  // Express body limit is too small for normal phone/camera photos.
  app.use(json({ limit: '12mb' }));
  app.use(urlencoded({ extended: true, limit: '12mb' }));
  const configuredOrigins = (process.env.FRONTEND_ORIGIN || 'https://plcm.up.railway.app')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

  app.enableCors({
    origin: configuredOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Apollo-Require-Preflight',
      'X-Apollo-Operation-Name',
    ],
  });

  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT || 4000, '0.0.0.0');
}
bootstrap();
