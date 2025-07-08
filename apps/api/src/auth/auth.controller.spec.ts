import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRole } from '@prisma/client';
import { UserEntity } from '../user/entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn(),
    getProfile: jest.fn(),
    changePassword: jest.fn(),
    updateProfile: jest.fn(),
  };

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@test.com',
    role: UserRole.AGENCY,
    isApproved: true,
    createdAt: new Date(),
  };

  const mockLoginResponse = {
    access_token: 'jwt.token.here',
    user: {
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      role: mockUser.role,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@test.com',
      password: 'password123',
    };

    it('deve retornar token e dados do usuário quando login é bem-sucedido', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockLoginResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });

    it('deve propagar UnauthorizedException do service', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Credenciais inválidas'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.login(loginDto)).rejects.toThrow(
        'Credenciais inválidas',
      );

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });

    it('deve aceitar diferentes tipos de credenciais', async () => {
      const adminLoginDto = {
        email: 'admin@test.com',
        password: 'adminPassword',
      };

      const adminLoginResponse = {
        ...mockLoginResponse,
        user: {
          ...mockLoginResponse.user,
          email: 'admin@test.com',
          role: UserRole.ADMIN,
        },
      };

      mockAuthService.login.mockResolvedValue(adminLoginResponse);

      const result = await controller.login(adminLoginDto);

      expect(result).toEqual(adminLoginResponse);
      expect(result.user.role).toBe(UserRole.ADMIN);
      expect(mockAuthService.login).toHaveBeenCalledWith(adminLoginDto);
    });

    it('deve validar formato do email', async () => {
      const invalidEmailDto = {
        email: 'email-invalido',
        password: 'password123',
      };

      // O controller não faz validação direta, mas o DTO pode fazer
      // Aqui testamos que o controller passa os dados para o service
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Email inválido'),
      );

      await expect(controller.login(invalidEmailDto)).rejects.toThrow();
      expect(mockAuthService.login).toHaveBeenCalledWith(invalidEmailDto);
    });

    it('deve lidar com senha vazia', async () => {
      const emptyPasswordDto = {
        email: 'test@test.com',
        password: '',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Senha é obrigatória'),
      );

      await expect(controller.login(emptyPasswordDto)).rejects.toThrow();
      expect(mockAuthService.login).toHaveBeenCalledWith(emptyPasswordDto);
    });

    it('deve propagar outros erros do service', async () => {
      const internalError = new Error('Erro interno do servidor');
      mockAuthService.login.mockRejectedValue(internalError);

      await expect(controller.login(loginDto)).rejects.toThrow(
        'Erro interno do servidor',
      );
    });
  });

  describe('getProfile', () => {
    const mockCurrentUser = {
      id: 1,
      email: 'test@test.com',
      role: UserRole.AGENCY,
    };

    const mockUserEntity = new UserEntity(mockUser);

    it('deve retornar perfil do usuário autenticado', async () => {
      mockAuthService.getProfile.mockResolvedValue(mockUserEntity);

      const result = await controller.getProfile(mockCurrentUser);

      expect(result).toEqual(mockUserEntity);
      expect(mockAuthService.getProfile).toHaveBeenCalledWith(
        mockCurrentUser.id,
      );
    });

    it('deve funcionar com usuário admin', async () => {
      const adminUser = {
        id: 2,
        email: 'admin@test.com',
        role: UserRole.ADMIN,
      };

      const adminUserEntity = new UserEntity({
        ...mockUser,
        id: 2,
        email: 'admin@test.com',
        role: UserRole.ADMIN,
      });

      mockAuthService.getProfile.mockResolvedValue(adminUserEntity);

      const result = await controller.getProfile(adminUser);

      expect(result).toEqual(adminUserEntity);
      expect(result.role).toBe(UserRole.ADMIN);
      expect(mockAuthService.getProfile).toHaveBeenCalledWith(adminUser.id);
    });

    it('deve funcionar com usuário fornecedor', async () => {
      const supplierUser = {
        id: 3,
        email: 'supplier@test.com',
        role: UserRole.SUPPLIER,
      };

      const supplierUserEntity = new UserEntity({
        ...mockUser,
        id: 3,
        email: 'supplier@test.com',
        role: UserRole.SUPPLIER,
      });

      mockAuthService.getProfile.mockResolvedValue(supplierUserEntity);

      const result = await controller.getProfile(supplierUser);

      expect(result).toEqual(supplierUserEntity);
      expect(result.role).toBe(UserRole.SUPPLIER);
      expect(mockAuthService.getProfile).toHaveBeenCalledWith(supplierUser.id);
    });

    it('deve propagar erro quando usuário não existe', async () => {
      const nonExistentUser = {
        id: 999,
        email: 'inexistente@test.com',
        role: UserRole.AGENCY,
      };

      mockAuthService.getProfile.mockResolvedValue(null);

      const result = await controller.getProfile(nonExistentUser);

      expect(result).toBeNull();
      expect(mockAuthService.getProfile).toHaveBeenCalledWith(
        nonExistentUser.id,
      );
    });

    it('deve propagar erro do service', async () => {
      const error = new Error('Erro no banco de dados');
      mockAuthService.getProfile.mockRejectedValue(error);

      await expect(controller.getProfile(mockCurrentUser)).rejects.toThrow(
        'Erro no banco de dados',
      );
      expect(mockAuthService.getProfile).toHaveBeenCalledWith(
        mockCurrentUser.id,
      );
    });

    it('deve usar o ID correto do usuário autenticado', async () => {
      const userWithDifferentId = {
        id: 42,
        email: 'user42@test.com',
        role: UserRole.AGENCY,
      };

      mockAuthService.getProfile.mockResolvedValue(mockUserEntity);

      await controller.getProfile(userWithDifferentId);

      expect(mockAuthService.getProfile).toHaveBeenCalledWith(42);
    });
  });

  describe('integração entre métodos', () => {
    it('deve permitir login seguido de getProfile', async () => {
      const loginDto = {
        email: 'test@test.com',
        password: 'password123',
      };

      // Simular login
      mockAuthService.login.mockResolvedValue(mockLoginResponse);
      const loginResult = await controller.login(loginDto);

      // Simular getProfile com o usuário logado
      const currentUser = {
        id: loginResult.user.id,
        email: loginResult.user.email,
        role: loginResult.user.role,
      };

      mockAuthService.getProfile.mockResolvedValue(new UserEntity(mockUser));
      const profileResult = await controller.getProfile(currentUser);

      expect(loginResult.user.id).toBe(profileResult.id);
      expect(loginResult.user.email).toBe(profileResult.email);
    });
  });

  describe('changePassword', () => {
    const changePasswordDto: ChangePasswordDto = {
      currentPassword: 'currentPassword123',
      newPassword: 'newPassword456',
    };

    const currentUser = {
      id: 1,
      email: 'test@test.com',
      role: 'AGENCY',
    };

    it('deve alterar senha com sucesso', async () => {
      const successResponse = { message: 'Senha alterada com sucesso' };
      mockAuthService.changePassword.mockResolvedValue(successResponse);

      const result = await controller.changePassword(
        currentUser,
        changePasswordDto,
      );

      expect(result).toEqual(successResponse);
      expect(mockAuthService.changePassword).toHaveBeenCalledWith(
        currentUser.id,
        changePasswordDto,
      );
    });

    it('deve propagar BadRequestException quando senha atual está incorreta', async () => {
      mockAuthService.changePassword.mockRejectedValue(
        new BadRequestException('Senha atual incorreta'),
      );

      await expect(
        controller.changePassword(currentUser, changePasswordDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.changePassword(currentUser, changePasswordDto),
      ).rejects.toThrow('Senha atual incorreta');
    });

    it('deve propagar BadRequestException quando nova senha é igual à atual', async () => {
      mockAuthService.changePassword.mockRejectedValue(
        new BadRequestException(
          'A nova senha deve ser diferente da senha atual',
        ),
      );

      await expect(
        controller.changePassword(currentUser, changePasswordDto),
      ).rejects.toThrow('A nova senha deve ser diferente da senha atual');
    });

    it('deve propagar UnauthorizedException quando usuário não existe', async () => {
      mockAuthService.changePassword.mockRejectedValue(
        new UnauthorizedException('Usuário não encontrado'),
      );

      await expect(
        controller.changePassword(currentUser, changePasswordDto),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve funcionar com diferentes tipos de usuário', async () => {
      const supplierUser = {
        id: 2,
        email: 'supplier@test.com',
        role: 'SUPPLIER',
      };

      const successResponse = { message: 'Senha alterada com sucesso' };
      mockAuthService.changePassword.mockResolvedValue(successResponse);

      const result = await controller.changePassword(
        supplierUser,
        changePasswordDto,
      );

      expect(result).toEqual(successResponse);
      expect(mockAuthService.changePassword).toHaveBeenCalledWith(
        supplierUser.id,
        changePasswordDto,
      );
    });
  });

  describe('updateProfile', () => {
    const updateProfileDto: UpdateProfileDto = {
      name: 'Nome Atualizado',
      email: 'novo@email.com',
      phone: '+5511999999999',
      photoUrl: 'https://exemplo.com/nova-foto.jpg',
    };

    const currentUser = {
      id: 1,
      email: 'test@test.com',
      role: 'AGENCY',
    };

    const updatedUserEntity = new UserEntity({
      id: 1,
      name: 'Nome Atualizado',
      email: 'novo@email.com',
      phone: '+5511999999999',
      photoUrl: 'https://exemplo.com/nova-foto.jpg',
      role: UserRole.AGENCY,
      isApproved: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    it('deve atualizar perfil com sucesso', async () => {
      mockAuthService.updateProfile.mockResolvedValue(updatedUserEntity);

      const result = await controller.updateProfile(
        currentUser,
        updateProfileDto,
      );

      expect(result).toEqual(updatedUserEntity);
      expect(mockAuthService.updateProfile).toHaveBeenCalledWith(
        currentUser.id,
        updateProfileDto,
      );
    });

    it('deve atualizar perfil com dados parciais', async () => {
      const partialUpdateDto: UpdateProfileDto = {
        name: 'Apenas Nome Novo',
      };

      const partiallyUpdatedUser = new UserEntity({
        ...mockUser,
        name: 'Apenas Nome Novo',
      });

      mockAuthService.updateProfile.mockResolvedValue(partiallyUpdatedUser);

      const result = await controller.updateProfile(
        currentUser,
        partialUpdateDto,
      );

      expect(result).toEqual(partiallyUpdatedUser);
      expect(mockAuthService.updateProfile).toHaveBeenCalledWith(
        currentUser.id,
        partialUpdateDto,
      );
    });

    it('deve propagar erro quando usuário não existe', async () => {
      const error = new Error('Usuário não encontrado');
      mockAuthService.updateProfile.mockRejectedValue(error);

      await expect(
        controller.updateProfile(currentUser, updateProfileDto),
      ).rejects.toThrow('Usuário não encontrado');
    });

    it('deve propagar erro quando email já está em uso', async () => {
      const error = new Error('Email já está em uso');
      mockAuthService.updateProfile.mockRejectedValue(error);

      await expect(
        controller.updateProfile(currentUser, updateProfileDto),
      ).rejects.toThrow('Email já está em uso');
    });

    it('deve funcionar com diferentes tipos de usuário', async () => {
      const adminUser = {
        id: 3,
        email: 'admin@test.com',
        role: 'ADMIN',
      };

      const updatedAdminUser = new UserEntity({
        ...mockUser,
        id: 3,
        email: 'admin@test.com',
        role: UserRole.ADMIN,
        ...updateProfileDto,
      });

      mockAuthService.updateProfile.mockResolvedValue(updatedAdminUser);

      const result = await controller.updateProfile(
        adminUser,
        updateProfileDto,
      );

      expect(result).toEqual(updatedAdminUser);
      expect(result.role).toBe(UserRole.ADMIN);
    });
  });
});
