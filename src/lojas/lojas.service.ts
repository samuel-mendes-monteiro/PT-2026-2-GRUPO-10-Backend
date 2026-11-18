import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { CreateLojaDto } from './dto/create-loja.dto.js';
import { UpdateLojaDto } from './dto/update-loja.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class LojasService {
  constructor(private prisma: PrismaService) {}

  async create(createLojaDto: CreateLojaDto, usuarioId: number) {
    if (createLojaDto.categoriaId) {
      const categoria = await this.prisma.categoria.findUnique({
        where: { id: createLojaDto.categoriaId },
      });
      if (!categoria) throw new NotFoundException('Categoria não encontrada.');
    }

    const loja = await this.prisma.loja.create({
      data: {
        ...createLojaDto,
        usuarioId: usuarioId,
      },
      include: {
        categoria: { select: { id: true, nome: true } },
      },
    });

    return {
      ...loja,
      categoriaPrincipal: loja.categoria,
    };
  }

  async findAll() {
    const lojas = await this.prisma.loja.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        categoria: { select: { id: true, nome: true } },
      },
    });

    return lojas.map((loja) => ({
      ...loja,
      categoriaPrincipal: loja.categoria,
    }));
  }

  async findOne(id: number) {
    const loja = await this.prisma.loja.findUnique({
      where: { id },
      include: {
        categoria: { select: { id: true, nome: true } },
      },
    });

    if (!loja) throw new NotFoundException('Loja não encontrada.');

    return {
      ...loja,
      categoriaPrincipal: loja.categoria,
    };
  }

  async update(id: number, updateLojaDto: UpdateLojaDto, usuarioId: number) {
    const loja = await this.prisma.loja.findUnique({ where: { id } });

    if (!loja) throw new NotFoundException('Loja não encontrada.');
    if (loja.usuarioId !== usuarioId) throw new UnauthorizedException('Não tem permissão para editar esta loja.');

    if (updateLojaDto.categoriaId) {
      const categoria = await this.prisma.categoria.findUnique({
        where: { id: updateLojaDto.categoriaId },
      });
      if (!categoria) throw new NotFoundException('Categoria não encontrada.');
    }

    const atualizada = await this.prisma.loja.update({
      where: { id },
      data: updateLojaDto,
      include: {
        categoria: { select: { id: true, nome: true } },
      },
    });

    return {
      ...atualizada,
      categoriaPrincipal: atualizada.categoria,
    };
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