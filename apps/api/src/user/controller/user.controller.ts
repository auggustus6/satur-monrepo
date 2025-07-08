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
  Query,
  ParseIntPipe,
  ParseBoolPipe,
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
import { UserService } from '../service/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ApproveSupplierDto } from '../dto/approve-supplier.dto';
import { UserEntity } from '../entities/user.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo usuário' })
  @ApiBody({
    type: CreateUserDto,
    description: 'Dados para criação do usuário',
    examples: {
      customer: {
        summary: 'Criar Cliente',
        description: 'Exemplo de criação de usuário do tipo cliente (padrão)',
        value: {
          name: 'João Silva',
          email: 'joao@cliente.com',
          password: 'senha123',
          phone: '+55 11 99999-9999',
          address: 'Rua das Flores, 123',
          city: 'São Paulo',
          document: '12345678901',
          documentType: 'CPF',
        },
      },
      agency: {
        summary: 'Criar Agência',
        description: 'Exemplo de criação de usuário do tipo agência',
        value: {
          name: 'Maria Santos',
          email: 'maria@agencia.com',
          password: 'senha456',
          phone: '+55 11 88888-8888',
          role: 'AGENCY',
          address: 'Av. Principal, 456',
          city: 'São Paulo',
          document: '12345678901',
          documentType: 'CPF',
        },
      },
      supplier: {
        summary: 'Criar Fornecedor',
        description: 'Exemplo de criação de usuário do tipo fornecedor',
        value: {
          name: 'Carlos Oliveira',
          email: 'carlos@fornecedor.com',
          password: 'senha789',
          phone: '+55 21 77777-7777',
          role: 'SUPPLIER',
          address: 'Rua Comercial, 789',
          city: 'Rio de Janeiro',
          document: '12345678000123',
          documentType: 'CNPJ',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    type: UserEntity,
  })
  @ApiResponse({
    status: 409,
    description: 'Email já está em uso',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar todos os usuários com paginação (admin only)',
  })
  @ApiQuery({
    name: 'page',
    description: 'Número da página',
    type: 'number',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Número de itens por página',
    type: 'number',
    required: false,
    example: 20,
  })
  @ApiQuery({
    name: 'search',
    description: 'Termo de busca (nome ou email)',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'role',
    description: 'Filtrar por role',
    type: 'string',
    required: false,
    enum: ['ALL', 'ADMIN', 'AGENCY', 'SUPPLIER', 'CUSTOMER'],
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de usuários',
    schema: {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: { $ref: '#/components/schemas/UserEntity' },
        },
        total: { type: 'number', example: 100 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 },
        totalPages: { type: 'number', example: 5 },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado. Apenas administradores',
  })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
    @Query('role') role?: string,
  ): Promise<{
    users: UserEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    return this.userService.findAll(pageNum, limitNum, search, role);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiParam({ name: 'id', description: 'ID do usuário', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado',
    type: UserEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário', type: 'number' })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Dados para atualização do usuário',
    examples: {
      updateBasicInfo: {
        summary: 'Atualizar Informações Básicas',
        description: 'Exemplo de atualização de nome e telefone',
        value: {
          name: 'João Silva Santos',
          phone: '+55 11 99999-0000',
        },
      },
      updateAddress: {
        summary: 'Atualizar Endereço',
        description: 'Exemplo de atualização de endereço e cidade',
        value: {
          address: 'Rua Nova, 789',
          city: 'Brasília',
        },
      },
      updateDocument: {
        summary: 'Atualizar Documento',
        description: 'Exemplo de atualização de documento',
        value: {
          document: '98765432100',
          documentType: 'CPF',
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
    status: 404,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Email já está em uso',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Usuário deletado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.userService.remove(id);
    return { message: 'Usuário deletado com sucesso' };
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aprovar/reprovar fornecedor (admin only)' })
  @ApiParam({ name: 'id', description: 'ID do fornecedor', type: 'number' })
  @ApiBody({
    type: ApproveSupplierDto,
    description: 'Dados para aprovação/reprovação do fornecedor',
    examples: {
      approve: {
        summary: 'Aprovar Fornecedor',
        description: 'Exemplo de aprovação de fornecedor',
        value: {
          isApproved: true,
        },
      },
      reject: {
        summary: 'Reprovar Fornecedor',
        description: 'Exemplo de reprovação de fornecedor',
        value: {
          isApproved: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Status de aprovação atualizado com sucesso',
    type: UserEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Apenas fornecedores podem ser aprovados',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  async approveSupplier(
    @Param('id', ParseIntPipe) id: number,
    @Body() approveDto: ApproveSupplierDto,
  ): Promise<UserEntity> {
    return this.userService.approveSupplier(id, approveDto);
  }

  @Get('suppliers/approval-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar fornecedores por status de aprovação (admin only)',
  })
  @ApiQuery({
    name: 'approved',
    description: 'Status de aprovação (true/false)',
    type: 'boolean',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de fornecedores filtrados por status de aprovação',
    type: [UserEntity],
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado. Apenas administradores',
  })
  async getSuppliersByApprovalStatus(
    @Query('approved', ParseBoolPipe) isApproved: boolean,
  ): Promise<UserEntity[]> {
    return this.userService.getSuppliersByApprovalStatus(isApproved);
  }

  @Get('by-role/:role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar usuários por role (admin only)' })
  @ApiParam({
    name: 'role',
    description: 'Role do usuário',
    enum: UserRole,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários filtrados por role',
    type: [UserEntity],
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado. Apenas administradores',
  })
  async getUsersByRole(@Param('role') role: UserRole): Promise<UserEntity[]> {
    return this.userService.getUsersByRole(role);
  }
}
