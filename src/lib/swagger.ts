import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const configureSwagger = (app) => {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('MOVEBOX API V3')
    .setDescription('Comprehensive documentation for the STASHBOX API')
    .setVersion('3.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'AdminJWT',
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'CustomerJWT',
    )
    .addTag('MOVEBOX Docs', 'Documentation for the MOVEBOX API endpoints')
    .setExternalDoc('Postman Collection', '/documentation-json')
    .build();

  // const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/documentation', app, documentFactory);
};
