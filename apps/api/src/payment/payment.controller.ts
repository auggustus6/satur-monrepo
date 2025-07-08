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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
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

@ApiTags('payments')
@Controller('payments')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Criar registro de pagamento (admin only)' })
  @ApiBody({
    type: CreatePaymentDto,
    description: 'Dados para criação do pagamento',
    examples: {
      basicPayment: {
        summary: 'Pagamento Básico',
        description: 'Exemplo de criação de pagamento básico',
        value: {
          serviceRequestId: 1,
          amount: 250.0,
          description: 'Pagamento por serviço de limpeza residencial',
        },
      },
      premiumPayment: {
        summary: 'Pagamento Premium',
        description: 'Exemplo de pagamento para serviço premium',
        value: {
          serviceRequestId: 2,
          amount: 1500.0,
          description: 'Pagamento por consultoria empresarial especializada',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Pagamento criado com sucesso',
    type: PaymentEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Solicitação não completada ou dados inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'Pagamento já existe para esta solicitação',
  })
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentEntity> {
    return this.paymentService.create(createPaymentDto);
  }

  @Get('search-users')
  @ApiOperation({ summary: 'Buscar usuários para seleção' })
  @ApiQuery({ name: 'search', type: 'string', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'ignoreUserType', type: 'string', required: false })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários encontrados',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string' },
        },
      },
    },
  })
  async searchUsers(
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('ignoreUserType') ignoreUserType?: string,
  ): Promise<any[]> {
    const limitNumber = limit ? parseInt(limit, 10) : 5;
    return this.paymentService.searchUsers(search, limitNumber, ignoreUserType);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pagamentos com filtros e paginação' })
  @ApiQuery({
    name: 'page',
    description: 'Número da página',
    type: 'number',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Número de itens por página',
    type: 'number',
    required: false,
    example: 20,
  })
  @ApiQuery({ name: 'status', enum: PaymentStatus, required: false })
  @ApiQuery({ name: 'agencyId', type: 'number', required: false })
  @ApiQuery({ name: 'supplierId', type: 'number', required: false })
  @ApiQuery({
    name: 'dateFrom',
    type: 'string',
    required: false,
    description: 'Data inicial (ISO 8601)',
  })
  @ApiQuery({
    name: 'dateTo',
    type: 'string',
    required: false,
    description: 'Data final (ISO 8601)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de pagamentos',
    schema: {
      type: 'object',
      properties: {
        payments: {
          type: 'array',
          items: { $ref: '#/components/schemas/PaymentEntity' },
        },
        total: { type: 'number', example: 100 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 },
        totalPages: { type: 'number', example: 5 },
      },
    },
  })
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
  @ApiOperation({ summary: 'Obter relatório financeiro (admin only)' })
  @ApiQuery({ name: 'agencyId', type: 'number', required: false })
  @ApiQuery({ name: 'supplierId', type: 'number', required: false })
  @ApiQuery({
    name: 'dateFrom',
    type: 'string',
    required: false,
    description: 'Data inicial (ISO 8601)',
  })
  @ApiQuery({
    name: 'dateTo',
    type: 'string',
    required: false,
    description: 'Data final (ISO 8601)',
  })
  @ApiResponse({
    status: 200,
    description: 'Relatório financeiro detalhado',
  })
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
  @ApiOperation({ summary: 'Buscar pagamento por ID' })
  @ApiParam({ name: 'id', description: 'ID do pagamento', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Pagamento encontrado',
    type: PaymentEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Pagamento não encontrado',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PaymentEntity> {
    return this.paymentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar pagamento (admin only)' })
  @ApiParam({ name: 'id', description: 'ID do pagamento', type: 'number' })
  @ApiBody({
    type: UpdatePaymentDto,
    description: 'Dados para atualização do pagamento',
    examples: {
      updateAmount: {
        summary: 'Atualizar Valor',
        description: 'Exemplo de atualização do valor do pagamento',
        value: {
          amount: 300.0,
        },
      },
      updateDescription: {
        summary: 'Atualizar Descrição',
        description: 'Exemplo de atualização da descrição',
        value: {
          description: 'Pagamento atualizado - serviço premium com extras',
        },
      },
      updateComplete: {
        summary: 'Atualização Completa',
        description: 'Exemplo de atualização de múltiplos campos',
        value: {
          amount: 350.0,
          description: 'Pagamento final - serviço completo com garantia',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Pagamento atualizado com sucesso',
    type: PaymentEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Pagamento já foi processado',
  })
  @ApiResponse({
    status: 404,
    description: 'Pagamento não encontrado',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentEntity> {
    return this.paymentService.update(id, updatePaymentDto);
  }

  @Patch(':id/mark-paid')
  @ApiOperation({ summary: 'Marcar pagamento como pago (admin only)' })
  @ApiParam({ name: 'id', description: 'ID do pagamento', type: 'number' })
  @ApiBody({
    type: MarkPaidDto,
    description: 'Dados para marcar pagamento como pago',
    examples: {
      markPaid: {
        summary: 'Marcar como Pago',
        description: 'Exemplo de marcação de pagamento como pago',
        value: {
          notes: 'Pagamento processado via transferência bancária',
        },
      },
      markPaidWithDetails: {
        summary: 'Marcar como Pago com Detalhes',
        description: 'Exemplo com observações detalhadas',
        value: {
          notes:
            'Pagamento confirmado - Comprovante #12345 - Processado em 15/01/2024',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Pagamento marcado como pago',
    type: PaymentEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Pagamento já foi processado',
  })
  @ApiResponse({
    status: 403,
    description: 'Apenas administradores podem processar pagamentos',
  })
  @ApiResponse({
    status: 404,
    description: 'Pagamento não encontrado',
  })
  async markAsPaid(
    @Param('id', ParseIntPipe) id: number,
    @Body() markPaidDto: MarkPaidDto,
    @CurrentUser() user: { id: number; email: string; role: string },
  ): Promise<PaymentEntity> {
    return this.paymentService.markAsPaid(id, markPaidDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar pagamento (admin only)' })
  @ApiParam({ name: 'id', description: 'ID do pagamento', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Pagamento deletado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Pagamento já foi processado',
  })
  @ApiResponse({
    status: 404,
    description: 'Pagamento não encontrado',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.paymentService.remove(id);
    return { message: 'Pagamento deletado com sucesso' };
  }
}
