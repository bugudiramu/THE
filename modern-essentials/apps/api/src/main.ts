import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const logger = new Logger("Bootstrap");

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  const parseEnvOrigins = (env?: string): string[] => {
    if (!env) return [];
    return env.split(",").map((origin) => origin.trim());
  };

  const allowedOrigins = [
    ...parseEnvOrigins(process.env.FRONTEND_URL),
    ...parseEnvOrigins(process.env.ADMIN_URL),
    "https://thehonestessentials.com",
    "https://www.thehonestessentials.com",
    "https://admin.thehonestessentials.com",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Modern Essentials API")
    .setDescription("Subscription-first D2C fresh essentials platform")
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port, "0.0.0.0");
  const url = await app.getUrl();
  logger.log(`API running on ${url}`);
  logger.log(`Swagger docs at ${url}/api/docs`);
}

bootstrap();
