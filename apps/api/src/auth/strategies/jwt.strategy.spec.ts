import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { UserRole } from '@prisma/client';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);

    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('deve retornar dados do usuário a partir do payload JWT', () => {
      const payload = {
        sub: 1,
        email: 'test@test.com',
        role: UserRole.AGENCY,
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        id: 1,
        email: 'test@test.com',
        role: UserRole.AGENCY,
      });
    });

    it('deve mapear sub para id corretamente', () => {
      const payload = {
        sub: 42,
        email: 'user42@test.com',
        role: UserRole.SUPPLIER,
      };

      const result = strategy.validate(payload);

      expect(result.id).toBe(42);
      expect(result).not.toHaveProperty('sub');
    });

    it('deve preservar email e role do payload', () => {
      const payload = {
        sub: 1,
        email: 'admin@test.com',
        role: UserRole.ADMIN,
      };

      const result = strategy.validate(payload);

      expect(result.email).toBe('admin@test.com');
      expect(result.role).toBe(UserRole.ADMIN);
    });

    it('deve funcionar com diferentes roles', () => {
      const testCases = [
        {
          payload: { sub: 1, email: 'agency@test.com', role: UserRole.AGENCY },
          expected: { id: 1, email: 'agency@test.com', role: UserRole.AGENCY },
        },
        {
          payload: {
            sub: 2,
            email: 'supplier@test.com',
            role: UserRole.SUPPLIER,
          },
          expected: {
            id: 2,
            email: 'supplier@test.com',
            role: UserRole.SUPPLIER,
          },
        },
        {
          payload: { sub: 3, email: 'admin@test.com', role: UserRole.ADMIN },
          expected: { id: 3, email: 'admin@test.com', role: UserRole.ADMIN },
        },
      ];

      testCases.forEach(({ payload, expected }) => {
        const result = strategy.validate(payload);
        expect(result).toEqual(expected);
      });
    });

    it('deve lidar com IDs numéricos grandes', () => {
      const payload = {
        sub: 999999999,
        email: 'bigid@test.com',
        role: UserRole.AGENCY,
      };

      const result = strategy.validate(payload);

      expect(result.id).toBe(999999999);
      expect(typeof result.id).toBe('number');
    });

    it('deve retornar objeto com estrutura consistente', () => {
      const payload = {
        sub: 1,
        email: 'test@test.com',
        role: UserRole.AGENCY,
      };

      const result = strategy.validate(payload);

      expect(Object.keys(result)).toEqual(['id', 'email', 'role']);
      expect(Object.keys(result)).toHaveLength(3);
    });
  });

  describe('tipos de payload', () => {
    it('deve aceitar payload com propriedades adicionais', () => {
      const payloadWithExtra = {
        sub: 1,
        email: 'test@test.com',
        role: UserRole.AGENCY,
        iat: 1234567890,
        exp: 1234567890,
        extraProp: 'valor extra',
      };

      const result = strategy.validate(payloadWithExtra);

      // Deve retornar apenas as propriedades esperadas
      expect(result).toEqual({
        id: 1,
        email: 'test@test.com',
        role: UserRole.AGENCY,
      });
    });

    it('deve funcionar com emails de diferentes formatos', () => {
      const emailFormats = [
        'simple@test.com',
        'user.name@domain.com',
        'user+tag@domain.co.uk',
        'user123@sub.domain.org',
      ];

      emailFormats.forEach((email) => {
        const payload = {
          sub: 1,
          email,
          role: UserRole.AGENCY,
        };

        const result = strategy.validate(payload);

        expect(result.email).toBe(email);
      });
    });
  });
});
