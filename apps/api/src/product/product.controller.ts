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
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('products')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductEntity> {
    return this.productService.create(createProductDto);
  }

  @Get()
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
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ProductEntity> {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductEntity> {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.productService.remove(id);
    return { message: 'Product deleted successfully' };
  }

  @Get('service/:serviceId')
  async getProductsByService(
    @Param('serviceId', ParseIntPipe) serviceId: number,
  ): Promise<ProductEntity[]> {
    return this.productService.getServiceProducts(serviceId);
  }

  @Get(':id/stats')
  async getStats(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getProductStats(id);
  }
}
