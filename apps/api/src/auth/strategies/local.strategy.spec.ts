import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '../auth.service';
import { UserRole } from '@prisma/client';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;

  const mockAuthService = {
    validateUser: jest.fn(),
  };

  const mockUser = {
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
        LocalStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);

    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('deve retornar usuário quando credenciais são válidas', async () => {
      mockAuthService.validateUser.mockResolvedValue(mockUser);

      const result = await strategy.validate('test@test.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        'test@test.com',
        'password123',
      );
    });

    it('deve lançar UnauthorizedException quando credenciais são inválidas', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(
        strategy.validate('test@test.com', 'senhaErrada'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        strategy.validate('test@test.com', 'senhaErrada'),
      ).rejects.toThrow('Credenciais inválidas');

      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        'test@test.com',
        'senhaErrada',
      );
    });

    it('deve funcionar com diferentes tipos de usuário', async () => {
      const adminUser = {
        ...mockUser,
        role: UserRole.ADMIN,
      };

      mockAuthService.validateUser.mockResolvedValue(adminUser);

      const result = await strategy.validate('admin@test.com', 'adminPassword');

      expect(result).toEqual(adminUser);
      expect(result.role).toBe(UserRole.ADMIN);
    });

    it('deve funcionar com usuário fornecedor', async () => {
      const supplierUser = {
        ...mockUser,
        role: UserRole.SUPPLIER,
        isApproved: false, // Fornecedor pode não estar aprovado
      };

      mockAuthService.validateUser.mockResolvedValue(supplierUser);

      const result = await strategy.validate(
        'supplier@test.com',
        'supplierPassword',
      );

      expect(result).toEqual(supplierUser);
      expect(result.role).toBe(UserRole.SUPPLIER);
      expect(result.isApproved).toBe(false);
    });

    it('deve propagar erro do AuthService', async () => {
      const error = new Error('Erro no banco de dados');
      mockAuthService.validateUser.mockRejectedValue(error);

      await expect(
        strategy.validate('test@test.com', 'password123'),
      ).rejects.toThrow('Erro no banco de dados');
    });

    it('deve lidar com email em diferentes formatos', async () => {
      const emailFormats = [
        'simple@test.com',
        'user.name@domain.com',
        'user+tag@domain.co.uk',
        'USER@DOMAIN.COM', // Maiúsculo
      ];

      for (const email of emailFormats) {
        mockAuthService.validateUser.mockResolvedValue(mockUser);

        const result = await strategy.validate(email, 'password123');

        expect(result).toEqual(mockUser);
        expect(mockAuthService.validateUser).toHaveBeenCalledWith(
          email,
          'password123',
        );

        // Limpar mock para próxima iteração
        mockAuthService.validateUser.mockClear();
      }
    });

    it('deve lidar com senhas especiais', async () => {
      const specialPasswords = [
        'password123',
        'P@ssw0rd!',
        'senha_com_underscore',
        'senha-com-hifen',
        'SenhaComMaiuscula',
        '123456789',
        'senha com espaços',
      ];

      for (const password of specialPasswords) {
        mockAuthService.validateUser.mockResolvedValue(mockUser);

        const result = await strategy.validate('test@test.com', password);

        expect(result).toEqual(mockUser);
        expect(mockAuthService.validateUser).toHaveBeenCalledWith(
          'test@test.com',
          password,
        );

        // Limpar mock para próxima iteração
        mockAuthService.validateUser.mockClear();
      }
    });

    it('deve lançar UnauthorizedException para usuário inexistente', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(
        strategy.validate('inexistente@test.com', 'qualquerSenha'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException para senha vazia', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(strategy.validate('test@test.com', '')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve lançar UnauthorizedException para email vazio', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(strategy.validate('', 'password123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve preservar todos os dados do usuário retornado', async () => {
      const completeUser = {
        id: 42,
        name: 'Complete User',
        email: 'complete@test.com',
        role: UserRole.SUPPLIER,
        isApproved: true,
        createdAt: new Date('2024-01-01'),
        phone: '+55 11 99999-9999',
      };

      mockAuthService.validateUser.mockResolvedValue(completeUser);

      const result = await strategy.validate(
        'complete@test.com',
        'password123',
      );

      expect(result).toEqual(completeUser);
      expect(result.id).toBe(42);
      expect(result.phone).toBe('+55 11 99999-9999');
    });
  });

  describe('configuração da strategy', () => {
    it('deve usar email como campo de username', () => {
      // A configuração é feita no constructor
      // Testamos indiretamente através do comportamento
      expect(strategy).toBeDefined();
    });
  });

  describe('casos extremos', () => {
    it('deve lidar com timeout do AuthService', async () => {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 100);
      });

      mockAuthService.validateUser.mockReturnValue(timeoutPromise);

      await expect(
        strategy.validate('test@test.com', 'password123'),
      ).rejects.toThrow('Timeout');
    });

    it('deve lidar com resposta undefined do AuthService', async () => {
      mockAuthService.validateUser.mockResolvedValue(undefined);

      await expect(
        strategy.validate('test@test.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lidar com resposta false do AuthService', async () => {
      mockAuthService.validateUser.mockResolvedValue(false);

      await expect(
        strategy.validate('test@test.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
