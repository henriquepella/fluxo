import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  // No eager $connect on init: Prisma connects lazily on first query, so the
  // API can boot and expose /health/readiness even while the database is down.
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
