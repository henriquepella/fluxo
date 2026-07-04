import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/app.setup';

describe('Health (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication({ logger: false });
    setupApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health/liveness responds 200 with status ok', async () => {
    const response = await request(app.getHttpServer()).get('/api/health/liveness').expect(200);

    expect(response.body).toMatchObject({ status: 'ok' });
  });

  it('unknown routes respond 404 through the global exception filter', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/nope').expect(404);

    expect(response.body).toMatchObject({
      statusCode: 404,
      code: 'NOT_FOUND',
      path: '/api/v1/nope',
    });
  });
});
