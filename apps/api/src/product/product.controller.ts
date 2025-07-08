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
  UsePipes,
  ValidationPipe,
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
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { ProductEntity } from './entities/product.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('products')
@Controller('products')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({
    type: CreateProductDto,
    description: 'Product creation data',
    examples: {
      basicProduct: {
        summary: 'Basic Product',
        description: 'Example of basic product creation',
        value: {
          name: 'Premium Cleaning Service',
          description: 'Complete premium cleaning service for homes',
          price: 15000, // R$ 150.00 in centavos
          currency: 'BRL',
          serviceId: 1,
          isActive: true,
        },
      },
      premiumProduct: {
        summary: 'Premium Product',
        description: 'Example of premium product with Stripe integration',
        value: {
          name: 'Business Consultation Package',
          description:
            'Complete business consultation package for medium companies',
          price: 50000, // R$ 500.00 in centavos
          currency: 'BRL',
          serviceId: 2,
          stripeProductId: 'prod_example123',
          stripePriceId: 'price_example456',
          isActive: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  @ApiResponse({
    status: 409,
    description: 'A product with this name already exists for this service',
  })
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductEntity> {
    return this.productService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'List products with pagination and search' })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    type: 'number',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Items per page',
    type: 'number',
    required: false,
    example: 20,
  })
  @ApiQuery({
    name: 'search',
    description: 'Search term (name or description)',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'serviceId',
    description: 'Filter by service ID',
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'isActive',
    description: 'Filter by active status',
    type: 'boolean',
    required: false,
  })
  @ApiQuery({
    name: 'locationId',
    description: 'Filter by location ID',
    type: 'number',
    required: false,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of products',
    schema: {
      type: 'object',
      properties: {
        products: {
          type: 'array',
          items: { $ref: '#/components/schemas/ProductEntity' },
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
    @Query('search') search?: string,
    @Query('serviceId') serviceId?: number,
    @Query('isActive') isActive?: boolean | string,
    @Query('locationId') locationId?: number,
  ): Promise<{
    products: ProductEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const serviceIdNum = serviceId ? Number(serviceId) : undefined;
    const locationIdNum = locationId ? Number(locationId) : undefined;
    const isActiveBool =
      isActive !== undefined
        ? isActive === true || isActive === 'true'
        : undefined;

    return this.productService.findAll(
      pageNum,
      limitNum,
      search,
      serviceIdNum,
      isActiveBool,
      locationIdNum,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Product found',
    type: ProductEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ProductEntity> {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'id', description: 'Product ID', type: 'number' })
  @ApiBody({
    type: UpdateProductDto,
    description: 'Product update data',
    examples: {
      updateName: {
        summary: 'Update Name',
        description: 'Example of updating only the name',
        value: {
          name: 'Premium Cleaning Service Plus',
        },
      },
      updatePrice: {
        summary: 'Update Price',
        description: 'Example of updating the price',
        value: {
          price: 18000, // R$ 180.00 in centavos
        },
      },
      updateStatus: {
        summary: 'Update Status',
        description: 'Example of updating the active status',
        value: {
          isActive: false,
        },
      },
      updateComplete: {
        summary: 'Complete Update',
        description: 'Example of updating all fields',
        value: {
          name: 'Advanced Business Consultation',
          description: 'Advanced consultation with exclusive methodology',
          price: 75000, // R$ 750.00 in centavos
          serviceId: 3,
          stripeProductId: 'prod_updated123',
          stripePriceId: 'price_updated456',
          isActive: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 409,
    description: 'A product with this name already exists for this service',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductEntity> {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product (soft delete)' })
  @ApiParam({ name: 'id', description: 'Product ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete product with existing orders',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.productService.remove(id);
    return { message: 'Product deleted successfully' };
  }

  @Get('service/:serviceId')
  @ApiOperation({ summary: 'Get products by service ID' })
  @ApiParam({ name: 'serviceId', description: 'Service ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'List of products for the service',
    type: [ProductEntity],
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  async getProductsByService(
    @Param('serviceId', ParseIntPipe) serviceId: number,
  ): Promise<ProductEntity[]> {
    return this.productService.getServiceProducts(serviceId);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get product statistics' })
  @ApiParam({ name: 'id', description: 'Product ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Product statistics',
    schema: {
      type: 'object',
      properties: {
        product: { $ref: '#/components/schemas/ProductEntity' },
        stats: {
          type: 'object',
          properties: {
            totalOrders: { type: 'number', example: 25 },
            totalRevenue: {
              type: 'number',
              example: 375000,
              description: 'Total revenue in centavos',
            },
            activeOrders: { type: 'number', example: 5 },
          },
        },
        recentOrders: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              quantity: { type: 'number' },
              totalAmount: { type: 'number' },
              status: { type: 'string' },
              customer: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                },
              },
              service: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                },
              },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async getStats(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getProductStats(id);
  }
}
