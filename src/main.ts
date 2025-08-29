import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://62.171.147.235',
      'https://school-management-system-fn.vercel.app',
      "http://localhost:5173"
    ],
    Credential:true
  });
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  
  // Apply global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  app.setGlobalPrefix('api/');

  const config = new DocumentBuilder()
  .setTitle('School Management system API')
  .setDescription('API description for School Management system')
  .setLicense('MIT', 'https://opensource.org/licenses/MIT')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);

SwaggerModule.setup('api/docs', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
