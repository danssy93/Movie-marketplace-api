import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(compression());
  app.use(helmet());

  app.enableCors({
    origin: '*',
    methods: 'POST, DELETE, GET, PATCH',
    credentials: true,
    allowedHeaders:
      'Content-Type, Authorization, X-Requested-With, token, Accept, Api-Key',
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MOVEBOX API V3')
    .setDescription('API to process Book payment from a movie marketplace')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'AdminJWT',
        in: 'header',
        description: 'Enter Admin JWT token',
      },
      'AdminJWT',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'CustomerJWT',
        in: 'header',
        description: 'Enter Customer JWT token',
      },
      'CustomerJWT',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;

  await app.listen(port, () => {
    Logger.warn(` 
      --------------------------------------
      Application Server Successful!
      API Docs: localhost:${port}/api
      --------------------------------------
    `);
  });
}
bootstrap();
