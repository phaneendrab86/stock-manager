import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
    imports: [PrismaModule, AuditLogModule, AuthModule],
    controllers: [ExpensesController],
    providers: [ExpensesService],
})
export class ExpensesModule { }
