import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/service/user.service';
import { UserRole } from '@prisma/client';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcrypt';

// Mock do bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;

  const mockUserService = {
    findByEmail: jest.fn(),
    findOne: jest.fn(),
    findByIdWithPassword: jest.fn(),
    updatePassword: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@test.com',
    password: 'hashedPassword123',
    role: UserRole.AGENCY,
    isApproved: true,
    createdAt: new Date(),
  };

  const mockUserWithoutPassword = {
    id: 1,
    name: 'Test User',
    email: 'test@test.com',
    role: UserRole.AGENCY,
    isApproved: true,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('deve retornar usuário sem senha quando credenciais são válidas', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validateUser('test@test.com', 'password123');

      expect(result).toEqual(mockUserWithoutPassword);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith('test@test.com');
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword123',
      );
    });

    it('deve retornar null quando usuário não existe', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'inexistente@test.com',
        'password123',
      );

      expect(result).toBeNull();
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(
        'inexistente@test.com',
      );
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
    });

    it('deve retornar null quando senha é inválida', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validateUser('test@test.com', 'senhaErrada');

      expect(result).toBeNull();
      expect(mockUserService.findByEmail).toHaveBeenCalledWith('test@test.com');
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        'senhaErrada',
        'hashedPassword123',
      );
    });

    it('deve lidar com erro na comparação de senha', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockRejectedValue(
        new Error('Erro no bcrypt') as never,
      );

      await expect(
        service.validateUser('test@test.com', 'password123'),
      ).rejects.toThrow('Erro no bcrypt');
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@test.com',
      password: 'password123',
    };

    const mockToken = 'jwt.token.here';

    it('deve retornar token e dados do usuário quando login é bem-sucedido', async () => {
      const validateUserSpy = jest
        .spyOn(service, 'validateUser')
        .mockResolvedValue(mockUserWithoutPassword);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
        },
      });

      expect(validateUserSpy).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        role: mockUser.role,
      });
    });

    it('deve lançar UnauthorizedException quando credenciais são inválidas', async () => {
      const validateUserSpy = jest
        .spyOn(service, 'validateUser')
        .mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Credenciais inválidas',
      );

      expect(validateUserSpy).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('deve gerar payload JWT correto', async () => {
      const supplierUser = {
        ...mockUserWithoutPassword,
        role: UserRole.SUPPLIER,
      };

      jest.spyOn(service, 'validateUser').mockResolvedValue(supplierUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      await service.login(loginDto);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: supplierUser.email,
        sub: supplierUser.id,
        role: UserRole.SUPPLIER,
      });
    });

    it('deve propagar erro do validateUser', async () => {
      const error = new Error('Erro no banco de dados');
      jest.spyOn(service, 'validateUser').mockRejectedValue(error);

      await expect(service.login(loginDto)).rejects.toThrow(
        'Erro no banco de dados',
      );
    });
  });

  describe('getProfile', () => {
    it('deve retornar perfil do usuário quando ID é válido', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile(1);

      expect(result).toEqual(mockUser);
      expect(mockUserService.findOne).toHaveBeenCalledWith(1);
    });

    it('deve retornar null quando usuário não existe', async () => {
      mockUserService.findOne.mockResolvedValue(null);

      const result = await service.getProfile(999);

      expect(result).toBeNull();
      expect(mockUserService.findOne).toHaveBeenCalledWith(999);
    });

    it('deve propagar erro do userService', async () => {
      const error = new Error('Erro no banco de dados');
      mockUserService.findOne.mockRejectedValue(error);

      await expect(service.getProfile(1)).rejects.toThrow(
        'Erro no banco de dados',
      );
    });

    it('deve funcionar com diferentes tipos de usuário', async () => {
      const adminUser = {
        ...mockUser,
        role: UserRole.ADMIN,
      };

      mockUserService.findOne.mockResolvedValue(adminUser);

      const result = await service.getProfile(1);

      expect(result).toEqual(adminUser);
      expect(result.role).toBe(UserRole.ADMIN);
    });
  });

  describe('integração validateUser e login', () => {
    it('deve fazer login completo com sucesso', async () => {
      const loginDto = {
        email: 'test@test.com',
        password: 'password123',
      };

      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue('jwt.token.here');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(loginDto.email);
      expect(result.user).not.toHaveProperty('password');
    });

    it('deve falhar no login quando senha está incorreta', async () => {
      const loginDto = {
        email: 'test@test.com',
        password: 'senhaErrada',
      };

      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(
        'Credenciais inválidas',
      );
    });
  });

  describe('changePassword', () => {
    const changePasswordDto: ChangePasswordDto = {
      currentPassword: 'currentPassword123',
      newPassword: 'newPassword456',
    };

    const mockUserWithPassword = {
      ...mockUser,
      password: 'hashedCurrentPassword',
    };

    beforeEach(() => {
      mockedBcrypt.hash.mockResolvedValue('hashedNewPassword' as never);
    });

    it('deve alterar senha com sucesso quando dados são válidos', async () => {
      mockUserService.findByIdWithPassword.mockResolvedValue(
        mockUserWithPassword,
      );
      mockedBcrypt.compare
        .mockResolvedValueOnce(true as never) // senha atual correta
        .mockResolvedValueOnce(false as never); // nova senha é diferente
      mockUserService.updatePassword.mockResolvedValue(undefined);

      const result = await service.changePassword(1, changePasswordDto);

      expect(result).toEqual({ message: 'Senha alterada com sucesso' });
      expect(mockUserService.findByIdWithPassword).toHaveBeenCalledWith(1);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        'currentPassword123',
        'hashedCurrentPassword',
      );
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        'newPassword456',
        'hashedCurrentPassword',
      );
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('newPassword456', 10);
      expect(mockUserService.updatePassword).toHaveBeenCalledWith(
        1,
        'hashedNewPassword',
      );
    });

    it('deve lançar UnauthorizedException quando usuário não existe', async () => {
      mockUserService.findByIdWithPassword.mockResolvedValue(null);

      await expect(
        service.changePassword(999, changePasswordDto),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.changePassword(999, changePasswordDto),
      ).rejects.toThrow('Usuário não encontrado');

      expect(mockUserService.findByIdWithPassword).toHaveBeenCalledWith(999);
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
      expect(mockUserService.updatePassword).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException quando senha atual está incorreta', async () => {
      mockUserService.findByIdWithPassword.mockResolvedValue(
        mockUserWithPassword,
      );
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        service.changePassword(1, changePasswordDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.changePassword(1, changePasswordDto),
      ).rejects.toThrow('Senha atual incorreta');

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        'currentPassword123',
        'hashedCurrentPassword',
      );
      expect(mockUserService.updatePassword).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException quando nova senha é igual à atual', async () => {
      const samePasswordDto: ChangePasswordDto = {
        currentPassword: 'currentPassword123',
        newPassword: 'currentPassword123',
      };

      mockUserService.findByIdWithPassword.mockResolvedValue(
        mockUserWithPassword,
      );

      // Mock específico para este teste - resetar completamente
      mockedBcrypt.compare.mockReset();
      mockedBcrypt.compare
        .mockResolvedValueOnce(true as never) // primeira chamada: senha atual correta
        .mockResolvedValueOnce(true as never); // segunda chamada: nova senha é igual à atual

      await expect(service.changePassword(1, samePasswordDto)).rejects.toThrow(
        BadRequestException,
      );

      // Testar novamente com mock resetado
      mockUserService.findByIdWithPassword.mockResolvedValue(
        mockUserWithPassword,
      );
      mockedBcrypt.compare.mockReset();
      mockedBcrypt.compare
        .mockResolvedValueOnce(true as never) // primeira chamada: senha atual correta
        .mockResolvedValueOnce(true as never); // segunda chamada: nova senha é igual à atual

      await expect(service.changePassword(1, samePasswordDto)).rejects.toThrow(
        'A nova senha deve ser diferente da senha atual',
      );

      expect(mockUserService.updatePassword).not.toHaveBeenCalled();
    });

    it('deve propagar erro do userService.findByIdWithPassword', async () => {
      const error = new Error('Erro no banco de dados');
      mockUserService.findByIdWithPassword.mockRejectedValue(error);

      await expect(
        service.changePassword(1, changePasswordDto),
      ).rejects.toThrow('Erro no banco de dados');
    });

    it('deve propagar erro do userService.updatePassword', async () => {
      mockUserService.findByIdWithPassword.mockResolvedValue(
        mockUserWithPassword,
      );
      mockedBcrypt.compare
        .mockResolvedValueOnce(true as never)
        .mockResolvedValueOnce(false as never);

      const error = new Error('Erro ao atualizar senha');
      mockUserService.updatePassword.mockRejectedValue(error);

      await expect(
        service.changePassword(1, changePasswordDto),
      ).rejects.toThrow('Erro ao atualizar senha');
    });
  });

  describe('updateProfile', () => {
    const updateProfileDto: UpdateProfileDto = {
      name: 'Nome Atualizado',
      email: 'novo@email.com',
      phone: '+5511999999999',
      photoUrl: 'https://exemplo.com/nova-foto.jpg',
    };

    const updatedUser = {
      ...mockUser,
      ...updateProfileDto,
    };

    it('deve atualizar perfil com sucesso quando dados são válidos', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile(1, updateProfileDto);

      expect(result).toEqual(updatedUser);
      expect(mockUserService.findOne).toHaveBeenCalledWith(1);
      expect(mockUserService.update).toHaveBeenCalledWith(1, updateProfileDto);
    });

    it('deve atualizar perfil com dados parciais', async () => {
      const partialUpdateDto: UpdateProfileDto = {
        name: 'Apenas Nome Novo',
      };

      const partiallyUpdatedUser = {
        ...mockUser,
        name: 'Apenas Nome Novo',
      };

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockUserService.update.mockResolvedValue(partiallyUpdatedUser);

      const result = await service.updateProfile(1, partialUpdateDto);

      expect(result).toEqual(partiallyUpdatedUser);
      expect(mockUserService.update).toHaveBeenCalledWith(1, partialUpdateDto);
    });

    it('deve propagar erro quando usuário não existe', async () => {
      const error = new Error('Usuário não encontrado');
      mockUserService.findOne.mockRejectedValue(error);

      await expect(
        service.updateProfile(999, updateProfileDto),
      ).rejects.toThrow('Usuário não encontrado');

      expect(mockUserService.findOne).toHaveBeenCalledWith(999);
      expect(mockUserService.update).not.toHaveBeenCalled();
    });

    it('deve propagar erro do userService.update', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);

      const error = new Error('Email já está em uso');
      mockUserService.update.mockRejectedValue(error);

      await expect(service.updateProfile(1, updateProfileDto)).rejects.toThrow(
        'Email já está em uso',
      );

      expect(mockUserService.update).toHaveBeenCalledWith(1, updateProfileDto);
    });

    it('deve funcionar com diferentes tipos de usuário', async () => {
      const supplierUser = {
        ...mockUser,
        role: UserRole.SUPPLIER,
      };

      const updatedSupplierUser = {
        ...supplierUser,
        ...updateProfileDto,
      };

      mockUserService.findOne.mockResolvedValue(supplierUser);
      mockUserService.update.mockResolvedValue(updatedSupplierUser);

      const result = await service.updateProfile(1, updateProfileDto);

      expect(result).toEqual(updatedSupplierUser);
      expect(result.role).toBe(UserRole.SUPPLIER);
    });
  });
});
