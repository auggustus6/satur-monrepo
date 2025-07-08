import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from '../service/user.service';
import { UserEntity } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ApproveSupplierDto } from '../dto/approve-supplier.dto';
import { UserRole } from '@prisma/client';

describe('UserController', () => {
  let controller: UserController;

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    approveSupplier: jest.fn(),
    getSuppliersByApprovalStatus: jest.fn(),
    incrementPoints: jest.fn(),
    getUsersByRole: jest.fn(),
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

  const mockUserEntity = new UserEntity(mockUser);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);

    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
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

    it('deve criar um usuário com sucesso', async () => {
      mockUserService.create.mockResolvedValue(mockUserEntity);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockUserEntity);
      expect(result).toBeInstanceOf(UserEntity);
      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('deve propagar ConflictException do service', async () => {
      mockUserService.create.mockRejectedValue(
        new ConflictException('Email já está em uso'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(controller.create(createUserDto)).rejects.toThrow(
        'Email já está em uso',
      );
    });

    it('deve propagar erro do service', async () => {
      const error = new Error('Erro interno do servidor');
      mockUserService.create.mockRejectedValue(error);

      await expect(controller.create(createUserDto)).rejects.toThrow(
        'Erro interno do servidor',
      );
    });
  });

  describe('findAll', () => {
    const mockUsers = [
      mockUserEntity,
      new UserEntity({
        ...mockUser,
        id: 2,
        name: 'Maria Santos',
        email: 'maria@test.com',
        role: UserRole.SUPPLIER,
      }),
    ];

    it('deve retornar todos os usuários', async () => {
      mockUserService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(UserEntity);
      expect(result[1]).toBeInstanceOf(UserEntity);
      expect(mockUserService.findAll).toHaveBeenCalled();
    });

    it('deve retornar array vazio quando não há usuários', async () => {
      mockUserService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('deve propagar erro do service', async () => {
      const error = new Error('Erro interno do servidor');
      mockUserService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow(
        'Erro interno do servidor',
      );
    });
  });

  describe('findOne', () => {
    it('deve retornar usuário por ID com sucesso', async () => {
      mockUserService.findOne.mockResolvedValue(mockUserEntity);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockUserEntity);
      expect(result).toBeInstanceOf(UserEntity);
      expect(mockUserService.findOne).toHaveBeenCalledWith(1);
    });

    it('deve propagar NotFoundException do service', async () => {
      mockUserService.findOne.mockRejectedValue(
        new NotFoundException('Usuário não encontrado'),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(controller.findOne(999)).rejects.toThrow(
        'Usuário não encontrado',
      );
    });

    it('deve funcionar com diferentes IDs válidos', async () => {
      const testIds = [1, 42, 999999];

      for (const id of testIds) {
        const userWithId = new UserEntity({ ...mockUser, id });
        mockUserService.findOne.mockResolvedValue(userWithId);

        const result = await controller.findOne(id);

        expect(result.id).toBe(id);
        expect(mockUserService.findOne).toHaveBeenCalledWith(id);

        jest.clearAllMocks();
      }
    });

    it('deve propagar erro do service', async () => {
      const error = new Error('Erro interno do servidor');
      mockUserService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(1)).rejects.toThrow(
        'Erro interno do servidor',
      );
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      name: 'João Silva Atualizado',
      phone: '+5511888888888',
      photoUrl: 'https://example.com/new-photo.jpg',
    };

    const updatedUserEntity = new UserEntity({
      ...mockUser,
      name: 'João Silva Atualizado',
      phone: '+5511888888888',
      photoUrl: 'https://example.com/new-photo.jpg',
    });

    it('deve atualizar usuário com sucesso', async () => {
      mockUserService.update.mockResolvedValue(updatedUserEntity);

      const result = await controller.update(1, updateUserDto);

      expect(result).toEqual(updatedUserEntity);
      expect(result).toBeInstanceOf(UserEntity);
      expect(mockUserService.update).toHaveBeenCalledWith(1, updateUserDto);
    });

    it('deve propagar NotFoundException do service', async () => {
      mockUserService.update.mockRejectedValue(
        new NotFoundException('Usuário não encontrado'),
      );

      await expect(controller.update(999, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.update(999, updateUserDto)).rejects.toThrow(
        'Usuário não encontrado',
      );
    });

    it('deve propagar ConflictException do service', async () => {
      mockUserService.update.mockRejectedValue(
        new ConflictException('Email já está em uso'),
      );

      await expect(controller.update(1, updateUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(controller.update(1, updateUserDto)).rejects.toThrow(
        'Email já está em uso',
      );
    });

    it('deve propagar erro do service', async () => {
      const error = new Error('Erro interno do servidor');
      mockUserService.update.mockRejectedValue(error);

      await expect(controller.update(1, updateUserDto)).rejects.toThrow(
        'Erro interno do servidor',
      );
    });
  });

  describe('remove', () => {
    it('deve remover usuário com sucesso', async () => {
      mockUserService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1);

      expect(result).toEqual({ message: 'Usuário deletado com sucesso' });
      expect(mockUserService.remove).toHaveBeenCalledWith(1);
    });

    it('deve propagar NotFoundException do service', async () => {
      mockUserService.remove.mockRejectedValue(
        new NotFoundException('Usuário não encontrado'),
      );

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
      await expect(controller.remove(999)).rejects.toThrow(
        'Usuário não encontrado',
      );
    });

    it('deve funcionar com diferentes IDs válidos', async () => {
      const testIds = [1, 42, 999999];

      for (const id of testIds) {
        mockUserService.remove.mockResolvedValue(undefined);

        const result = await controller.remove(id);

        expect(result).toEqual({ message: 'Usuário deletado com sucesso' });
        expect(mockUserService.remove).toHaveBeenCalledWith(id);

        jest.clearAllMocks();
      }
    });

    it('deve propagar erro do service', async () => {
      const error = new Error('Erro interno do servidor');
      mockUserService.remove.mockRejectedValue(error);

      await expect(controller.remove(1)).rejects.toThrow(
        'Erro interno do servidor',
      );
    });
  });

  describe('approveSupplier', () => {
    const approveDto: ApproveSupplierDto = {
      isApproved: true,
    };

    const approvedSupplierEntity = new UserEntity({
      ...mockUser,
      id: 2,
      role: UserRole.SUPPLIER,
      isApproved: true,
    });

    it('deve aprovar fornecedor com sucesso', async () => {
      mockUserService.approveSupplier.mockResolvedValue(approvedSupplierEntity);

      const result = await controller.approveSupplier(2, approveDto);

      expect(result).toEqual(approvedSupplierEntity);
      expect(result).toBeInstanceOf(UserEntity);
      expect(result.isApproved).toBe(true);
      expect(mockUserService.approveSupplier).toHaveBeenCalledWith(
        2,
        approveDto,
      );
    });

    it('deve reprovar fornecedor com sucesso', async () => {
      const disapproveDto: ApproveSupplierDto = {
        isApproved: false,
      };

      const disapprovedSupplierEntity = new UserEntity({
        ...mockUser,
        id: 2,
        role: UserRole.SUPPLIER,
        isApproved: false,
      });

      mockUserService.approveSupplier.mockResolvedValue(
        disapprovedSupplierEntity,
      );

      const result = await controller.approveSupplier(2, disapproveDto);

      expect(result).toEqual(disapprovedSupplierEntity);
      expect(result.isApproved).toBe(false);
      expect(mockUserService.approveSupplier).toHaveBeenCalledWith(
        2,
        disapproveDto,
      );
    });

    it('deve propagar NotFoundException do service', async () => {
      mockUserService.approveSupplier.mockRejectedValue(
        new NotFoundException('Usuário não encontrado'),
      );

      await expect(controller.approveSupplier(999, approveDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.approveSupplier(999, approveDto)).rejects.toThrow(
        'Usuário não encontrado',
      );
    });

    it('deve propagar BadRequestException do service', async () => {
      mockUserService.approveSupplier.mockRejectedValue(
        new BadRequestException('Apenas fornecedores podem ser aprovados'),
      );

      await expect(controller.approveSupplier(1, approveDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.approveSupplier(1, approveDto)).rejects.toThrow(
        'Apenas fornecedores podem ser aprovados',
      );
    });

    it('deve propagar erro do service', async () => {
      const error = new Error('Erro interno do servidor');
      mockUserService.approveSupplier.mockRejectedValue(error);

      await expect(controller.approveSupplier(2, approveDto)).rejects.toThrow(
        'Erro interno do servidor',
      );
    });
  });

  describe('getSuppliersByApprovalStatus', () => {
    const approvedSuppliers = [
      new UserEntity({
        ...mockUser,
        id: 2,
        role: UserRole.SUPPLIER,
        isApproved: true,
      }),
      new UserEntity({
        ...mockUser,
        id: 3,
        name: 'Fornecedor 2',
        email: 'fornecedor2@test.com',
        role: UserRole.SUPPLIER,
        isApproved: true,
      }),
    ];

    const unapprovedSuppliers = [
      new UserEntity({
        ...mockUser,
        id: 4,
        role: UserRole.SUPPLIER,
        isApproved: false,
      }),
    ];

    it('deve retornar fornecedores aprovados', async () => {
      mockUserService.getSuppliersByApprovalStatus.mockResolvedValue(
        approvedSuppliers,
      );

      const result = await controller.getSuppliersByApprovalStatus(true);

      expect(result).toEqual(approvedSuppliers);
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(UserEntity);
      expect(result[1]).toBeInstanceOf(UserEntity);
      expect(result[0].isApproved).toBe(true);
      expect(result[1].isApproved).toBe(true);
      expect(mockUserService.getSuppliersByApprovalStatus).toHaveBeenCalledWith(
        true,
      );
    });

    it('deve retornar fornecedores não aprovados', async () => {
      mockUserService.getSuppliersByApprovalStatus.mockResolvedValue(
        unapprovedSuppliers,
      );

      const result = await controller.getSuppliersByApprovalStatus(false);

      expect(result).toEqual(unapprovedSuppliers);
      expect(result).toHaveLength(1);
      expect(result[0].isApproved).toBe(false);
      expect(mockUserService.getSuppliersByApprovalStatus).toHaveBeenCalledWith(
        false,
      );
    });

    it('deve retornar array vazio quando não há fornecedores', async () => {
      mockUserService.getSuppliersByApprovalStatus.mockResolvedValue([]);

      const result = await controller.getSuppliersByApprovalStatus(true);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('deve propagar erro do service', async () => {
      const error = new Error('Erro interno do servidor');
      mockUserService.getSuppliersByApprovalStatus.mockRejectedValue(error);

      await expect(
        controller.getSuppliersByApprovalStatus(true),
      ).rejects.toThrow('Erro interno do servidor');
    });
  });

  describe('getUsersByRole', () => {
    const agencies = [
      mockUserEntity,
      new UserEntity({
        ...mockUser,
        id: 2,
        name: 'Agência 2',
        email: 'agencia2@test.com',
        role: UserRole.AGENCY,
      }),
    ];

    const suppliers = [
      new UserEntity({
        ...mockUser,
        id: 3,
        name: 'Fornecedor 1',
        email: 'fornecedor1@test.com',
        role: UserRole.SUPPLIER,
      }),
    ];

    const admins = [
      new UserEntity({
        ...mockUser,
        id: 4,
        name: 'Admin 1',
        email: 'admin1@test.com',
        role: UserRole.ADMIN,
      }),
    ];

    it('deve retornar usuários por role AGENCY', async () => {
      mockUserService.getUsersByRole.mockResolvedValue(agencies);

      const result = await controller.getUsersByRole(UserRole.AGENCY);

      expect(result).toEqual(agencies);
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(UserEntity);
      expect(result[1]).toBeInstanceOf(UserEntity);
      expect(result[0].role).toBe(UserRole.AGENCY);
      expect(result[1].role).toBe(UserRole.AGENCY);
      expect(mockUserService.getUsersByRole).toHaveBeenCalledWith(
        UserRole.AGENCY,
      );
    });

    it('deve retornar usuários por role SUPPLIER', async () => {
      mockUserService.getUsersByRole.mockResolvedValue(suppliers);

      const result = await controller.getUsersByRole(UserRole.SUPPLIER);

      expect(result).toEqual(suppliers);
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe(UserRole.SUPPLIER);
      expect(mockUserService.getUsersByRole).toHaveBeenCalledWith(
        UserRole.SUPPLIER,
      );
    });

    it('deve retornar usuários por role ADMIN', async () => {
      mockUserService.getUsersByRole.mockResolvedValue(admins);

      const result = await controller.getUsersByRole(UserRole.ADMIN);

      expect(result).toEqual(admins);
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe(UserRole.ADMIN);
      expect(mockUserService.getUsersByRole).toHaveBeenCalledWith(
        UserRole.ADMIN,
      );
    });

    it('deve retornar array vazio quando não há usuários do role especificado', async () => {
      mockUserService.getUsersByRole.mockResolvedValue([]);

      const result = await controller.getUsersByRole(UserRole.ADMIN);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('deve propagar erro do service', async () => {
      const error = new Error('Erro interno do servidor');
      mockUserService.getUsersByRole.mockRejectedValue(error);

      await expect(controller.getUsersByRole(UserRole.AGENCY)).rejects.toThrow(
        'Erro interno do servidor',
      );
    });
  });

  describe('integração entre endpoints', () => {
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

      const createdEntity = new UserEntity({
        id: 1,
        ...createDto,
        isApproved: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const updatedEntity = new UserEntity({
        ...createdEntity,
        ...updateDto,
      });

      const approvedEntity = new UserEntity({
        ...updatedEntity,
        isApproved: true,
      });

      // Create
      mockUserService.create.mockResolvedValue(createdEntity);
      const created = await controller.create(createDto);
      expect(created).toEqual(createdEntity);

      // FindAll
      mockUserService.findAll.mockResolvedValue([createdEntity]);
      const all = await controller.findAll();
      expect(all).toContain(createdEntity);

      // FindOne
      mockUserService.findOne.mockResolvedValue(createdEntity);
      const found = await controller.findOne(1);
      expect(found).toEqual(createdEntity);

      // Update
      mockUserService.update.mockResolvedValue(updatedEntity);
      const updated = await controller.update(1, updateDto);
      expect(updated).toEqual(updatedEntity);

      // ApproveSupplier
      mockUserService.approveSupplier.mockResolvedValue(approvedEntity);
      const approved = await controller.approveSupplier(1, approveDto);
      expect(approved).toEqual(approvedEntity);

      // GetSuppliersByApprovalStatus
      mockUserService.getSuppliersByApprovalStatus.mockResolvedValue([
        approvedEntity,
      ]);
      const approvedSuppliers =
        await controller.getSuppliersByApprovalStatus(true);
      expect(approvedSuppliers).toContain(approvedEntity);

      // GetUsersByRole
      mockUserService.getUsersByRole.mockResolvedValue([approvedEntity]);
      const suppliersByRole = await controller.getUsersByRole(
        UserRole.SUPPLIER,
      );
      expect(suppliersByRole).toContain(approvedEntity);

      // Remove
      mockUserService.remove.mockResolvedValue(undefined);
      const removed = await controller.remove(1);
      expect(removed).toEqual({ message: 'Usuário deletado com sucesso' });
    });
  });

  describe('validação de tipos de entrada', () => {
    it('deve aceitar CreateUserDto válido', async () => {
      const validDto: CreateUserDto = {
        name: 'João Silva',
        email: 'joao@test.com',
        password: 'password123',
        role: UserRole.AGENCY,
      };

      mockUserService.create.mockResolvedValue(mockUserEntity);

      const result = await controller.create(validDto);

      expect(result).toEqual(mockUserEntity);
      expect(mockUserService.create).toHaveBeenCalledWith(validDto);
    });

    it('deve aceitar IDs numéricos válidos', async () => {
      const testIds = [1, 42, 999999, 1234567890];

      for (const id of testIds) {
        mockUserService.findOne.mockResolvedValue(mockUserEntity);

        await controller.findOne(id);

        expect(mockUserService.findOne).toHaveBeenCalledWith(id);
        expect(typeof id).toBe('number');

        jest.clearAllMocks();
      }
    });
  });

  describe('estrutura de resposta', () => {
    it('deve retornar UserEntity no create', async () => {
      mockUserService.create.mockResolvedValue(mockUserEntity);

      const result = await controller.create({
        name: 'João Silva',
        email: 'joao@test.com',
        password: 'password123',
        role: UserRole.AGENCY,
      });

      expect(result).toBeInstanceOf(UserEntity);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('role');
    });

    it('deve retornar array de UserEntity no findAll', async () => {
      const mockEntities = [mockUserEntity, mockUserEntity];
      mockUserService.findAll.mockResolvedValue(mockEntities);

      const result = await controller.findAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(UserEntity);
      expect(result[1]).toBeInstanceOf(UserEntity);
    });

    it('deve retornar UserEntity no findOne', async () => {
      mockUserService.findOne.mockResolvedValue(mockUserEntity);

      const result = await controller.findOne(1);

      expect(result).toBeInstanceOf(UserEntity);
    });

    it('deve retornar UserEntity no update', async () => {
      mockUserService.update.mockResolvedValue(mockUserEntity);

      const result = await controller.update(1, {});

      expect(result).toBeInstanceOf(UserEntity);
    });

    it('deve retornar objeto com message no remove', async () => {
      mockUserService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1);

      expect(result).toEqual({ message: 'Usuário deletado com sucesso' });
      expect(typeof result.message).toBe('string');
    });

    it('deve retornar UserEntity no approveSupplier', async () => {
      mockUserService.approveSupplier.mockResolvedValue(mockUserEntity);

      const result = await controller.approveSupplier(1, { isApproved: true });

      expect(result).toBeInstanceOf(UserEntity);
    });

    it('deve retornar array de UserEntity no getSuppliersByApprovalStatus', async () => {
      const mockEntities = [mockUserEntity];
      mockUserService.getSuppliersByApprovalStatus.mockResolvedValue(
        mockEntities,
      );

      const result = await controller.getSuppliersByApprovalStatus(true);

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toBeInstanceOf(UserEntity);
    });

    it('deve retornar array de UserEntity no getUsersByRole', async () => {
      const mockEntities = [mockUserEntity];
      mockUserService.getUsersByRole.mockResolvedValue(mockEntities);

      const result = await controller.getUsersByRole(UserRole.AGENCY);

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toBeInstanceOf(UserEntity);
    });
  });
});
