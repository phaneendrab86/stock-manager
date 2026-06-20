import { Module } from '@nestjs/common';
import { SalesmenService } from './salesmen.service';
import { SalesmenController } from './salesmen.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [PrismaModule, AuditLogModule],
  providers: [SalesmenService],
  controllers: [SalesmenController],
  exports: [SalesmenService]
})
export class SalesmenModule { }
