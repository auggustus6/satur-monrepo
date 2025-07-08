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
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ManageServiceUsersDto } from './dto/manage-service-users.dto';
import { ServiceEntity } from './entities/service.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('services')
@Controller('services')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo serviço' })
  @ApiBody({
    type: CreateServiceDto,
    description: 'Dados para criação do serviço',
    examples: {
      basicService: {
        summary: 'Serviço Básico',
        description: 'Exemplo de criação de serviço básico',
        value: {
          name: 'Limpeza Residencial',
          description: 'Serviço completo de limpeza para residências',
          locationId: 1,
          isActive: true,
          userIds: [1, 2],
        },
      },
      premiumService: {
        summary: 'Serviço Premium',
        description: 'Exemplo de criação de serviço premium',
        value: {
          name: 'Consultoria Empresarial',
          description: 'Consultoria especializada para empresas de médio porte',
          locationId: 2,
          isActive: true,
          userIds: [3],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Serviço criado com sucesso',
    type: ServiceEntity,
  })
  @ApiResponse({
    status: 409,
    description: 'Já existe um serviço com este nome',
  })
  async create(
    @Body() createServiceDto: CreateServiceDto,
  ): Promise<ServiceEntity> {
    return this.serviceService.create(createServiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar serviços com paginação e busca' })
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
    description: 'Termo de busca (nome ou descrição)',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'locationId',
    description: 'Filtrar por localização',
    type: 'number',
    required: false,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de serviços',
    schema: {
      type: 'object',
      properties: {
        services: {
          type: 'array',
          items: { $ref: '#/components/schemas/ServiceEntity' },
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
  @ApiOperation({ summary: 'Listar todos os serviços (sem paginação)' })
  @ApiResponse({
    status: 200,
    description: 'Lista completa de serviços',
    type: [ServiceEntity],
  })
  async findAllLegacy(): Promise<ServiceEntity[]> {
    return this.serviceService.findAllLegacy();
  }

  @Get('popular')
  @ApiOperation({ summary: 'Listar serviços mais populares' })
  @ApiQuery({
    name: 'limit',
    description: 'Número máximo de serviços a retornar',
    type: 'number',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de serviços mais populares',
  })
  async getPopularServices(@Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.serviceService.getPopularServices(limitNumber);
  }

  @Get('search-users')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Buscar usuários para associação com serviços' })
  @ApiQuery({ name: 'search', type: 'string', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários encontrados',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string' },
          locationId: { type: 'number' },
        },
      },
    },
  })
  async searchUsers(
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ): Promise<any[]> {
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    return this.serviceService.searchUsers(search, limitNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar serviço por ID' })
  @ApiParam({ name: 'id', description: 'ID do serviço', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Serviço encontrado',
    type: ServiceEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Serviço não encontrado',
  })
  async findOne(@Param('id') id: string): Promise<ServiceEntity> {
    return this.serviceService.findOne(parseInt(id, 10));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar serviço' })
  @ApiParam({ name: 'id', description: 'ID do serviço', type: 'number' })
  @ApiBody({
    type: UpdateServiceDto,
    description: 'Dados para atualização do serviço',
    examples: {
      updateName: {
        summary: 'Atualizar Nome',
        description: 'Exemplo de atualização apenas do nome',
        value: {
          name: 'Limpeza Residencial Premium',
        },
      },
      updateStatus: {
        summary: 'Atualizar Status',
        description: 'Exemplo de atualização do status do serviço',
        value: {
          isActive: false,
        },
      },
      updateComplete: {
        summary: 'Atualização Completa',
        description: 'Exemplo de atualização de todos os campos',
        value: {
          name: 'Consultoria Empresarial Avançada',
          description: 'Consultoria especializada com metodologia exclusiva',
          locationId: 3,
          isActive: true,
          userIds: [1, 4, 5],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Serviço atualizado com sucesso',
    type: ServiceEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Serviço não encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Já existe um serviço com este nome',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceEntity> {
    return this.serviceService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar serviço' })
  @ApiParam({ name: 'id', description: 'ID do serviço', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Serviço deletado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Serviço não encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Não é possível deletar serviço com solicitações associadas',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.serviceService.remove(id);
    return { message: 'Serviço deletado com sucesso' };
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Obter estatísticas do serviço' })
  @ApiParam({ name: 'id', description: 'ID do serviço', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas do serviço',
  })
  @ApiResponse({
    status: 404,
    description: 'Serviço não encontrado',
  })
  async getStats(@Param('id', ParseIntPipe) id: number) {
    return this.serviceService.getServiceStats(id);
  }

  @Post(':id/users')
  @ApiOperation({ summary: 'Associar usuários ao serviço' })
  @ApiParam({ name: 'id', description: 'ID do serviço', type: 'number' })
  @ApiBody({
    type: ManageServiceUsersDto,
    description: 'IDs dos usuários para associar',
    examples: {
      associateUsers: {
        summary: 'Associar Usuários',
        description: 'Exemplo de associação de usuários ao serviço',
        value: {
          userIds: [1, 2, 3],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Usuários associados com sucesso',
    type: ServiceEntity,
  })
  @ApiResponse({
    status: 400,
    description:
      'Erro de validação (ex: usuário SUPPLIER com localidade diferente)',
  })
  @ApiResponse({
    status: 404,
    description: 'Serviço não encontrado',
  })
  async addUsersToService(
    @Param('id', ParseIntPipe) id: number,
    @Body() manageUsersDto: ManageServiceUsersDto,
  ): Promise<ServiceEntity> {
    return this.serviceService.addUsersToService(id, manageUsersDto);
  }

  @Delete(':id/users')
  @ApiOperation({ summary: 'Remover usuários do serviço' })
  @ApiParam({ name: 'id', description: 'ID do serviço', type: 'number' })
  @ApiBody({
    description: 'IDs dos usuários para remover',
    schema: {
      type: 'object',
      properties: {
        userIds: {
          type: 'array',
          items: { type: 'number' },
          example: [1, 2],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Usuários removidos com sucesso',
    type: ServiceEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Serviço não encontrado',
  })
  async removeUsersFromService(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { userIds: number[] },
  ): Promise<ServiceEntity> {
    return this.serviceService.removeUsersFromService(id, body.userIds);
  }
}
