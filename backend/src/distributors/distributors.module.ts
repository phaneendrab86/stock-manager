import { Module } from '@nestjs/common';
import { DistributorsService } from './distributors.service';
import { DistributorsController } from './distributors.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [DistributorsController],
    providers: [DistributorsService],
    exports: [DistributorsService],
})
export class DistributorsModule { }
