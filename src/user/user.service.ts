import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {

  constructor(private readonly prisma: PrismaService) {

  }

  // Create

  async create(createUserDto: CreateUserDto) {
    const existingUserUsername = await this.prisma.usuario.findUnique({
      where: { username: createUserDto.username }
    })

    if (existingUserUsername) {
      throw new ConflictException('User com esse username já existe');
    }


    const existingUserEmail = await this.prisma.usuario.findUnique({
      where: { email: createUserDto.email }
    });

    if (existingUserEmail) {
      throw new ConflictException('User com esse email já existe');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.senhaHash, 10);

    return this.prisma.usuario.create({
      data: {
        username: createUserDto.username,
        nome: createUserDto.nome,
        email: createUserDto.email,
        senhaHash: hashedPassword,
        fotoPerfilUrl: createUserDto.fotoPerfilUrl,
      },
    });
  }

  //Finds

  async findAll() {
    return await this.prisma.usuario.findMany({
      select: {
        id: true,
        username: true,
        nome: true,
        email: true,
        senhaHash: false,
        fotoPerfilUrl: true,
        createdAt: true,
        updatedAt: true,

      }
    });
  }

  async findOne(id: number) {
    const isValidId = await this.prisma.usuario.findUnique({ where: { id } })

    if (!isValidId) {
      throw new NotFoundException('User com Id não encontrado');
    }
    return await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        nome: true,
        email: true,
        senhaHash: false,
        fotoPerfilUrl: true,
        createdAt: true,
        updatedAt: true,

      }
    });
  }

  async findByEmail(email: string) {

    const user = await this.prisma.usuario.findUnique({ where: { email } });
    if (!user) {
      return null;
    }
    return user;
  }

  //Update

  async update(id: number, updateUserDto: UpdateUserDto) {
    const isValidId = await this.prisma.usuario.findUnique({ where: { id } })

    if (!isValidId) {
      throw new NotFoundException('User com Id não encontrado');
    }

    return await this.prisma.usuario.update({
      where: { id },
      data: {
        username: updateUserDto.username,
        nome: updateUserDto.nome,
        email: updateUserDto.email,
        ...(updateUserDto.senhaHash !== undefined && {
          senhaHash: await bcrypt.hash(updateUserDto.senhaHash, 10),
        }),
        fotoPerfilUrl: updateUserDto.fotoPerfilUrl,
      },
      select: {
        id: true,
        username: true,
        nome: true,
        email: true,
        senhaHash: false,
        fotoPerfilUrl: true,
        createdAt: true,
        updatedAt: true,
      }
    });
  }

  //Remove

  async remove(id: number) {

    const isValidId = await this.prisma.usuario.findUnique({ where: { id } })

    if (!isValidId) {
      throw new NotFoundException('User com Id não encontrado');
    }

    return await this.prisma.usuario.delete({
      where: { id }, select: {
        id: true,
        username: true,
        nome: true,
        email: true,
        senhaHash: false,
        fotoPerfilUrl: true,
        createdAt: true,
        updatedAt: true,

      }
    });
  }
}
