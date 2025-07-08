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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UserEntity } from '../user/entities/user.entity';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('admin')
@Controller('admin')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // CRUD de usuários
  @Get('users')
  @ApiOperation({ summary: 'Listar todos os usuários (admin only)' })
  @ApiQuery({ name: 'role', enum: UserRole, required: false })
  @ApiQuery({ name: 'isApproved', type: 'boolean', required: false })
  @ApiQuery({
    name: 'search',
    type: 'string',
    required: false,
    description: 'Buscar por nome ou email',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários',
    type: [UserEntity],
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado. Apenas administradores',
  })
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
  @ApiOperation({
    summary: 'Buscar usuário por ID com detalhes completos (admin only)',
  })
  @ApiParam({ name: 'id', description: 'ID do usuário', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado com detalhes completos',
    type: UserEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  async getUserById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserEntity> {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Atualizar usuário (admin only)' })
  @ApiParam({ name: 'id', description: 'ID do usuário', type: 'number' })
  @ApiBody({
    type: UpdateUserAdminDto,
    description: 'Dados para atualização do usuário (admin)',
    examples: {
      updateBasicInfo: {
        summary: 'Atualizar Informações Básicas',
        description: 'Exemplo de atualização de nome e telefone',
        value: {
          name: 'João Silva Santos',
          phone: '+55 11 99999-0000',
        },
      },
      approveUser: {
        summary: 'Aprovar Usuário',
        description: 'Exemplo de aprovação de usuário',
        value: {
          isApproved: true,
        },
      },
      updateContact: {
        summary: 'Atualizar Contato',
        description: 'Exemplo de atualização de email',
        value: {
          email: 'novoemail@exemplo.com',
        },
      },
      completeUpdate: {
        summary: 'Atualização Completa',
        description: 'Exemplo de atualização de múltiplos campos',
        value: {
          name: 'Maria Santos Silva',
          email: 'maria.santos@exemplo.com',
          phone: '+55 21 88888-8888',
          isApproved: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso',
    type: UserEntity,
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado. Apenas administradores',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateUserAdminDto,
    @CurrentUser() user: { id: number; email: string; role: string },
  ): Promise<UserEntity> {
    return this.adminService.updateUser(id, updateData, user.id);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Deletar usuário (admin only)' })
  @ApiParam({ name: 'id', description: 'ID do usuário', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Usuário deletado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Usuário possui dependências e não pode ser deletado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado. Apenas administradores',
  })
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; email: string; role: string },
  ): Promise<{ message: string }> {
    await this.adminService.deleteUser(id, user.id);
    return { message: 'Usuário deletado com sucesso' };
  }

  // Dashboard de serviços
  @Get('dashboard/top-services')
  @ApiOperation({ summary: 'Top serviços mais contratados (admin only)' })
  @ApiQuery({
    name: 'limit',
    description: 'Número máximo de serviços a retornar',
    type: 'number',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista dos serviços mais contratados',
  })
  async getTopServices(@Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.adminService.getTopServices(limitNumber);
  }

  @Get('dashboard/top-suppliers')
  @ApiOperation({
    summary: 'Top fornecedores por média de rating (admin only)',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Número máximo de fornecedores a retornar',
    type: 'number',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista dos melhores fornecedores',
  })
  async getTopSuppliers(@Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.adminService.getTopSuppliers(limitNumber);
  }

  // Relatórios financeiros
  @Get('reports/financial')
  @ApiOperation({ summary: 'Relatório financeiro detalhado (admin only)' })
  @ApiQuery({
    name: 'from',
    type: 'string',
    required: false,
    description: 'Data inicial (ISO 8601)',
  })
  @ApiQuery({
    name: 'to',
    type: 'string',
    required: false,
    description: 'Data final (ISO 8601)',
  })
  @ApiQuery({ name: 'agencyId', type: 'number', required: false })
  @ApiQuery({ name: 'supplierId', type: 'number', required: false })
  @ApiResponse({
    status: 200,
    description: 'Relatório financeiro completo',
  })
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
  @ApiOperation({ summary: 'Estatísticas gerais do sistema (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas gerais da plataforma',
  })
  async getSystemStats() {
    return this.adminService.getSystemStats();
  }
}
