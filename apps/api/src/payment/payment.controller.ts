import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';
import { PaymentEntity } from './entities/payment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaymentStatus } from '@prisma/client';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

// Configure dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

@Controller('payments')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentEntity> {
    return this.paymentService.create(createPaymentDto);
  }

  @Get('search-users')
  async searchUsers(
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('ignoreUserType') ignoreUserType?: string,
  ): Promise<any[]> {
    const limitNumber = limit ? parseInt(limit, 10) : 5;
    return this.paymentService.searchUsers(search, limitNumber, ignoreUserType);
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: PaymentStatus,
    @Query('agencyId') agencyId?: string,
    @Query('supplierId') supplierId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<{
    payments: PaymentEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const filters: any = {};

    if (status) filters.status = status;
    if (agencyId) filters.agencyId = parseInt(agencyId, 10);
    if (supplierId) filters.supplierId = parseInt(supplierId, 10);
    if (dateFrom) {
      // Parse date and set to start of day in UTC
      const fromDate = dayjs(dateFrom).utc().startOf('day').toDate();
      filters.dateFrom = fromDate;
    }
    if (dateTo) {
      // Parse date and set to end of day in UTC
      const toDate = dayjs(dateTo).utc().endOf('day').toDate();
      filters.dateTo = toDate;
    }

    return this.paymentService.findAll(pageNum, limitNum, filters);
  }

  @Get('financial-report')
  async getFinancialReport(
    @Query('agencyId') agencyId?: string,
    @Query('supplierId') supplierId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const filters: any = {};

    if (agencyId) filters.agencyId = parseInt(agencyId, 10);
    if (supplierId) filters.supplierId = parseInt(supplierId, 10);
    if (dateFrom) {
      // Parse date and set to start of day in UTC
      const fromDate = dayjs(dateFrom).utc().startOf('day').toDate();
      filters.dateFrom = fromDate;
    }
    if (dateTo) {
      // Parse date and set to end of day in UTC
      const toDate = dayjs(dateTo).utc().endOf('day').toDate();
      filters.dateTo = toDate;
    }

    return this.paymentService.getFinancialReport(filters);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PaymentEntity> {
    return this.paymentService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentEntity> {
    return this.paymentService.update(id, updatePaymentDto);
  }

  @Patch(':id/mark-paid')
  async markAsPaid(
    @Param('id', ParseIntPipe) id: number,
    @Body() markPaidDto: MarkPaidDto,
    @CurrentUser() user: { id: number; email: string; role: string },
  ): Promise<PaymentEntity> {
    return this.paymentService.markAsPaid(id, markPaidDto, user.id);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.paymentService.remove(id);
    return { message: 'Pagamento deletado com sucesso' };
  }
}
