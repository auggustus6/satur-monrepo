import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserRole, PaymentStatus } from '@prisma/client';
import { UserEntity } from '../user/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  private async validateAdmin(userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Acesso negado. Apenas administradores podem acessar esta funcionalidade',
      );
    }
  }

  // CRUD de usuários para admin
  async getAllUsers(filters?: {
    role?: UserRole;
    isApproved?: boolean;
    search?: string;
  }): Promise<UserEntity[]> {
    const where: any = {};

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.isApproved !== undefined) {
      where.isApproved = filters.isApproved;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => new UserEntity(user));
  }

  async getUserById(id: number): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        payments: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return new UserEntity(user);
  }

  async updateUser(
    id: number,
    updateData: {
      name?: string;
      email?: string;
      phone?: string;
      isApproved?: boolean;
    },
    adminId: number,
  ): Promise<UserEntity> {
    await this.validateAdmin(adminId);

    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se email já está em uso (se estiver sendo alterado)
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateData.email },
      });
      if (emailExists) {
        throw new BadRequestException('Este email já está em uso');
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return new UserEntity(user);
  }

  async deleteUser(id: number, adminId: number): Promise<void> {
    await this.validateAdmin(adminId);

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se o usuário tem dependências
    const hasPayments = await this.prisma.payment.count({
      where: { processedById: id },
    });

    if (hasPayments > 0) {
      throw new BadRequestException(
        'Não é possível deletar usuário com pagamentos associados',
      );
    }

    await this.prisma.user.delete({ where: { id } });
  }

  // Dashboard de serviços
  async getTopServices(limit: number = 10) {
    const topServices = await this.prisma.service.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return topServices.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      isActive: service.isActive,
      locationId: service.locationId,
    }));
  }

  async getTopSuppliers(limit: number = 10) {
    const suppliers = await this.prisma.user.findMany({
      where: {
        role: UserRole.SUPPLIER,
        isApproved: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return suppliers.map((supplier) => ({
      id: supplier.id,
      name: supplier.name,
      email: supplier.email,
      isApproved: supplier.isApproved,
    }));
  }

  // Relatórios financeiros
  async getFinancialReport(filters?: { from?: Date; to?: Date }) {
    const where: any = {};

    if (filters?.from || filters?.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = filters.from;
      if (filters.to) where.createdAt.lte = filters.to;
    }

    // Buscar todos os pagamentos no período
    const payments = await this.prisma.payment.findMany({
      where,
      include: {
        processedBy: true,
      },
    });

    // Calcular estatísticas
    const totalPayments = payments.length;
    const paidPayments = payments.filter(
      (p) => p.status === PaymentStatus.PAID,
    );
    const pendingPayments = payments.filter(
      (p) => p.status === PaymentStatus.PENDING,
    );

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalPaidAmount = paidPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPendingAmount = pendingPayments.reduce(
      (sum, p) => sum + p.amount,
      0,
    );

    // Agrupar por mês
    const monthlyData = paidPayments.reduce(
      (acc, payment) => {
        const month =
          payment.paidAt?.toISOString().substring(0, 7) || 'unknown';
        if (!acc[month]) {
          acc[month] = {
            totalAmount: 0,
            transactionCount: 0,
          };
        }
        acc[month].totalAmount += payment.amount;
        acc[month].transactionCount += 1;
        return acc;
      },
      {} as Record<string, any>,
    );

    return {
      summary: {
        totalPayments,
        paidPayments: paidPayments.length,
        pendingPayments: pendingPayments.length,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalPaidAmount: Math.round(totalPaidAmount * 100) / 100,
        totalPendingAmount: Math.round(totalPendingAmount * 100) / 100,
        averageTransactionValue:
          totalPayments > 0
            ? Math.round((totalAmount / totalPayments) * 100) / 100
            : 0,
      },
      monthlyData,
      period: {
        from: filters?.from?.toISOString() || null,
        to: filters?.to?.toISOString() || null,
      },
    };
  }

  // Estatísticas gerais do sistema
  async getSystemStats() {
    const [
      totalUsers,
      totalAgencies,
      totalSuppliers,
      pendingSuppliers,
      totalServices,
      totalPayments,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: UserRole.AGENCY } }),
      this.prisma.user.count({
        where: { role: UserRole.SUPPLIER, isApproved: true },
      }),
      this.prisma.user.count({
        where: { role: UserRole.SUPPLIER, isApproved: false },
      }),
      this.prisma.service.count(),
      this.prisma.payment.count({ where: { status: PaymentStatus.PAID } }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.PAID },
        _sum: { amount: true },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        agencies: totalAgencies,
        approvedSuppliers: totalSuppliers,
        pendingSuppliers,
      },
      services: {
        total: totalServices,
      },
      financial: {
        totalPayments,
        totalRevenue: Math.round((totalRevenue._sum.amount || 0) * 100) / 100,
        averagePayment:
          totalPayments > 0
            ? Math.round(
                ((totalRevenue._sum.amount || 0) / totalPayments) * 100,
              ) / 100
            : 0,
      },
    };
  }
}
