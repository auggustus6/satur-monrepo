import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class ServiceUserValidationService {
  constructor(private prisma: PrismaService) {}

  async validateUserServiceAssociation(
    serviceId: number,
    userIds: number[],
  ): Promise<void> {
    // Get service with location
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      include: { location: true },
    });

    if (!service) {
      throw new BadRequestException('Serviço não encontrado');
    }

    await this.validateUsersForLocation(userIds, service.locationId);
  }

  async validateUsersExistAndRole(userIds: number[]): Promise<void> {
    // Get users with their roles
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: userIds },
        deletedAt: null, // Only active users
      },
    });

    if (users.length !== userIds.length) {
      throw new BadRequestException(
        'Um ou mais usuários não foram encontrados',
      );
    }

    // Validate each user role
    for (const user of users) {
      // Check if user role is allowed
      const allowedRoles: UserRole[] = ['AGENCY', 'SUPPLIER', 'ADMIN'];
      if (!allowedRoles.includes(user.role)) {
        throw new BadRequestException(
          `Usuário ${user.name} não pode ser associado ao serviço. Apenas usuários com roles AGENCY, SUPPLIER ou ADMIN podem ser associados.`,
        );
      }
    }
  }

  async validateUsersForLocation(
    userIds: number[],
    locationId: number,
  ): Promise<void> {
    // Get users with their roles and locations
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: userIds },
        deletedAt: null, // Only active users
      },
      include: { location: true },
    });

    if (users.length !== userIds.length) {
      throw new BadRequestException(
        'Um ou mais usuários não foram encontrados',
      );
    }

    // Validate each user
    for (const user of users) {
      // Check if user role is allowed
      const allowedRoles: UserRole[] = ['AGENCY', 'SUPPLIER', 'ADMIN'];
      if (!allowedRoles.includes(user.role)) {
        throw new BadRequestException(
          `Usuário ${user.name} não pode ser associado ao serviço. Apenas usuários com roles AGENCY, SUPPLIER ou ADMIN podem ser associados.`,
        );
      }

      // Special validation for SUPPLIER users
      if (user.role === 'SUPPLIER') {
        if (!user.locationId || user.locationId !== locationId) {
          throw new BadRequestException(
            `Usuário ${user.name} não pode ser associado ao serviço pois possui uma localidade diferente da do serviço.`,
          );
        }
      }
    }
  }

  async validateUserForServiceUpdate(
    userId: number,
    serviceLocationId: number,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      include: { location: true },
    });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    const allowedRoles: UserRole[] = ['AGENCY', 'SUPPLIER', 'ADMIN'];
    if (!allowedRoles.includes(user.role)) {
      throw new BadRequestException(
        `Usuário ${user.name} não pode ser associado ao serviço. Apenas usuários com roles AGENCY, SUPPLIER ou ADMIN podem ser associados.`,
      );
    }

    if (user.role === 'SUPPLIER') {
      if (!user.locationId || user.locationId !== serviceLocationId) {
        throw new BadRequestException(
          `Usuário ${user.name} não pode ser associado ao serviço pois possui uma localidade diferente da do serviço.`,
        );
      }
    }
  }
}
