import { Module } from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { ServiceUserValidationService } from './validation/service-user-validation.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ServiceController],
  providers: [ServiceService, ServiceUserValidationService, PrismaService],
  exports: [ServiceService],
})
export class ServiceModule {}
