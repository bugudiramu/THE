import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { Request, Response, NextFunction } from "express";

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

  const parseEnvOrigins = (env?: string): string[] => {
    if (!env) return [];
    return env.split(",").map((origin) => origin.trim());
  };

  // Manual CORS Middleware to ensure headers are ALWAYS present
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin as string;
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

    if (allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, X-Requested-With");
    res.header("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
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
