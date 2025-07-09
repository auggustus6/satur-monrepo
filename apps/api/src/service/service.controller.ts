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
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ManageServiceUsersDto } from './dto/manage-service-users.dto';
import { ServiceEntity } from './entities/service.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('services')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  async create(
    @Body() createServiceDto: CreateServiceDto,
  ): Promise<ServiceEntity> {
    return this.serviceService.create(createServiceDto);
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
    @Query('locationId') locationId?: number,
  ): Promise<{
    services: ServiceEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const locationIdNum = locationId ? Number(locationId) : undefined;
    return this.serviceService.findAll(
      pageNum,
      limitNum,
      search,
      locationIdNum,
    );
  }

  @Get('all')
  async findAllLegacy(): Promise<ServiceEntity[]> {
    return this.serviceService.findAllLegacy();
  }

  @Get('popular')
  async getPopularServices(@Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.serviceService.getPopularServices(limitNumber);
  }

  @Get('search-users')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async searchUsers(
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ): Promise<any[]> {
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    return this.serviceService.searchUsers(search, limitNumber);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ServiceEntity> {
    return this.serviceService.findOne(parseInt(id, 10));
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceEntity> {
    return this.serviceService.update(id, updateServiceDto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.serviceService.remove(id);
    return { message: 'Serviço deletado com sucesso' };
  }

  @Get(':id/stats')
  async getStats(@Param('id', ParseIntPipe) id: number) {
    return this.serviceService.getServiceStats(id);
  }

  @Post(':id/users')
  async addUsersToService(
    @Param('id', ParseIntPipe) id: number,
    @Body() manageUsersDto: ManageServiceUsersDto,
  ): Promise<ServiceEntity> {
    return this.serviceService.addUsersToService(id, manageUsersDto);
  }

  @Delete(':id/users')
  async removeUsersFromService(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { userIds: number[] },
  ): Promise<ServiceEntity> {
    return this.serviceService.removeUsersFromService(id, body.userIds);
  }
}
