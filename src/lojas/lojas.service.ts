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
  

  async findAll() {
    const [lojas, contagens, categorias] = await Promise.all([
      this.prisma.loja.findMany({ orderBy: { createdAt: 'asc' } }),
      // Quantos produtos cada loja tem em cada categoria
      this.prisma.produto.groupBy({
        by: ['lojaId', 'categoriaId'],
        _count: { _all: true },
      }),
      this.prisma.categoria.findMany({ select: { id: true, nome: true } }),
    ]);

    // A loja não tem categoria própria: usa a categoria com mais produtos dela
    const principalPorLoja = new Map<number, { categoriaId: number; total: number }>();
    for (const c of contagens) {
      const atual = principalPorLoja.get(c.lojaId);
      if (!atual || c._count._all > atual.total) {
        principalPorLoja.set(c.lojaId, { categoriaId: c.categoriaId, total: c._count._all });
      }
    }
    const categoriaPorId = new Map(categorias.map((c) => [c.id, c]));

    return lojas.map((loja) => {
      const principal = principalPorLoja.get(loja.id);
      return {
        ...loja,
        categoriaPrincipal: principal ? (categoriaPorId.get(principal.categoriaId) ?? null) : null,
      };
    });
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