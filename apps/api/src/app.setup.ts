import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';

/**
 * Applies cross-cutting HTTP configuration (security headers, prefix,
 * versioning, validation). Shared between main.ts and e2e tests so tests
 * exercise the exact same pipeline as production.
 */
export function setupApp(app: INestApplication): void {
  app.use(helmet());
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.enableShutdownHooks();
}
