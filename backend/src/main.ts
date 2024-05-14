import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // set global validation
  app.useGlobalPipes(new ValidationPipe());

  // set global prefix
  app.setGlobalPrefix('api');

  // enable versioning
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
  });

  // swagger
  const config = new DocumentBuilder()
    .setTitle('Cerberus Vault API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // start server
  await app.listen(3000);
}
bootstrap();
