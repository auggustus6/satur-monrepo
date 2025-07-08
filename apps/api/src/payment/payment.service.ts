import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';
import { PaymentEntity } from './entities/payment.entity';
import { UserRole, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<PaymentEntity> {
    const payment = await this.prisma.payment.create({
      data: createPaymentDto,
      include: {
        processedBy: true,
        user: true,
      },
    });

    return new PaymentEntity(payment);
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    filters?: {
      status?: PaymentStatus;
      dateFrom?: Date;
      dateTo?: Date;
    },
  ): Promise<{
    payments: PaymentEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          processedBy: true,
          user: true,
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      payments: payments.map((payment) => new PaymentEntity(payment)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: number): Promise<PaymentEntity> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        processedBy: true,
        user: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    return new PaymentEntity(payment);
  }

  async update(
    id: number,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentEntity> {
    const existingPayment = await this.findOne(id);

    // Não permitir atualização se já foi pago (exceto para cancelar)
    if (
      existingPayment.status === PaymentStatus.PAID &&
      updatePaymentDto.status !== 'CANCELLED'
    ) {
      throw new BadRequestException(
        'Não é possível atualizar um pagamento que já foi processado',
      );
    }

    const payment = await this.prisma.payment.update({
      where: { id },
      data: updatePaymentDto,
      include: {
        processedBy: true,
        user: true,
      },
    });

    return new PaymentEntity(payment);
  }

  async markAsPaid(
    id: number,
    markPaidDto: MarkPaidDto,
    userId: number,
  ): Promise<PaymentEntity> {
    const existingPayment = await this.findOne(id);

    // Verificar se o usuário tem permissão (admin only)
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Apenas administradores podem marcar pagamentos como pagos',
      );
    }

    // Verificar se o pagamento ainda não foi processado
    if (existingPayment.status === PaymentStatus.PAID) {
      throw new BadRequestException('Este pagamento já foi processado');
    }

    const payment = await this.prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.PAID,
        paidAt: new Date(),
        processedById: userId,
        paymentMethod: markPaidDto.paymentMethod,
      },
      include: {
        processedBy: true,
        user: true,
      },
    });

    return new PaymentEntity(payment);
  }

  async remove(id: number): Promise<void> {
    const existingPayment = await this.findOne(id);

    // Não permitir deleção se já foi pago
    if (existingPayment.status === PaymentStatus.PAID) {
      throw new BadRequestException(
        'Não é possível deletar um pagamento que já foi processado',
      );
    }

    await this.prisma.payment.delete({
      where: { id },
    });
  }

  async searchUsers(
    search?: string,
    limit: number = 5,
    ignoreUserType?: string,
  ): Promise<any[]> {
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter out specific user type if provided
    if (ignoreUserType) {
      where.role = { not: ignoreUserType };
    }

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        locationId: true,
        location: true,
      },
      take: limit,
      orderBy: { name: 'asc' },
    });

    return users;
  }

  async getFinancialReport(filters?: { dateFrom?: Date; dateTo?: Date }) {
    const where: any = {};

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    // Buscar todos os pagamentos
    const allPayments = await this.prisma.payment.findMany({
      where,
      include: {
        processedBy: true,
      },
    });

    // Calcular estatísticas
    const totalPayments = allPayments.length;
    const paidPayments = allPayments.filter(
      (p) => p.status === PaymentStatus.PAID,
    );
    const pendingPayments = allPayments.filter(
      (p) => p.status === PaymentStatus.PENDING,
    );
    const cancelledPayments = allPayments.filter(
      (p) => p.status === PaymentStatus.CANCELLED,
    );

    const totalAmount = allPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPaidAmount = paidPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPendingAmount = pendingPayments.reduce(
      (sum, p) => sum + p.amount,
      0,
    );
    const totalCancelledAmount = cancelledPayments.reduce(
      (sum, p) => sum + p.amount,
      0,
    );

    // Agrupar por mês (apenas pagamentos pagos)
    const monthlyRevenue = paidPayments.reduce(
      (acc, payment) => {
        const month =
          payment.paidAt?.toISOString().substring(0, 7) || 'unknown';
        if (!acc[month]) {
          acc[month] = {
            totalAmount: 0,
            count: 0,
          };
        }
        acc[month].totalAmount += payment.amount;
        acc[month].count += 1;
        return acc;
      },
      {} as Record<string, any>,
    );

    return {
      summary: {
        totalPayments,
        paidPayments: paidPayments.length,
        pendingPayments: pendingPayments.length,
        cancelledPayments: cancelledPayments.length,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalPaidAmount: Math.round(totalPaidAmount * 100) / 100,
        totalPendingAmount: Math.round(totalPendingAmount * 100) / 100,
        totalCancelledAmount: Math.round(totalCancelledAmount * 100) / 100,
        averageTransactionValue:
          totalPayments > 0
            ? Math.round((totalAmount / totalPayments) * 100) / 100
            : 0,
      },
      monthlyRevenue,
      recentPayments: allPayments.slice(0, 10).map((p) => new PaymentEntity(p)),
    };
  }
}
