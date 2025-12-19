import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser'; // AJOUT
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import { addTagsAutomatically } from './tools/swagger-tag';
import { TransformInterceptor } from './transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(bodyParser.json({ limit: '1024mb' }));
  app.use(bodyParser.urlencoded({ limit: '1024mb', extended: true }));
  app.use(cookieParser()); // AJOUT - Pour gérer les cookies
  
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());
  
  if (process.env.NODE_ENV !== 'production') {
    app.use(
      [`/${process.env.SWAGGER_PATH}`, `/${process.env.SWAGGER_PATH}-json`],
      basicAuth({
        challenge: true,
        users: {
          admin: process.env.BASIC_AUTH_PASSWORD ?? '',
        },
      }),
    );
    const config = new DocumentBuilder()
      .setTitle(`API ${process.env.APP_NAME}`)
      .setDescription('API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    addTagsAutomatically(app, document);
    SwaggerModule.setup(`${process.env.SWAGGER_PATH}`, app, document, {
      jsonDocumentUrl: `${process.env.SWAGGER_PATH}-json`,
    });
  }
  
  console.log(`🚀 API NestJS démarrée sur http://localhost:${process.env.APP_PORT ?? 5000}`);
  await app.listen(process.env.APP_PORT ?? 5000);
}
bootstrap();