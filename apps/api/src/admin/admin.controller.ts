/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseIntPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { UserEntity } from '../user/entities/user.entity';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('admin')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // CRUD de usuários
  @Get('users')
  async getAllUsers(
    @Query('role') role?: UserRole,
    @Query('isApproved') isApproved?: string,
    @Query('search') search?: string,
  ): Promise<UserEntity[]> {
    const filters: any = {};

    if (role) filters.role = role;
    if (isApproved !== undefined) filters.isApproved = isApproved === 'true';
    if (search) filters.search = search;

    return this.adminService.getAllUsers(filters);
  }

  @Get('users/:id')
  async getUserById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserEntity> {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateUserAdminDto,
    @CurrentUser() user: { id: number; email: string; role: string },
  ): Promise<UserEntity> {
    return this.adminService.updateUser(id, updateData, user.id);
  }

  @Delete('users/:id')
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; email: string; role: string },
  ): Promise<{ message: string }> {
    await this.adminService.deleteUser(id, user.id);
    return { message: 'Usuário deletado com sucesso' };
  }

  // Dashboard de serviços
  @Get('dashboard/top-services')
  async getTopServices(@Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.adminService.getTopServices(limitNumber);
  }

  @Get('dashboard/top-suppliers')
  async getTopSuppliers(@Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.adminService.getTopSuppliers(limitNumber);
  }

  // Relatórios financeiros
  @Get('reports/financial')
  async getFinancialReport(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('agencyId') agencyId?: string,
    @Query('supplierId') supplierId?: string,
  ) {
    const filters: any = {};

    if (from) filters.from = new Date(from);
    if (to) filters.to = new Date(to);
    if (agencyId) filters.agencyId = parseInt(agencyId, 10);
    if (supplierId) filters.supplierId = parseInt(supplierId, 10);

    return this.adminService.getFinancialReport(filters);
  }

  // Estatísticas gerais do sistema
  @Get('dashboard/stats')
  async getSystemStats() {
    return this.adminService.getSystemStats();
  }
}
