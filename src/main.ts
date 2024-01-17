import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3001', // Replace with the actual origin of your React app
    credentials: true,
  });
  app.use(json());

  await app.listen(3000);
}
bootstrap();
