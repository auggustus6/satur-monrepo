import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<ProductEntity> {
    // Check if service exists
    const service = await this.prisma.service.findFirst({
      where: {
        id: createProductDto.serviceId,
        deletedAt: null,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Check if product name already exists for this service
    const existingProduct = await this.prisma.product.findFirst({
      where: {
        name: createProductDto.name,
        serviceId: createProductDto.serviceId,
        deletedAt: null,
      },
    });

    if (existingProduct) {
      throw new ConflictException(
        'A product with this name already exists for this service',
      );
    }

    const product = await this.prisma.product.create({
      data: createProductDto,
      include: {
        service: {
          include: {
            location: true,
          },
        },
      },
    });

    return new ProductEntity(product);
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    search?: string,
    serviceId?: number,
    isActive?: boolean,
    locationId?: number,
  ): Promise<{
    products: ProductEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (serviceId !== undefined) {
      where.serviceId = serviceId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (locationId !== undefined) {
      // If serviceId is also specified, we need to combine the conditions
      if (serviceId !== undefined) {
        where.service = {
          id: serviceId,
          locationId: locationId,
        };
        // Remove the direct serviceId since we're using service relation
        delete where.serviceId;
      } else {
        where.service = {
          locationId: locationId,
        };
      }
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          service: {
            include: {
              location: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      products: products.map((product) => new ProductEntity(product)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: number): Promise<ProductEntity> {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        service: {
          include: {
            location: true,
            serviceUsers: {
              include: {
                user: {
                  include: {
                    location: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return new ProductEntity(product);
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductEntity> {
    // Check if product exists
    const existingProduct = await this.prisma.product.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    // If updating service, check if it exists
    if (updateProductDto.serviceId) {
      const service = await this.prisma.service.findFirst({
        where: {
          id: updateProductDto.serviceId,
          deletedAt: null,
        },
      });

      if (!service) {
        throw new NotFoundException('Service not found');
      }
    }

    // Check for name conflicts if updating name or serviceId
    if (updateProductDto.name || updateProductDto.serviceId) {
      const nameToCheck = updateProductDto.name || existingProduct.name;
      const serviceIdToCheck =
        updateProductDto.serviceId || existingProduct.serviceId;

      const conflictingProduct = await this.prisma.product.findFirst({
        where: {
          name: nameToCheck,
          serviceId: serviceIdToCheck,
          deletedAt: null,
          NOT: { id },
        },
      });

      if (conflictingProduct) {
        throw new ConflictException(
          'A product with this name already exists for this service',
        );
      }
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        service: {
          include: {
            location: true,
          },
        },
      },
    });

    return new ProductEntity(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if product has any orders
    const orderCount = await this.prisma.order.count({
      where: {
        productId: id,
      },
    });

    if (orderCount > 0) {
      throw new ConflictException(
        'Cannot delete product with existing orders. Set isActive to false instead.',
      );
    }

    // Soft delete
    await this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  async getProductStats(id: number) {
    const product = await this.findOne(id);

    const [orderCount, totalRevenue, activeOrders, recentOrders] =
      await Promise.all([
        this.prisma.order.count({
          where: { productId: id },
        }),
        this.prisma.order.aggregate({
          where: { productId: id, status: 'PAID' },
          _sum: { totalAmount: true },
        }),
        this.prisma.order.count({
          where: { productId: id, status: 'PENDING' },
        }),
        this.prisma.order.findMany({
          where: { productId: id },
          include: {
            customer: {
              select: { id: true, name: true, email: true },
            },
            service: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ]);

    return {
      product,
      stats: {
        totalOrders: orderCount,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        activeOrders,
      },
      recentOrders,
    };
  }

  async getServiceProducts(serviceId: number): Promise<ProductEntity[]> {
    const products = await this.prisma.product.findMany({
      where: {
        serviceId,
        deletedAt: null,
        isActive: true,
      },
      include: {
        service: {
          include: {
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return products.map((product) => new ProductEntity(product));
  }
}
