import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ManageServiceUsersDto } from './dto/manage-service-users.dto';
import { ServiceEntity } from './entities/service.entity';
import { ServiceUserValidationService } from './validation/service-user-validation.service';

@Injectable()
export class ServiceService {
  constructor(
    private prisma: PrismaService,
    private serviceUserValidation: ServiceUserValidationService,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<ServiceEntity> {
    // Verificar se já existe um serviço com o mesmo nome
    const existingService = await this.prisma.service.findFirst({
      where: {
        name: createServiceDto.name,
        deletedAt: null,
      },
    });

    if (existingService) {
      throw new ConflictException('Já existe um serviço com este nome');
    }

    // Validate location exists
    const location = await this.prisma.location.findUnique({
      where: { id: createServiceDto.locationId, deletedAt: null },
    });

    if (!location) {
      throw new NotFoundException('Localização não encontrada');
    }

    // Validate user associations if provided (basic validation only)
    if (createServiceDto.userIds && createServiceDto.userIds.length > 0) {
      await this.serviceUserValidation.validateUsersExistAndRole(
        createServiceDto.userIds,
      );
    }

    const { userIds, ...serviceData } = createServiceDto;

    const service = await this.prisma.service.create({
      data: serviceData,
      include: {
        location: true,
        serviceUsers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                email: true,
                locationId: true,
                location: {
                  select: {
                    id: true,
                    city: true,
                    state: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Create user associations if provided
    if (userIds && userIds.length > 0) {
      await this.prisma.serviceUser.createMany({
        data: userIds.map((userId) => ({
          serviceId: service.id,
          userId,
        })),
      });

      // Fetch service again with user associations
      const serviceWithUsers = await this.prisma.service.findUnique({
        where: { id: service.id },
        include: {
          location: true,
          serviceUsers: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                  email: true,
                  locationId: true,
                  location: {
                    select: {
                      id: true,
                      city: true,
                      state: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return new ServiceEntity({
        ...serviceWithUsers,
        users: serviceWithUsers?.serviceUsers.map((su) => su.user) || [],
      });
    }

    return new ServiceEntity({
      ...service,
      users: service.serviceUsers.map((su) => su.user),
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    search?: string,
    locationId?: number,
  ): Promise<{
    services: ServiceEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    // Build filters
    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (locationId) {
      where.locationId = locationId;
    }

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take: limit,
        include: {
          location: true,
          serviceUsers: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                  email: true,
                  locationId: true,
                  location: {
                    select: {
                      id: true,
                      city: true,
                      state: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.service.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      services: services.map(
        (service) =>
          new ServiceEntity({
            ...service,
            users: service.serviceUsers.map((su) => su.user),
          }),
      ),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findAllLegacy(): Promise<ServiceEntity[]> {
    const services = await this.prisma.service.findMany({
      where: { deletedAt: null },
      include: {
        location: true,
        serviceUsers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                email: true,
                locationId: true,
                location: {
                  select: {
                    id: true,
                    city: true,
                    state: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return services.map(
      (service) =>
        new ServiceEntity({
          ...service,
          users: service.serviceUsers.map((su) => su.user),
        }),
    );
  }

  async findOne(id: number): Promise<ServiceEntity> {
    const service = await this.prisma.service.findUnique({
      where: { id, deletedAt: null },
      include: {
        location: true,
        serviceUsers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                email: true,
                locationId: true,
                location: {
                  select: {
                    id: true,
                    city: true,
                    state: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }

    return new ServiceEntity({
      ...service,
      users: service.serviceUsers.map((su) => su.user),
    });
  }

  async update(
    id: number,
    updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceEntity> {
    // Verificar se o serviço existe
    await this.findOne(id);

    // Se está atualizando o nome, verificar se não está em uso
    if (updateServiceDto.name) {
      const existingService = await this.prisma.service.findFirst({
        where: {
          name: updateServiceDto.name,
          deletedAt: null,
          NOT: { id },
        },
      });

      if (existingService) {
        throw new ConflictException('Já existe um serviço com este nome');
      }
    }

    // Validate location if being updated
    if (updateServiceDto.locationId) {
      const location = await this.prisma.location.findUnique({
        where: { id: updateServiceDto.locationId, deletedAt: null },
      });

      if (!location) {
        throw new NotFoundException('Localização não encontrada');
      }
    }

    const { userIds, ...serviceData } = updateServiceDto;

    // Update service data
    const service = await this.prisma.service.update({
      where: { id },
      data: serviceData,
      include: {
        location: true,
        serviceUsers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    // Handle user associations if provided
    if (userIds !== undefined) {
      if (userIds.length > 0) {
        // Validate users exist and have appropriate roles (basic validation only)
        await this.serviceUserValidation.validateUsersExistAndRole(userIds);

        // Remove existing associations
        await this.prisma.serviceUser.deleteMany({
          where: { serviceId: id },
        });

        // Create new associations
        await this.prisma.serviceUser.createMany({
          data: userIds.map((userId) => ({
            serviceId: id,
            userId,
          })),
        });
      } else {
        // Remove all associations if empty array provided
        await this.prisma.serviceUser.deleteMany({
          where: { serviceId: id },
        });
      }

      // Fetch updated service with new associations
      const updatedService = await this.prisma.service.findUnique({
        where: { id },
        include: {
          location: true,
          serviceUsers: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                  email: true,
                  locationId: true,
                  location: {
                    select: {
                      id: true,
                      city: true,
                      state: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return new ServiceEntity({
        ...updatedService,
        users: updatedService?.serviceUsers.map((su) => su.user) || [],
      });
    }

    return new ServiceEntity({
      ...service,
      users: service.serviceUsers.map((su) => su.user),
    });
  }

  async remove(id: number): Promise<void> {
    // Verificar se o serviço existe
    await this.findOne(id);

    // Soft delete - preserve data for metrics and history
    await this.prisma.service.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getServiceStats(id: number) {
    const service = await this.findOne(id);

    return {
      service,
      stats: {
        totalRequests: 0,
        completedRequests: 0,
        completionRate: 0,
      },
    };
  }

  async getPopularServices(limit: number = 10) {
    const services = await this.prisma.service.findMany({
      where: { deletedAt: null },
      include: {
        location: true,
        serviceUsers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return services.map((service) => ({
      ...new ServiceEntity({
        ...service,
        users: service.serviceUsers.map((su) => su.user),
      }),
      requestsCount: 0,
    }));
  }

  async searchUsers(search?: string, limit: number = 20): Promise<any[]> {
    const where: any = {
      role: { in: ['ADMIN', 'AGENCY', 'SUPPLIER'] },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        locationId: true,
      },
      take: limit,
      orderBy: { name: 'asc' },
    });

    return users;
  }

  // New methods for user association management
  async addUsersToService(
    serviceId: number,
    manageUsersDto: ManageServiceUsersDto,
  ): Promise<ServiceEntity> {
    await this.findOne(serviceId);

    await this.serviceUserValidation.validateUserServiceAssociation(
      serviceId,
      manageUsersDto.userIds,
    );

    // Remove existing associations
    await this.prisma.serviceUser.deleteMany({
      where: { serviceId },
    });

    // Create new associations
    await this.prisma.serviceUser.createMany({
      data: manageUsersDto.userIds.map((userId) => ({
        serviceId,
        userId,
      })),
    });

    return this.findOne(serviceId);
  }

  async removeUsersFromService(
    serviceId: number,
    userIds: number[],
  ): Promise<ServiceEntity> {
    await this.findOne(serviceId);

    await this.prisma.serviceUser.deleteMany({
      where: {
        serviceId,
        userId: { in: userIds },
      },
    });

    return this.findOne(serviceId);
  }
}
