import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../../prisma.service';
import { UserEntity } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ApproveSupplierDto } from '../dto/approve-supplier.dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Mock do bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UserService', () => {
  let service: UserService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockUser = {
    id: 1,
    name: 'João Silva',
    email: 'joao@test.com',
    password: 'hashedPassword123',
    phone: '+5511999999999',
    photoUrl: 'https://example.com/photo.jpg',
    role: UserRole.AGENCY,
    isApproved: true,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  };

  const mockSupplier = {
    ...mockUser,
    id: 2,
    name: 'Maria Santos',
    email: 'maria@test.com',
    role: UserRole.SUPPLIER,
    isApproved: false,
  };

  const mockAdmin = {
    ...mockUser,
    id: 3,
    name: 'Admin User',
    email: 'admin@test.com',
    role: UserRole.ADMIN,
    isApproved: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);

    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();

    // Mock padrão do bcrypt
    mockedBcrypt.hash.mockResolvedValue('hashedPassword123' as never);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      name: 'João Silva',
      email: 'joao@test.com',
      password: 'password123',
      phone: '+5511999999999',
      photoUrl: 'https://example.com/photo.jpg',
      role: UserRole.AGENCY,
    };

    it('deve criar um usuário agência com sucesso', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.name).toBe('João Silva');
      expect(result.email).toBe('joao@test.com');
      expect(result.role).toBe(UserRole.AGENCY);
      expect(result.isApproved).toBe(true);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: 'João Silva',
          phone: '+5511999999999',
          photoUrl: 'https://example.com/photo.jpg',
          email: 'joao@test.com',
          password: 'hashedPassword123',
          role: UserRole.AGENCY,
          isApproved: true,
        },
      });
    });

    it('deve criar um fornecedor não aprovado por padrão', async () => {
      const supplierDto = {
        ...createUserDto,
        email: 'fornecedor@test.com',
        role: UserRole.SUPPLIER,
      };

      const createdSupplier = {
        ...mockSupplier,
        email: 'fornecedor@test.com',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(createdSupplier);

      const result = await service.create(supplierDto);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.role).toBe(UserRole.SUPPLIER);
      expect(result.isApproved).toBe(false);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: 'João Silva',
          phone: '+5511999999999',
          photoUrl: 'https://example.com/photo.jpg',
          email: 'fornecedor@test.com',
          password: 'hashedPassword123',
          role: UserRole.SUPPLIER,
          isApproved: false,
        },
      });
    });

    it('deve usar role AGENCY como padrão quando não especificado', async () => {
      const dtoWithoutRole = {
        name: 'João Silva',
        email: 'joao@test.com',
        password: 'password123',
      } as CreateUserDto;

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      await service.create(dtoWithoutRole);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: 'João Silva',
          email: 'joao@test.com',
          password: 'hashedPassword123',
          role: UserRole.AGENCY,
          isApproved: true,
        },
      });
    });

    it('deve lançar ConflictException quando email já existe', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createUserDto)).rejects.toThrow(
        'Email já está em uso',
      );

      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('deve propagar erro do banco de dados', async () => {
      const dbError = new Error('Erro no banco de dados');
      mockPrismaService.user.findUnique.mockRejectedValue(dbError);

      await expect(service.create(createUserDto)).rejects.toThrow(
        'Erro no banco de dados',
      );
    });

    it('deve propagar erro do bcrypt', async () => {
      const bcryptError = new Error('Erro no hash da senha');
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockedBcrypt.hash.mockRejectedValue(bcryptError as never);

      await expect(service.create(createUserDto)).rejects.toThrow(
        'Erro no hash da senha',
      );
    });
  });

  describe('findAll', () => {
    const mockUsers = [mockUser, mockSupplier, mockAdmin];

    it('deve retornar todos os usuários', async () => {
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toHaveLength(3);
      expect(result[0]).toBeInstanceOf(UserEntity);
      expect(result[1]).toBeInstanceOf(UserEntity);
      expect(result[2]).toBeInstanceOf(UserEntity);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });

    it('deve retornar array vazio quando não há usuários', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('deve propagar erro do banco de dados', async () => {
      const dbError = new Error('Erro no banco de dados');
      mockPrismaService.user.findMany.mockRejectedValue(dbError);

      await expect(service.findAll()).rejects.toThrow('Erro no banco de dados');
    });
  });

  describe('findOne', () => {
    it('deve retornar usuário por ID com sucesso', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.id).toBe(1);
      expect(result.name).toBe('João Silva');
      expect(result.email).toBe('joao@test.com');
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('deve lançar NotFoundException quando usuário não existe', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Usuário não encontrado',
      );
    });

    it('deve funcionar com diferentes IDs válidos', async () => {
      const testIds = [1, 42, 999999];

      for (const id of testIds) {
        const userWithId = { ...mockUser, id };
        mockPrismaService.user.findUnique.mockResolvedValue(userWithId);

        const result = await service.findOne(id);

        expect(result.id).toBe(id);
        expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
          where: { id },
        });

        jest.clearAllMocks();
      }
    });

    it('deve propagar erro do banco de dados', async () => {
      const dbError = new Error('Erro no banco de dados');
      mockPrismaService.user.findUnique.mockRejectedValue(dbError);

      await expect(service.findOne(1)).rejects.toThrow(
        'Erro no banco de dados',
      );
    });
  });

  describe('findByEmail', () => {
    it('deve retornar usuário por email com sucesso', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('joao@test.com');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'joao@test.com' },
      });
    });

    it('deve retornar null quando usuário não existe', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('inexistente@test.com');

      expect(result).toBeNull();
    });

    it('deve propagar erro do banco de dados', async () => {
      const dbError = new Error('Erro no banco de dados');
      mockPrismaService.user.findUnique.mockRejectedValue(dbError);

      await expect(service.findByEmail('joao@test.com')).rejects.toThrow(
        'Erro no banco de dados',
      );
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      name: 'João Silva Atualizado',
      phone: '+5511888888888',
      photoUrl: 'https://example.com/new-photo.jpg',
    };

    const updatedUser = {
      ...mockUser,
      name: 'João Silva Atualizado',
      phone: '+5511888888888',
      photoUrl: 'https://example.com/new-photo.jpg',
    };

    it('deve atualizar usuário com sucesso', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateUserDto);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.name).toBe('João Silva Atualizado');
      expect(result.phone).toBe('+5511888888888');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateUserDto,
      });
    });

    it('deve atualizar email quando fornecido e não está em uso', async () => {
      const updateWithEmail = {
        ...updateUserDto,
        email: 'novo@test.com',
      };

      const updatedWithEmail = {
        ...updatedUser,
        email: 'novo@test.com',
      };

      // Primeira chamada para verificar se usuário existe
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(mockUser)
        // Segunda chamada para verificar se email está em uso
        .mockResolvedValueOnce(null);

      mockPrismaService.user.update.mockResolvedValue(updatedWithEmail);

      const result = await service.update(1, updateWithEmail);

      expect(result.email).toBe('novo@test.com');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'João Silva Atualizado',
          phone: '+5511888888888',
          photoUrl: 'https://example.com/new-photo.jpg',
          email: 'novo@test.com',
        },
      });
    });

    it('deve lançar NotFoundException quando usuário não existe', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.update(999, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(999, updateUserDto)).rejects.toThrow(
        'Usuário não encontrado',
      );

      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('deve lançar ConflictException quando email já está em uso por outro usuário', async () => {
      const updateWithEmail = {
        ...updateUserDto,
        email: 'maria@test.com',
      };

      // Primeira chamada para verificar se usuário existe (findOne)
      // Segunda chamada para verificar se email está em uso
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockSupplier);

      await expect(service.update(1, updateWithEmail)).rejects.toThrow(
        'Email já está em uso',
      );

      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('deve permitir atualizar para o mesmo email do usuário', async () => {
      const updateWithSameEmail = {
        ...updateUserDto,
        email: 'joao@test.com',
      };

      // Primeira chamada para verificar se usuário existe
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(mockUser)
        // Segunda chamada para verificar se email está em uso (retorna o próprio usuário)
        .mockResolvedValueOnce(mockUser);

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateWithSameEmail);

      expect(result).toBeInstanceOf(UserEntity);
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it('deve propagar erro do banco de dados', async () => {
      const dbError = new Error('Erro no banco de dados');
      mockPrismaService.user.findUnique.mockRejectedValue(dbError);

      await expect(service.update(1, updateUserDto)).rejects.toThrow(
        'Erro no banco de dados',
      );
    });
  });

  describe('remove', () => {
    it('deve remover usuário com sucesso', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      await expect(service.remove(1)).resolves.not.toThrow();

      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('deve lançar NotFoundException quando usuário não existe', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      await expect(service.remove(999)).rejects.toThrow(
        'Usuário não encontrado',
      );

      expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
    });

    it('deve funcionar com diferentes IDs válidos', async () => {
      const testIds = [1, 42, 999999];

      for (const id of testIds) {
        const userWithId = { ...mockUser, id };
        mockPrismaService.user.findUnique.mockResolvedValue(userWithId);
        mockPrismaService.user.delete.mockResolvedValue(userWithId);

        await expect(service.remove(id)).resolves.not.toThrow();

        expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
          where: { id },
        });

        jest.clearAllMocks();
      }
    });

    it('deve propagar erro do banco de dados', async () => {
      const dbError = new Error('Erro no banco de dados');
      mockPrismaService.user.findUnique.mockRejectedValue(dbError);

      await expect(service.remove(1)).rejects.toThrow('Erro no banco de dados');
    });
  });

  describe('findByIdWithPassword', () => {
    it('deve retornar usuário com senha por ID com sucesso', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByIdWithPassword(1);

      expect(result).toEqual(mockUser);
      expect(result.password).toBe('hashedPassword123');
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('deve lançar NotFoundException quando usuário não existe', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findByIdWithPassword(999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByIdWithPassword(999)).rejects.toThrow(
        'Usuário não encontrado',
      );
    });

    it('deve funcionar com diferentes IDs válidos', async () => {
      const testIds = [1, 42, 999999];

      for (const id of testIds) {
        const userWithId = { ...mockUser, id };
        mockPrismaService.user.findUnique.mockResolvedValue(userWithId);

        const result = await service.findByIdWithPassword(id);

        expect(result.id).toBe(id);
        expect(result.password).toBeDefined();
        expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
          where: { id },
        });

        jest.clearAllMocks();
      }
    });

    it('deve propagar erro do banco de dados', async () => {
      const dbError = new Error('Erro no banco de dados');
      mockPrismaService.user.findUnique.mockRejectedValue(dbError);

      await expect(service.findByIdWithPassword(1)).rejects.toThrow(
        'Erro no banco de dados',
      );
    });
  });

  describe('updatePassword', () => {
    const newHashedPassword = 'newHashedPassword456';

    it('deve atualizar senha com sucesso', async () => {
      const updatedUser = {
        ...mockUser,
        password: newHashedPassword,
      };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      await expect(
        service.updatePassword(1, newHashedPassword),
      ).resolves.not.toThrow();

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { password: newHashedPassword },
      });
    });

    it('deve funcionar com diferentes IDs e senhas', async () => {
      const testCases = [
        { id: 1, password: 'hash1' },
        { id: 42, password: 'hash2' },
        { id: 999999, password: 'hash3' },
      ];

      for (const testCase of testCases) {
        const updatedUser = {
          ...mockUser,
          id: testCase.id,
          password: testCase.password,
        };

        mockPrismaService.user.update.mockResolvedValue(updatedUser);

        await expect(
          service.updatePassword(testCase.id, testCase.password),
        ).resolves.not.toThrow();

        expect(mockPrismaService.user.update).toHaveBeenCalledWith({
          where: { id: testCase.id },
          data: { password: testCase.password },
        });

        jest.clearAllMocks();
      }
    });

    it('deve propagar erro do banco de dados', async () => {
      const dbError = new Error('Erro no banco de dados');
      mockPrismaService.user.update.mockRejectedValue(dbError);

      await expect(
        service.updatePassword(1, newHashedPassword),
      ).rejects.toThrow('Erro no banco de dados');
    });

    it('deve propagar erro quando usuário não existe', async () => {
      const notFoundError = new Error('Record to update not found');
      mockPrismaService.user.update.mockRejectedValue(notFoundError);

      await expect(
        service.updatePassword(999, newHashedPassword),
      ).rejects.toThrow('Record to update not found');
    });
  });

  describe('approveSupplier', () => {
    const approveDto: ApproveSupplierDto = {
      isApproved: true,
    };

    const approvedSupplier = {
      ...mockSupplier,
      isApproved: true,
    };

    it('deve aprovar fornecedor com sucesso', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockSupplier);
      mockPrismaService.user.update.mockResolvedValue(approvedSupplier);

      const result = await service.approveSupplier(2, approveDto);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.isApproved).toBe(true);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { isApproved: true },
      });
    });

    it('deve reprovar fornecedor com sucesso', async () => {
      const disapproveDto: ApproveSupplierDto = {
        isApproved: false,
      };

      const disapprovedSupplier = {
        ...mockSupplier,
        isApproved: false,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(approvedSupplier);
      mockPrismaService.user.update.mockResolvedValue(disapprovedSupplier);

      const result = await service.approveSupplier(2, disapproveDto);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.isApproved).toBe(false);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { isApproved: false },
      });
    });

    it('deve lançar NotFoundException quando usuário não existe', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.approveSupplier(999, approveDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.approveSupplier(999, approveDto)).rejects.toThrow(
        'Usuário não encontrado',
      );

      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException quando usuário não é fornecedor', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.approveSupplier(1, approveDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.approveSupplier(1, approveDto)).rejects.toThrow(
        'Apenas fornecedores podem ser aprovados',
      );

      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('deve propagar erro do banco de dados', async () => {
      const dbError = new Error('Erro no banco de dados');
      mockPrismaService.user.findUnique.mockRejectedValue(dbError);

      await expect(service.approveSupplier(2, approveDto)).rejects.toThrow(
        'Erro no banco de dados',
      );
    });
  });

  describe('getSuppliersByApprovalStatus', () => {
    const approvedSuppliers = [
      { ...mockSupplier, id: 2, isApproved: true },
      { ...mockSupplier, id: 3, isApproved: true, name: 'Fornecedor 2' },
    ];

    const unapprovedSuppliers = [
      { ...mockSupplier, id: 4, isApproved: false },
      { ...mockSupplier, id: 5, isApproved: false, name: 'Fornecedor 3' },
    ];

    it('deve retornar fornecedores aprovados', async () => {
      mockPrismaService.user.findMany.mockResolvedValue(approvedSuppliers);

      const result = await service.getSuppliersByApprovalStatus(true);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(UserEntity);
      expect(result[1]).toBeInstanceOf(UserEntity);
      expect(result[0].isApproved).toBe(true);
      expect(result[1].isApproved).toBe(true);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          role: UserRole.SUPPLIER,
          isApproved: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('deve retornar fornecedores não aprovados', async () => {
      mockPrismaService.user.findMany.mockResolvedValue(unapprovedSuppliers);

      const result = await service.getSuppliersByApprovalStatus(false);

      expect(result).toHaveLength(2);
      expect(result[0].isApproved).toBe(false);
      expect(result[1].isApproved).toBe(false);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          role: UserRole.SUPPLIER,
          isApproved: false,
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('deve retornar array vazio quando não há fornecedores', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.getSuppliersByApprovalStatus(true);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('deve propagar erro do banco de dados', async () => {
      const dbError = new Error('Erro no banco de dados');
      mockPrismaService.user.findMany.mockRejectedValue(dbError);

      await expect(service.getSuppliersByApprovalStatus(true)).rejects.toThrow(
        'Erro no banco de dados',
      );
    });
  });

  describe('getUsersByRole', () => {
    const agencies = [
      mockUser,
      { ...mockUser, id: 2, name: 'Agência 2', email: 'agencia2@test.com' },
    ];

    const suppliers = [
      mockSupplier,
      {
        ...mockSupplier,
        id: 3,
        name: 'Fornecedor 2',
        email: 'fornecedor2@test.com',
      },
    ];

    const admins = [
      mockAdmin,
      { ...mockAdmin, id: 4, name: 'Admin 2', email: 'admin2@test.com' },
    ];

    it('deve retornar usuários por role AGENCY', async () => {
      mockPrismaService.user.findMany.mockResolvedValue(agencies);

      const result = await service.getUsersByRole(UserRole.AGENCY);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(UserEntity);
      expect(result[1]).toBeInstanceOf(UserEntity);
      expect(result[0].role).toBe(UserRole.AGENCY);
      expect(result[1].role).toBe(UserRole.AGENCY);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: { role: UserRole.AGENCY },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('deve retornar usuários por role SUPPLIER', async () => {
      mockPrismaService.user.findMany.mockResolvedValue(suppliers);

      const result = await service.getUsersByRole(UserRole.SUPPLIER);

      expect(result).toHaveLength(2);
      expect(result[0].role).toBe(UserRole.SUPPLIER);
      expect(result[1].role).toBe(UserRole.SUPPLIER);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: { role: UserRole.SUPPLIER },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('deve retornar usuários por role ADMIN', async () => {
      mockPrismaService.user.findMany.mockResolvedValue(admins);

      const result = await service.getUsersByRole(UserRole.ADMIN);

      expect(result).toHaveLength(2);
      expect(result[0].role).toBe(UserRole.ADMIN);
      expect(result[1].role).toBe(UserRole.ADMIN);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: { role: UserRole.ADMIN },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('deve retornar array vazio quando não há usuários do role especificado', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.getUsersByRole(UserRole.ADMIN);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('deve propagar erro do banco de dados', async () => {
      const dbError = new Error('Erro no banco de dados');
      mockPrismaService.user.findMany.mockRejectedValue(dbError);

      await expect(service.getUsersByRole(UserRole.AGENCY)).rejects.toThrow(
        'Erro no banco de dados',
      );
    });
  });

  describe('integração entre métodos', () => {
    it('deve executar CRUD completo com sucesso', async () => {
      const createDto = {
        name: 'João Silva',
        email: 'joao@test.com',
        password: 'password123',
        role: UserRole.SUPPLIER,
      };

      const updateDto = {
        name: 'João Silva Atualizado',
        phone: '+5511888888888',
      };

      const approveDto = {
        isApproved: true,
      };

      // Create
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockSupplier);

      const created = await service.create(createDto);
      expect(created).toBeInstanceOf(UserEntity);
      expect(created.role).toBe(UserRole.SUPPLIER);
      expect(created.isApproved).toBe(false);

      // FindOne
      mockPrismaService.user.findUnique.mockResolvedValue(mockSupplier);

      const found = await service.findOne(2);
      expect(found.id).toBe(2);

      // Update
      const updatedSupplier = { ...mockSupplier, ...updateDto };
      mockPrismaService.user.update.mockResolvedValue(updatedSupplier);

      const updated = await service.update(2, updateDto);
      expect(updated.name).toBe('João Silva Atualizado');

      // ApproveSupplier
      const approvedSupplier = { ...mockSupplier, isApproved: true };
      mockPrismaService.user.update.mockResolvedValue(approvedSupplier);

      const approved = await service.approveSupplier(2, approveDto);
      expect(approved.isApproved).toBe(true);

      // Remove
      mockPrismaService.user.delete.mockResolvedValue(approvedSupplier);

      await expect(service.remove(2)).resolves.not.toThrow();
    });
  });
});
