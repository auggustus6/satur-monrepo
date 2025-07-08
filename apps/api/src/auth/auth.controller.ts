import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserEntity } from '../user/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Fazer login',
    description:
      'Autentica o usuário com email e senha, retornando um token JWT para acesso às rotas protegidas.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Credenciais de login',
    examples: {
      admin: {
        summary: 'Login Admin',
        description: 'Exemplo de login como administrador',
        value: {
          email: 'admin@exemplo.com',
          password: 'admin123',
        },
      },
      agency: {
        summary: 'Login Agência',
        description: 'Exemplo de login como agência',
        value: {
          email: 'agencia@exemplo.com',
          password: 'agencia123',
        },
      },
      supplier: {
        summary: 'Login Fornecedor',
        description: 'Exemplo de login como fornecedor',
        value: {
          email: 'fornecedor@exemplo.com',
          password: 'fornecedor123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'João Silva' },
            email: { type: 'string', example: 'joao@exemplo.com' },
            role: { type: 'string', example: 'AGENCY' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Credenciais inválidas',
        },
        statusCode: {
          type: 'number',
          example: 401,
        },
      },
    },
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter perfil do usuário autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil do usuário',
    type: UserEntity,
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou expirado',
  })
  async getProfile(
    @CurrentUser() user: { id: number; email: string; role: string },
  ): Promise<UserEntity> {
    return this.authService.getProfile(user.id);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Alterar senha do usuário autenticado',
    description:
      'Permite que o usuário autenticado altere sua senha fornecendo a senha atual e a nova senha. Requer autenticação via Bearer token.',
  })
  @ApiBody({
    type: ChangePasswordDto,
    description: 'Dados para alteração de senha',
    examples: {
      changePassword: {
        summary: 'Alterar Senha',
        description: 'Exemplo de alteração de senha',
        value: {
          currentPassword: 'minhasenhaatual123',
          newPassword: 'minhannovasenha456',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Senha alterada com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Senha alterada com sucesso',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Senha atual incorreta ou nova senha inválida',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Senha atual incorreta',
        },
        error: {
          type: 'string',
          example: 'Bad Request',
        },
        statusCode: {
          type: 'number',
          example: 400,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou expirado',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Unauthorized',
        },
        statusCode: {
          type: 'number',
          example: 401,
        },
      },
    },
  })
  async changePassword(
    @CurrentUser() user: { id: number; email: string; role: string },
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, changePasswordDto);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar perfil do usuário autenticado' })
  @ApiBody({
    type: UpdateProfileDto,
    description: 'Dados para atualização do perfil',
    examples: {
      updateBasicInfo: {
        summary: 'Atualizar Informações Básicas',
        description: 'Exemplo de atualização de nome e telefone',
        value: {
          name: 'João Silva Santos',
          phone: '+55 11 99999-0000',
        },
      },
      updateContact: {
        summary: 'Atualizar Contato',
        description: 'Exemplo de atualização de email e telefone',
        value: {
          email: 'novoemail@exemplo.com',
          phone: '+55 11 88888-8888',
        },
      },
      updateAddress: {
        summary: 'Atualizar Endereço',
        description: 'Exemplo de atualização de endereço completo',
        value: {
          address: 'Rua Nova, 789',
          city: 'Brasília',
        },
      },
      clearOptionalFields: {
        summary: 'Limpar Campos Opcionais',
        description: 'Exemplo de como limpar campos opcionais (string vazia)',
        value: {
          phone: '',
          photoUrl: '',
          address: '',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil atualizado com sucesso',
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
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou expirado',
  })
  async updateProfile(
    @CurrentUser() user: { id: number; email: string; role: string },
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserEntity> {
    return this.authService.updateProfile(user.id, updateProfileDto);
  }
}
