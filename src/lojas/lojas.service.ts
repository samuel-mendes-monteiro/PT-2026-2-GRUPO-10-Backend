import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';import { CreateLojaDto } from './dto/create-loja.dto.js';
import { UpdateLojaDto } from './dto/update-loja.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';


@Injectable()
export class LojasService {
  constructor(private prisma: PrismaService) {}

  create(createLojaDto: CreateLojaDto, usuarioId: number) {
    return this.prisma.loja.create({
      data: {
        ...createLojaDto,
        usuarioId: usuarioId,
      },
    });
  }
  

  findAll() {
    return this.prisma.loja.findMany();
  }

  findOne(id: number) {
    return this.prisma.loja.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateLojaDto: UpdateLojaDto, usuarioId: number) {
    const loja = await this.prisma.loja.findUnique({ where: { id } });
    
    if (!loja) throw new NotFoundException('Loja não encontrada.');
    if (loja.usuarioId !== usuarioId) throw new UnauthorizedException('Não tem permissão para editar esta loja.');

    return this.prisma.loja.update({
      where: { id },
      data: updateLojaDto,
    });
  }

  async remove(id: number, usuarioId: number) {
    const loja = await this.prisma.loja.findUnique({ where: { id } });
    
    if (!loja) throw new NotFoundException('Loja não encontrada.');
    if (loja.usuarioId !== usuarioId) throw new UnauthorizedException('Não tem permissão para apagar esta loja.');

    return this.prisma.loja.delete({
      where: { id },
    });
  }
}