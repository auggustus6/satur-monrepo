import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ApproveSupplierDto } from '../dto/approve-supplier.dto';
import { UserEntity } from '../entities/user.entity';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const { email, password, role, document, ...userData } = createUserDto;

    // Verificar se o email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    // Verificar se o documento já existe (se fornecido)
    if (document) {
      const existingDocument = await this.prisma.user.findUnique({
        where: { document },
      });

      if (existingDocument) {
        throw new ConflictException('Document is already in use');
      }
    }

    // Hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Determinar se o usuário deve ser aprovado automaticamente
    const isApproved = role === UserRole.SUPPLIER ? false : true;

    // Criar usuário
    const user = await this.prisma.user.create({
      data: {
        ...userData,
        email,
        document,
        password: hashedPassword,
        role: (role as UserRole) || UserRole.AGENCY,
        isApproved,
      },
    });

    return new UserEntity(user);
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    search?: string,
    role?: string,
  ): Promise<{
    users: UserEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role && role !== 'ALL') {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map((user) => new UserEntity(user)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: number): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return new UserEntity(user);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const { email, role, documentType, ...userData } = updateUserDto;

    // Verificar se o usuário existe
    await this.findOne(id);

    // Se está atualizando o email, verificar se não está em uso
    if (email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email já está em uso');
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...userData,
        ...(email && { email }),
        ...(role && { role: role as UserRole }),
        ...(documentType && { documentType }),
      },
    });

    return new UserEntity(user);
  }

  async remove(id: number): Promise<void> {
    // Verificar se o usuário existe
    await this.findOne(id);

    await this.prisma.user.delete({
      where: { id },
    });
  }

  async findByIdWithPassword(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async updatePassword(id: number, hashedPassword: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async approveSupplier(
    id: number,
    approveDto: ApproveSupplierDto,
  ): Promise<UserEntity> {
    const user = await this.findOne(id);

    if (user.role !== UserRole.SUPPLIER) {
      throw new BadRequestException('Apenas fornecedores podem ser aprovados');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        isApproved: approveDto.isApproved,
      },
    });

    return new UserEntity(updatedUser);
  }

  async getSuppliersByApprovalStatus(
    isApproved: boolean,
  ): Promise<UserEntity[]> {
    const suppliers = await this.prisma.user.findMany({
      where: {
        role: UserRole.SUPPLIER,
        isApproved,
      },
      orderBy: { createdAt: 'desc' },
    });

    return suppliers.map((supplier) => new UserEntity(supplier));
  }

  async getUsersByRole(role: UserRole): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      where: { role },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => new UserEntity(user));
  }
}
